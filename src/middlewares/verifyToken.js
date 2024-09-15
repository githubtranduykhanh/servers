const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const {UserModel} = require('../models')

require('dotenv').config()
const verifyAccessToken = asyncHandler(async (req, res, next) => {
    // Bearer token
    // headers: { authorization: Bearer token}
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                // Kiểm tra lỗi
                return res.status(401).json({
                    success: false,
                    mes: err?.name ?? 'Invalid access token'
                })
            }
            req.user = decode
            next()
        })
    } else {
        return res.status(401).json({
            success: false,
            mes: 'Require authentication!!!'
        })
    }
})
const isAdmin = asyncHandler((req, res, next) => {
    const { role } = req.user
    if (+role !== 2001)
        return res.status(401).json({
            success: false,
            mes: ' REQUIRE ADMIN ROLE'
        })
    next()
})


const checkUserDatabase = asyncHandler( async (req, res, next) => {
    const { _id } = req.user

    const userFind = await UserModel.findById(_id)

    if(!userFind) return res.status(401).json({
        status: false,
        mes: 'Invalid credentials!',
    })
    next()
})


module.exports = {
    verifyAccessToken,
    isAdmin,
    checkUserDatabase,
}