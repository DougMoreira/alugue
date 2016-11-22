// Controlador que busca e modifica informações de usuário
var User      = require('../models/user');
var Estados   = require('../models/estados')
var util      = require('../util/util');
var validator = require('validator');
var bCrypt    = require('bcrypt-nodejs');
// var async     = require('async');

/* INUTILIZADA - Atualiza o status de newUser para false no banco de dados */
function updateNewUser(id) {
	User.update({ "id": id }, { $set: { "newUser": false } }, function(err) {
		if(err) console.error(err);
	});
};

/* Valida se todos os campos solicitados existem */
function fieldsValidator(user, fields) {
	var notFound = '';
	for(let i = 0;i < fields.length; i++) {
		if(!user[fields[i]]){
			notFound += '[' + fields[i] + '] ';
			delete fields[i];
		}
	}

	return {
		invalid: notFound
		, valid: fields
	};
};

// Generates hash using bCrypt
function createHash(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports.getUser = function(id, cb) {
	let filterBy = { "id": id };
	let onlyFields = {
		"id": 1
		, "displayName": 1
		, "firstName": 1
		, "lastName": 1
		, "linkPicture": 1
		, "newUser": 1
	};

	function execFn(err, user) {
		if (user) {
			let userInfo = {
				"id": user.id
				, "displayName": user.displayName
				, "name": user.firstName
				, "lastName": user.lastName
				, "linkPicture": user.linkPicture
				, "newUser": user.newUser
			}
			return cb(err, { user: userInfo });
		}
		else {
			return cb(err, undefined)
		}
	};

	User
		.findOne(filterBy)
		.select(onlyFields)
		.exec(execFn);
};

module.exports.getUserExtraFields = function(id, extraFields, cb) {
	User.findOne({ "id": id }, { "keyUser": 0 }, function(err, user) {
		if (user) {
			let userInfo = {
				"id": user.id
				, "displayName": user.displayName
				, "name": user.firstName
				, "lastName": user.lastName
				, "linkPicture": user.linkPicture
				, "newUser": user.newUser
			}
			
			let fields = extraFields;
			var validation = {
				valid: ''
				, invalid: ''
				, message: undefined
			};
			
			if(fields.length > 0) {
				validation = fieldsValidator(user, fields);
				fields = validation.valid;
				
				for(let i = 0; i < fields.length; i++) {
					userInfo[fields[i]] = user[fields[i]];
				}
				
			}
			
			if(validation.invalid != '') {
				validation.message = 'Os atributos seguintes não foram encontrados: ' + validation.invalid;
			}
		
			return cb(err, { user: userInfo }, validation.message);
		}
		else {
			return cb(err, undefined);
		}
	});
};

module.exports.newGuia = function(id, dataRequest, cb) {console.log("newGuia")
	let estadosFilterBy = { "id": dataRequest.estado.id, "cidades":{ $eq: dataRequest.cidade } }; // Filtro de busca do estado
	let userFilterBy = { "id": id }; // Filtro dde busca do usuário
	let onlyFields = { "newUser": 1, "email": 1 }; // Filtro de campos retornados
	let fieldsToSave = {
		keyUser: undefined
		, email: undefined
		, local: {
			estadoId: undefined
			, estado: undefined
			, indexCidade: undefined
			, cidade: undefined
		}
	};
	let error;
	let message;

	// let obj = new Object({
	// 	estFinish: false
	// 	, usrFinish: false
	// });
	
	function execEstados(err, estado) {
		if(err) {
			console.error(err);
			return cb(err, undefined, undefined);
		}

		if(estado) {
			// if(estado.cidades.contains(dataRequest.cidade)){
			// 	console.log("YEAAAAAH")
			// }

			fieldsToSave.local.estado = estado.nome;
			fieldsToSave.local.estadoId = estado.id;
			fieldsToSave.local.cidade = dataRequest.cidade;
			fieldsToSave.local.indexCidade = estado.cidades.indexOf(dataRequest.cidade);
		}
		else {
			message = 'O estado ou cidade enviados não correspondem a nenhum estado ou cidade válidos!\n';
			console.log(message);
		}

		z();
	};

	function execUser(err, user) {
		if(err) {
			console.error(err);
			return cb(err, undefined, undefined);
		}

		(!user.email) 
			? ((validator.isEmail(dataRequest.email)) 
				? (fieldsToSave.email = dataRequest.email) : (message = 'Email inválido'))
			: (fieldsToSave.email = user.email);

		if(validator.isAscii(dataRequest.senha) && validator.isLength(dataRequest.senha, {min: 10, max: 50}) ){
			fieldsToSave.keyUser = createHash(dataRequest.senha); // Criptografa a senha
		}
		else {
			message = 'Senha inválida! Apenas são permitidos caracteres ASCII!';
			console.info(message)
		}

		Estados.findOne(estadosFilterBy).exec(execEstados);
	};
	
	User.findOne(userFilterBy).select(onlyFields).exec(execUser);

	function z() {
		console.log('zzZZZZZzzzZZZzZzzzZZZZzZZ');
		
		if(error || message) return cb(error, undefined, message)

		User.update({ "id": id }, { $set: { "newUser": false, "email": fieldsToSave.email, "local": fieldsToSave.local, "keyUser": fieldsToSave.keyUser } }, function(err, user) {
			if(err) console.error(err);
			console.log(message)
			let userSend = {
				firstName: user.firstName
				, email: user.email
				, local: user.local
			};

			return cb(err, userSend, message);
		});
	}
};