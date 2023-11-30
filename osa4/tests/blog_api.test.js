const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('correct number of blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blog identifier is "id"', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

test('blog can be added', async () => {
  const newBlog = {
    title: "Swizec - A geek with a hat",
    author: "Swizec Teller",
    url: "https://swizec.com/blog/",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain('Swizec - A geek with a hat')
})

test('if no value is given to "likes", set to 0', async () => {
  const newBlog = {
    title: "Swizec - A geek with a hat",
    author: "Swizec Teller",
    url: "https://swizec.com/blog/",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const blog = response.body.find(r => r.title === "Swizec - A geek with a hat")
  expect(blog.likes).toBe(0)
})

test('if no value to "title" is given, through error code 400', async () => {
  const newBlog = {
    author: "Swizec Teller",
    url: "https://swizec.com/blog/",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('if no value to "url" is given, through error code 400', async () => {
  const newBlog = {
    title: "Swizec - A geek with a hat",
    author: "Swizec Teller",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})
