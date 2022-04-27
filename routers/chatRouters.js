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
    const findChat = await Chat.findOne({chatId: chatId});
    if(findChat){
        do{
            chatId = generateId();
            findChat = await Chat.findOne({chatId: chatId});
        }while(findChat)
    }

    const chatMembers = members;

    for(let pos in chatMembers){

        const findUser = await User.findOne({userId: chatMembers[pos]});
        if(!findUser){
            continue;
        }else{

            let { userName, userId, email, password, contactList , chats } = findUser;

            chats.push(chatId);

            const user = {
                userName,
                userId,
                email,
                password,
                contactList,
                chats,
            };

            try {

                await User.updateOne({userId: userId}, user);
                
            } catch (error) {
                return res.status(500).json({error: error});
            }
        }

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
        return res.status(404).json({error: 'Chat not found'})
    }

    res.status(200).json(chatList);
});

//Get groups
router.get('/find/:chatId', async(req, res)=> {

    const chatId = req.params.chatId;

    const findChat = await Chat.findOne({chatId: chatId});
    if(!findChat){
        return res.status(404).json({error: 'Chat not found'});
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
    //checking if chat exist
    const findChat = await Chat.findOne({chatId: chatId});
    if(!findChat){
        return res.status(404).json({error: 'Chat not found'});
    }else{
        //list of chat members
        const chatMembers = findChat.members;
        for(let pos in chatMembers){

            try {
                
                const findUser = await User.findOne({userId: chatMembers[pos]});
                const { userName, userId, email, password, contactList, chats: userChats } = findUser;

                // picking up the user's chat list and removing the chat that will be deleted
                const removedChat = userChats.filter(chat => chat != chatId);

                // creeating a new user object to do the update in bd 
                const user = {
                    userName,
                    userId,
                    email,
                    password,
                    contactList,
                    chats: removedChat,
                };

                //updating the user without the deleted chat
                await User.updateOne({userId: chatMembers[pos]}, user);

            } catch (error) {
                return res.status(500).json({error: error});
            }

        }
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