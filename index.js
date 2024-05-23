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
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb'); // Added by Tanner from Chatgpt: chat.openai.com to save user information from form and repopulate the form with previously entered values.

const expireTime =  1 * 60 * 60 * 1000; 


const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;


var {database} = require('./databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');



app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + "/images"));
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/js"));

app.set('view engine', 'ejs');


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
	resave: true,
    cookie: {maxAge: expireTime }
}
));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.get('/login', (req,res) => {
    var errorMessage = req.session.errorMessage || '';
    req.session.errorMessage = '';
    res.render("login", {errorMessage: errorMessage});
});

app.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    const user = await userCollection.findOne({ email });
    if (!user) {
        req.session.errorMessage = 'User with this email does not exist';
        res.redirect('/login');
        return;
    }

    // Generate a unique token for password reset
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    await userCollection.updateOne({ email }, { $set: { resetPasswordToken: token, resetPasswordExpires: user.resetPasswordExpires } });

    // Send the reset link to user's email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n`
            + `Please click on the following link, or paste this into your browser to complete the process:\n\n`
            + `http://${req.headers.host}/reset/${token}\n\n`
            + `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    req.session.successMessage = 'Password reset link has been sent to your email';
    res.redirect('/login');
});

// Route for rendering password reset form
app.get('/reset/:token', async (req, res) => {
    const user = await userCollection.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.session.errorMessage = 'Password reset token is invalid or has expired';
        res.redirect('/login');
        return;
    }
    res.render('reset', { token: req.params.token });
});

// Route for processing password reset
app.post('/reset/:token', async (req, res) => {
    const user = await userCollection.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.session.errorMessage = 'Password reset token is invalid or has expired';
        res.redirect('/login');
        return;
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.updateOne({ email: user.email }, { $set: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null } });

    req.session.successMessage = 'Password has been reset successfully';
    res.redirect('/login');
});

app.get('/forgotPassword', (req,res) => {
    res.render("forgotPassword");
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
	
	var result = await userCollection.insertOne({email: email, username: username, password: hashedPassword, user_type: "user"});
	console.log("Inserted user");

    req.session.authenticated = true;
    req.session.username = result.username;
    //Tanner created req.session.userId = result.insertedId; with chatgpt: chat.openai.com
    req.session.userId = result.insertedId;
    req.session.cookiemaxAge = expireTime;

    res.redirect("/userProfileInfo");

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
        res.redirect("/login");
        return;
    }

    if (await bcrypt.compare(password, result[0].password)) {
        console.log("correct password");
        req.session.authenticated = true;
        req.session.username = result[0].username;
        req.session.userId = result[0]._id;
        req.session.user_type = result[0].user_type;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/userProfileInfo');
    } else {
        req.session.errorMessage = 'Invalid email or password';
        res.redirect("/login");
    }
});
app.get('/loggedin', (req,res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }
    res.render('test');
});
// Could be useful in the future
// require('dotenv').config();
// const session = require('express-session');
// const Joi = require("joi");
// const path = require('path');
// ));

app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/map', (req, res) => {
    res.render('map');
});

// Tanner Added userProfileInfo and userInformation
// Used chatgpt to help include any previously user submited data. Chatgpt: chat.openai.com
app.get('/userProfileInfo', async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await userCollection.findOne({ _id: new ObjectId(userId)});
        res.render('userProfileInformation', { user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Used ChatGpt to help accept form submission and editing. Chatgpt: chat.openai.com
app.post('/userInformation', async (req, res) => {
    try {
        const { firstName, lastName, email, address, city, province, postalCode, phone, DOB, age, gender, careCard, doctor, medHistory, medication, allergies } = req.body;

        const userId = req.session.userId;
        await userCollection.updateOne(
            { _id:  new ObjectId(userId) },
            { $set: { firstName, lastName, email, address, city, province, postalCode, phone, DOB, age, gender, careCard, doctor, medHistory, medication, allergies }
        });

        // Redirect the user to a success page or back to the profile page
        res.redirect('/userProfileInfo');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/login');
    });
});


// Added by Aathavan
app.get('/drones', (req, res) => {
    res.render('userDroneTracking'); 
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


