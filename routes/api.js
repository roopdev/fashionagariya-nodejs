var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('api/login');
});

router.get('/dashboard', function(req, res, next) {
	if(req.session.email === 'rooptestdev@gmail.com') {
		res.render('api/dashboard',{title: 'fashionagariya'});
		
	}
	return res.status(401).send('Unathorised access!!!');
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