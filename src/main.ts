import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import session from 'express-session'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'

const MongoDBStore = require('connect-mongodb-session')(session)

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const config = app.get(ConfigService)

	const store = new MongoDBStore({
		uri: config.getOrThrow<string>('MONGO_URI'),
		collection: 'auth_sessions',
		connectionOptions: {
        dbName: config.getOrThrow<string>("DB_NAME"),
    }
	})

	app.setGlobalPrefix('api')

	app.enableCors({
		origin: config.getOrThrow<string>('CLIENT_URL'),
		credentials: true
	})

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.use(
		session({
			name: config.getOrThrow<string>('COOKIE_NAME'),
			secret: config.getOrThrow<string>('COOKIE_SECRET_KEY'),
			resave: false, // Не сохранять сессию, если она не менялась
			saveUninitialized: false, // Не создавать сессию, пока в неё что-то не записали
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 3, // 3 дня
				httpOnly: true, // Защита от XSS
				secure: false // true только если используете HTTPS
			},
			store: store
		})
	)

	store.on('error', function (error) {
		console.error('SESSION_STORE_ERROR:', error)
	})

	store.on('connected', function () {
		console.log('Session store connected to MongoDB')
	})

	await app.listen(config.getOrThrow<string>('APP_PORT') ?? 3000)
}
bootstrap()
