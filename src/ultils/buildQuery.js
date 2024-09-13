const asyncHandler = require('express-async-handler')
require("dotenv").config();
const buildQuery = asyncHandler(async (Model, query, customFilters) => {
   
        // 1A) Basic Filtering
        const queryObj = { ...query }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        // 1B) Advanced filtering (gte, lte, gt, lt)
        let queryString = JSON.stringify(queryObj)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        let formateQueries = JSON.parse(queryString)

        // 2) Apply custom filters
        if (typeof customFilters === 'function') {
            formateQueries = customFilters(formateQueries, queryObj)
        }

        // Build the query
        let queryCommand = Model.find(formateQueries)

        // 3) Sorting
        if (query.sort) {
            const sortBy = query.sort.split(',').join(' ')
            queryCommand = queryCommand.sort(sortBy)
        }

        // 4) Field limiting
        if (query.fields) {
            const fieldsBy = query.fields.split(',').join(' ')
            queryCommand = queryCommand.select(fieldsBy)
        }

        // 5) Pagination
        const page = +query.page || 1
        const limit = +query.limit || process.env.LIMIT_DEFAULT
        const skip = (page - 1) * limit
        queryCommand.limit(limit).skip(skip)



        // Execute query
        const response = await queryCommand
        const counts = await Model.find(formateQueries).countDocuments()



        return {
            counts,
            data: response ? response : [],
        }
        
})


/* 
    Lọc theo tiêu đề (title) 
    GET /api/events?title=Conference
    
    Lọc theo danh mục (category)
    GET /api/events?category=Music
    
    Lọc theo người dùng (users) với $in
    GET /api/events?users=user1,user2&filterType=in
    
    Lọc theo người dùng (users) với $all
    GET /api/events?users=user1,user2&filterType=all
    
    Lọc theo khoảng thời gian (startAt và endAt)
    GET /api/events?startAt=2024-01-01&endAt=2024-12-31
    
    Sắp xếp theo tiêu đề (title) (dấu '-' trước trường để sắp xếp giảm dần)
    GET /api/events?sort=title
    
    Lấy các trường cụ thể
    GET /api/events?fields=title,date,location
    
    Phân trang
    GET /api/events?page=2&limit=10

    Ví dụ tích hợp đầy đủ với tất cả các tham số
    GET /api/events?title=Conference&category=Music&users=user1,user2&filterType=in&startAt=2024-01-01&endAt=2024-12-31&sort=date,-title&fields=title,date,location&page=2&limit=10


    Ví dụ về các phép toán gte, gt, lte, và lt

    Lọc theo giá lớn hơn hoặc bằng một giá trị (gte)
    GET /api/events?price[gte]=50

    Lọc theo giá lớn hơn một giá trị (gt)
    GET /api/events?price[gt]=100

    Lọc theo giá nhỏ hơn hoặc bằng một giá trị (lte)
    GET /api/events?price[lte]=200

    Lọc theo giá nhỏ hơn một giá trị (lt)
    GET /api/events?price[lt]=150

    Lọc theo ngày bắt đầu sau hoặc bằng một ngày cụ thể (gte)
    GET /api/events?startAt[gte]=2024-01-01

    Lọc theo ngày bắt đầu sau một ngày cụ thể (gt)
    GET /api/events?startAt[gt]=2024-01-01

    Lọc theo ngày kết thúc trước hoặc bằng một ngày cụ thể (lte)
    GET /api/events?endAt[lte]=2024-12-31

    Lọc theo ngày kết thúc trước một ngày cụ thể (lt)
    GET /api/events?endAt[lt]=2024-12-31

*/

module.exports = buildQuery