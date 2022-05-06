const mongoose = require('mongoose');
const { Schema } = mongoose;
const generateId = require('../src/generateId.js');

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        default: generateId,
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
    },
    chats: {
        type: Object,
        required: true,
        default: [],
    },
    isConfirmed: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;