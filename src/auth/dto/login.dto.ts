import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	IsNotEmpty
} from 'class-validator'

export class LoginDto {
	@IsString({ message: 'Пароль должен быть строкой' })
	@MinLength(6, { message: 'Пароль должен быть не меньше 6 символов' })
	@MaxLength(32, { message: 'Пароль должен быть не больше 32 символов' })
	password: string

	@IsString({ message: 'Логин должен быть строкой' })
	@IsNotEmpty({ message: 'Логин не может быть пустым' })
	login: string
}
