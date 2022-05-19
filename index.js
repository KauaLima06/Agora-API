// Imports 
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const userRouters = require('./routers/userRouters.js');
const admimRouters = require('./routers/admimRouters.js');
const chatRouters = require('./routers/chatRouters.js');
const conversationRouters = require('./routers/conversationRouters.js');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/user', userRouters);
app.use('/admim', admimRouters);
app.use('/chat', chatRouters);
app.use('/conversation', conversationRouters);

app.get('/', (req, res) => {
    res.status(200).json({message: 'Agora API'});
});


const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const port = process.env.PORT || 2929;
//Connecting data base
mongoose.connect(`mongodb+srv://${db_user}:${db_pass}
@api-db.0xuhv.mongodb.net/agora-api?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Mongo was connected');
        app.listen(port, () => {
            console.log(`API is running on port ${port}`);
        })
    })
    .catch(err => console.log(`Error: ${err}`));