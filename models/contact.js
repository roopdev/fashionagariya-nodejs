var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	firstName: {type: String, required: true},
	email: {type: String, required: true},
	number: {type: String},
	message: {type: String, required: true},
	createdAt: {type: Date,default: Date.now}
});

module.exports = mongoose.model('Contact', schema);