var express = require('express');
var router = express.Router();

router.get('/mainblog', function(req, res, next) {
  res.render('blog/mainblog', { title: 'FashionNagariya' });
});





module.exports = router;