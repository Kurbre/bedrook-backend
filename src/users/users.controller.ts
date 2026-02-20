import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { GetUser } from './decorators/users.decorator'
import { Auth } from '../auth/decorators/auth.decorator'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Auth()
	@Get('get-profile')
	getProfile(@GetUser('id') userId: string) {
		return this.usersService.findById(userId)
	}
}
