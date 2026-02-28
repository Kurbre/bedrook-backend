import { Test, TestingModule } from '@nestjs/testing'
import { FoldersController } from './folders.controller'
import { FoldersService } from './folders.service'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '../auth/guards/auth.guard'

const folder = {
	title: 'Test',
	order: 1,
	user: '699828f12d8f4022f12a1b36',
	notes: [],
	_id: '69a3436c8d74bf7162486cae',
	createdAt: '2026-02-28T19:35:08.877Z',
	updatedAt: '2026-02-28T19:35:08.877Z',
	__v: 0
}

const userId = '123'

describe('FoldersController', () => {
	let controller: FoldersController
	let service: FoldersService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FoldersController],
			providers: [
				{
					provide: FoldersService,
					useValue: {
						create: jest.fn().mockResolvedValue(folder),
						update: jest.fn().mockResolvedValue(folder),
						findById: jest.fn().mockResolvedValue(folder),
						remove: jest
							.fn()
							.mockResolvedValue({ message: 'Папка успешно удалена.' })
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

		controller = module.get<FoldersController>(FoldersController)
		service = module.get<FoldersService>(FoldersService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('should be completed created', async () => {
		const dto = { title: 'Test123' }

		const result = await controller.create(dto, userId)

		expect(service.create).toHaveBeenCalledTimes(1)
		expect(service.create).toHaveBeenCalledWith(dto, userId)
		expect(result).toEqual(folder)
	})

	it('should be completed updated', async () => {
		const dto = { title: 'Test123' }

		const result = await controller.update(folder._id, dto, userId)

		expect(service.update).toHaveBeenCalledTimes(1)
		expect(service.update).toHaveBeenCalledWith(folder._id, dto, userId)
		expect(result).toEqual(folder)
	})

	it('should be completed removed', async () => {
		const result = await controller.remove(folder._id, userId)

		expect(service.remove).toHaveBeenCalledTimes(1)
		expect(service.remove).toHaveBeenCalledWith(folder._id, userId)
		expect(result).toEqual({ message: 'Папка успешно удалена.' })
	})
})
