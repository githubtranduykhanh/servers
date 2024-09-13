const router = require('express').Router()
const eventController = require('../controllers/eventController')
const { verifyAccessToken } = require('../middlewares/verifyToken')
const {validates,addEventConfigsBody,distanceEventConfigsQuery} = require('../middlewares/validates')



router.post('/add-new',[verifyAccessToken,...validates(addEventConfigsBody)], eventController.postAddNewEvent)
router.get('/by-distance',...validates(distanceEventConfigsQuery,'query'), eventController.getEventsByDistance)



module.exports = router