const mongoose = require('mongoose');
const { Schema } = mongoose;
const generateId = require('../src/generateId.js');

const groupsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    members: {
        type: String,
        required: true,
        default: '',
    },
    groupId: {
        type: String,
        required: true,
        default: generateId,
    },
    message: {
        type: String,
        required: true,
        default: '',
    }
});

const Group = mongoose.model('Group', groupsSchema);

module.exports = Group; 