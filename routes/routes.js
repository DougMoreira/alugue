'use strict';
var express = require('express');
var User = require('../models/user');
var fileController     = require('../controllers/file_controller.js');


var router = express.Router();

var isAuthenticated = function (req, res, next) {
	/* Se o usuário estiver autenticado, ele é direcionado para o próximo middleware */
	if(req.isAuthenticated()) return next();
	res.status(401).send("Usuário não autorizado!");
    /* A FAZER >>>> Mensagem de erro caso não esteja autenticado */
};

/* Atualiza o status de newUser para false no banco de dados */
function updateNewUser(id) {
	User.update({"id": id}, {$set: {"newUser": false}}, function(err) {
		if(err)
			console.error(err);
	});
}

/* Valida se todos os campos solicitados existem */
function fieldsValidator(user, fields) {
	var notFound = '';
	for(let i = 0;i < fields.length; i++) {
		if(!user[fields[i]]){
			notFound += '[' + fields[i] + '] ';
			delete fields[i];
		}
	}
	return { invalid: notFound, valid: fields };
}

module.exports = function(passport, gfs){

	/* GET - Página principal */
	router.get('/', function(req, res) {
    	
	});

    /* GET - Autenticação com Facebook */
    router.get('/login/facebook/'
        , passport.authenticate('facebook', { scope: ['email', 'user_friends']  })
        , function(req, res){});

    /* GET - Rota de callback */
    router.get('/login/facebook/callback'
        , passport.authenticate('facebook', {
            successRedirect: '/'
            , failureRedirect: '/erroLogin'
            , failureFlash : true  })
    );

	/* GET - Home Page */
	router.get('/home', function(req, res){
		console.log(req.user);
		res.send('Página Inicial usuário | isLogged: ' + req.isAuthenticated());
	});

	/* GET - Realiza o logout do usuário */
	router.get('/logout', isAuthenticated, function(req, res) {
		req.logout();
		res.redirect('/')
	});

	/* GET - Verifica se o usuário está logado na sessão */
	router.get('/api/isLogged', function (req, res) {
		if(req.isAuthenticated()) res.json({ auth: true, user: req.user });
		else res.json({ auth: false });
	});

	/* GET - As informações básicas são requisitadas nesta rota  */
	router.get('/api/user/info', isAuthenticated, function(req, res) {
		User.findOne({ 'id': req.user }, function(err, user) {
			if (err) res.redirect('/');
			if (user) {
				let userInfo = {
					"id": user.id
					, "displayName": user.displayName
					, "name": user.firstName
					, "lastName": user.lastName
					, "linkPicture": user.linkPicture
					, "newUser": user.newUser
				}
				if(user.newUser === true) updateNewUser(req.user);
				res.json(userInfo);
			}
			else {
				res.redirect('/');
			}
		});
	});

	/* POST - Retorna informações detalhadas do usuário. A rota espera um array com os campos */
	router.post('/api/user/info', isAuthenticated, function(req, res) {
		User.findOne({ 'id': req.user }, function(err, user) {
			if (err) res.redirect('/');
			if (user) {
				let userInfo = {
					"id": user.id
					, "displayName": user.displayName
					, "name": user.firstName
					, "lastName": user.lastName
					, "linkPicture": user.linkPicture
					, "newUser": user.newUser
				}

				if(req.body.extraFields) {
					let fields = req.body.extraFields;
					
					if(fields.length > 0) {
						var validation = fieldsValidator(user, fields);
						fields = validation.valid;
						
						for(let i = 0;i < fields.length; i++) {
							userInfo[fields[i]] = user[fields[i]];
						}
						console.log(JSON.stringify(userInfo, null, 2));
					}
					
					if(!validation.invalid == '') {
						userInfo.message = "Os atributos seguintes não foram encontrados: " + validation.invalid;
					}
				}
				else {
					userInfo.message = "O atributo extraFields deve ser mandado obrigatoriamente para esta rota";
				}
				res.json(userInfo);
			}
			else {
				res.redirect('/');
			}
		});
		
	});

	/* POST - Rota para upload de imagens */
	router.post('/fileupload', isAuthenticated, fileController(gfs).upload);

	/* TESTE */
	router.get('/vai', function(request, response){
    response.send(
        '<form method="post" action="/fileupload" enctype="multipart/form-data">'
        + '<input type="file" id="file" name="file">'
        + '<input type="submit" value="submit">'
        + '</form>'
        );    
	});

	return router;
};