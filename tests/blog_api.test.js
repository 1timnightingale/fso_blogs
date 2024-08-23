const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

const api = supertest(app)

describe('blog API testing', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is id', async () => {
    const response = await api.get('/api/blogs')
    const responseArray = JSON.parse(JSON.stringify(response.body))
    const ids = responseArray.map(blog => blog.id); // Extract ids
    const unique = [...new Set(ids)]
    assert.strictEqual(unique.length, helper.initialBlogs.length)
  })

  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: "This is a new note for testing",
      author: "Tim Nightingale",
      url: "https://www.news.bbc.co.uk",
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('This is a new note for testing'))
    const authors = blogsAtEnd.map(b => b.author)
    assert(authors.includes('Tim Nightingale'))
    const urls = blogsAtEnd.map(b => b.url)
    assert(urls.includes('https://www.news.bbc.co.uk'))
    const likess = blogsAtEnd.map(b => b.likes)
    assert(likess.includes(5))
  })


  test('blog without likes value defaults to zero (0)', async () => {
    const newBlog2 = {
      title: "A note that has not been liked",
      author: "Bluey Heeler",
      url: "https://www.apple.com",
    }

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd2 = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd2.length, helper.initialBlogs.length + 1)

    const likess = blogsAtEnd2.map(b => b.likes)
    assert(likess.includes(0))
  })


  test('blog without title', async () => {
    const newBlog3 = {
      author: "Bingo Heeler",
      url: "https://www.apple.com",
      likes: 7
    }

    await api
      .post('/api/blogs')
      .send(newBlog3)
      .expect(400)
  })

  test('blog without url', async () => {
    const newBlog4 = {
      title: 'another amazing blog that is wrong',
      author: "Bingo Heeler",
      likes: 7
    }

    await api
      .post('/api/blogs')
      .send(newBlog4)
      .expect(400)
  })

  test('a valid blog can be deleted ', async () => {

    await api
      .delete('/api/blogs/5a422a851b54a676234d17f7')
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })


  test('a valid blog can be updated ', async () => {
    const newBlog4 = {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 10,
    }

    await api
      .put('/api/blogs/5a422bc61b54a676234d17fc')
      .send(newBlog4)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('Type wars'))
    const authors = blogsAtEnd.map(b => b.author)
    assert(authors.includes('Robert C. Martin'))
    const urls = blogsAtEnd.map(b => b.url)
    assert(urls.includes('http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'))
    const likess = blogsAtEnd.map(b => b.likes)
    assert(likess.includes(10))
  })


}) // end blog testing description

////// ALWAYS LAST ////////
after(async () => {
  await mongoose.connection.close()
})

