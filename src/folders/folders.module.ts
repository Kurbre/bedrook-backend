import { Module } from '@nestjs/common'
import { FoldersService } from './folders.service'
import { FoldersController } from './folders.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Folder, FolderSchema } from './folders.model'
import { User, UserSchema } from '../users/users.model'
import { UsersModule } from '../users/users.module'

@Module({
	controllers: [FoldersController],
	providers: [FoldersService],
	imports: [
		MongooseModule.forFeature([
			{
				name: Folder.name,
				schema: FolderSchema
			},
			{
				name: User.name,
				schema: UserSchema
			}
		]),
		UsersModule
	]
})
export class FoldersModule {}
