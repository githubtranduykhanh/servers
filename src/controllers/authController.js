const asyncHandler = require('express-async-handler')


const register = asyncHandler(async (req, res) => {

    const {fullName,email,password,confirmPassword} = req.body
    console.log('==========')
    console.log(req.body)


    res.json({
        status:false,
        errors:{
            email:'Email error'+ email,
            fullName:'Full Name error' + fullName
        }
    })
})


module.exports = {
    register
}