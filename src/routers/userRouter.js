const router = require('express').Router()
const userController = require('../controllers/userController')
const { verifyAccessToken,checkUserDatabase } = require('../middlewares/verifyToken')
const {validates,followersEventConfigsParams,myProfileUserConfigsBody,profileInterestUserConfigsBody,profileEmailUserConfigsBody,expoPushTokenUserConfigsBody,profileUserConfigsParams} = require('../middlewares/validates')



router.get('/',[verifyAccessToken,userController.getAll])
router.get('/profile/:idUser',...validates(profileUserConfigsParams,'params'),userController.getProfile)
router.post('/expoPushToken',[verifyAccessToken,checkUserDatabase,...validates(expoPushTokenUserConfigsBody,'body')],userController.postExpoPushToken)
router.get('/followers-user', [verifyAccessToken,checkUserDatabase],userController.getFollowersUser)
router.put('/followers/:idEvent', [verifyAccessToken,...validates(followersEventConfigsParams,'params')] ,userController.putFollowers)
router.put('/profile-email', [verifyAccessToken,...validates(profileEmailUserConfigsBody)] ,userController.putMyEmailProfile)
router.put('/my-profile', [verifyAccessToken,...validates(myProfileUserConfigsBody)] ,userController.putMyProfile)
router.put('/profile-interest', [verifyAccessToken,...validates(profileInterestUserConfigsBody)] ,userController.putMyInterestProfile)
module.exports = router