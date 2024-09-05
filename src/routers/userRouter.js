const router = require('express').Router()
const userController = require('../controllers/userController')
const { verifyAccessToken } = require('../middlewares/verifyToken')

router.get('/',[verifyAccessToken,userController.getAll])

module.exports = router