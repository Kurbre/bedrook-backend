import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
	private transporter

	constructor(private readonly configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true, // true для 465, false для других портов
			auth: {
				user: this.configService.getOrThrow<string>('SMTP_USER'),
				pass: this.configService.getOrThrow<string>('SMTP_PASS')
			}
		})
	}

	async sendMail(to: string, subject: string, html: string) {
		return this.transporter.sendMail({
			from: `"Donation" <${this.configService.getOrThrow<string>('SMTP_USER')}>`,
			to,
			subject,
			html
		})
	}
}
