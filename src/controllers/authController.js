const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const uniqid = require('uniqid')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const UserModel = require('../models/userModel')
const Validate = require('../ultils/validate')


const validate = (email, password, confirmPassword) => {
    const errors = {}
    if (email && !Validate.email(email)) errors.email = 'Invalid email.'
    if (password && !Validate.Password(password)) errors.password = 'Password must be greater than 6 characters.'
    if (confirmPassword && !Validate.ConfirmPassword(password, confirmPassword)) errors.confirmPassword = 'Password confirmation must match the password.'
    return errors
}

const isValid = (obj) => {
    // Sử dụng Object.values để lấy tất cả các giá trị trong obj
    return Object.values(obj).every(value => value !== undefined && value !== '');
};

const register = asyncHandler(async (req, res) => {
    const data = { fullName, email, password, confirmPassword } = req.body

    if (!isValid(data)) return res.status(400).json({
        status: false,
        mes: 'Missing inputs'
    })

    const errors = validate(email, password, confirmPassword)

    if (Object.keys(errors).length > 0) return res.status(400).json({
        status: false,
        mes: 'Validation failed.',
        errors
    })

    const user = await UserModel.findOne({ email })

    if (user) throw new Error('User email has existed')
    else {
        const newUser = await UserModel.create(req.body)
        const {
            role,
            _id,
            photoUrl,
            fullName,
            email,
            ...userData
        } = newUser.toObject()

        // Tạo access token
        const accessToken = generateAccessToken(newUser._id, role)
        // Tạo refresh token
        const newRefreshToken = generateRefreshToken(newUser._id)
        // Lưu refresh token vào database
        await UserModel.findByIdAndUpdate(newUser._id, { refreshToken: newRefreshToken }, { new: true })
        return res.status(201).json({
            status: newUser ? true : false,
            mes: newUser ? 'Register is successfully. Please go login :))' : 'Something went wrong',
            data: {
                id: _id,
                email,
                role,
                fullName,
                photoUrl,
                accessToken,
            }
        })
    }
})




const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) return res.status(400).json({
        status: false,
        mes: 'Missing inputs'
    })


    const errors = validate(email, password)
    if (Object.keys(errors).length > 0) return res.status(400).json({
        status: false,
        mes: 'Validation failed.',
        errors
    })

    const user = await UserModel.findOne({ email })
    const isUser = user && await user.isCorrectPassword(password)
    if (isUser) {
        const {
            role,
            _id,
            photoUrl,
            fullName,
            email,
            ...userData
        } = user.toObject()

        // Tạo access token
        const accessToken = generateAccessToken(user._id, role)
        // Tạo refresh token
        const newRefreshToken = generateRefreshToken(user._id)
        // Lưu refresh token vào database
        await UserModel.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true })

        return res.status(200).json({
            status: true,
            mes: 'Login is successfully',
            data: {
                id: _id,
                email,
                role,
                fullName,
                photoUrl,
                accessToken,
            }
        })
    } else {
        throw new Error('Invalid credentials!')
    }
})


module.exports = {
    register,
    login
}