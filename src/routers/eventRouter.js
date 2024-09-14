const router = require('express').Router()
const eventController = require('../controllers/eventController')
const { verifyAccessToken } = require('../middlewares/verifyToken')
const {validates,addEventConfigsBody,distanceEventConfigsQuery,followersEventConfigsParams} = require('../middlewares/validates')



router.post('/add-new',[verifyAccessToken,...validates(addEventConfigsBody)], eventController.postAddNewEvent)
router.get('/by-distance',...validates(distanceEventConfigsQuery,'query'), eventController.getEventsByDistance)
router.get('/', eventController.getEvents)
router.put('/followers/:idEvent', [verifyAccessToken,...validates(followersEventConfigsParams,'params')] ,eventController.putFollowers)


module.exports = router