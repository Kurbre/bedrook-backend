import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	HttpStatus
} from '@nestjs/common'
import { FoldersService } from './folders.service'
import { CreateFolderDto } from './dto/create-folder.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetUser } from '../users/decorators/users.decorator'

@Controller('folders')
export class FoldersController {
	constructor(private readonly foldersService: FoldersService) {}

	@Auth()
	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(
		@Body() createFolderDto: CreateFolderDto,
		@GetUser('_id') userId: string
	) {
		return this.foldersService.create(createFolderDto, userId)
	}

	@Patch(':id')
	@Auth()
	@HttpCode(HttpStatus.OK)
	update(
		@Param('id') id: string,
		@Body() updateFolderDto: CreateFolderDto,
		@GetUser('_id') userId: string
	) {
		return this.foldersService.update(id, updateFolderDto, userId)
	}

	@Delete(':id')
	@Auth()
	@HttpCode(HttpStatus.OK)
	remove(@Param('id') id: string, @GetUser('_id') userId: string) {
		return this.foldersService.remove(id, userId)
	}
}
