var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var helper = require('sendgrid').mail;
var handlebars = require('handlebars');
var fs = require('fs');

//------------- All the mongoose models are required here ----------------------------------------------------------
var Order = require('../models/order');
var Cart = require('../models/cart');
var UserCart = require('../models/userCart');
var User = require('../models/user');
var Contact = require('../models/contact');
var Wishlist = require('../models/wishlist');

//------------------ Csurf protections to all the routes with csrf.token --------------------------------------------
var csrfProtection = csrf();
router.use(csrfProtection);

//------------------- formatting the email from handlebars to template -----------------------------------
var template = fs.readFileSync('./views/email.hbs', 'utf-8');
var compiledTemplate = handlebars.compile(template);


//------------------------- All the routing starts from here -----------------------------------------------------------
router.get('/profile', isLoggedIn, function(req, res, next) {
	var user = req.user;
		res.render('user/profile', { user: user});
});

router.get('/wishlist', isLoggedIn, function(req, res, next) {
	var user = req.user;
	//console.log(user);
	if (!req.session.wishlist) {
		return res.render('user/wishlist', {products: null, user: user});
	}
	var wishlist = new Wishlist(req.session.wishlist);
	res.render('user/wishlist', {products: wishlist.generateArray(), user: user});
});


router.get('/order', isLoggedIn, function(req, res, next) {
	var user = req.user;
	var successMsg = req.flash('success')[0];
	Order.find({user: req.user}, function(err, orders) {
		if (err) {
			return res.write('No order list Yet! ');
		}
		var cart;
		orders.forEach(function(order) {
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});
		res.render('user/order', {orders: orders, user: user, successMsg: successMsg, noMessages: !successMsg});
	});
});

router.get('/logout', isLoggedIn, function(req, res, next) {
	if (req.session.cart) {
		var cart = req.session.cart;
		var userCart = new UserCart({
	  		user: req.user,
	  		cart: cart,
	  	});
	  	// saving the present items in cart of the user whiling logging out
	  	userCart.save(function(err, result) {
	  		if(err) {
	  			res.redirect('/');
	  		}
	  		req.session.cart = null;
	  		req.logout();
			res.redirect('/');	  		
	  	});
	} else {
		req.logout();
		res.redirect('/');
	}
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
				//user.GENERATED_VERIFYING_URL = null;
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
	//--------- How to retrieve the saved cart for the user ------------
	// var user = req.user;
	// console.log(user.id);
	// UserCart.findOne({'userCart.user': user.id}, function(err, userCart) {
	// 	if(err) {
	// 		return res.status(404);
	// 	}
	// 		console.log(userCart.cart);
	// 		var cart = new Cart(userCart.cart);
	// 		req.session.cart = cart;
	// 		console.log(cart);
	// });
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/');
		}
});



router.get('/contact', function(req, res, next) {
	var messages = req.flash('error');
	res.render('user/contact', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/contact', function(req, res, next) {
	// Add the function to send the input contact 
	// Response should be an success message on same page (rendering to new page for more personalization)
	// Respond with thank you mail to the recipient. 
	var info = {
		firstName: req.body.firstName,
		email: req.body.email,
		number: req.body.number,
		message: req.body.message
	};
	var contact = new Contact(info);

	contact.save(function(err, contact) {
		if(err) {
			console.log('Error in Saving');
			throw err;
		}
		else {
			var firstName, email;
			console.log(contact);
			res.render('user/thankyou',{firstName: contact.firstName, email: contact.email});

			// send thank you email to the contact person email-id
				var from_email = new helper.Email('support@fashionagariya.com');
				var to_email = new helper.Email(contact.email);
				var subject = 'Fashionagariya: Thank you for contacting us!!';
				var content = new helper.Content('text/plain', 'Hello , Thank you!!, We will respond your query to this email earliest.');
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
		}
	});
				// send detailed contact form email to the admin
				var from_email = new helper.Email('info@fashionagariya.com');
				var to_email = new helper.Email('rooptestdev@gmail.com');
				var subject = 'Fashionagariya: You recieved a new contact form!!';
				var content = new helper.Content('text/html', compiledTemplate({firstName: contact.firstName, email: contact.email, number: contact.number, message: contact.message}));
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
