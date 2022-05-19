const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversationSchema = new Schema({
    members: {
        type: Object,
        required: true,
    },
    conversationId: {
        type: String,
        required: true,
    },
    messages: {
        type: Object,
        required: true,
        default: [],
    },
    creator: {
        type: String,
        require: true,
    },
});

const Conversation = mongoose.model('Conversations', conversationSchema);

module.exports = Conversation;