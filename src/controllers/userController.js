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



module.exports = {
    getAll,
}