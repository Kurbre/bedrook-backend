import { Body, Controller, Post, Req, Res } from '@nestjs/common'
import { type Request, type Response } from 'express'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() dto: CreateUserDto, @Req() req: Request) {
		return this.authService.register(dto, req)
	}

	@Post('login')
	login(@Body() dto: AuthDto, @Req() req: Request) {
		return this.authService.login(dto, req)
	}

	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
		return this.authService.logout(req, res)
	}
}
