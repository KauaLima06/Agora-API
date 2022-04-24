const mongoose = require('mongoose');
const { Schema } = mongoose;
const generateId = require('../src/generateId.js');

const conversationSchema = new Schema({
    members: {
        type: String,
        required: true,
        default: '',
    },
    conversationId: {
        type: String,
        required: true,
        default: generateId,
    },
    messages: {
        type: String,
        required: true,
        default: '',
    }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;