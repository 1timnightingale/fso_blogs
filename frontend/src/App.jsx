import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const [newBlogTitle, setNewBlogTitle] = useState('blog title...')
  const [newBlogAuthor, setNewBlogAuthor] = useState('blog author...')
  const [newBlogUrl, setNewBlogUrl] = useState('blog URL...')
  const [newBlogLikes, setNewBlogLikes] = useState('blog likes...')
  const [userMessage, setUserMessage] = useState({ message: null, status: null })

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON =
      window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])


  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: newBlogTitle,
      author: newBlogAuthor,
      url: newBlogUrl,
      likes: newBlogLikes
    }

    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setNewBlogTitle('blog title...')
        setNewBlogAuthor('blog author...')
        setNewBlogUrl('blog URL...')
        setNewBlogLikes('blog likes...')
        setUserMessage({ message: `Blog \' ${blogObject.title}\' added`, status: 'info' })
        setTimeout(() => {
          setUserMessage({ message: null, status: null })
        }, 3000)
      })
  }


  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setUserMessage({ message: 'Wrong credentials', status: 'error' })
      setTimeout(() => {
        setUserMessage({ message: null, status: null })
      }, 3000)
    }
  }


  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const handleLogout = async (event) => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken('')
    setUser(null)
    setUsername('')
    setPassword('')
  }

  const blogForm = () => (
    <div>
      <p> Add a new blog</p>
      <form onSubmit={addBlog}>
        <div>title:
          <input
            value={newBlogTitle}
            onChange={handleTitleChange}
          />
        </div>
        <div>author:
          <input
            value={newBlogAuthor}
            onChange={handleAuthorChange}
          />
        </div>
        <div>URL:
          <input
            value={newBlogUrl}
            onChange={handleUrlChange}
          />
        </div>
        <div>Likes:
          <input
            value={newBlogLikes}
            onChange={handleLikesChange}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  )

  const handleTitleChange = (event) => {
    setNewBlogTitle(event.target.value)
  }
  const handleAuthorChange = (event) => {
    setNewBlogAuthor(event.target.value)
  }
  const handleUrlChange = (event) => {
    setNewBlogUrl(event.target.value)
  }
  const handleLikesChange = (event) => {
    setNewBlogLikes(event.target.value)
  }

  /////////////// APP returned here /////////////////
  return (
    <div>
      <h1>Blogs</h1>
      {Notification(userMessage)}
      {
        user === null ?
          loginForm() :
          <div>
            <p>Welcome {user.name}</p>
            <button onClick={handleLogout}>Logout</button>
            <p />
            {blogForm()}
            <p />
            <h2>Blogs</h2>
          </div>
      }
      {
        user !== null ?
          blogs.map(blog =>
            <Blog key={blog.id} blog={blog} />
          ) :
          null}
    </div >
  )
}

export default App