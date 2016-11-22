'use strict';
var facebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

module.exports = function(passport) {
	passport.use(new facebookStrategy(
		{
			clientID: '568097623392176'
			, clientSecret: 'b748f5d7b28ae46804e8bbe2b8a3ff95'
			, callbackURL: 'http://teste.com.zz/login/facebook/callback'
			// , callbackURL: 'https://guire.herokuapp.com/login/facebook/callback'
			, profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'picture.type(large)']
		}
		, fnToken
	));

	function time() {
		var d = new Date();
		return (d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
	}

	function fnToken(accessToken, refreshToken, profile, done) {
		console.log(time() + ' - Buscando usuário');
		var str = JSON.stringify(profile, null, 2);
		console.log(str);
		/* Faz a busca pelo id do usuário do Facebook */
		User.findOne({ 'id' : profile.id }, function(err, user) {
			
			/* Caso haja erro na busca pelo usuário, é retornada a mensagem com o ocorrido */
			/* Um exemplo pode ser a falha na conexão com o banco de dados */
			if (err) return done(err);

			/* Se o usuário existir no banco, suas informações são retornadas na func done */
			if (user) {
				/* Retorna o usuário para ser usado na serialização / deserialização */
				return done(null, user); 
			} 
			else {
				var newUser = new User();

				newUser.id = profile.id; // id de usuário da base do Facebook              
				newUser.accessToken = accessToken; // Chave provida pelo Facebook                    
				newUser.displayName = profile.displayName; // Nome na página principal no Facebook
				newUser.firstName = profile.name.givenName;
				newUser.lastName = profile.name.familyName;
				newUser.linkPicture = (profile.photos.length > 0) ? (profile.photos[0].value) : null;

				// Caso o usuário dê permissão, o email do mesmo é salvo
				newUser.email = profile.emails ?
					((profile.emails.length > 0) ? (profile.emails[0].value) : null) : null;

				// Propriedade newUser | true para novos usuários
				// Usado para exibir mensagem de bem-vindo e escolher entre guia e usuário
				newUser.newUser = true;

				/* Persiste os dados no mongoDB */
				newUser.save(function(err) {
					if (err) throw err; // Retorna erro se houver
					
					return done(null, newUser); // Se estiver tudo ok, retorna o usuário no done
				});
			}
		});
	}
}