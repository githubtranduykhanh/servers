const router = require('express').Router()
const authController = require('../controllers/authController')
const {validates,refreshTokenAuthConfigsBody} = require('../middlewares/validates')



router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/send-code-email', authController.sendCodeEmail)

router.put('/resset-password', authController.ressetPassword)

router.post('/refresh-token',...validates(refreshTokenAuthConfigsBody), authController.refreshToken)



module.exports = router