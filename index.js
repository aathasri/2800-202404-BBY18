const express = require('express');
const fs = require('fs');
const port = process.env.PORT || 3000;
const app = express();

// Could be useful in the future
// require('dotenv').config();
// const session = require('express-session');
// const Joi = require("joi");
// const path = require('path');
// app.use(session({ 
//     secret: node_session_secret,
// 	store: mongoStore, //default is memory store 
// 	saveUninitialized: false, 
// 	resave: true
// }
// ));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


