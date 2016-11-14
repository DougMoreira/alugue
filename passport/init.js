'use strict';
var login = require('./login');
var User = require('../models/user');

module.exports = function(passport){

    /* Serializa o usuário na sessão */
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    /* Deserializa o usuário na sessão */
    passport.deserializeUser(function(user, done){
        done(null, user);
    });

    /* Login com Facebook */
    login(passport);
};