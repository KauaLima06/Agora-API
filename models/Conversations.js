const mongoose =require('mongoose');
const { Schema } = mongoose;
const generateId = require('../src/generateId.js');

const conversationSchema = new Schema({
    members: {
        type: Object,
        required: true,
        default: [],
    },
    conversationId: {
        type: String,
        required: true,
        default: generateId,
    },
    messages: {
        type: Object,
        required: true,
        default: [],
    }
});

const Conversation = mongoose.model('Conversations', conversationSchema);

module.exports = Conversation;