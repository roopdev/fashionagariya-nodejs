var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	email: {type: String, required: true},
	password: {type: String, required: true},
	username: {type: String, required: true},
	number: {type: Number, required: true},
	GENERATED_VERIFYING_URL: {type: String, required: true},
	createdAt: {type: Date,default: Date.now}
});


module.exports = mongoose.model('apiUser', userSchema);