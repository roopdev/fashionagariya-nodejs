var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	title: {type: String, required: true},
	description: {type: String, required: true},
	createdDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Category', schema);