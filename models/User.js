const mongoose = require('mongoose');
const { Schema } = mongoose;
const generateUserId = require('../src/generateUserId.js');

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        default: generateUserId,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    contactList: {
        type: Object,
        required: true,
        default: [],
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;