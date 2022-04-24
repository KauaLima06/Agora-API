const router = require('express').Router();
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const generateId = require('../src/generateId.js');

router.get('/', (req, res) => {
    res.status(200).json({message: 'Agora API'});
});

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

    const contactList = [];

    let userId = generateId();
    let findUserId = await User.findOne({userId: userId}, '-password');
    if(findUserId){
        do {
            userId = generateId();
            findUserId = await User.findOne({userId: userId}, '-password');
        }while(findUserId)
    }

    //Creating user object
    let user = {
        userName,
        userId,
        email,
        password: passHash,
        contactList,
    }

    try {
        //Save user in database
        await User.create(user);

        res.status(201).json(
            user = {
                userName,
                userId: generateId,
                email,
                contactList
            }
        );
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: error});
    }
});

//Get user list
router.get('/list', async(req, res) => {

    //returning a list with all users
    const userList = await User.find({}, '-password -email -_id -contactList');
    res.status(200).json(userList);

});

//Get user
router.get('/find/:userId', async(req, res) => {

    const userId = req.params.userId;

    //Checking if user exist
    const user = await User.findOne({userId: userId}, '-password');
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    console.log(user)
    res.status(200).json(user);

});

//Update user
router.patch('/update/:userId', async(req, res) => {
    const id = req.params.userId;

    let { userName, userId, email, password, contactList } = req.body;

    const fields = [userName, userId, email, password, contactList];
    const fieldsName = ['userName', 'userId', 'email', 'password', 'contactList'];

    //checking all fields
    for(let pos in fields){
        if(!fields[pos]){
            return res.status(400).json({error: `The field ${fieldsName[pos]} is required.`});
        }
    }
    
    //Checking user exist
    const findUser = await User.findOne({userId: id}, '-password');
    if(!findUser){
        return res.status(422).json({error: 'User not found'});
    }

    //Generating a new password
    const salt = await bcrypt.genSalt(12);
    const passHash = await bcrypt.hash(password, salt);

    //Creating a user object with new data
    const user = {
        userName,
        userId,
        email,
        password: passHash,
        contactList
    }

    try {

        //Updating user data
        const updateUser = await User.updateOne({userId: id}, user);

        return res.status(200).json({message: 'User data has been updated'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error});
    }
});

//Delete user
router.delete('/delete/:userId', async(req, res) => {
    const id = req.params.userId;

    //Checking isf user exist
    const findUser = await User.find({userId: id}, '-password');
    if(!findUser){
        return res.status(422).json({error: 'User not found'});
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