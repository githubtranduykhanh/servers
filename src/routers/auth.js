const router = require('express').Router()





router.get('/', (req,res)=>{
    res.json({
        status:true,
        data:['hello']
    })
})

module.exports = router