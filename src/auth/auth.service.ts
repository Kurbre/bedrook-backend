import {
	Injectable,
	InternalServerErrorException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { Response, type Request } from 'express'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UsersService } from 'src/users/users.service'
import { AuthDto } from './dto/auth.dto'
import { verify } from 'argon2'
import { ConfigService } from '@nestjs/config'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService
	) {}

	async register(dto: CreateUserDto, req: Request) {
		const user = await this.usersService.create(dto)

		await this.saveSession(req, user)

		return user
	}

	async login(dto: AuthDto, req: Request) {
		const { password, ...user } = await this.usersService.findByEmail(dto.email)

		const isValidPassword = await verify(password, dto.password)
		if (!isValidPassword)
			throw new UnauthorizedException('Email или пароль не правильные')

		await this.saveSession(req, user)

		return user
	}

	async logout(req: Request, res: Response): Promise<{ message: string }> {
		return new Promise((resolve, reject) => {
			if (!req.session.token)
				return reject(
					new UnauthorizedException(
						'Вы не авторизованы, чтобы выйти из аккаунта.'
					)
				)

			req.session.destroy(err => {
				if (err)
					return reject(
						new InternalServerErrorException('Не удалось выйти из аккаунта.')
					)

				res.clearCookie(this.configService.getOrThrow<string>('COOKIE_NAME'))
				resolve({
					message: 'Вы успешно вышли из аккаунта.'
				})
			})
		})
	}

	async getTemplate() {}

	private async generateJwtToken(user: Omit<User, 'password'>) {
		return this.jwtService.signAsync({
			sub: user.id,
			email: user.email
		})
	}

	private async saveSession(req: Request, user: Omit<User, 'password'>) {
		const token = await this.generateJwtToken(user)

		return new Promise((resolve, reject) => {
			req.session.token = token

			req.session.save(err => {
				if (err) {
					console.log(err)

					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию. Проверьте, правильно ли настроены параметры сесси.'
						)
					)
				}

				resolve(user)
			})
		})
	}
}
