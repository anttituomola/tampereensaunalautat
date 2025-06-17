// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { SESClient } from '@aws-sdk/client-ses';
import { SendEmailCommand } from '@aws-sdk/client-ses';
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
  emailTo: string;
  emailFrom: string;
  customerEmail: string;
  message: {
    date: string;
    time: string;
    pax: number;
    sauna: string;
    additionalInfo?: string;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { emailTo, emailFrom, customerEmail, message }: Req = req.body;
  console.log('req', req.body);

  const additionalInfoSection = message.additionalInfo
    ? `\nLisätietoja asiakkaalta:\n${message.additionalInfo}`
    : '';

  // Treat date as a simple date without timezone conversion
  const formattedDate = dayjs(message.date).format('DD.MM.YYYY');

  var params = {
    Destination: {
      ToAddresses: [emailTo],
    },
    Message: {
      Body: {
        Text: {
          Data: `${message.sauna} on saanut tarjouspyynnön: 
          
Asiakas haluaisi saunoa ${formattedDate} klo ${dayjs(message.time)
            .tz('Europe/Helsinki')
            .format('HH:mm')}, mukana ${
            message.pax
          } osallistujaa.${additionalInfoSection}
          
Vastaa tähän viestiin asiakkaalle osoitteeseen ${customerEmail}, kertomalla sopiiko tämä aika saunasi kalenteriin ja mikä olisi tilaisuuden hinta.
          
Terveisin,
tampereensaunalautat.fi | info@tampereensaunalautat.fi | +358456798818`,
        },
      },
      Subject: {
        Data: 'Tarjouspyyntö: ' + formattedDate,
      },
    },
    ReplyToAddresses: [customerEmail],
    Source: 'info@tampereensaunalautat.fi',
  };

  return sesClient
    .send(new SendEmailCommand(params))
    .then(() => {
      res.status(200).json({
        message: 'Message sent.',
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
