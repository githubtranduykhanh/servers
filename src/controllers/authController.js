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


const sendCodeEmail = asyncHandler(async (req, res) => {
    const { email, title = 'Verification' } = req.body

    if (!email) return res.status(400).json({
        status: false,
        mes: 'Mising input.'
    })

    const randomNunber = Number.RandomNumber(0, 9, 4)
    if (title && title === 'ressetPassword') {
        const user = await UserModel.findOne({ email })
        if (!user) return res.status(400).json({
            status: false,
            mes: 'Invalid credentials.'
        })
        await UserModel.findByIdAndUpdate(user._id, { passwordResetToken: randomNunber.join('') }, { new: true })
    }




    const html = `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <table align="center" style="background-color: #5669FF;border-radius:8px;padding:20px;max-width:600px;margin:auto">
            <tr>
            <td>
                <h1 style="color: #ffffff; text-align: center;">Code ${title}</h1>
                <h2 style="color: #ffffff; text-align: center;">Hello,</h2>
                <p style="color: #ffffff; text-align: center;">We have received your request. Below are the random numbers generated:</p>
                
                <!-- Bảng chứa các ô số -->
                <table align="center" style="margin: 20px auto; border-spacing: 10px;">
                <tr>
                    ${randomNunber?.map(number => `
                    <td style="padding: 5px;">
                        <div style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; color: #000; font-size: 20px; font-weight: bold; border-radius: 8px; text-align: center; line-height: 40px;">
                        ${number}
                        </div>
                    </td>
                    `).join('')}
                </tr>
                </table>
                
                <h4 style="color: #ffffff; text-align: center;">Thank you for using our service!</h4>
                <h4 style="color: #ffffff; text-align: center;">Best regards,</h4>
                <h4 style="color: #ffffff; text-align: center;">Support team</h4>
            </td>
            </tr>
        </table>
    </body>`

    await sendMail(email, html, `Registration Code Event Hub : ${randomNunber?.join(' ')}`)

    return res.status(200).json({
        status: true,
        mes: `${title} is successfully`,
        email,
        numbers: randomNunber
    })
})

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
            followers,
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
                _id,
                email,
                role,
                fullName,
                photoUrl,
                followers,
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
            followers,
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
                _id,
                email,
                role,
                fullName,
                photoUrl,
                followers,
                accessToken,
            }
        })
    } else {
        throw new Error('Invalid credentials!')
    }
})



const ressetPassword = asyncHandler(async (req, res) => {
    const { codes, email, newPassword, confirmPassword } = req.body

    if (!codes || !email || !newPassword || !confirmPassword) return res.status(400).json({
        status: false,
        mes: 'Missing inputs'
    })

    if(!Array.isArray(codes) || codes.length > 4) return res.status(400).json({
        status: false,
        mes: 'The codes array must contain at most 4 elements.',
    }) 

    const errors = validate(email, newPassword, confirmPassword)
    if (Object.keys(errors).length > 0) return res.status(400).json({
        status: false,
        mes: 'Validation failed.',
        errors
    })

    const user = await UserModel.findOne({ email })

    if (!user) return res.status(400).json({
        status: false,
        mes: 'Invalid credentials.'
    })

    const {
        role,
        _id,
        photoUrl,
        fullName,
        followers,
        passwordResetToken,
        ...userData
    } = user.toObject()

    console.log(passwordResetToken)
    const arrPasswordResetToken = passwordResetToken.split('').map((val => +val))
    if (!codes?.every((code, index) => code === arrPasswordResetToken[index]))
        return res.status(400).json({
            status: false,
            mes: 'Invalid authentication code.'
        })

    // Tạo access token
    const accessToken = generateAccessToken(user._id, role)
    // Tạo refresh token
    const newRefreshToken = generateRefreshToken(user._id)
    //Hash password
    const salt = bcrypt.genSaltSync(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)
    // Lưu refresh token vào database
    await UserModel.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken, password: passwordHash }, { new: true })

    return res.status(200).json({
        status: true,
        mes: 'Resset Password is successfully',
        data: {
            _id,
            email,
            role,
            fullName,
            photoUrl,
            followers,
            accessToken,
        }
    })
})


module.exports = {
    register,
    login,
    sendCodeEmail,
    ressetPassword
}