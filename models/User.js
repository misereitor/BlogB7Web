const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
mongoose.Promise = global.Promise

const userShema = new mongoose.Schema({
    name: String,
    email: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

userShema.plugin(passportLocalMongoose, { usernameField: 'email' })

module.exports = mongoose.model('User', userShema)