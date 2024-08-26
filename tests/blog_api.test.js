const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')
const User = require('../models/user')


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

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token
    const loginOption = { headers: { 'Authorization': `Bearer ${testToken}` } }
    // end of section
    // add loginOption to api.get request

    const response = await api.get('/api/blogs', loginOption)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is id', async () => {
    const response = await api.get('/api/blogs')
    const responseArray = JSON.parse(JSON.stringify(response.body))
    const ids = responseArray.map(blog => blog.id); // Extract ids
    const unique = [...new Set(ids)]
    assert.strictEqual(unique.length, helper.initialBlogs.length)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: "This is a new note for testing",
      author: "Tim Nightingale",
      url: "https://www.news.bbc.co.uk",
      likes: 5
    }

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token
    const loginOption = `Bearer ${testToken}`
    // end of section
    // add loginOption to api.get request
    //      .set({ 'Authorization': loginOption })

    await api
      .post('/api/blogs')
      .set({ 'Authorization': loginOption })
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
    const newBlog = {
      title: "A note that has not been liked",
      author: "Bluey Heeler",
      url: "https://www.apple.com",
    }

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token

    const loginOption = `Bearer ${testToken}`

    // end of section
    // add loginOption to api.get request

    await api
      .post('/api/blogs')
      .set({ 'Authorization': loginOption })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const likess = blogsAtEnd.map(b => b.likes)
    assert(likess.includes(0))
  })


  test('blog without title', async () => {
    const newBlog = {
      author: "Bingo Heeler",
      url: "https://www.apple.com",
      likes: 7
    }

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token

    const loginOption = `Bearer ${testToken}`

    // end of section
    // add loginOption to api.get request
    //      .set({ 'Authorization': loginOption })

    await api
      .post('/api/blogs')
      .set({ 'Authorization': loginOption })
      .send(newBlog)
      .expect(400)
  })

  test('blog without url', async () => {
    const newBlog = {
      title: 'another amazing blog that is wrong',
      author: "Bingo Heeler",
      likes: 7
    }

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token

    const loginOption = `Bearer ${testToken}`

    // end of section
    // add loginOption to api.get request
    //      .set({ 'Authorization': loginOption })

    await api
      .post('/api/blogs')
      .set({ 'Authorization': loginOption })
      .send(newBlog)
      .expect(400)
  })

  test('a valid blog can be deleted', async () => {

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token

    const loginOption = `Bearer ${testToken}`

    // end of section
    // add loginOption to api.get request
    //      .set({ 'Authorization': loginOption })

    await api
      .delete('/api/blogs/5a422a851b54a676234d17f7')
      .set({ 'Authorization': loginOption })
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })


  test('a valid blog can be updated ', async () => {
    const newBlog = {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 10,
    }

    // Section to log in test user
    const testUser = {
      username: 'root',
      password: 'salainen'
    }
    const signInResponse = await api.post('/api/login').send(testUser)
    let testToken = signInResponse.body.token

    const loginOption = `Bearer ${testToken}`

    // end of section
    // add loginOption to api.get request
    //      .set({ 'Authorization': loginOption })


    await api
      .put('/api/blogs/5a422bc61b54a676234d17fc')
      .set({ 'Authorization': loginOption })
      .send(newBlog)
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

// ///////////// User API testing

describe('when there is initially one user in db', () => {
  beforeEach(async () => {

    /*
        await User.deleteMany({})
    
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
    
        await user.save()
    */
    await User.deleteMany({})

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)


  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected username to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails shortened username or password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bo',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('username and password should be at least 3 characters'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  /*
    //// login in a test user and get header token
    const loginTestUser = req => {
      const testUser = {
        username: 'root',
        password: 'salainen',
      }
  
      ///
  
      const signInResponse = api.post('/api/login').send(testUser)
  
      let cookie = signInResponse.get('token')
      console.log('Cookie:', cookie)
      //  const response = await request(app).get('/auth/test-private').set('Cookie', [...cookie]);
  
  
  
      ///
  
  
      const result = api
        .post('/api/login')
        .send(testUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      console.log('result', result)
      const testToken = (result.body)
      console.log('test token', testToken)
      const headerOptions = { headers: { 'Authorization': `Bearer ${testToken}` } }
  
      return headerOptions
    }
    ////////////////////////
  */


})




////// ALWAYS LAST ////////
after(async () => {
  await mongoose.connection.close()
})

