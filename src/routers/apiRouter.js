const express = require('express');
const router = express.Router();

// Import các router con
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const eventRouter = require('./eventRouter');
// const userRouter = require('./user'); // Thêm các router khác nếu cần

// Gán các router con vào router chính
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/events', eventRouter);
// router.use('/users', userRouter); // Thêm các router con khác nếu cần

module.exports = router;
