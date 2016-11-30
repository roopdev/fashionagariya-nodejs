var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
var helper = require('sendgrid').mail;
var handlebars = require('handlebars');
var fs = require('fs');
var randtoken = require('rand-token');

var apiUser = require('../models/apiuser');

var template = fs.readFileSync('./views/apiemail.hbs', 'utf-8');
var compiledTemplate = handlebars.compile(template);

passport.serializeUser(function (apiuser, done) {
	done(null, apiuser.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function(err, apiuser) {
		done(err, apiuser);
	});
});

//passport for the signup strategy 
passport.use('local.apisignup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody('password', 'Password is short').notEmpty().isLength({min: 6});
	req.checkBody('username', 'Username should be longer than 4 letters').notEmpty().isLength({min:4,max:15});
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
		apiUser.findOne({'email': email }, function(err, user) {
			// In case of any error, return using the done method
			if (err) {
				console.log('Error in Registration: ' +err);
				return done(err);
			}
			// User already exists
			if (user) {
				console.log('apiUser already exists with email: '+email);
				return done(null, false, {message: 'Email is already in use.'});
			} else {

				//Generate an random token for URL
				var URLLength= 48;
				var URL= randtoken.generate(URLLength);

				// if there is not user with the email
				// create the user
				var newapiUser = new apiUser();

				// set the user's local credentials
				newapiUser.email = email;
				newapiUser.password = createHash(password);
				newapiUser.username = req.body.username;
				newapiUser.number = req.body.number;
				newapiUser.GENERATED_VERIFYING_URL = URL;

				// send verificatoin email with verification link  after registration
				var from_email = new helper.Email('admin@fashionagariya.com');
				var to_email = new helper.Email(newapiUser.email);
				var subject = 'Admin Fashionagariya: Please confirm your Registration!';
				var content = new helper.Content('text/plain', 'The verification link for api will be provided in future!!!');
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

				// Save the new api user
				newapiUser.save(function(err) {
					if (err) {
						console.log('Error in Saving apiuser: '+err);
						throw err;
					}
					console.log('apiUser Registration succesful!');
					return done(null, newapiUser);
				});
		 	}
		});
	};
	// Delay the execution of findOrCreateUser and execute the method
	// in the next tick of the event loop
	process.nextTick(findOrCreateUser);
	})
);

passport.use('local.apisignin', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, username, password, done) {
	req.checkBody('username', 'User not Found').notEmpty();
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
	apiUser.findOne({'username': username}, function(err, apiuser) {
		// In case of any error, return using the done method
		if (err) {
			return done(err);
		}
		// Username does not exist, log the error and redirect back
		if (!apiuser) {
			console.log('User Not Found with username ' + username);
			return done(null, false, {message: 'apiUser Not found.'});
		}
		// User exists but wrong password, log the error
		if(!isValidPassword(apiuser, password)) {
			console.log('Invalid Password');
			return done(null, false, {message: 'Wrong password.'}); // redirect back to login page
		}
		// User and password both match, return user from done method
		// which will be treated like success
		return done(null, apiuser);
	});
}));

// Generates hash using bcrypt
var createHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
// Compares  hash password using bcrypt
var isValidPassword = function(apiuser, password) {
	return bcrypt.compareSync(password, apiuser.password);
};