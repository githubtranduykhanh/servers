const router = require('express').Router()
const userController = require('../controllers/userController')
const { verifyAccessToken } = require('../middlewares/verifyToken')
const {validates,addEventConfigs} = require('../middlewares/validates')



router.get('/',[verifyAccessToken,userController.getAll])



router.post('/add-new-event',[verifyAccessToken,...validates(addEventConfigs)], userController.postAddNewEvent)

module.exports = router