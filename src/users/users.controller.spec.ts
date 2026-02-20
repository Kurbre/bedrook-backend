import { Request, Response } from 'express'
import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AuthGuard } from '../auth/guards/auth.guard'

const user = {
	_id: uuidv4(),
	login: 'dfgdfgdfggdf',
	email: 'gdfdfg@gmail.com',
	phoneNumber: '+380951267890',
	createdAt: '2026-02-12T18:40:48.402Z',
	updatedAt: '2026-02-12T18:40:48.402Z',
	__v: 0
}

describe('UsersController', () => {
	let controller: UsersController
	let service: UsersService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: {
						getProfile: jest.fn().mockResolvedValue(user),
						findById: jest.fn().mockResolvedValue(user),
						findByIdNoValidation: jest.fn().mockResolvedValue(user)
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

		controller = module.get<UsersController>(UsersController)
		service = module.get<UsersService>(UsersService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('should get profile', async () => {
		const result = await controller.getProfile(user._id)

		expect(result).toEqual(user)
	})

	it('should user not found', async () => {
		jest
			.spyOn(service, 'findById')
			.mockRejectedValueOnce(new NotFoundException('Пользователь не найден'))

		await expect(controller.getProfile('non-existent-id')).rejects.toThrow(
			NotFoundException
		)
	})
})
