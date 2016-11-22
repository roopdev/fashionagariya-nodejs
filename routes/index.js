var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'FashionNagariya' });
});

router.get('/about', function(req, res, next) {
	res.render('shop/about');
});

router.get('/single', function(req, res, next) {
  res.render('shop/single', { title: 'FashionNagariya' });
});

router.get('/products', function(req, res, next) {
  res.render('shop/products', { title: 'FashionNagariya' });
});

router.get('/shopping-cart', function(req, res, next) {
  res.render('shop/shopping-cart', { title: 'FashionNagariya' });
});

router.get('/checkout', function(req, res, next) {
  res.render('shop/checkout', { title: 'FashionNagariya' });
});



module.exports = router;
