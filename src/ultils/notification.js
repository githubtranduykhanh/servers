const fetch = require('node-fetch')
const asyncHandler = require("express-async-handler");
const sendPushNotification = asyncHandler(async (expoPushToken, title, body,data) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data ? data : { withSome: 'data' },
    };
  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
})

module.exports = sendPushNotification