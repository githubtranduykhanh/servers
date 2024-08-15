/** @format */

const { default: mongoose, isValidObjectId, Schema } = require('mongoose');

const bcrypt = require('bcrypt')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema({
	fullName: {
		type: String,
	},
	givenName: {
		type: String,
	},
	familyName: {
		type: String,
	},
	bio: {
		type: String,
	},
	email: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	photoUrl: {
		type: String,
	},
	fcmTokens: {
		type: [String],
	},
	following: {
		type: [String],
	},
	followers: {
		type: [String],
	},
	interests: {
		type: [String],
	},
    role: {
        type: Number,
        enum:[2101,2001],
        default: 2101,
    },
    refreshToken: {
        type: String,
    },
    passwordChangedAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    }
},{
    timestamps: true
});


UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
})
UserSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    },
    createPasswordChangedToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000
        return resetToken
    }
}


module.exports = mongoose.model('users', UserSchema);