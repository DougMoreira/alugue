'use strict';
var express = require('express');
var UserCtrl = require('../controllers/user_controller');
var EstadoCtrl = require('../controllers/estado_controller');
var fileController = require('../controllers/file_controller.js');

var router = express.Router();

var isAuthenticated = function (req, res, next) {
	/* Se o usuário estiver autenticado, ele é direcionado para o próximo middleware */
	if(req.isAuthenticated()) return next();
	res.status(401).send("Usuário não autorizado!");
    /* A FAZER >>>> Mensagem de erro caso não esteja autenticado */
};

/* Monta os erros */
function errorHandler(errorType, err) {
	console.error(err);
	let errorObjectSend = {
		error: {
			type: errorType
			, message: err.message
		}
	};

	return errorObjectSend;
};

module.exports = function(passport, gfs) {

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
	// router.get('/home', function(req, res){
	// 	console.log(req.user);
	// 	res.send('Página Inicial usuário | isLogged: ' + req.isAuthenticated());
	// });

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
		UserCtrl.getUser(req.user, function(err, data) {
			if(err)       res.status(500).json(errorHandler('SEARCH_ERROR', err));
			else if(data) res.status(200).json({ "data": data });
			else          res.status(404).json(errorHandler('NAO_ENCONTRADO', { message: 'O usuário não foi encontrado!' }));
		});
	});

	/* POST - Retorna informações detalhadas do usuário. A rota espera um array com os campos */
	router.post('/api/user/info', isAuthenticated, function(req, res) {
		if(req.body.extraFields) {
			UserCtrl.getUserExtraFields(req.user, req.body.extraFields, function(err, data, message) {
				if(err)					  res.status(500).json(errorHandler('SEARCH_ERROR', err));
				else if(data && !message) res.status(200).json({ "data": data });
				// I'M A TEAPOT - message é retornado quando há campos inválidos ou inesperados na requisição
				else if(data && message)  res.status(418).json(errorHandler('INVALID', { message: message }));
				else					  res.status(404).json(errorHandler('NOT_FOUND', { message: 'O usuário não foi encontrado!' }));
			});
		}
		else {
			let message = errorHandler('MISSING', { message: 'O atributo extraFields deve ser mandado obrigatoriamente para esta rota!' });
			res.status(422).json(message); // 422 - Unprocessable Entity
		}
	});

	/* POST - Salva dados obrigatórios do guia */
	router.post('/api/newGuia', isAuthenticated, function(req, res) {
		console.log(req.body)
		if(req.body) {
			UserCtrl.newGuia(req.user, req.body, function(err, data, message) {
				if(err) 				 res.status(500).json(errorHandler('SEARCH_ERROR', err));
				else if(message && !err) res.status(422).json(errorHandler('MISSING', { message: message })); // 422 - Unprocessable Entity
				else if(data)			 res.status(200).json({ "data": data });
				else        			 res.status(404).json(errorHandler('NOT_FOUND', { message: 'Ocorreu um problema no cadastro!' }));
			});
		}
		else {
			let message = errorHandler('MISSING', { message: 'É necessário envir uma objeto na requisição!' });
			res.status(422).json(message); // 422 - Unprocessable Entity
		}
		
	});

	/* POST - Cidades do Brasil - Recebe o id do estado e retorna as cidades deste estado */
	router.post('/api/cidades', isAuthenticated, function(req, res) {
		if(req.body.id) {
			EstadoCtrl.getCidades(req.body.id, function(err, data){
				if(err)       res.status(500).json(errorHandler('SEARCH_ERROR', err));
				else if(data) res.status(200).json({ "data": data });
				else          res.status(404).json(errorHandler('NOT_FOUND', { message: 'Cidades não localizadas!' }));
			});
		}
		else {
			let message = errorHandler('MISSING', { message: 'É necessário enviar o código do estado para buscar as cidades!' });
			res.status(422).json(message); // 422 - Unprocessable Entity
		}
	});

	/* GET - Estados do Brasil - Envia a lista de estados */
	router.get('/api/estados', isAuthenticated, function(req, res) {
		EstadoCtrl.getEstados(function(err, data) {
			if(err)       res.status(500).json(errorHandler('SEARCH_ERROR', err));
			else if(data) res.status(200).json({ "data": data });
			else          res.status(404).json(errorHandler('NOT_FOUND', { message: 'Estados não localizados!' }));
		})
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