import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from '../users/users.model'
import { type Types, type PopulatedDoc } from 'mongoose'

export type NoteDocument = HydratedDocument<Note>

@Schema({
	timestamps: true
})
export class Note {
	@Prop({ default: 'Untitled' })
	title: string

	@Prop({ default: '' })
	text: string

	@Prop()
	order: number

	@Prop({ default: true })
	isEditMode: boolean

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	})
	user: PopulatedDoc<User & Types.Subdocument>
}

export const NoteSchema = SchemaFactory.createForClass(Note)
