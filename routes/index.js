var express = require('express');
var router = express.Router();

var Product = require('../models/product');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'FashionNagariya' });
});

router.get('/about', function(req, res, next) {
	res.render('shop/about');
});

router.get('/single/:id', function(req, res, next) {
	var productId = req.params.id;
	Product.findById(productId, function(err, product) {
		if (err) {
			return res.redirect('/');
		}
		res.render('shop/single', { title: 'FashionNagariya', product: product });
	});
  
});

router.get('/products', function(req, res, next) {
	var successMsg = req.flash('success')[0];
	Product.find(function(err, docs){
		var productChunks = [];
		var chunkSize = 3;
		for (var i = 0; i < docs.length; i += chunkSize) {
			productChunks.push(docs.slice(i, i + chunkSize));
		}
		res.render('shop/products', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });	
	});
});

router.get('/shopping-cart', function(req, res, next) {
  res.render('shop/shopping-cart', { title: 'FashionNagariya' });
});

router.get('/checkout', function(req, res, next) {
  res.render('shop/checkout', { title: 'FashionNagariya' });
});



module.exports = router;
