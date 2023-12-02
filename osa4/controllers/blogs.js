const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const allUsers = await User.find({})
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: allUsers[0]._id
  })
  const savedBlog = await blog.save()
  allUsers[0].blogs = allUsers[0].blogs.concat(savedBlog._id)
  await allUsers[0].save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { $set: { likes } }, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter
