import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

export class CreateUserDto {
	@IsEmail({}, { message: 'Email не валидный' })
	@IsString({ message: 'Email должен быть строкой' })
	@IsNotEmpty({ message: 'Email не может быть пустым' })
	email: string

	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Пароль не может быть пустым' })
	@MinLength(6, { message: 'Пароль должен быть не меньше 6 символов' })
	@MaxLength(32, { message: 'Пароль должен быть не больше 32 символов' })
	password: string

	@IsNotEmpty({ message: 'Логин не может быть пустым' })
	@IsString({ message: 'Логин должен быть строкой' })
	login: string
}
