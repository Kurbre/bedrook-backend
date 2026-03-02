import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { UpdateNoteDto } from './dto/update-note.dto'
import { type MongoType } from '../utils/types/mongo-type'
import { InjectModel } from '@nestjs/mongoose'
import { Note, NoteDocument } from './notes.model'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/users.model'
import { FoldersService } from 'src/folders/folders.service'

@Injectable()
export class NotesService {
	constructor(
		@InjectModel(Note.name) private readonly noteModel: Model<Note>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly foldersService: FoldersService
	) {}

	async create(userId: MongoType) {
		const maxOrder = await this.getMaxOrder(userId)

		const note = (await this.noteModel.create({
			user: userId,
			order: maxOrder + 1
		})) as NoteDocument

		await this.userModel.findByIdAndUpdate(userId, {
			$push: { notes: note._id }
		})

		return note
	}

	async update(id: MongoType, dto: UpdateNoteDto, userId: MongoType) {
		await this.findById(id, userId)

		return await this.noteModel.findByIdAndUpdate(id, dto, {
			returnDocument: 'after'
		})
	}

	async findById(id: MongoType, userId: MongoType) {
		const note = await this.noteModel
			.findById(id)
			.populate<{ user: UserDocument }>('user')
			.exec()

		if (!note) throw new NotFoundException('Заметка не найдена.')

		if (note.user._id.toString() !== userId.toString())
			throw new ForbiddenException('У вас нету доступа к этой заметке.')

		return note
	}

	async getMaxOrder(userId: MongoType) {
		const user = await this.userModel
			.findOne({
				id: userId,
				$or: [{ folders: [] }, { folders: null }]
			})
			.populate<{ notes: Note[] }>({
				path: 'notes',
				options: { sort: { order: 1 } }
			})
			.exec()

		return user!.notes.length > 0
			? Math.max(...user!.notes.map(n => n.order))
			: 0
	}

	async addedNoteToFolder(folderId: MongoType, noteId: string, userId: string) {
		await this.foldersService.addedNoteToFolder(folderId, noteId, userId)

		const order = await this.foldersService.getMaxOrder(folderId, userId)

		await this.findById(noteId, userId)

		await this.noteModel.findByIdAndUpdate(
			noteId,
			{
				folder: folderId,
				order: order + 1
			},
			{ returnDocument: 'after' }
		)

		return { message: 'Заметка успешно добавлена.' }
	}

	async removeNoteFromFolder(
		folderId: MongoType,
		noteId: string,
		userId: string
	) {
		await this.foldersService.removeNoteFromFolder(folderId, noteId, userId)

		const maxOrder = await this.getMaxOrder(userId)

		await this.findById(noteId, userId)

		await this.noteModel.findByIdAndUpdate(
			noteId,
			{
				folder: null,
				order: maxOrder + 1
			},
			{ returnDocument: 'after' }
		)

		return { message: 'Заметка успешно удалена.' }
	}

	async getNotes(userId: MongoType) {
		const butNotFolder = await this.noteModel.find({
			folder: null
		})

		return butNotFolder
	}
}
