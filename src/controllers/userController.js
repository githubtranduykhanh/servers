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
const {selectUser} = require('../ultils/constant')


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


const getDataDefaultUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userFind = await UserModel.findById(_id)
    res.status(userFind ? 200 : 400).json({
      status: userFind ? true : false,
      mes:  userFind ? `Get Data Default User successfully` : 'Get Data Default User failed',
      data: userFind ? {
        followedEvents : userFind.followedEvents,
        followers : userFind.followers,
        following : userFind.following
      } : undefined
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
  const { messageTitle, messageBody, idUsers, idEvent  } = req.body
  

  const users = await UserModel.find({ _id: { $in: idUsers } });
  const event = await EventModel.findById(idEvent)

  if (users.length === 0 || !event) {
    return res.status(404).json({
      status: false,
      mes: 'No users or event found!',
    });
  }

  const notificationPromises = users.map(user => {
    if (user.expoPushToken) {
      return sendPushNotification(
          user.expoPushToken,
          messageTitle,
          messageBody,
          {idEvent}
        );
    }
    else if(user.email){
      const html = `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <table align="center" style="background-color: #5669FF;border-radius:8px;padding:20px;max-width:600px;margin:auto">
            <tr>
            <td>
                <h1 style="color: #ffffff; text-align: center;">Invite Notification</h1>
                <h2 style="color: #ffffff; text-align: center;">Hello,</h2>
                <p style="color: #ffffff; text-align: center;">We have received your request. Below are the random numbers generated:</p>
                
                <!-- Bảng chứa các ô số -->
                <table align="center" style="margin: 20px auto; border-spacing: 10px;">
                <tr>
                    ${idEvent}
                </tr>
                </table>
                
                <h4 style="color: #ffffff; text-align: center;">Thank you for using our service!</h4>
                <h4 style="color: #ffffff; text-align: center;">Best regards,</h4>
                <h4 style="color: #ffffff; text-align: center;">Support team</h4>
            </td>
            </tr>
        </table>
    </body>`
      return sendMail(user.email,html,'Invite Notification')
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
      ...userProfile
    } = user.toObject()

    const events = await EventModel.find({authorId:user._id}).select('-__v -createdAt -updatedAt');
    userProfile.followedEvents = events
    return res.status(200).json({
      status: true,
      mes: 'Get Profile successfully!',
      data:userProfile
    });
})


const putMyProfile = asyncHandler(async (req, res) => {
  const {_id} = req.user
  const {photoUrl,familyName,givenName,fullName,bio} = req.body
  const user = await checkUser(_id)
  if(!user) return res.status(401).json({
    status: false,
    mes: 'Invalid credentials!',
  })   

  const result = await UserModel.findByIdAndUpdate(user._id,{photoUrl,familyName,givenName,fullName,bio},{new:true})
  res.status(result ? 200 : 400).json({
    status: result ? true : false,
    mes:  result ? `Update my email successfully` : 'Update my email failed',
  })

})


const putMyEmailProfile = asyncHandler(async (req, res) => {
  const {_id} = req.user
  const {email} = req.body
  const user = await checkUser(_id)
  if(!user) return res.status(401).json({
    status: false,
    mes: 'Invalid credentials!',
  })   

  const result = await UserModel.findByIdAndUpdate(user._id,{email},{new:true})


  res.status(result ? 200 : 400).json({
    status: result ? true : false,
    mes:  result ? `Update my email successfully` : 'Update my email failed',
  })
})


const putMyInterestProfile = asyncHandler(async (req, res) => {
  const {_id} = req.user
  const {interests} = req.body
  const user = await checkUser(_id)
  if(!user) return res.status(401).json({
    status: false,
    mes: 'Invalid credentials!',
  })   


  const result = await UserModel.findByIdAndUpdate(user._id,{interests},{new:true})


  res.status(result ? 200 : 400).json({
    status: result ? true : false,
    mes:  result ? `Update my Interest successfully` : 'Update my Interest failed',
    data:result.interests
  })

  
})



const postFollow = asyncHandler(async (req, res) => {
  const {_id} = req.user
  const {idFollow} = req.body

  const [followUser, followingUser] = await Promise.all([
    UserModel.findByIdAndUpdate(
      idFollow,
      { $addToSet: { followers: _id } }, // Sử dụng $addToSet để tránh thêm trùng lặp
      { new: true }
    ),
    UserModel.findByIdAndUpdate(
      _id,
      { $addToSet: { following: idFollow } }, // Sử dụng $addToSet để tránh thêm trùng lặp
      { new: true }
    )
  ]);

  // Kiểm tra xem cả hai thao tác cập nhật có thành công không
  if (followUser && followingUser) {
    return res.status(200).json({
      status: true,
      mes: 'Post Follow successfully',
      data:{
        followUser:followUser.followers,
        myFollowingUser:followingUser.following
      }
    });
  } else {
    return res.status(400).json({
      status: false,
      mes: 'Post Follow failed',
    });
  }
})


const postUnFollow = asyncHandler(async (req, res) => {
  const {_id} = req.user
  const {idFollow} = req.body

  const [followUser, followingUser] = await Promise.all([
    UserModel.findByIdAndUpdate(
      idFollow,
      { $pull: { followers: _id } }, // Sử dụng $addToSet để tránh thêm trùng lặp
      { new: true }
    ),
    UserModel.findByIdAndUpdate(
      _id,
      { $pull: { following: idFollow } }, // Sử dụng $addToSet để tránh thêm trùng lặp
      { new: true }
    )
  ]);

  // Kiểm tra xem cả hai thao tác cập nhật có thành công không
  if (followUser && followingUser) {
    return res.status(200).json({
      status: true,
      mes: 'Post Follow successfully',
      data:{
        followUser:followUser.followers,
        myFollowingUser:followingUser.following
      }
    });
  } else {
    return res.status(400).json({
      status: false,
      mes: 'Post Follow failed',
    });
  }
})


const getFriend = asyncHandler(async (req, res) => {
  const {_id} = req.user
  const user = await checkUser(_id)
  if(!user) return res.status(401).json({
    status: false,
    mes: 'Invalid credentials!',
  }) 

  console.log(user.following)

  console.log('selectUser',selectUser.join(' '))
  const friends = await Promise.all(user.following.map( async (friend) => {
    const user = await UserModel.findById(friend).select(selectUser.join(' ')).exec()
    return user ? user : null
  }))


  const filteredFriends = friends.filter(event => event !== null);


  console.log(filteredFriends)

  return res.status(200).json({
    status: true,
    mes: 'Get Friend successfully',
    data:filteredFriends
  });

})




module.exports = {
    getAll,
    putFollowers,
    getDataDefaultUser,
    postExpoPushToken,
    sendInviteNotification,
    getProfile,
    putMyProfile,
    putMyEmailProfile,
    putMyInterestProfile,
    postFollow,
    postUnFollow,
    getFriend
}