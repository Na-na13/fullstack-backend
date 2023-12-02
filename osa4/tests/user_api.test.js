const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

test('user is created with correct credentials', async () => {
  const usersAtStart = await api.get('/api/users')
    
  const newUser = {
    username: 'xyz',
    password: 'abcd'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await api.get('/api/users')
  expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length + 1)

  const usernames = usersAtEnd.body.map(u => u.username)
  expect(usernames).toContain(newUser.username)
})

describe('creation of user fails if', () => {
  test('username is not unique and proper status code is given', async () => {
    const usersAtStart = await api.get('/api/users')
      
    const notUniqueUser = {
      username: 'root',
      password: 'password'
    }
    
    const result = await api
      .post('/api/users')
      .send(notUniqueUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('expected `username` to be unique')
    
    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length)
  })

  test('username is shorter than 3 characters and proper status code is given', async () => {
    const usersAtStart = await api.get('/api/users')
      
    const newUser = {
      username: 'ab',
      password: 'password'
    }
    
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('`username` (`ab`) is shorter than the minimum allowed length')
    
    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length)
  })
    
  test('password is shorter than 3 characters and proper status code is given', async () => {
    const usersAtStart = await api.get('/api/users')
    
    const newUser = {
      username: 'user',
      password: 'ab'
    }
    
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('too short password')
    
    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length)
  })
    
  test('creation of user fails if username or password is missing and proper status code is given', async () => {
    const usersAtStart = await api.get('/api/users')

    const newUserWithoutUsername = {
    password: 'password'
    }

    let result = await api
      .post('/api/users')
      .send(newUserWithoutUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` is required')

    let usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length)

    const newUserWithoutPassword = {
      username: 'username'
    }
    
    result = await api
      .post('/api/users')
      .send(newUserWithoutPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password missing')
    
    usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length)
  })
})


afterAll(async () => {
    await mongoose.connection.close()
  })
