const mongoose = require('mongoose')
const RegisterSchema = new mongoose.Schema({
    username: {
        type: 'string',
        required: true,
        unique: true
    },
    password: {
        type: 'string',
        required: true
    }



    
})
RegisterSchema.statics.findUserByUsername = function(username) {
    return this.findOne({ username });
  }
const User = mongoose.model('User', RegisterSchema)
module.exports = User;