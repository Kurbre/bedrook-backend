import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	Res,
	HttpStatus
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { type Request, type Response } from 'express'
import { CreateUserDto } from '../users/dto/create-user.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	login(@Body() dto: LoginDto, @Req() req: Request) {
		return this.authService.login(dto, req)
	}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	register(@Body() dto: CreateUserDto, @Req() req: Request) {
		return this.authService.register(dto, req)
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(req, res)
	}
}
