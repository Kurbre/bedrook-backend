import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from '../users/users.model'
import { MongoType } from '../utils/types/mongo-type'
import { Note } from 'src/notes/notes.model'

export type FolderDocument = HydratedDocument<Folder>

@Schema({
	timestamps: true
})
export class Folder {
	@Prop({ default: 'Untitled' })
	title: string

	@Prop()
	order: number

	@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
	user: User

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }] })
	notes: Note[]
}

export const FolderSchema = SchemaFactory.createForClass(Folder)
