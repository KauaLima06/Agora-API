const mongoose = require('mongoose');
const { Schema } = mongoose;
const generateId = require('../src/generateId.js');

const chatSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    members: {
        type: Object,
        required: true,
        default: [],
    },
    chatId: {
        type: String,
        required: true,
        default: generateId,
    },
    messages: {
        type: Object,
        required: false,
        default: [],
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;