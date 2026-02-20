import { Request, Response } from 'express'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from './guards/auth.guard'

const user = {
	_id: uuidv4(),
	login: 'dfgdfgdfggdf',
	email: 'gdfdfg@gmail.com',
	phoneNumber: '+380951267890',
	createdAt: '2026-02-12T18:40:48.402Z',
	updatedAt: '2026-02-12T18:40:48.402Z',
	__v: 0
}

describe('AuthController', () => {
	let controller: AuthController
	let service: AuthService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						login: jest.fn().mockResolvedValue(user),
						register: jest.fn().mockResolvedValue(user),
						logout: jest
							.fn()
							.mockResolvedValue({ message: 'Вы вышли из аккаунта.' })
					}
				},
				{
					provide: JwtService,
					useValue: {
						signAsync: jest.fn(),
						verifyAsync: jest.fn()
					}
				}
			]
		})
			.overrideGuard(AuthGuard)
			.useValue({ canActivate: () => true })
			.compile()

		controller = module.get<AuthController>(AuthController)
		service = module.get<AuthService>(AuthService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('should login user', async () => {
		const dto = { login: user.email, password: '123123' }

		const req = { session: {} } as Request

		const result = await controller.login(dto, req)

		expect(service.login).toHaveBeenCalledWith(dto, req)
		expect(result).toEqual(user)
	})

	it('should login user an exception if user not found', async () => {
		jest
			.spyOn(service, 'login')
			.mockRejectedValueOnce(new NotFoundException('Пользователь не найден'))

		await expect(
			controller.login({ login: '', password: '' }, { session: {} } as Request)
		).rejects.toThrow(NotFoundException)
	})

	it('should register user', async () => {
		const dto = {
			email: user.email,
			login: user.login,
			phoneNumber: user.phoneNumber,
			password: '123123'
		}

		const req = { session: {} } as Request

		const result = await controller.register(dto, req)

		expect(service.register).toHaveBeenCalledWith(dto, req)
		expect(result).toEqual(user)
	})

	it('should register user an exception if user not found', async () => {
		jest
			.spyOn(service, 'register')
			.mockRejectedValueOnce(new NotFoundException('Пользователь не найден'))

		await expect(
			controller.register(
				{ email: '', login: '', phoneNumber: '', password: '' },
				{ session: {} } as Request
			)
		).rejects.toThrow(NotFoundException)
	})

	it('should logout user', async () => {
		const req = { session: { token: 'test-token' } } as Request
		const res = { clearCookie: jest.fn() } as any

		const result = await controller.logout(req, res)

		expect(service.logout).toHaveBeenCalledWith(req, res)
		expect(result).toEqual({ message: 'Вы вышли из аккаунта.' })
	})

	it('should logout user not token', async () => {
		jest
			.spyOn(service, 'logout')
			.mockRejectedValueOnce(
				new UnauthorizedException(
					'Вы не авторизованы, чтобы выйти из аккаунта.'
				)
			)

		const req = { session: {} } as Request
		const res = {} as Response

		await expect(controller.logout(req, res)).rejects.toThrow(
			UnauthorizedException
		)
	})
})
