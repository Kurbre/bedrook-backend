import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { CreateFolderDto } from './dto/create-folder.dto'
import { MongoType } from '../utils/types/mongo-type'
import { InjectModel } from '@nestjs/mongoose'
import { Folder, FolderDocument } from './folders.model'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/users.model'
import { NoteDocument } from 'src/notes/notes.model'

@Injectable()
export class FoldersService {
	constructor(
		@InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
		@InjectModel(User.name) private readonly userModel: Model<User>
	) {}

	async create(dto: CreateFolderDto, userId: MongoType) {
		const folders = await this.folderModel.find().exec()

		const maxOrder =
			folders!.length > 0 ? Math.max(...folders!.map(n => n.order)) : 0

		const folder = (await this.folderModel.create({
			user: userId,
			title: dto.title,
			order: maxOrder + 1
		})) as FolderDocument

		await this.userModel.findByIdAndUpdate(userId, {
			$push: {
				folders: folder._id
			}
		})

		return folder
	}

	async update(id: string, dto: CreateFolderDto, userId: MongoType) {
		await this.findById(id, userId)

		return await this.folderModel.findByIdAndUpdate(id, dto, {
			returnDocument: 'after'
		})
	}

	async remove(id: string, userId: MongoType) {
		await this.findById(id, userId)

		await this.folderModel.findByIdAndDelete(id)

		await this.userModel.findByIdAndUpdate(userId, {
			$pull: {
				folders: id
			}
		})

		return {
			message: 'Папка успешно удалена.'
		}
	}

	async findById(id: MongoType, userId: MongoType) {
		const folder = await this.folderModel
			.findById(id)
			.populate<{ user: UserDocument }>('user')
			.populate<{ notes: NoteDocument[] }>('notes')
			.exec()

		if (!folder) throw new NotFoundException('Папка не найдена.')

		if (folder.user._id.toString() !== userId.toString())
			throw new ForbiddenException('У вас нету доступа к этой заметке.')

		return folder
	}

	async addedNoteToFolder(
		folderId: MongoType,
		noteId: MongoType,
		userId: string
	) {
		const folder = await this.findById(folderId, userId)

		if (folder.notes.find(i => i.id === noteId))
			throw new BadRequestException('Заметка уже добавлена в папку')

		return await this.folderModel.findByIdAndUpdate(
			folderId,
			{
				$push: {
					notes: noteId
				}
			},
			{
				returnDocument: 'after'
			}
		)
	}

	async removeNoteFromFolder(
		folderId: MongoType,
		noteId: MongoType,
		userId: string
	) {
		const folder = await this.findById(folderId, userId)

		if (!folder.notes.find(i => i.id === noteId))
			throw new BadRequestException('Заметки нету в папку')

		return await this.folderModel.findByIdAndUpdate(
			folderId,
			{
				$pull: {
					notes: noteId
				}
			},
			{
				returnDocument: 'after'
			}
		)
	}

	async getMaxOrder(id: MongoType, userId: MongoType) {
		const folder = await this.findById(id, userId)

		const maxOrder =
			folder!.notes.length > 0
				? Math.max(...folder!.notes.map(n => n.order))
				: 0

		return maxOrder
	}
}
