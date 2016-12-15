var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	cart: {type: Object, required: true},
	cartDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('userCart', schema);