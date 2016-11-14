'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
	_id: Schema.Types.ObjectId
	, uploader: Schema.Types.ObjectId
	, description: String
	, city: Schema.Types.ObjectId
	, firstName: String
	, uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model(
	'Image'
	, schema
);
