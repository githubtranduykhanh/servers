const authRouter = require('./auth')


const initRoutes = (app) => {
    app.use('/api/auth', authRouter)
}

module.exports = initRoutes