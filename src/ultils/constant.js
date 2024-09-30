const roles = [
    {
        code:2101,
        value:'User'
    },
    {
        code:2001,
        value:'Admin'
    }
]


const selectUser = [
    '-passwordReset',
    '-refreshToken',
    '-role',
    '-password',
    '-createdAt',
    '-updatedAt',
    '-expoPushToken',
    '-__v'
]

module.exports = {roles,selectUser}