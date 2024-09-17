/** @format */

const { default: mongoose, isValidObjectId, Schema } = require('mongoose');

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { Number } = require('../ultils/helper')
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
	expoPushToken:{
		type: String,
	},
	followedEvents: {
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
	passwordReset: {
		passwordChangedAt: {
			type: String,
		},
		passwordResetToken: {
			type: String,
		},
		passwordResetExpires: {
			type: String,
		},
		passwordResetIV: {
			type: String,
		},
	},
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
    createPasswordChangedToken: function (encryptedData,iv) {
        this.passwordReset.passwordResetToken = encryptedData
        this.passwordReset.passwordResetExpires = Date.now() + 15 * 60 * 1000 // 15 phút
		this.passwordReset.passwordResetIV = iv
    }
}


module.exports = mongoose.model('users', UserSchema);