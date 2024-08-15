const {default:mongoose} =require('mongoose')
mongoose.set('strictQuery', false)
require('dotenv').config()

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.URL_MONGODB)
        if(conn.connection.readyState === 1){
            console.log('DB connection is successfully !!')
        }else{
            console.log('DB connecting')
        }       
    } catch (error) {
        console.log('DB connection is failed')
        throw new Error(error)
    }
}

const dbDisconnect = async () => {
    await mongoose.connection.close(()=>{
        console.log('DB disconnect is successfully')
    })
}

module.exports = {dbConnect,dbDisconnect}