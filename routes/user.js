var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
	var user = req.user;
		res.render('user/profile', { user: user});
});

router.get('/wishlist', isLoggedIn, function(req, res, next) {
	var user = req.user;
	res.render('user/wishlist', {user: user});
});

router.get('/order', isLoggedIn, function(req, res, next) {
	var user = req.user;
	Order.find({user: req.user}, function(err, orders) {
		if (err) {
			return res.write('No order list Yet! ');
		}
		var cart;
		orders.forEach(function(order) {
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});
		res.render('user/order', {orders: orders, user: user});
	});
});

router.get('/logout', isLoggedIn, function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
	next();
});

router.get('/register', function(req, res, next) {
	var messages = req.flash('error');
	res.render('user/register', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/register', passport.authenticate('local.signup', {
	failureRedirect: '/user/register',
	failureFlash: true
}),function (req, res, next) {
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/user/profile');
		}
	});

router.get('/resend', function(req, res, next) {
	res.render('user/resend');
});

router.post('/resend', function(req, res, next) {
	// Fill in the function to resend verification mail
});

router.get('/forgotPassword', function(req, res, next) {
	res.render('user/forgotPassword');
});

router.post('/forgotPassword', function(req, res, next) {
	// Fill in the function to reset password for the email id
});

router.get('/login', function(req, res, next) {
	var messages = req.flash('error');
	res.render('user/login', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/login', passport.authenticate('local.signin', {
	failureRedirect: '/user/login',
	failureFlash: true
}), function (req, res, next) {
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/');
		}
});

router.get('/contact', function(req, res, next) {
	res.render('user/contact');
});

router.post('/contact', function(req, res, next) {
	// Add the function to send the input contact 
	// Response should be an success message on same page
	// Respond with thank you mail to the recipient. 
});

module.exports = router;

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

function notLoggedIn (req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}
