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

const sendPushNotification = require('../ultils/notification')

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
    const alreadyFollowing = user.followedEvents.includes(idEvent);
  
    // Cập nhật sự kiện
    const result = await UserModel.findByIdAndUpdate(
        user._id,
      alreadyFollowing ? { $pull: { followedEvents: idEvent } } : { $push: { followedEvents: idEvent } },
      { new: true } // Trả về tài liệu đã cập nhật
    );
    
    res.status(result ? 200 : 400).json({
      status: result ? true : false,
      mes:  result ? `Put Followers User successfully` : 'Put Followers User failed',
      data: result.followedEvents
    })
})


const getFollowersUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userFind = await UserModel.findById(_id)
    res.status(userFind ? 200 : 400).json({
      status: userFind ? true : false,
      mes:  userFind ? `Get Followers User successfully` : 'Get Followers User failed',
      data: userFind.followedEvents
    })
})

const postExpoPushToken =  asyncHandler(async (req, res) => {
  const { _id } = req.user
  const {expoPushToken} =  req.body
  const user = await UserModel.findByIdAndUpdate(
    _id,
    {expoPushToken},
    { new: true } // Trả về tài liệu đã cập nhật
  );
  res.status(user ? 200 : 400).json({
    status: user ? true : false,
    mes:  user ? `Post Expo Push Token successfully` : 'Post Expo Push Token failed',
  })
})


const sendInviteNotification = asyncHandler(async (req, res) => {
  const { _id } = req.user 
  const { messageTitle, messageBody } = req.body
  const user = await checkUser(_id)
  if(!user) return res.status(401).json({
    status: false,
    mes: 'Invalid credentials!',
  })  

  const users = await UserModel.find({ _id: { $in: user.followedEvents } });
  

  if (users.length === 0) {
    return res.status(404).json({
      status: false,
      mes: 'No users found!',
    });
  }

  const notificationPromises = users.map(user => {
    if (user.expoPushToken) {
      return sendPushNotification(user.expoPushToken, messageTitle, messageBody);
    }
    return null;
  });

  // Loại bỏ những lời hứa không hợp lệ và đợi cho tất cả hoàn thành
  await Promise.all(notificationPromises.filter(promise => promise !== null));


  // Gửi phản hồi thành công
  return res.status(200).json({
    status: true,
    mes: 'Notifications sent successfully!',
  });
  
})


const getProfile = asyncHandler(async (req, res) => {
    const {idUser} = req.params
    const user = await checkUser(idUser)
    if(!user) return res.status(401).json({
      status: false,
      mes: 'Invalid credentials!',
    })  

    const {
      passwordReset,
      refreshToken,
      role,
      password,
      createdAt,
      updatedAt,
      expoPushToken,
      __v,
      ...UserProfile
    } = user.toObject()

    const events = await EventModel.find({authorId:user._id}).select('-__v -createdAt -updatedAt');
    UserProfile.followedEvents = events
    return res.status(200).json({
      status: true,
      mes: 'Get Profile successfully!',
      data:UserProfile
    });
})

module.exports = {
    getAll,
    putFollowers,
    getFollowersUser,
    postExpoPushToken,
    sendInviteNotification,
    getProfile
}