const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)

  return likes
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((likes, blog) => {
    return (likes.likes > blog.likes ? likes : blog)
  })

  return {
    "title": favorite.title, 
    "author": favorite.author, 
    "likes": favorite.likes
  }
}

const mostBlogs = (blogs) => {
    const most = _.chain(blogs)
      .groupBy("author")
      .mapValues(groupedBlogs => _.size(groupedBlogs))
      .toPairs()
      .orderBy([1], "desc")
      .head()
      .value()

    return {
        "author": most[0],
        "blogs": most[1]
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
