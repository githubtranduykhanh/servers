const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const uniqid = require('uniqid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const { EventModel, UserModel } = require("../models");
const Validate = require('../ultils/validate')
const { Number } = require('../ultils/helper')
const sendMail = require('../ultils/sendMail')
const {checkUser} = require('../middlewares/validates')

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

const putFollowers = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const idEvent = req.params.idEvent;
    const user = await checkUser(_id)
    if(!user) return res.status(401).json({
      status: false,
      mes: 'Invalid credentials!',
    })
    const event = await EventModel.findById(idEvent)
    if(!event) return res.status(400).json({
      status: false,
      mes: 'Event not found!',
    })
  
    // Kiểm tra nếu người dùng đã có trong mảng followers
    const alreadyFollowing = user.followers.includes(idEvent);
  
    // Cập nhật sự kiện
    const result = await UserModel.findByIdAndUpdate(
        user._id,
      alreadyFollowing ? { $pull: { followers: idEvent } } : { $push: { followers: idEvent } },
      { new: true } // Trả về tài liệu đã cập nhật
    );
    
    res.status(result ? 200 : 400).json({
      status: result ? true : false,
      mes:  result ? `Put Followers User successfully` : 'Put Followers User failed',
      data: result.followers
    })
})


const getFollowersUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userFind = await UserModel.findById(_id)
    res.status(userFind ? 200 : 400).json({
      status: userFind ? true : false,
      mes:  userFind ? `Get Followers User successfully` : 'Get Followers User failed',
      data: userFind.followers
    })
})

module.exports = {
    getAll,
    putFollowers,
    getFollowersUser
}