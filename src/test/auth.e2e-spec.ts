import { INestApplication, ValidationPipe } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AppModule } from '../app.module'
import { App } from 'supertest/types'
import mongoose from 'mongoose'
import request from 'supertest'
import session from 'express-session'

describe('AuthController (e2e)', () => {
	let app: INestApplication<App>
	let mongod: MongoMemoryServer
	let testUserData: {
		login: string
		password: string
		email: string
		phoneNumber: string
	}

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const uri = mongod.getUri()

		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		})
			.overrideModule(MongooseModule)
			.useModule(MongooseModule.forRoot(uri))
			.compile()

		app = module.createNestApplication()

		app.useGlobalPipes(
			new ValidationPipe({
				transform: true
			})
		)

		app.setGlobalPrefix('api')

		// Add session middleware for e2e testing
		app.use(
			session({
				secret: 'test-secret',
				resave: false,
				saveUninitialized: false,
				cookie: { maxAge: 1000 * 60 * 60 * 24 }
			})
		)

		await app.init()

		// Prepare test user data
		const timestamp = Date.now()
		testUserData = {
			login: `mock-test-${timestamp}`,
			password: 'test123',
			email: `mock-test-${timestamp}@gmail.com`,
			phoneNumber: `+3801234567${timestamp.toString().slice(-2)}`
		}
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongod.stop()
		await app.close()
	})

	it('/api/auth/register (POST)', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/auth/register')
			.send(testUserData)

		expect(res.status).toBe(201)
		expect(res.body).toHaveProperty('_id')
		expect(res.body.email).toBe(testUserData.email)
	})

	it('/api/auth/register (POST) - created no unique login user', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/auth/register')
			.send(testUserData)

		expect(res.status).toBe(400)
		expect(res.body.message).toBe(
			'Пользователь с такими данными уже существует'
		)
	})

	it('/api/auth/login (POST)', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/auth/login')
			.send({
				login: testUserData.login,
				password: testUserData.password
			})

		expect(res.status).toBe(200)
		expect(res.body).toHaveProperty('_id')
		expect(res.body.email).toBe(testUserData.email)
	})

	it('/api/auth/login (POST) - should throw 404 error', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/auth/login')
			.send({
				login: 'tesgfjkdjfk@gmail.com',
				password: testUserData.password
			})

		expect(res.status).toBe(404)
		expect(res.body.message).toEqual('Пользователь не найден')
	})

	it('/api/auth/login (POST) - should throw 401 error', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/auth/login')
			.send({
				login: testUserData.email,
				password: 'incorect password'
			})

		expect(res.status).toBe(401)
		expect(res.body.message).toEqual('Логин или пароль не верные')
	})

	it('/api/auth/logout (POST)', async () => {
		const agent = request.agent(app.getHttpServer())

		await agent.post('/api/auth/login').send({
			login: testUserData.login,
			password: testUserData.password
		})

		const res = await agent.post('/api/auth/logout').send()

		expect(res.status).toBe(200)
		expect(res.body).toEqual({
			message: 'Вы вышли из аккаунта.'
		})
	})

	it('/api/auth/logout (POST) - should throw error', async () => {
		const res = await request
			.agent(app.getHttpServer())
			.post('/api/auth/logout')
			.send()

		expect(res.status).toBe(401)
		expect(res.body.message).toEqual(
			'Вы не авторизованы, чтобы выйти из аккаунта.'
		)
	})
})
