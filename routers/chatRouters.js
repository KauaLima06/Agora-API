const router = require('express').Router();
const Chat = require('../models/Chat.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const generateId = require('../src/generateId.js');
const User = require('../models/User.js');

//teste router
router.get('/', (req, res) => {
    res.status(200).json({message: 'Chat routers'});
});

//Create chat
router.post('/create', async(req, res) => {

    const { name, members } = req.body;
    //members = [members id, id, id, id]

    const fields = [name, members];
    const nameFields = ['name', 'members'];

    for(let pos in fields){
        if(!fields[pos]){
            return res.status(400).json({error: `The field ${nameFields} is required`})
        }
    }

    let chatId = generateId();
    let findChat = await Chat.findOne({chatId: chatId});
    if(findChat){
        do{
            chatId = generateId();
            findChat = await Chat.findOne({chatId: chatId});
        }while(findChat)
    }

    let chat = {
        name,
        members,
        chatId,
    };

    try {

      //Save chat in data base
      await Chat.create(chat);  

      res.status(201).json(
          chat = {
              name,
              members,
              chatId,
          }
      );
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error});
    }
});

//Group List
router.get('/list', async(req, res) => {
    
    //get all groups
    const chatList = await Chat.find({});
    if(!chatList){
        return res.status(404).json({error: 'Groups not found'})
    }

    res.status(200).json(chatList);
});

//Get groups
router.get('/find/:chatId', async(req, res)=> {

    const chatId = req.params.chatId;

    const findChat = await Chat.findOne({chatId: chatId});
    if(!findChat){
        return res.status(404).json({error: 'Group not found'});
    }

    res.status(200).json(findChat);

});

//Update chat data
router.patch('/update/:chatId', async(req, res) => {

    const chatId = req.params.chatId;
    const { name, members, messages } = req.body;

    const findChat = await Chat.findOne({chatId: chatId});
    if(!findChat){
        return res.status(404).json({error: 'Chat not found'});
    }

    const chatUpdate = {
        name,
        members,
        chatId,
        messages,
    };

    try {
        
        await Chat.updateOne({chatId: chatId}, chatUpdate);

        return res.status(200).json({message: 'Chat data has been updated'});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: error});
    }

});

//Delete chat
router.delete('/delete/:chatId', async(req, res) => {

    const chatId = req.params.chatId;
    const findChat = await Chat.findOne({chatId: chatId});
    if(!findChat){
        return res.status(404).json({error: 'Chat not found'});
    }

    try {

        await Chat.deleteOne({chatId: chatId});
        res.status(200).json({message: 'Chat removed'});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: error});
    }

});

module.exports = router;