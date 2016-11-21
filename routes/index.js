var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'FashionNagariya' });
});

router.get('/single', function(req, res, next) {
  res.render('shop/single', { title: 'FashionNagariya' });
});

module.exports = router;
