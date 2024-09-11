const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const uniqid = require('uniqid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const {EventModel,UserModel} = require('../models')
const Validate = require('../ultils/validate')
const { Number } = require('../ultils/helper')
const sendMail = require('../ultils/sendMail')


const postAddNewEvent = asyncHandler(async (req,res) => {
    const {user} = req
    const { title, description, position ,location, price, imageUrl, users, categories, authorId, startAt, endAt, date } = req.body
    const userFind = await UserModel.findById(user._id)
    if(!userFind) return res.status(400).json({
        status: false,
        mes: 'Invalid credentials!',
    })

    // Xử lý dữ liệu sự kiện
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Location:', location);
    console.log('Position:', position);
    console.log('Price:', price);
    console.log('Image URL:', imageUrl);
    console.log('Users:', users);
    console.log('Categories:', categories);
    console.log('Author ID:', authorId);
    console.log('Start At:', startAt);
    console.log('End At:', endAt);
    console.log('Date:', date);
    

    const newEvent = await EventModel.create({
        title,
        description,
        location,
        position,
        price,
        imageUrl,
        users,
        categories,
        authorId,
        startAt,
        endAt,
        date
    });

    console.log('Event created:', newEvent);

    // Trả về phản hồi thành công
    return res.status(newEvent ? 201 : 500).json({
        status: newEvent ?  true : false,
        mes: newEvent ?'Event added successfully!' : 'Error adding event!',
    });
})


module.exports = {
    postAddNewEvent
}