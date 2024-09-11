const router = require('express').Router()
const eventController = require('../controllers/eventController')
const { verifyAccessToken } = require('../middlewares/verifyToken')
const {validates,addEventConfigs} = require('../middlewares/validates')



router.post('/add-new-event',[verifyAccessToken,...validates(addEventConfigs)], eventController.postAddNewEvent)

module.exports = router