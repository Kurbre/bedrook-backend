import { Test, TestingModule } from '@nestjs/testing'
import { FoldersService } from './folders.service'
import { getModelToken } from '@nestjs/mongoose'
import { Folder } from './folders.model'
import { User } from '../users/users.model'
import { AuthGuard } from '../auth/guards/auth.guard'
import { Model } from 'mongoose'

const folder = {
	title: 'Test',
	order: 1,
	user: { _id: '699828f12d8f4022f12a1b36' },
	notes: [],
	_id: '69a3436c8d74bf7162486cae',
	createdAt: '2026-02-28T19:35:08.877Z',
	updatedAt: '2026-02-28T19:35:08.877Z',
	__v: 0
}

const userId = '123'

describe('FoldersService', () => {
	let service: FoldersService
	let folderModel: jest.Mocked<Model<Folder>>
	let userModel: jest.Mocked<Model<User>>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FoldersService,
				{
					provide: getModelToken(Folder.name),
					useValue: {
						findByIdAndUpdate: jest.fn(),
						create: jest.fn().mockResolvedValue(folder),
						find: jest.fn().mockReturnValue({
							exec: jest.fn().mockResolvedValue([folder])
						}),
						findByIdAndDelete: jest.fn(),
						findById: jest.fn((id: string) => ({
							populate: jest.fn().mockReturnValue({
								exec: jest
									.fn()
									.mockResolvedValue(id === 'not-found' ? null : folder)
							})
						}))
					}
				},
				{
					provide: getModelToken(User.name),
					useValue: {
						findByIdAndUpdate: jest.fn()
					}
				}
			]
		})
			.overrideGuard(AuthGuard)
			.useValue({ canActivate: () => true })
			.compile()

		service = module.get<FoldersService>(FoldersService)
		folderModel = module.get(getModelToken(Folder.name))
		userModel = module.get(getModelToken(User.name))
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should created folder', async () => {
		const dto = { title: 'Test123' }

		const result = await service.create(dto, userId)

		expect(folderModel.find).toHaveBeenCalled()
		expect(folderModel.create).toHaveBeenCalled()
		expect(userModel.findByIdAndUpdate).toHaveBeenCalled()

		expect(result).toEqual(folder)
	})

	it('should find by id', async () => {
		const result = await service.findById(folder._id, folder.user._id)

		expect(folderModel.findById).toHaveBeenCalled()

		expect(result).toEqual(folder)
	})

	it('should throw ForbiddenException if userId is not owner', async () => {
		await expect(service.findById(folder._id, '123')).rejects.toThrow(
			'У вас нету доступа к этой заметке.'
		)
	})

	it('should throw NotFoundException if id is not found', async () => {
		await expect(service.findById('not-found', '123')).rejects.toThrow(
			'Заметка не найдена.'
		)
	})
})
