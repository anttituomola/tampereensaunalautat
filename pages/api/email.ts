// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import aws from "aws-sdk"
import dayjs from "dayjs"

aws.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
  signatureVersion: 'v4',
})

var ses = new aws.SES({ region: "us-east-1" })

type Data = {
  response: string
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

  sesTest(emailTo, emailFrom, customerEmail, message)
    .then((val) => {
      console.log("Response from Amazon SES", val)
      res.status(200).json({ response: "Successfully Sent Email" })
    })
    .catch((err) => {
      res.status(400).json({ response: "error" })
      console.log("There was an error!", err, req.body)
    })
}

function sesTest(
  emailTo: string,
  emailFrom: string,
  customerEmail: string,
  message: {
    date: string
    time: string
    pax: number
    sauna: string
  }
) {
  var params = {
    Destination: {
      ToAddresses: [emailTo],
    },
    Message: {
      Body: {
        Text: {
          Data: `${message.sauna} on saanut tarjouspyynnön: 
          
          Asiakas haluaisi saunoa ${dayjs(message.date).format("DD.MM.YYYY")} klo ${dayjs(message.time).format("HH:mm")}, mukana ${message.pax} osallistujaa.
          
          Vastaa asiakkaalle osoitteeseen ${customerEmail}, kertomalla sopiiko tämä aika saunasi kalenteriin ja mikä olisi tilaisuuden hinta.`,
        },
      },
      Subject: { Data: "Tarjouspyyntö: " + dayjs(message.date).format("DD.MM.YYYY") },
    },
        ReplyToAddresses: [customerEmail],
     Source: "info@tampereensaunalautat.fi",
  }

  return ses.sendEmail(params).promise()
}
