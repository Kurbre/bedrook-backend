import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { UpdateNoteDto } from './dto/update-note.dto'
import { type MongoType } from 'src/utils/types/mongo-type'
import { InjectModel } from '@nestjs/mongoose'
import { Note, NoteDocument } from './notes.model'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/users.model'

@Injectable()
export class NotesService {
	constructor(
		@InjectModel(Note.name) private readonly noteModel: Model<Note>,
		@InjectModel(User.name) private readonly userModel: Model<User>
	) {}

	async create(userId: MongoType) {
		const user = await this.userModel
			.findById(userId)
			.populate<{ notes: Note[] }>({
				path: 'notes',
				options: { sort: { order: 1 } }
			})
			.exec()

		const maxOrder =
			user!.notes.length > 0 ? Math.max(...user!.notes.map(n => n.order)) : 0

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
}
