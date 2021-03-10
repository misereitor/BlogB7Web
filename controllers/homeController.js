const mongoose = require('mongoose')
const Post = require('../models/Post')

exports.userMiddleware = (req, res, next) => {
    let info = { name: "Misael", id: 123 }
    req.userInfo = info
    next()
}

exports.index = async (req, res) => {
    let responsejson = {
        pageTitle: "Misael",
        userInfo: req.userInfo,
        post: [],
        tags: [],
        tag: '',
    }

    responsejson.tag = req.query.t
    const postFilter = typeof responsejson.tag != 'undefined' ? { tags: responsejson.tag } : {}

    const tagsPromise = Post.getTagsList()
    const postsPromise = Post.find(postFilter).populate('author')
    const [tags, posts] = await Promise.all([tagsPromise, postsPromise])

    tags.forEach(element => element._id == responsejson.tag ? element.class = 'selected' : '');
    responsejson.tags = tags
    responsejson.posts = posts
    res.render("home", responsejson)
}

