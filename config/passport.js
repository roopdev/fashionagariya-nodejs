var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
var helper = require('sendgrid').mail;
var handlebars = require('handlebars');
var fs = require('fs');
var randtoken = require('rand-token');

var User = require('../models/user');
var UserCart = require('../models/userCart');

var template = fs.readFileSync('./views/email.hbs', 'utf-8');
var compiledTemplate = handlebars.compile(template);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

//passport for the signup strategy 
passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody('password', 'Password is short/Confirm password did not match').notEmpty().isLength({min: 6}).equals(req.body.confirmPassword);
	req.checkBody('firstName', 'First Name should be longer than 4 letters').notEmpty().isLength({min:4,max:15});
	req.checkBody('lastName', 'Last Name should be longer than 4 letters').notEmpty().isLength({min:4,max:15});
	req.checkBody('number', 'Provide 10 digit number!').notEmpty().isMobilePhone('en-IN');
	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error) {
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error',messages));
	}
	findOrCreateUser = function() {
		// find a user in Mongo with provided email
		User.findOne({'email': email }, function(err, user) {
			// In case of any error, return using the done method
			if (err) {
				console.log('Error in Registration: ' +err);
				return done(err);
			}
			// User already exists
			if (user) {
				console.log('User already exists with email: '+email);
				return done(null, false, {message: 'Email is already in use.'});
			} else {

				//Generate an random token for URL
				var URLLength= 48;
				var URL= randtoken.generate(URLLength);

				// if there is not user with the email
				// create the user
				var newUser = new User();

				// set the user's local credentials
				newUser.email = email;
				newUser.password = createHash(password);
				newUser.firstName = req.body.firstName;
				newUser.lastName = req.body.lastName;
				newUser.gender = req.body.gender;
				newUser.number = req.body.number;
				newUser.GENERATED_VERIFYING_URL = URL;

				// send verificatoin email with verification link  after registration
				var from_email = new helper.Email('noreply@fashionagariya.com');
				var to_email = new helper.Email(newUser.email);
				var subject = 'Fashionagariya: Please confirm your Registration!';
				var content = new helper.Content('text/html', compiledTemplate({firstName: newUser.firstName, link: 'http://localhost:3000/user/email-verification/'+URL}));
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

				// Save the new user
				newUser.save(function(err) {
					if (err) {
						console.log('Error in Saving user: '+err);
						throw err;
					}
					console.log('User Registration succesful!');
					return done(null, newUser);
				});
		 	}
		});
	};
	// Delay the execution of findOrCreateUser and execute the method
	// in the next tick of the event loop
	process.nextTick(findOrCreateUser);
	})
);

passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	req.checkBody('email', 'User not Found').notEmpty().isEmail();
	req.checkBody('password', 'Invalid password').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error) {
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}
	// Check in mongo if a user with username exists or not
	User.findOne({'email': email}, function(err, user) {
		// In case of any error, return using the done method
		if (err) {
			return done(err);
		}
		// Username does not exist, log the error and redirect back
		if (!user) {
			console.log('User Not Found with email ' + email);
			return done(null, false, {message: 'User Not found.'});
		}
		// User exists but wrong password, log the error
		if(!isValidPassword(user, password)) {
			console.log('Invalid Password');
			return done(null, false, {message: 'Wrong password.'}); // redirect back to login page
		}
		// User and password both match, return user from done method
		// which will be treated like success
		
		return done(null, user);
	});
}));

// Generates hash using bcrypt
var createHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
// Compares  hash password using bcrypt
var isValidPassword = function(user, password) {
	return bcrypt.compareSync(password, user.password);
};