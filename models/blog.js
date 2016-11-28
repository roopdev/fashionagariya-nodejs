var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	imagePath: {type: String, required: true},
	title: {type: String, required: true},
	author: {type: String, required: true},
	content: {type: String, required: true},
	createdAt: {type: Date,default: Date.now}
});

module.exports = mongoose.model('Blog', schema);