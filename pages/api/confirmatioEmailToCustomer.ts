// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);
dayjs.extend(utc);
import "dayjs/locale/fi";
dayjs.locale("fi");

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
  const { customerEmail, tenderSummary }: Req = req.body;

  const saunaNames = tenderSummary.saunaNames.join(", ");
  const additionalInfoSection = tenderSummary.additionalInfo
    ? `\nLisätietosi:\n${tenderSummary.additionalInfo}`
    : "";

  var params = {
    Destination: {
      ToAddresses: [customerEmail],
    },
    Message: {
      Body: {
        Text: {
          Data: `Moro,

Tarjouspyynnöt saunoille on nyt lähetetty seuraavilla tiedoilla:

Päivämäärä: ${dayjs(tenderSummary.date)
            .tz("Europe/Helsinki")
            .format("DD.MM.YYYY")}
Lähtöaika: ${dayjs(tenderSummary.time).tz("Europe/Helsinki").format("HH:mm")}
Saunat: ${saunaNames}${additionalInfoSection}

Saunayrittäjät vastaavat suoraan sähköpostiisi.

Parhain terveisin,
tampereensaunalautat.fi`,
        },
      },
      Subject: {
        Data:
          "Tarjouspyyntö lähetetty: " +
          dayjs(tenderSummary.date).tz("Europe/Helsinki").format("DD.MM.YYYY"),
      },
    },
    Source: "info@tampereensaunalautat.fi",
  };

  return sesClient
    .send(new SendEmailCommand(params))
    .then(() => {
      res.status(200).json({
        message: "Confirmation email sent.",
        status: "success",
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: `Error occured: ${error}`,
        status: "error",
      });
      console.log(error);
    });
}
