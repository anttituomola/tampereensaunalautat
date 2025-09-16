// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);
dayjs.extend(utc);
import 'dayjs/locale/fi';
dayjs.locale('fi');

interface Credentials {
  accessKeyId: any;
  secretAccessKey: any;
}

const credentials: Credentials = {
  accessKeyId: process.env.AWS_SDK_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SDK_SECRET_ACCESS_KEY,
};

const sesClient = new SESClient({
  region: process.env.AWS_SDK_REGION,
  credentials: credentials,
});

type Data = {
  message: string;
  status: string;
};

type Req = {
  customerEmail: string;
  tenderSummary: {
    date: string;
    time: string;
    saunaNames: string[];
    additionalInfo?: string;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method Not Allowed. Only POST requests are accepted.',
      status: 'error'
    });
  }

  // Validate request body exists
  if (!req.body) {
    return res.status(400).json({
      message: 'Request body is required.',
      status: 'error'
    });
  }

  // Validate required fields
  const { customerEmail, tenderSummary } = req.body;
  
  if (!customerEmail || !tenderSummary) {
    return res.status(400).json({
      message: 'Missing required fields: customerEmail and tenderSummary are required.',
      status: 'error'
    });
  }

  // Validate tenderSummary object structure
  if (typeof tenderSummary !== 'object' || !tenderSummary.date || !tenderSummary.time || !Array.isArray(tenderSummary.saunaNames)) {
    return res.status(400).json({
      message: 'Invalid tenderSummary structure. Required fields: date, time, saunaNames (array).',
      status: 'error'
    });
  }

  // Validate saunaNames array is not empty
  if (tenderSummary.saunaNames.length === 0) {
    return res.status(400).json({
      message: 'saunaNames array cannot be empty.',
      status: 'error'
    });
  }

  // Safe access to saunaNames with proper validation (already validated above)
  const saunaNames = tenderSummary.saunaNames.join(', ');
  
  // Safe access to additionalInfo with proper validation
  const additionalInfoSection = tenderSummary.additionalInfo && typeof tenderSummary.additionalInfo === 'string'
    ? `\nLisätietosi:\n${tenderSummary.additionalInfo}`
    : '';

  // Handle timezone-shifted dates: if the serialized date has a non-zero time component,
  // it likely means the customer selected a future date that got shifted during serialization
  let formattedDate: string;
  try {
    const dateObj = dayjs.utc(tenderSummary.date);
    if (!dateObj.isValid()) {
      throw new Error('Invalid date format');
    }
    const hasTimeComponent = dateObj.hour() !== 0 || dateObj.minute() !== 0;

    // If there's a time component in what should be a pure date, assume it was timezone-shifted
    // and use the next day to preserve the customer's intended calendar date
    const adjustedDate = hasTimeComponent ? dateObj.add(1, 'day') : dateObj;
    formattedDate = adjustedDate.format('DD.MM.YYYY');
  } catch (error) {
    return res.status(400).json({
      message: 'Invalid date format provided.',
      status: 'error'
    });
  }

  var params = {
    Destination: {
      ToAddresses: [customerEmail],
    },
    Message: {
      Body: {
        Text: {
          Data: `Moro,

Tarjouspyynnöt saunoille on nyt lähetetty seuraavilla tiedoilla:

Päivämäärä: ${formattedDate}
Lähtöaika: ${dayjs(tenderSummary.time).tz('Europe/Helsinki').format('HH:mm')}
Saunat: ${saunaNames}${additionalInfoSection}

Saunayrittäjät vastaavat suoraan sähköpostiisi.

Parhain terveisin,
tampereensaunalautat.fi`,
        },
      },
      Subject: {
        Data: 'Tarjouspyyntö lähetetty: ' + formattedDate,
      },
    },
    Source: 'info@tampereensaunalautat.fi',
  };

  return sesClient
    .send(new SendEmailCommand(params))
    .then(() => {
      res.status(200).json({
        message: 'Confirmation email sent.',
        status: 'success',
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: `Error occured: ${error}`,
        status: 'error',
      });
      console.log(error);
    });
}
