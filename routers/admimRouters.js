const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const generateId = require('../src/generateId.js');
const User = require('../models/User.js');
const Conversation = require('../models/Conversations.js');
const Chat = require('../models/Chat.js');

router.get('/', (req, res) => {
    res.status(200).json({message: 'Welcome to the admin panel'});
});

//login
router.post('/auth', async(req, res) => {
    const { email , password } = req.body;
});

module.exports = router;