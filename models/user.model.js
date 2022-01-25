const mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    fn: {
        type: String, 
        required: true 
    },
    ln: {
        type: String, 
        required: true 
    },
    email: {
        type: String, 
        required: true,
        index: {
            unique: true, 
        },
     
      },
    password: {
        type: String, 
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false,

    }

}, {timestamp: 1});

var userModel =  mongoose.model('Users', userSchema);
module.exports = userModel;