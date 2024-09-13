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
const calculateDistance = require('../ultils/distanceUtils')

const postAddNewEvent = asyncHandler(async (req,res) => {
    const {user} = req
    const { title, description, position ,location, price, imageUrl, users, categories, authorId, startAt, endAt, date } = req.body
    const userFind = await UserModel.findById(user._id)
    if(!userFind) return res.status(400).json({
        status: false,
        mes: 'Invalid credentials!',
    })
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
    // Trả về phản hồi thành công
    return res.status(newEvent ? 201 : 500).json({
        status: newEvent ?  true : false,
        mes: newEvent ?'Event added successfully!' : 'Error adding event!',
    });
})




const getEventsByDistance = asyncHandler(async (req,res) => {
    const {lat,lng,distance} = req.query
    const events = await EventModel.find()

    const filteredEvents = events.filter(event => {
        const eventLat = event.position.lat
        const eventLng = event.position.lng
  
        const eventDistance = calculateDistance(lat, lng, eventLat, eventLng)
        return eventDistance <= distance // Chỉ giữ các sự kiện trong khoảng cách
    })

    return res.status(filteredEvents ? 200 : 400).json({
        status: filteredEvents ? true : false ,
        mes: filteredEvents ? 'Events By Distance successfully!' : 'Error Events By Distance!',
        data: filteredEvents ?? []
    });
})


module.exports = {
    postAddNewEvent,
    getEventsByDistance
}