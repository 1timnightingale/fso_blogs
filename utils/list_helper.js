const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
  const max = blogs.reduce((prev, current) => {
    return (prev && prev.likes > current.likes) ? prev : current
  })
  return max
}

const mostBlogs = (blogs) => {
  function countOccurrences(arr) {
    const names = arr.map(blog => blog.author); // Extract names
    const uniqueNames = [...new Set(names)]; // Get unique names
    const counts = new Array(uniqueNames.length).fill(0); // Initialize counts array

    for (let i = 0; i < names.length; i++) {
      const index = uniqueNames.indexOf(names[i]);
      counts[index]++;
    }
    return uniqueNames.map((name, i) => ({ author: name, blogs: counts[i] }));
  }
  const result = countOccurrences(blogs);

  const mostB = (result) => {
    const maxNumber = result.reduce((prev, current) => {
      return (prev && prev.blogs > current.blogs) ? prev : current
    })
    return maxNumber
  }

  return mostB(result)
}



const mostLikes = (blogs) => {
  const mLikes = blogs.reduce((acc, { author, likes }) => {
    acc[author] = acc[author] || { author, likes: 0 }
    acc[author].likes += likes
    return acc
  }, {})

  const mostL = (mLikes) => {
    const maxLNumber = mLikes.reduce((prev, current) => {
      return (prev && prev.likes > current.likes) ? prev : current
    })
    return maxLNumber
  }

  return mostL(Object.values(mLikes))

}



module.exports = {
  dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes
}
