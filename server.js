'use strict';
var express            = require('express');
var expressSession     = require('express-session');
var cookieParser       = require('cookie-parser');
var passport           = require('passport');
var mongoose           = require('mongoose');
var Grid               = require('gridfs-stream');
var expressBusboy      = require('express-busboy');
var dbConfig           = require('./db.js');

mongoose.connect(dbConfig.url);

var conn = mongoose.connection;
var gfs;
//var ImageSchema = require('./models/image');

console.log("Iniciando banco de dados...")
conn.on('open', function () {
	console.log("Banco de dados conectado!\nIniciando Express..")
	gfs = Grid(conn.db, mongoose.mongo);
	initApp();
});

conn.on('error', function(err) {
	console.error(err)
	console.info("Tentando conectar ao servidor local...")
	mongoose.connect(dbConfig.local);
	conn = mongoose.connection;
});

// dbConfig.conexao(conn);
function initApp() {
	const PORT = process.env.PORT || 8080;

	var app = express();
	expressBusboy.extend(app, {
		upload: true
		, path: '/tmp/alfiles/'
		, allowedPath: /./
		, mimeTypeLimit: [ 'image/jpeg', 'image/png' ]
	});
	
	//app.use(cookieParser());
	// app.use(express.static('../front/dist'));
	app.use(express.static('./dist'));

	/* Inicialização da sessão */

	app.use(expressSession({ secret: 'mySecretKey', resave: false, saveUninitialized: true }));
	app.use(passport.initialize());
	app.use(passport.session());

	var initPassport = require('./passport/init');
	initPassport(passport);

	var routes = require('./routes/routes')(passport, gfs);
	app.use('/', routes);

	app.listen(PORT, function() {
		console.log("Express iniciado!");
	});
};