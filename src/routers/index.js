const apiRouter = require('./apiRouter')


const { notFound, errHandler } = require('../middlewares/errHandler')

const initRoutes = (app) => {
    app.use('/api', apiRouter)
    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes