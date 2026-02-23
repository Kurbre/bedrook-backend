import { Test, TestingModule } from '@nestjs/testing'
import { NotesService } from './notes.service'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '../auth/guards/auth.guard'

const note = {
	_id: '69982f8f4f4a39614efdf1ba',
	title: 'Untitled',
	text: '',
	isEditMode: true,
	createdAt: '2026-02-20T09:55:27.795Z',
	updatedAt: '2026-02-20T09:55:27.795Z',
	__v: 0
}

describe('NotesService', () => {
	let service: NotesService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NotesService,
				{
					provide: NotesService,
					useValue: {
						create: jest.fn().mockResolvedValue(note),
						update: jest.fn().mockResolvedValue(note)
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

		service = module.get<NotesService>(NotesService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should be created note', async () => {
		expect(service.create).resolves.toEqual(note)
	})
})
