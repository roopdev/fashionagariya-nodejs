var express = require('express');
var router = express.Router();

var Blog = require('../models/blog');

router.get('/mainblog', function(req, res, next) {
  res.render('blog/mainblog', { title: 'FashionNagariya' });
});

router.get('/singleBlogPage', function(req, res, next) {
  res.render('blog/singleBlogPage', { title: 'FashionNagariya' });
});





module.exports = router;