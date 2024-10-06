const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const uniqid = require("uniqid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const { EventModel, UserModel, CategoryModel } = require("../models");
const Validate = require("../ultils/validate");
const { Number } = require("../ultils/helper");
const sendMail = require("../ultils/sendMail");
const calculateDistance = require("../ultils/distanceUtils");
const buildQuery = require("../ultils/buildQuery");
const { checkUser } = require('../middlewares/validates')

const sendPushNotification = require('../ultils/notification');
const { selectUser } = require("../ultils/constant");

const postAddNewEvent = asyncHandler(async (req, res) => {
  const { user } = req;
  const {
    title,
    description,
    position,
    location,
    price,
    imageUrl,
    users,
    categories,
    authorId,
    startAt,
    endAt,
    date,
  } = req.body;
  const userFind = await UserModel.findById(user._id);
  if (!userFind)
    return res.status(400).json({
      status: false,
      mes: "Invalid credentials!",
    });
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
    date,
  });
  // Trả về phản hồi thành công
  return res.status(newEvent ? 201 : 500).json({
    status: newEvent ? true : false,
    mes: newEvent ? "Event added successfully!" : "Error adding event!",
  });
});

const getEventsByDistance = asyncHandler(async (req, res) => {
  const { lat, lng, distance } = req.query;
  const events = await EventModel.find();



  const filteredDistanceEvents = events.filter((event) => {
    const eventLat = event.position.lat;
    const eventLng = event.position.lng;

    const eventDistance = calculateDistance(lat, lng, eventLat, eventLng);
    return eventDistance <= distance; // Chỉ giữ các sự kiện trong khoảng cách
  });


  const updatedEvents = await Promise.all(filteredDistanceEvents.map(async (event) => {
    event = event.toObject()
    const author = await UserModel.findById(event.authorId).select('-password -refreshToken -passwordReset')
    .exec();
    
    if(author){
      event.author = author
      return event
    }
    return null
  }))


  const filteredEvents = updatedEvents.filter(event => event !== null);


  return res.status(filteredEvents ? 200 : 400).json({
    status: filteredEvents ? true : false,
    mes: filteredEvents
      ? "Events By Distance successfully!"
      : "Error Events By Distance!",
    data: filteredEvents ?? [],
  });
});

const eventFilters = (formateQueries, queryObj) => {
  // Lọc theo title
  if (queryObj?.title)
    formateQueries.title = { $regex: queryObj.title, $options: "i" };

  // Lọc theo categories
  if (queryObj?.categories) {
    formateQueries.categories = { $in: [queryObj.categories] };
  }

  // Lọc theo khoảng thời gian (startAt và endAt)
  if (queryObj?.startAt && queryObj?.endAt) {
    formateQueries.startAt = { $gte: new Date(queryObj.startAt) };
    formateQueries.endAt = { $lte: new Date(queryObj.endAt) };
  }

  // Lọc theo người theo dõi (followers)
  if (queryObj?.followers) {
    formateQueries.followers = { $in: [queryObj.followers] };
  }

  // Lọc theo người dùng
  if (queryObj?.users) {
    const arrUsers = queryObj.users.split(",");
    const filterUserType = queryObj.filterUserType || "in"; // Tham số filterType: 'in' hoặc 'all'

    if (filterUserType === "all") {
      formateQueries.users = { $all: arrUsers }; // Phải chứa tất cả người dùng trong danh sách
    } else {
      formateQueries.users = { $in: arrUsers }; // Có ít nhất một người dùng trong danh sách
    }
  }

  return formateQueries;
};

const getEvents = asyncHandler(async (req, res) => {
  console.log(req.query)
  const { author, ...query } = req.query;
  const result = await buildQuery(EventModel, { ...query }, eventFilters)

  if (author) {
    const updatedEvents = await Promise.all(result.data.map(async (event) => {
     
      event = event.toObject(); 
     
      const author = await UserModel.findById(event.authorId)
        .select('-password -refreshToken -passwordReset')
        .exec();

      
      if (author) {
        event.author = author; 
        return event;         
      }
    
      return null;
    }));
 
    const filteredEvents = updatedEvents.filter(event => event !== null);
    result.data = filteredEvents;
  }



  /* // Return response
  if (lat && lng && distance) {
    result.data = result.data.filter((event) => {
      const eventLat = event.position.lat;
      const eventLng = event.position.lng;

      const eventDistance = calculateDistance(lat, lng, eventLat, eventLng);
      return eventDistance <= distance; // Chỉ giữ các sự kiện trong khoảng cách
    });
  } */




  res.status(result ? 200 : 404).json({
    status: result ? true : false,
    mes: result ? `Get events successfully` : `Cannot get events`,
    ...result
  })
});



const getFollowersUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const events = await EventModel.find({ followers: _id }).select('_id').exec();
  const eventIds = events.map(event => event._id.toString());
  res.status(eventIds ? 200 : 400).json({
    status: eventIds ? true : false,
    mes: eventIds ? `Get Followers User successfully` : 'Get Followers User failed',
    data: eventIds
  })
})


const sendInviteNotification = asyncHandler(async (req, res) => {
  const { userIds, messageTitle, messageBody } = req.body

  const users = await UserModel.find({ _id: { $in: userIds } });

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

const createCategories = asyncHandler(async (req, res) => {
  const categoriesData = [
    {
      key: 'sport',
      title: 'Sports',
      iconLibrary: 'Ionicons',
      iconName: 'basketball',
      iconSize: 22,
      iconColor: '#EE544A'
    },
    {
      key: 'music',
      title: 'Music',
      iconLibrary: 'FontAwesome',
      iconName: 'music',
      iconSize: 22,
      iconColor: '#F59762'
    },
    {
      key: 'food',
      title: 'Food',
      iconLibrary: 'CustomSVG', // Thư viện cho icon tùy chỉnh
      iconName: 'ChefForkSVG',
      iconSize: 22,
      iconColor: '#29D697'
    },
    {
      key: 'art',
      title: 'Art',
      iconLibrary: 'Ionicons',
      iconName: 'color-palette-sharp',
      iconSize: 22,
      iconColor: '#46CDFB'
    }
  ];


  for (let categoryData of categoriesData) {
    await CategoryModel.create(categoryData)
  }

  return res.status(200).json({
    status: true,
    mes: 'Create Categories successfully!',
  });

})


const getCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.find()
  return res.status(categories ? 200 : 400).json({
    status: categories ? true : false,
    mes: categories ? 'Create Categories successfully!' : 'Create Categories failed',
    data: categories ? categories : []
  });
})


const getEventById = asyncHandler(async (req, res) => {
  const{id} = req.params
  console.log('id',id)
  let event = await EventModel.findById(id)
  if(!event)  return res.status(400).json({
    status: false,
    mes: 'Get Event By Id  failed event',
  });

  const user = await UserModel.findById(event.authorId).select(selectUser.join(' ')).exec()
  if(!user)  return res.status(400).json({
    status: false,
    mes: 'Get Event By Id  failed author',
  });

  event = event.toObject()
  event.author = user
  console.log('event',event)
  return res.status(event ? 200 : 400).json({
    status: event ? true : false,
    mes: event ? 'Get Event By Id successfully!' : 'Get Event By Id  failed',
    data: event ? event : {}
  });
})



module.exports = {
  postAddNewEvent,
  getEventsByDistance,
  getEvents,
  createCategories,
  getCategories,
  getEventById
};
