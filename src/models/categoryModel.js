/** @format */
/** @format */

const { default: mongoose } = require('mongoose');

const CategorySchema = new mongoose.Schema({
	title: {
		type: String,
	},
	key: {
		type: Number,
	},
},{
    timestamps:true
});


module.exports = mongoose.model('categories', CategorySchema);