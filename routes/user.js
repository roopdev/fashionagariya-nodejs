var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('user/login');
});

router.get('/register', function(req, res, next) {
  res.render('user/register');
});

router.get('/contact', function(req, res, next) {
  res.render('user/contact', { title: 'FashionNagariya' });
});
module.exports = router;
