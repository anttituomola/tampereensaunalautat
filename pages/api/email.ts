// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import aws from "aws-sdk"
var ses = new aws.SES({ region: "us-east-1" })

type Data = {
  response: string
}

type Req = {
  emailTo: string
  emailFrom: string
  message: string
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { emailTo, emailFrom, message, name }: Req = req.body
  console.log("req", req.body)

  sesTest(emailTo, emailFrom, message, name)
    .then((val) => {
      console.log("Response from Amazon SES", val)
      res.status(200).json({ response: "Successfully Sent Email" })
    })
    .catch((err) => {
      res.status(400).json({ response: "error" })
      console.log("There was an error!", err, req.body)
    })
}

  function sesTest(emailTo: string, emailFrom: string, message: string, name: string) {
    var params = {
      Destination: {
        ToAddresses: [emailTo],
      },
      Message: {
        Body: {
          Text: { Data: "From Contact Form: " + name + "\n " + message },
        },

        Subject: { Data: "From: " + emailFrom },
      },
      Source: "info@tampereensaunalautat.fi",
    }

    return ses.sendEmail(params).promise()
  }
