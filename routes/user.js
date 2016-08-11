// Return a list of users
// GET list
exports.list = function (req, res) {
	res.send('Respond with a resource');
}

// Login: Render a login form
// GET login
exports.login =	function (req, res, next) {
	res.render('login');
}

// Logout: destroy session and redirect users to homepage 
// GET logout 
exports.logout = function (req, res, next) {
	req.session.destroy();
	res.redirect('/');
}

// Handle authentication and redirect authenticated user to admin page
// POST authenticate
exports.authenticate = function (req, res, next) {
	if (!req.body.email || !req.body.password) {
		return res.render('login', {error: 'Please enter your email and password.'});
	}
	req.models.User.findOne({
		email: req.body.email,
		password: req.body.password
	}, function (err, user) {
		if (err) {return next(err)}
		if (!user) {return res.render('login', {error: 'Incorrect email and password combination.'})}
		// console.log(user);
		req.session.user = user;
		req.session.admin = user.admin;
		res.redirect('/admin');
	});
}


