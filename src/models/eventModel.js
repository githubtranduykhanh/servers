/** @format */

const { default: mongoose } = require('mongoose');

// Định nghĩa Schema cho Location
const LocationSchema = new mongoose.Schema({
    address: { type: String, required: true },
    title: { type: String, required: true }
}, { _id: false }); // Không tạo _id cho subdocument

// Định nghĩa Schema cho Position
const PositionSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
}, { _id: false }); // Không tạo _id cho subdocument


const EventSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	location: { type: LocationSchema, required: true },  // Sử dụng LocationSchema
    position: { type: PositionSchema, required: true },  // Sử dụng PositionSchema
	imageUrl: {
		type: String,
	},
	users: {
		type: [String],
	},
	authorId: {
		type: String,
		required: true,
	},
	startAt: {
		type: Date,
		required: true,
	},
	endAt: {
		type: Date,
		required: true,
	},
	price: {
		type: String,
		required: true,
	},
	categories: {
		type: [String],
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	followers: {
		type: [String],
	},
},{
    timestamps:true
});


module.exports =  mongoose.model('events', EventSchema);