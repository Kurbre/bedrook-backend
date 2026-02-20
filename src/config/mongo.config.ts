import { ConfigService } from '@nestjs/config'
import { MongooseModuleOptions } from '@nestjs/mongoose'


export const mongoConfig = (configService: ConfigService): MongooseModuleOptions => ({
	uri: configService.getOrThrow<string>('MONGO_URI'),
	dbName: configService.getOrThrow<string>('DB_NAME')
})