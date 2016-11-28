var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var helper = require('sendgrid').mail;

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

// user accesses the link that is sent 
router.get('/email-verification/:URL', function(req, res, next) {
	var url = req.params.URL;

	User.findOne({'GENERATED_VERIFYING_URL': url}, function(err, user) {
			if(user) {
				console.log(user);
				res.render('user/confirm',{firstName: user.firstName, email: user.email});
				// send confirmation email 
				var from_email = new helper.Email('noreply@fashionagariya.com');
				var to_email = new helper.Email(user.email);
				var subject = 'Fashionagariya: Verification successful!';
				var content = new helper.Content('text/plain','Thank You !!');
				var mail = new helper.Mail(from_email, subject, to_email, content);
				 
				var sg = require('sendgrid')(process.env.KEY);
				var request = sg.emptyRequest({
				  method: 'POST',
				  path: '/v3/mail/send',
				  body: mail.toJSON(),
				});
				 
				sg.API(request, function(error, response) {
					if(error) {
						console.log('Error response received');
					}
				  console.log(response.statusCode);
				  console.log(response.body);
				  console.log(response.headers);
				});
			} else {
				console.log('The URL didnt match with the user');
				return res.status(404).send('Please Resend verification email to confrim email address again or Register with a valid email id.');
			}			
	});

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
