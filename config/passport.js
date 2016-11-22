var passport = require('passport');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
	console.log('Serializing user: ');console.log(user);
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function(err, user) {
		console.log('deserialize user: ', user);
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
	req.checkBody('password', 'Invalid password').notEmpty().isLength({min:6});
	req.checkBody('username', 'Username should be more than 6').notEmpty().isLength({min:6});
	req.checkBody('firstName', 'Invalid First Name').notEmpty().isLength({min:4,max:15});
	req.checkBody('lastName', 'Invalid Last Name').notEmpty().isLength({min:4,max:15});
	req.checkBody('number', 'Provide 10 digit number!').notEmpty().isInt().isLength({min:10});
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
				console.log('Error in SignUp: ' +err);
				return done(err);
			}
			// User already exists
			if (user) {
				console.log('User already exists with username: '+email);
				return done(null, false, {message: 'Email is already in use.'});
			} else {
				// if there is not user with the email
				// create the user
				var newUser = new User();

				// set the user's local credentials
				newUser.email = email;
				newUser.password = createHash(password);
				newUser.username = req.param('username');
				newUser.firstName = req.param('firstName');
				newUser.lastName = req.param('lastName');
				newUser.number = req.param('number');

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
	User.findOne({'username': username}, function(err, user) {
		// In case of any error, return using the done method
		if (err) {
			return done(err);
		}
		// Username does not exist, log the error and redirect back
		if (!user) {
			console.log('User Not Found with username ' + username);
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