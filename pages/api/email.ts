// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { SESClient } from "@aws-sdk/client-ses"
import { SendEmailCommand } from "@aws-sdk/client-ses"
import dayjs from "dayjs"

interface Credentials {
  accessKeyId: any
  secretAccessKey: any
}

const credentials: Credentials = {
  accessKeyId: process.env.AWS_SDK_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SDK_SECRET_ACCESS_KEY,
}

const sesClient = new SESClient({
  region: process.env.AWS_SDK_REGION,
  credentials: credentials,
})

type Data = {
  message: string,
  status: string,
}

type Req = {
  emailTo: string
  emailFrom: string
  customerEmail: string
  message: {
    date: string
    time: string
    pax: number
    sauna: string
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { emailTo, emailFrom, customerEmail, message }: Req = req.body
  console.log("req", req.body)

  var params = {
    Destination: {
      ToAddresses: [emailTo],
      BccAddresses: [emailFrom],
    },
    Message: {
      Body: {
        Text: {
          Data: `${message.sauna} on saanut tarjouspyynnön: 
          
          Asiakas haluaisi saunoa ${dayjs(message.date).format(
            "DD.MM.YYYY"
          )} klo ${dayjs(message.time).format("HH:mm")}, mukana ${
            message.pax
          } osallistujaa.
          
          Vastaa tähän viestiin asiakkaalle osoitteeseen ${customerEmail}, kertomalla sopiiko tämä aika saunasi kalenteriin ja mikä olisi tilaisuuden hinta.
          
          Terveisin,
          tampereensaunalautat.fi | info@tampereensaunalautat.fi | +358456798818`,
        },
      },
      Subject: {
        Data: "Tarjouspyyntö: " + dayjs(message.date).format("DD.MM.YYYY"),
      },
    },
    ReplyToAddresses: [customerEmail],
    Source: "info@tampereensaunalautat.fi",
  }

  return sesClient
    .send(new SendEmailCommand(params))
    .then(() => {
      res.status(200).json({
        message: "Message sent.",
        status: "success",
      })
    })
    .catch((error) => {
      res.status(500).json({
        message: `Error occured: ${error}`,
        status: "error",
      })
    })
}
