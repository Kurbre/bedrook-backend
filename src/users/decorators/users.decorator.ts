import { createParamDecorator } from '@nestjs/common'
import { UserDocument } from '../users.model'

export const GetUser = createParamDecorator((data: keyof UserDocument, ctx) => {
	const req = ctx.switchToHttp().getRequest()

	const user = req.user

	return data ? user?.[data] : user
})
