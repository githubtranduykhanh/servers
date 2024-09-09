const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const uniqid = require('uniqid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const UserModel = require('../models/userModel')
const Validate = require('../ultils/validate')
const { Number } = require('../ultils/helper')
const sendMail = require('../ultils/sendMail')


const getAll = asyncHandler(async (req,res) => {
    const {user} = req
    const userFind = await UserModel.findById(user._id)
    if(!userFind) return res.status(400).json({
        status: false,
        mes: 'Invalid credentials!',
    })

    const users = await UserModel.find().select('_id email role fullName photoUrl')
    console.log('users',users)

    return res.status(users ? 200 : 400).json({
        status: users ? true : false,
        mes: users ? 'Get all user is successfully' : 'No users',
        data: users ?? [],
    })
})




const postAddNewEvent = asyncHandler(async (req,res) => {
    const {user} = req
    const { title, description, location, price, imageUrl, users, caterory, authorId, startAt, endAt, date } = req.body
    const userFind = await UserModel.findById(user._id)
    if(!userFind) return res.status(400).json({
        status: false,
        mes: 'Invalid credentials!',
    })

    // Xử lý dữ liệu sự kiện
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Location:', location);
    console.log('Price:', price);
    console.log('Image URL:', imageUrl);
    console.log('Users:', users);
    console.log('Caterory:', caterory);
    console.log('Author ID:', authorId);
    console.log('Start At:', startAt);
    console.log('End At:', endAt);
    console.log('Date:', date);
    
    // Trả về phản hồi thành công
    return res.status(200).json({ status: true, mes: 'Event added successfully!' });
})


module.exports = {
    getAll,
    postAddNewEvent
}