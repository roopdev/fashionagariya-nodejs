var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var apiUser = require('../models/apiuser');
var Product = require('../models/product');

var apicsrfProtection = csrf();
router.use(apicsrfProtection);

/* GET api users listing. */
router.get('/apisignup', function(req, res, next) {
	var messages = req.flash('error');
	res.render('api/apisignup', {apicsrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/apisignup', passport.authenticate('local.apisignup', {
	failureRedirect: '/api/apisignup',
	failureFlash: true
	}),function (req, res, next) {
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/api/dashboard');
		}
});

router.get('/apilogin', function(req, res, next) {
	var messages = req.flash('error');
	res.render('api/apilogin', {apicsrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/apilogin', passport.authenticate('local.apisignin', {
	failureRedirect: '/api/apilogin',
	failureFlash: true
}), function (req, res, next) {
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/api/dashboard');
		}
});

router.get('/dashboard', function(req, res, next) {

		res.render('api/dashboard',{title: 'fashionagariya'});
		
});

router.get('/prodinsert', function(req, res, next) {
	var successMsg = req.flash('success')[0];
	res.render('api/prodinsert',{apicsrfToken: req.csrfToken(),successMsg: successMsg, noMessages: !successMsg});		
});

router.post('/prodinsert', function(req, res, next) {
	var item = {
		imagePath: req.body.imagePath,
		title: req.body.title,
		category: req.body.category,
		brand: req.body.brand,
		description: req.body.description,
		price: req.body.price,
		stock: req.body.stock
	};
	var product = new Product(item);
	
	product.save(function(err, prod) {
		if(err) {
			console.log('Error in Saving');
			throw err;
		}
		else {
		console.log(prod);
		res.redirect('/api/prodinsert');
		}
	});
	
});




module.exports = router;

// function isLoggedIn (req, res, next) {
// 	if (req.isAuthenticated()) {
// 		return next();
// 	}
// 	res.redirect('/');
// }

// function notLoggedIn (req, res, next) {
// 	if (!req.isAuthenticated()) {
// 		return next();
// 	}
// 	res.redirect('/');
// }