require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const port = process.env.PORT || 3000;
const app = express();
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const path = require('path');
const Joi = require("joi");

const expireTime =  1 * 60 * 60 * 1000; 


const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;


var {database} = require('./databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
})

app.use(session({ 
    secret: node_session_secret,
	store: mongoStore, 
	saveUninitialized: false, 
	resave: true
}
));

app.get('/login', (req,res) => {
    var errorMessage = req.session.errorMessage || '';
    req.session.errorMessage = '';
    res.render("login", {errorMessage: errorMessage});
});

app.get('/createUser', (req,res) => {
	res.render("createUser");
   });


app.post('/submitUser', async (req,res) => {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

	const schema = Joi.object(
		{
            email: Joi.string().email().required(),
			username: Joi.string().alphanum().max(20).required(),
			password: Joi.string().max(20).required()
		});
	
	const validationResult = schema.validate({email, username, password});
	if (validationResult.error != null) {
	   console.log(validationResult.error);
	   res.redirect("/createUser");
	   return;
   }

    var hashedPassword = await bcrypt.hash(password, saltRounds);
	
	await userCollection.insertOne({email: email, username: username, password: hashedPassword, user_type: "user"});
	console.log("Inserted user");

    req.session.authenticated = true;
    req.session.username = username;
    req.session.cookiemaxAge = expireTime;

    res.render("submitUser");

});

app.post('/loggingin', async (req, res) => {
    var email = req.body.email; 
    var password = req.body.password;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate({ email, password });

    if (error) {
        console.log(error);
        req.session.errorMessage = 'Invalid email or password';
        res.redirect("/login");
        return;
    }
    const result = await userCollection.find({email: email}).project({username: 1, password: 1, user_type: 1, _id: 1}).toArray();

    // const result = await userCollection.findOne({ email });

    console.log(result);

    if (result.length != 1) {
		console.log("user not found");
		res.redirect("/login");
		return;
	}

    if (!result) {
        req.session.errorMessage = 'Invalid email or password';
        res.redirect("/");
        return;
    }

    if (await bcrypt.compare(password, result[0].password)) {
        console.log("correct password");
        req.session.authenticated = true;
        req.session.user_type = result[0].user_type;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/home');
    } else {
        req.session.errorMessage = 'Invalid email or password';
        res.redirect("/login");
    }
});

// Could be useful in the future
// require('dotenv').config();
// const session = require('express-session');
// const Joi = require("joi");
// const path = require('path');
// ));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


