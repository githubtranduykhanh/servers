const router = require('express').Router()
const userController = require('../controllers/userController')
const { verifyAccessToken,checkUserDatabase } = require('../middlewares/verifyToken')
const {validates,followersEventConfigsParams,postFollowUserConfigsBody,sendInviteNotificationConfigsBody,myProfileUserConfigsBody,profileInterestUserConfigsBody,profileEmailUserConfigsBody,expoPushTokenUserConfigsBody,profileUserConfigsParams} = require('../middlewares/validates')



router.get('/',[verifyAccessToken,userController.getAll])
router.get('/profile/:idUser',...validates(profileUserConfigsParams,'params'),userController.getProfile)
router.post('/expoPushToken',[verifyAccessToken,checkUserDatabase,...validates(expoPushTokenUserConfigsBody,'body')],userController.postExpoPushToken)
router.get('/data-default', [verifyAccessToken,checkUserDatabase],userController.getDataDefaultUser)
router.get('/friend', [verifyAccessToken],userController.getFriend)
router.post('/followers', [verifyAccessToken,...validates(postFollowUserConfigsBody),checkUserDatabase],userController.postFollow)
router.post('/unFollowers', [verifyAccessToken,...validates(postFollowUserConfigsBody),checkUserDatabase],userController.postUnFollow)
router.put('/followers/:idEvent', [verifyAccessToken,...validates(followersEventConfigsParams,'params')] ,userController.putFollowers)
router.put('/profile-email', [verifyAccessToken,...validates(profileEmailUserConfigsBody)] ,userController.putMyEmailProfile)
router.put('/my-profile', [verifyAccessToken,...validates(myProfileUserConfigsBody)] ,userController.putMyProfile)
router.put('/profile-interest', [verifyAccessToken,...validates(profileInterestUserConfigsBody)] ,userController.putMyInterestProfile)
router.post('/send-invite-notification', [verifyAccessToken,checkUserDatabase,...validates(sendInviteNotificationConfigsBody)] ,userController.sendInviteNotification)
module.exports = router