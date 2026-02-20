import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({
	timestamps: true
})
export class User {
	@Prop({ unique: true })
	login: string

	@Prop({ unique: true })
	email: string

	@Prop({ select: false })
	password: string
}

export const UserSchema = SchemaFactory.createForClass(User)
