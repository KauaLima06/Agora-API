const router = require('express').Router();
const generateId = require('../src/generateId.js');
const User = require('../models/User.js');
const Chat = require('../models/Chat.js');
const Conversation = require('../models/Conversation.js')

router.get('/', (req, res) => {
    res.status(200).json({message: 'Conversation router'});
});

//Create convesation
router.post('/create', async(req, res) => {
    const { members, creator } = req.body;

    for(let pos in members){
        const findUser = await User.findOne({userId: members[pos]}, '-password -chats -_id -__v');
        if(!findUser){
            return res.status(404).json({
                error: true,
                message: `The user ${members[pos]} doesn't exist`,
            });
        }else {
            let { contactList } = findUser;
        }
    }

    const conversationId = generateId();

    const conversation = {
        conversationId,
        members,
        creator,
        messages: [],
    }

    try {
        
        await Conversation.create(conversation);
        res.status(201).json(conversation);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
});

router.get('/find/:conversationId', async(req, res) => {
    const id = req.params.conversationId;

    const findConvesation = await Conversation.findOne({conversationId: id}, '-_id -__v');
    if(!findConvesation) return res.status(404).json({
        error: true,
        message: 'Conversation not found',
    });

    res.status(200).json(findConvesation);
});

router.patch('/update/:conversationId', async(req, res) => {
    const id = req.params.conversationId;

    const { members:newMembers, newMessage } = req.body;
    /* message = {
        sendBy: 'Uy68yrEE', (userId),
        hour: '14:34',
        text: 'this message is a text',
    } */

    const findConvesation = await Conversation.findOne({conversationId: id});
    if(!findConvesation) return res.status(404).json({
        error: true,
        message: 'Conversation not found',
    });

    let { members, messages } = findConvesation;

    if(newMessage){
        messages.push(newMessage);
    }

    const conversation = {
        members,
        messages
    };

    try {

        await Conversation.updateOne({conversationId: id}, conversation);
        return res.status(200).json({
            error: false,
            message: 'The conversation data has been updated',
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
});

router.delete('/delete/:conversationId', async(req, res) => {
    const id = req.params.conversationId;

    const find = await Conversation.findOne({conversationId: id});
    if(!find) return res.status(404).json({
        error: true,
        message: 'Conversation not found',
    });

    console.log(find)
    const { members } = find;
    for(let pos in members){
        const user = await User.findOne({userId: members[pos]}, '-email -password -chats -_id -__v');
        if(!user) continue;

        const { contactList } = user;
        const newContactList = contactList.filter(conversationObj => conversationObj.conversationId != id);
        console.log(newContactList)
        try {

            await User.updateOne({userId: members[pos]}, { contactList: newContactList });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: error,
            });
        }
    }

    try {

        await Conversation.deleteOne({conversationId: id});
        res.status(200).json({
            error: false,
            message: 'The conversation was deleted',
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: error,
        });
    }
});

module.exports = router;