// Controlador que gerencia informações dos estados e das cidades
var Estados = require('../models/estados.js');

module.exports.getEstados = function(cb) {
    let filterBy = {};
	let onlyFields = { "id": 1, "nome": 1, "sigla": 1, "_id": 0 };

    function execFn(err, listEstados) {
        if (listEstados) {
            let estObject = { estados: listEstados };
            return cb(err, estObject);
        }
        else {
            return cb(err, undefined);
        }
	};

    Estados.find(filterBy).select(onlyFields).exec(execFn);
};

module.exports.getCidades = function(id, cb) {
    let filterBy = { "id": id };
	let onlyFields = { "cidades": 1, "_id": 0 };
    
    function execFn(err, listCidades) {
        if (listCidades) return cb(err, listCidades);
        else return cb(err, undefined);
    };

    Estados.findOne(filterBy).select(onlyFields).exec(execFn);
};