const { body, validationResult } = require('express-validator');

// Hàm validates nhận vào một đối tượng cấu hình các trường cần kiểm tra và thông báo lỗi
const validates = (fieldConfigs) => [
     // Tạo các kiểm tra cho từng trường cần thiết dựa trên cấu hình
     ...Object.entries(fieldConfigs).map(([field, { checks }]) => {
        let validatorChain = body(field);
        checks.forEach(check => {
            validatorChain = validatorChain.custom(async (value) => {
                const result = await check.run({ body: { [field]: value } });
                if (!result.isEmpty()) {
                    throw new Error(result.errors[0].msg); // Lấy thông báo lỗi từ kiểm tra
                }
                return true;
            });
        });
        return validatorChain;
    }),

    // Kiểm tra các lỗi và trả về phản hồi lỗi nếu có
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                mes: 'Validation failed !!',
                errors: errors.array(),
            });
        }
        next();
    }
];

// Cấu hình các trường cần kiểm tra và các hàm kiểm tra
const addEventConfigs = {
    authorId: {
        checks: [
            body('authorId').isString().withMessage('Author ID must be a string'),
        ]
    },
    caterory: {
        checks: [
            body('caterory').isArray().withMessage('Caterory must be an array'),
            body('caterory.*').isString().withMessage('Each caterory must be a string')
        ]
    },
    date: {
        checks: [
            body('date').isISO8601().withMessage('Date must be a valid ISO8601 date')
        ]
    },
  /*   description: {
        checks: [
            body('description').optional().isString().withMessage('Description must be a string')
        ]
    }, */
    endAt: {
        checks: [
            body('endAt').isISO8601().withMessage('EndAt must be a valid ISO8601 date')
        ]
    },
    imageUrl: {
        checks: [
            body('imageUrl').isURL().withMessage('ImageUrl must be a valid URL')
        ]
    },
    location: {
        checks: [
            body('location').isObject().withMessage('Location must be an object'),
            body('location.address').isString().withMessage('Location address must be a string'),
            body('location.title').isString().withMessage('Location title must be a string')
        ]
    },
    price: {
        checks: [
            body('price').isNumeric().withMessage('Price must be a number'),
            body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
        ]
    },
    startAt: {
        checks: [
            body('startAt').isISO8601().withMessage('StartAt must be a valid ISO8601 date')
        ]
    },
    title: {
        checks: [
            body('title').notEmpty().withMessage('Title is required'),
            body('title').isString().withMessage('Title must be a string')
        ]
    },
   /*  users: {
        checks: [
            body('users').isArray().withMessage('Users must be an array'),
            body('users.*').isString().withMessage('Each user must be a string')
        ]
    } */
};



module.exports = {
    validates,
    addEventConfigs
};
