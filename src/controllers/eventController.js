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
const { EventModel, UserModel } = require("../models");
const Validate = require("../ultils/validate");
const { Number } = require("../ultils/helper");
const sendMail = require("../ultils/sendMail");
const calculateDistance = require("../ultils/distanceUtils");
const buildQuery = require("../ultils/buildQuery");
const {checkUser} = require('../middlewares/validates')
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

  const filteredEvents = events.filter((event) => {
    const eventLat = event.position.lat;
    const eventLng = event.position.lng;

    const eventDistance = calculateDistance(lat, lng, eventLat, eventLng);
    return eventDistance <= distance; // Chỉ giữ các sự kiện trong khoảng cách
  });

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
    const { lat, lng, distance, ...query } = req.query;
    const result = await buildQuery(EventModel,{...query},eventFilters)
    // Return response
    if(lat && lng && distance){
        result.data = result.data.filter((event) => {
            const eventLat = event.position.lat;
            const eventLng = event.position.lng;
        
            const eventDistance = calculateDistance(lat, lng, eventLat, eventLng);
            return eventDistance <= distance; // Chỉ giữ các sự kiện trong khoảng cách
        });
    }
    
    res.status(result ? 200 : 404).json({
        status: result ? true : false,
        mes: result ? `Get events successfully` : `Cannot get events`,
       ...result
    })
});

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
  const alreadyFollowing = event.followers.includes(user._id);

  // Cập nhật sự kiện
  const result = await EventModel.findByIdAndUpdate(
    idEvent,
    alreadyFollowing ? { $pull: { followers: user._id } } : { $push: { followers: user._id } },
    { new: true } // Trả về tài liệu đã cập nhật
  );
  
  res.status(result ? 200 : 400).json({
    status: result ? true : false,
    mes:  result ? `Put Followers successfully` : 'Put Followers failed',
    data: result.followers
  })
})


module.exports = {
  postAddNewEvent,
  getEventsByDistance,
  getEvents,
  putFollowers,
};
