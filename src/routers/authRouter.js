const router = require('express').Router()
const authController = require('../controllers/authController')

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/verification', authController.verification)

module.exports = router