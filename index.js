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
const multer = require('multer');

// Storage for uploaded files.
const storage = multer.diskStorage( {
    destination: function(req, file, cb) {
    cb(null, path.join(__dirname, 'images')); // Destination folder.
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname +'-' + Date.now() + path.extname(file.originalname)); // File name.
    }
});

// Initialize multer upload middleware.
const upload = multer({ storage: storage });

// Route to handle file upload.
app.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send('No file uploaded');
            return;
        }

        // File uploaded successfully, get the filename
        const filename = req.file.filename;

        // Update the user document in the database with the filename of the profile picture
        const userId = req.session.userId; // Assuming you have a user ID stored in the session
        await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { profilePicture: filename } });

        // Log to console
        console.log(`Profile picture filename "${filename}" saved to MongoDB for user ID "${userId}"`);

        res.send('File uploaded successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



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

// Contains GPT code to help with the password reset with crypto tokens
app.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    const user = await userCollection.findOne({ email });
    if (!user) {
        req.session.errorMessage = 'User with this email does not exist';
        res.redirect('/login');
        return;
    }

    // ChatGPT provided the following code to generate a unique token (hexa) for password reset
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    await userCollection.updateOne({ email }, { $set: { resetPasswordToken: token, resetPasswordExpires: user.resetPasswordExpires } });


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
// Generated by chatGPT: chat.openai.com 5/17/2024
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
// Generated by chatGPT: chat.openai.com 5/17/2024
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
app.post('/userInformation', upload.single('profilePicture'), async (req, res) => {
    try {
        const { firstName, lastName, email, address, city, province, postalCode, phone, DOB, age, gender, careCard, doctor, medHistory, medication, allergies } = req.body;

        // Get the user ID from the session
        const userId = req.session.userId;

        // Create an object with the user information to update
        const userInfoToUpdate = {
            firstName,
            lastName,
            email,
            address,
            city,
            province,
            postalCode,
            phone,
            DOB,
            age,
            gender,
            careCard,
            doctor,
            medHistory,
            medication,
            allergies
        };

        // Check if a profile picture was uploaded
        if (req.file) {
            // Read the file data
            const profilePictureData = fs.readFileSync(req.file.path);

            // Add the profile picture data to the user information object
            userInfoToUpdate.profilePictureData = profilePictureData;

            // Delete the temporary file uploaded by multer
            fs.unlinkSync(req.file.path);
        }

        // Update the user document in the database with the user information
        await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: userInfoToUpdate }
        );

        // Redirect the user to the profile page
        res.redirect('/userProfileInfo');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


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


app.get('/orgDashboard', (req, res) => {
    res.render('orgDashboard');
});

app.get('/userProfilePicture/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        // Check if the user exists and has a profile picture
        if (user && user.profilePictureData) {
            // Set the appropriate content type for the image
            res.contentType('image/jpeg'); // Adjust the content type based on the image format

            // Send the profile picture data as the response
            res.send(user.profilePictureData.buffer); // Assuming profilePictureData is a Binary object
        } else {
            // If the user or profile picture data doesn't exist, send a default image or error message
            res.sendFile(path.join(__dirname, 'images', 'default-profile-picture.png')); // Send default image
            // Alternatively, you can send an error message
            // res.status(404).send('Profile picture not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


