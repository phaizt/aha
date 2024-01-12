import { Injectable } from '@nestjs/common';
import { Client, SendEmailV3_1, LibraryResponse } from 'node-mailjet';

@Injectable()
export class MailService {
  async sendMail(params: { to: string; subject: string; html: string }) {
    const { to, subject, html } = params;
    const mailjet = new Client({
      apiKey: process.env.MAIL_USER,
      apiSecret: process.env.MAIL_PASS,
    });
    const body: SendEmailV3_1.Body = {
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM,
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
      .post('send', { version: 'v3.1' })
      .request(body);

    const { Status } = result.body.Messages[0];
    return Status;
  }
}
