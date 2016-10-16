'use strict';
const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const facebookStrategy = require('passport-facebook');
var app = express();
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://doug:123@ds019796.mlab.com:19796/doug');

const PORT = process.env.PORT || 8080;

var db = mongoose.connection;
db.on('error', (err) => {console.error(err)});

db.once('open', () => console.log("Connected in database " + db.name + "!"));

var userSchema = mongoose.Schema({
	id: Number
	, accessToken: String
	, firstName: String
	, lastName: String
	, email: String
});

var User = mongoose.model('iusers', userSchema);

// var newUser = new User({
//      name: 'Caio'
//     , age: 20
//     , email: 'caio@gmail.com'
// });

//newUser.save(fnSave); /* Persiste a nova instâcia de User */
//User.find({age: {$eq: 20}},fnSave);
function fnSave(err, obj) {
	if(err) return console.error(err);
	console.log(obj);
};

app.use(express.static('dist'));

app.get('/api/gets', function (req, res, next) {
	User.findOne(function(err, obj) {
		if(err) return console.error(err);
		console.log(obj);
		var x = JSON.stringify(obj);
		res.json(x);
		next();
	});
});

function facebookConfig(server) {
	passport.use(new facebookStrategy(
		{
			clientID: '568097623392176'
			, clientSecret: 'b748f5d7b28ae46804e8bbe2b8a3ff95'
			, callbackURL: 'https://guire.herokuapp.com/auth/facebook/callback'
		}
		, function(accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				User.findOne({ 'id' : profile.id }, function(err, user) {
					if (err)
						return done(err);
	
					if (user) {
						return done(null, user); // user found, return that user
					} 
					else {
						var newUser = new User();
	
						newUser.id = profile.id; // set the users facebook id                 
						newUser.accessToken = accessToken; // we will save the token that facebook provides to the user                    
						newUser.firstName = profile.name.givenName;
						newUser.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
						newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
	
						// save our user to the database
						newUser.save(function(err) {
							if (err)
								throw err;

							// if successful, return the new user
							return done(null, newUser);
						});
					} 
				});
			});
		}
	));

	server.get('/auth/facebook/', passport.authenticate('facebook', { scope: ['email', 'user_friends'] }));
	server.get('/auth/facebook/callback'
	, passport.authenticate('facebook', {failureRedirect: '/ingressar/'})
	, function(req, res) {
		console.log('success!');
		res.redirect('/index.html');
	});
};

app.use(express.static('dist'));

facebookConfig(app);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
	// req.user is available for use here
	return next(); }

  // denied. redirect to login
  res.redirect('/')
}

app.get('/protected', ensureAuthenticated, function(req, res) {
  res.send("access granted. secure stuff happens here");
});

app.listen(PORT);