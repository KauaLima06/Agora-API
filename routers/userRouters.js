const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const generateId = require('../src/generateId.js');
const User = require('../models/User.js');
const Chat = require('../models/Chat.js');

//Register users
router.post('/register', async(req, res) => {

    const { userName, email, password } = req.body;

    const fields = [userName, email, password];
    const fieldsName = ['userName', 'email', 'password'];

    //checking all fields
    for(let pos in fields){
        if(!fields[pos]){
            return res.status(400).json({error: `The field ${fieldsName[pos]} is required.`});
        }
    }

    //Create a hash password
    let salt = await bcrypt.genSalt(12);
    let passHash = await bcrypt.hash(password, salt);

    //checking if user already exist
    let findUser = await User.findOne({email: email}, '-password');
    if(findUser){
        return res.status(500).json({error: 'A user with this email already exist'});
    }

    const userId = generateId();
    let findUserId = await User.findOne({userId: userId}, '-password');
    if(findUserId){
        do {
            userId = generateId();
            findUserId = await User.findOne({userId: userId}, '-password');
        }while(findUserId)
    }
    
    const contactList = [];
    const chats = [];

    //Creating user object
    let user = {
        userName,
        userId,
        email,
        password: passHash,
        contactList,
        chats,
    }

    try {
        //Save user in database
        await User.create(user);

        res.status(201).json(
            user = {
                userName,
                userId: userId,
                email,
                contactList,
                chats
            }
        );
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: error});
    }
});

//Auth
router.post('/auth', async(req, res) => {

    const { email , password } = req.body;

    //checking if user exist
    const findUser = await User.findOne({email: email});
    if(!findUser){
        return res.status(404).json({error: 'User not found'});
    }

    //checking if password match
    const checkPass = await bcrypt.compare(password, findUser.password);
    if(!checkPass){
        return res.status(500).json({error: 'Passwords dont match'}); 
    }

    const { userName , userId , contactList , chats} = findUser;
    
    //generate token
    try {
        
        const secret = process.env.SECRET;
        
        const token = jwt.sign({id: findUser._id}, secret);

        //create user object
        const user = {
            userName,
            userId,
            email,
            contactList,
            chats,
            token
            /*the token will be stored in local storage 
            or in session storage to be used on the front end.*/
        };

        res.status(200).json(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error});
    }

});

//Get user list
router.get('/list', async(req, res) => {

    //returning a list with all users
    // const userList = await User.find({}, '-password -_id -contactList -chats');
    const userList = await User.find({}, '-password -_id');
    res.status(200).json(userList);

});

//Get user
router.get('/findById/:userId', async(req, res) => {

    const userId = req.params.userId;

    //Checking if user exist
    const user = await User.findOne({userId: userId}, '-password -__v');
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    res.status(200).json(user);

});
router.get('/getUser/:userId', async(req, res) => {

    const userId = req.params.userId;

    //Checking if user exist
    const user = await User.findOne({userId: userId}, '-_id -email -password -contactList -chats -isConfirmed -__v');
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    res.status(200).json(user);

});

router.get('/findByDbId/:userDBId', async(req, res) => {

    const userDbId = req.params.userDbId;

    //Checking if user exist
    const user = await User.findOne({_id: userDbId});
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    res.status(200).json(user);

});
router.get('/findByEmail/:email', async(req, res) => {

    const email = req.params.email;

    //Checking if user exist
    const user = await User.findOne({email: email});
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    res.status(200).json(user);

});

//Update user
router.patch('/update/:userId', async(req, res) => {
    const id = req.params.userId;

    const { newUserName, newEmail, password: newPass, newContact, newchat, contactList: cttList , chats: chatList } = req.body;

    // const fields = [userName, email, password, contactList, chats, isConfirmed];
    // const fieldsName = ['userName', 'email', 'password', 'contactList', 'chats', 'isConfirmed'];

    // //checking all fields
    // for(let pos in fields){
    //     if(!fields[pos]){
    //         return res.status(400).json({error: `The field ${fieldsName[pos]} is required.`});
    //     }
    // }
    
    //Checking user exist
    const findUser = await User.findOne({userId: id});
    if(!findUser){
        return res.status(422).json({error: 'User not found'});
    }

    const { userName, email, password, contactList, chats } = findUser;
    //Generating a new password
    const salt = await bcrypt.genSalt(12);
    let passHash;
    if(!newPass) {
        const { password } = findUser;
        passHash = password;
    }else {
        passHash = await bcrypt.hash(newPass, salt);
    }

    if(newContact){
        const { userId, conversationId } = newContact;
        const findContact = await User.findOne({userId: userId}, '-password -chats -_id -__v -email -isConfirmed');

        let { contactList } = findContact;

        const contactToSave = {
            name: userName,
            userId: id,
            conversationId
        }

        contactList.push(contactToSave);

        try {

            await User.updateOne({userId: userId}, { contactList });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: error,
            });
        }
    }
    let newCttList;
    if(!cttList && newContact){
        newCttList = contactList;
        newCttList.push(newContact);
    }else if(cttList){
        newCttList = cttList;
    }else {
        newCttList = contactList;
    }
    //Creating a user object with new data
    const chatsArray = chatList ? chatList : chats;
    const user = {
        userName,
        email,
        password: passHash,
        contactList: newCttList,
        chats: chatsArray,
    }

    try {

        //Updating user data
        await User.updateOne({userId: id}, user);

        return res.status(200).json({message: 'User data has been updated'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error});
    }
});

router.patch('/confirmEmail/:userId', async(req, res) => {
    
    const id = req.params.userId;
    const { isConfirmed } = req.body;

    const user = await User.findOne({userId: id}, '-password');
    if(!user || user == null || user == undefined) return res.status(404).json({
        error: true,
        message: 'User not found',
    });
    
    let { isConfirmed: confirmed } = user;
    confirmed = isConfirmed;
    try {
        
        await User.updateOne({userId: id}, {isConfirmed: confirmed});
        return res.status(200).json({
            error: false,
            message: 'User was confirmed',
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error,
        });
    }

});

//Delete user
router.delete('/delete/:userId', async(req, res) => {
    const id = req.params.userId;

    //Checking isf user exist
    const findUser = await User.findOne({userId: id}, '-password');
    if(!findUser){
        return res.status(422).json({error: 'User not found'});
    }else {
        //list of chats
        const { chats } = findUser;
        for(let pos in chats){

            try {
                //find chat
                const findChat = await Chat.findOne({chatId: chats[pos]});
                const { name, members, chatId, messages } = findChat;

                //removing user of chat
                const removeUser = members.filter(member => member != id);

                //create a new chat object
                const chat = {
                    name,
                    members: removeUser,
                    chatId, 
                    messages,
                };

                //doing update without the member deleted
                await Chat.updateOne({chatId: chats[pos]}, chat);
                
            } catch (error) {
                console.log(error);
                return res.status(500).json({error: error});
            }
        }
    }

    try {
        //Deleting user
        await User.deleteOne({userId: id});
        res.status(200).json({message: 'User removed'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error});
    }
});

module.exports = router;