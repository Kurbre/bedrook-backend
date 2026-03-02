import { Module } from '@nestjs/common'
import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Note, NoteSchema } from './notes.model'
import { User, UserSchema } from '../users/users.model'
import { UsersModule } from '../users/users.module'
import { FoldersModule } from 'src/folders/folders.module'

@Module({
	controllers: [NotesController],
	providers: [NotesService],
	imports: [
		MongooseModule.forFeature([
			{ name: Note.name, schema: NoteSchema },
			{ name: User.name, schema: UserSchema }
		]),
		UsersModule,
		FoldersModule
	]
})
export class NotesModule {}
