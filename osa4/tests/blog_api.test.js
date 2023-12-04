const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
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

describe('When user is logged in', () => {
  beforeEach(async () => {
    const loginUser = await api
      .post('/api/login')
      .send({ username: "root", password: "sekret" })
      .expect(200)

    token = `Bearer ${loginUser.body.token}`
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
      .set({ Authorization: token })
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
      .set({ Authorization: token })
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
      .set({ Authorization: token })
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
      .set({ Authorization: token })
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blog can be deleted', async () => {
    const newBlog = {
      title: "Swizec - A geek with a hat",
      author: "Swizec Teller",
      url: "https://swizec.com/blog/",
      likes: 6
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: token })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[blogsAtStart.body.length - 1]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: token })
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1)

    const titles = blogsAtEnd.body.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

test('blog cannot be added if token is not provided', async () => {
  const newBlog = {
    title: "Swizec - A geek with a hat",
    author: "Swizec Teller",
    url: "https://swizec.com/blog/",
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length)
  expect(titles).not.toContain('Swizec - A geek with a hat')
})

test('blog can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]
  expect(blogToUpdate.likes).toBe(7)

  blogToUpdate.likes = 5

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(200)

  const blogsAtEnd = await api.get('/api/blogs')
  const updatedBlog = blogsAtEnd.body[0]
  expect(updatedBlog.id).toBe(blogToUpdate.id)
  expect(updatedBlog.likes).toBe(5)
})

afterAll(async () => {
  await mongoose.connection.close()
})
