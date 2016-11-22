var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	id: String,
	username: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	number: {type: Number, required: true},
	createdAt: {type: Date,default: Date.now}
});



module.exports = mongoose.model('User', userSchema);