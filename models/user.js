'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
	id: Number
	, accessToken: String
	, displayName: String
	, email: String
	, firstName: String
	, lastName: String
	, linkPicture: String
    , typeUser: String
    , keyUser: String
	, newUser: Boolean
	, firstAccess: { type: Date, default: Date.now }
});
var collection = 'usuarios';
module.exports = mongoose.model(
	'User'
	, schema
	, collection
);

/* accessToken > verificar
 * displayName > Nome que aparece no facebook
 * linkPicture > Link do FB da foto de perfil. Como atualizar? Como pegar tamanho grande?
 * typeUser    > Diferenciador de usuário normal e guia(utilizado nas pesquisas de guia)
 * keyUser     > Senha especial para fazer reservas e pagamentos
 * newUser	   > Usado para exibir mensagem de boas vindas
 * firstAccess > Grava no banco a data de registro do usuário
 */