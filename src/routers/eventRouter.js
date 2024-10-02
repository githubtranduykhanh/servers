const router = require('express').Router()
const eventController = require('../controllers/eventController')
const { verifyAccessToken,checkUserDatabase } = require('../middlewares/verifyToken')
const {validates,addEventConfigsBody,eventByIdConfigsParams,distanceEventConfigsQuery,followersEventConfigsParams} = require('../middlewares/validates')



router.post('/add-new',[verifyAccessToken,...validates(addEventConfigsBody)], eventController.postAddNewEvent)
router.get('/by-distance',...validates(distanceEventConfigsQuery,'query'), eventController.getEventsByDistance)


router.get('/create-categories', eventController.createCategories)

router.get('/categories', eventController.getCategories)

router.get('/:id',...validates(eventByIdConfigsParams,'params'),eventController.getEventById)

router.get('/', eventController.getEvents)


module.exports = router