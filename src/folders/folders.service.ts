import {
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

	async findById(id: string, userId: MongoType) {
		const folder = await this.folderModel
			.findById(id)
			.populate<{ user: UserDocument }>('user')
			.exec()

		if (!folder) throw new NotFoundException('Заметка не найдена.')

		if (folder.user._id.toString() !== userId.toString())
			throw new ForbiddenException('У вас нету доступа к этой заметке.')

		return folder
	}
}
