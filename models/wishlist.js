// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

// var schema = new Schema({
// 	user: {type: Schema.Types.ObjectId, ref: 'User'},
// 	products: [ {type: Schema.Types.ObjectId, ref: 'Product'} ],
// 	cartDate: {type: Date, default: Date.now}
// });

// module.exports = mongoose.model('Wishlist', schema);

module.exports = function Wishlist(oldWishlist) {
	this.items = oldWishlist.items || {};
	
 
	this.add = function (item, id) {
		var storedItem = this.items[id];
		if (!storedItem) {
			storedItem = this.items[id] = {item: item};
		}
	};


	this.removeItem = function(id) {
		delete this.items[id];
	};

	this.generateArray = function() {
		var arr = [];
		for (var id in this.items) {
			arr.push(this.items[id]);
		}
		return arr;
	};
};
