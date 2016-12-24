var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Wishlist = require('../models/wishlist');
var UserCart = require('../models/userCart');
var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
	var successMsg = req.flash('success')[0];
	Product.find(function(err, docs){
		var productChunks = [];
		var chunkSize = 1;
		for (var i = 0; i < docs.length; i += chunkSize) {
			productChunks.push(docs.slice(i, i + chunkSize));
		}
		res.render('shop/index', { title: 'Fashionagariya', products: productChunks, successMsg: successMsg, noMessages: !successMsg });	
	});
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
		res.render('shop/products', { title: 'Fashionagariya', products: productChunks, successMsg: successMsg, noMessages: !successMsg });	
	});
});

router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	Product.findById(productId, function(err, product) {
		if (err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/products');
	});
});

router.get('/reduce/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.removeItem(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
	var user = req.user;
	//console.log(user);
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', {products: null, user: user});
	}
	var cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, user: user});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];
	res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});

});

router.post('/checkout', isLoggedIn, function(req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);

	var stripe = require("stripe")(
	  "sk_test_XUJDbG6HkarkrffapyHUf9gE"
	);

	stripe.charges.create({
	  amount: cart.totalPrice * 100,
	  currency: "usd",
	  source: req.body.stripeToken, // obtained with Stripe.js
	  description: "Test Charge"
	}, function(err, charge) {
	  	if (err) {
	  		req.flash('error', err.message);
	  		return res.redirect('/checkout');
	  	}
	  	var order = new Order({
	  		user: req.user,
	  		cart: cart, 
	  		address: req.body.address,
	  		name: req.body.name,
	  		paymentId: charge.id
	  	});
	  	order.save(function(err, result) {
	  		if(err) {
	  			res.redirect('/checkout', {errMsg:'Order could not be saved to database'});
	  		}
	  		req.flash('success', 'Successfully bought product!');
	  		req.session.cart = null;
	  		res.redirect('/user/order');
	  	});
	});
});

router.get('/add-to-wishlist/:id', isLoggedIn, function(req, res, next) {
	var productId = req.params.id;
	var wishlist = new Wishlist(req.session.wishlist ? req.session.wishlist : {});

	Product.findById(productId, function(err, product) {
		if (err) {
			return res.redirect('/');
		}
		wishlist.add(product, product.id);
		req.session.wishlist = wishlist;
		console.log(req.session.wishlist);
		res.redirect('/products');
	});
});

router.get('/remove-wishlist/:id', isLoggedIn, function(req, res, next) {
	var productId = req.params.id;
	var wishlist = new Wishlist(req.session.wishlist ? req.session.wishlist : {});

	wishlist.removeItem(productId);
	req.session.wishlist = wishlist;
	res.redirect('/user/wishlist');
});

router.get('/usercart', function(req, res, next) {

	UserCart.findById('5852d31f81f17e06a8c941e7', function(err, userCart) {
		if(err) {
			return res.status(404).res.json({message: 'Cart could not be found'});
		}
			console.log(userCart.user);
			res.json({cart: userCart});
	});
});

module.exports = router;

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/login');
}

function notLoggedIn (req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}