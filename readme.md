## About Us
Team Name: BBY-18
Team Members:
- Tanner Parkes
- Mitchell MacDonald
- Hugo Amuan
- Gurshaan Daula
- Aathavan Sriharan

## 1. Project Title
Our project title is "Asclepius".
## 2. Project Description (One Sentence Pitch)
Our team, BBY18, is developing a web application, Asclepius, to help patients and emergency responders increase survival rates in emergency situations and improve the efficiency of emergency response with the management of medical drones that will assist patients prior to the paramedics arrival.
## 3. Technologies used 
Frontend:
- Bootstrap
- Font Awesome
- Ejs
Backend:
- Javascript
- Nodemailer
- Render
- Node.js
- Express.js
Database: 
- Mongodb


    - other tech tools

## 4. Listing of File Contents of folder:

Animations folder
    animation.json

Css folder
    droneList.css
    index.css
    locationList.css
    style.css

images folder
│   bcf3a371b9303c27752e1109e96a2fe6.gif
│   download (1).jpg
│   download.jpg
│   gojo.png
│   logo.png
│   placeholder_pp.jpg
│   transparent-drone-uav-in-flight-png.webp
│
├───landing
│       landing-alex-profile.jpg
│       landing-assistance-icon.png
│       landing-profile-icon.png
│       landing-security-icon.png
│       landing-tracking-icon.png
│       landing_feature_image.jpg
│
└───navIcons
        orgDashboard.svg
        orgDrones.svg
        orgProfile.svg
        userDrones.svg
        userHome.svg
        userProfile.svg

js folder
    databaseConnection.js
    form.js
    index.js
    maps.js

models folder
    empty

views folder
│   404.ejs
│   aboutUs.ejs
│   addDrone.ejs
│   addingDrone.ejs
│   addLocation.ejs
│   contact.ejs
│   createOrganization.ejs
│   createUser.ejs
│   droneList.ejs
│   errorMessage.ejs
│   forgotPassword.ejs
│   landing.ejs
│   locationList.ejs
│   login.ejs
│   orgDashboard.ejs
│   orgProfile.ejs
│   reset.ejs
│   success.ejs
│   userDash.ejs
│   userDroneTracking.ejs
│   userProfileInformation.ejs
│   userType.ejs
│
└───templates
        footerAuthenticatedOrg.ejs
        footerAuthenticatedUser.ejs
        footerUnauthenticated.ejs
        headerAuthenticated.ejs
        headerUnauthenticated.ejs

.env
/gitignore
about.html
index.html
package-lock.json
package.json
readme.md
Readme.txt

## 5. How to install or run the project
    
The developer would need to install the following:
- Node.js 
- Express.js
- MongoDB
- express
- express-session
- dotenv
- fs
- mongoose
- connect-mongo
- bcrypt
- path
- joi
- crypto
- nodemailer
- multer

There is an API key and details regarding our mongoDB

installation does not have an order or location, it all must be downloaded prior to coding however.

go into a terminal and type npm i, also ensure all details in .env file are eligible, and all images are downloaded

Link to testing plan:
https://docs.google.com/spreadsheets/d/19mL9ubcbjFqc0b8EkNRcmtMcfc2bQ_4I-9c6LWYKXMg/edit#gid=0

## 6. How to use the product (Features):

Users:
- As a new user, I want to specify all current health risks in my medical user profile.
- As a frequent user, I want to be able to view the location of the nearest drone station to my current location 
- As an existing user, I want to login and see that my user and medical information has been saved.
- As an existing user, I want to call for help and see that a drone is coming to assist me.
- As an existing user, I want to view the list of locations with drones available to help me.
- As an existing user, I want to logout.

Organizations:
- As a paramedic, I want to describe all current supply and availability of drones at the drone location I am located at. 
- As an organization, I want to keep track of which drones are in use.
- As an organization, I want to sign up on behalf of my organization.
- As an organizaiton, I want to have a profile for our organization to contain information regarding our headquarters.
- As an organization, I want to add a drone and be able to view it on the drone list page.
- As an organization, I want to add a location and be able to view it on the location list page.
- As an organization, I want to logout.
## 7. Include Credits, References, and Licenses:
This project was developed by team BBY-18 of BCIT's 2800 course. The developers who created this are Gurshaan Daula, Tanner Parkes, Aathavan Sriharan, Mitchell MacDonald, Hugo Amuan. We used the Google Maps API from https://developers.google.com/maps. 
## 8. How did you use AI? Tell us exactly what AI services and products you used and how you used them. Be very specific:

We used ChatGPT for debugging and some code assistance, but decided against implementing AI in our app, preferring to leave drone deployment to trained professionals. 

Below you will find each members use of AI in this app along with a reference to what AI they used.


Tanner Parkes:

1. File: index.js, (/userProfileInfo, /userInformation)
Used chatgpt: chat.openai.com
- Generated code to retrieve user information from the database and populate the user profile with previously entered information.
- Generated code to submit any of the fields in the form filled out for the specific user.

2. File: index.js, (req.session.userId = result.insertedId;)
Used chatgpt: chat.openai.com
- Generated code to retrieve the _id value created by mongodb.

3. File: userProfileInformation,
Used chatgpt: chat.openai.com
- Generated the conditional statements in the value for each field to populate with previously entered information.
- Generated the enable form function to control the profile form with the edit button. 

4. File: orgProfile.ejs
Used chatgpt: chat.openai.com
- Created the orgProfile using the userProfileInformation.ejs as a template. Everything generated for userProfileInfo was
used in the orgProfile and altered to fit for organizations.

5. File: userDash.ejs
Used chatgpt: chat.openai.com
- Used chatgpt to generate a confirmation that the call for help was sent.
- Also used the script for the eventlisteners generated by chatgpt.

6. File: 404.ejs
Used chatgpt: chat.openai.com
- Used chatgpt to help generate the conditionals and buttons for which button to display.

7. File: orgProfile.ejs
Used chatgpt: chat.openai.com
- Reused what was generated for userProfileInformation.ejs
- Generated the conditional statements in the value for each field to populate with previously entered information.
- Generated the enable form function to control the profile form with the edit button. 

Hugo Amuan:

1. File: index.js
Used ChatGPT: chat.openai.com
- npm multer used to handle file uploads for profile picture. 
- npm bcrypt to generate tokens for email password reset
- Retrieval of images after decrypting to hex format in mongoDB

2. File: orgDashboard.ejs
Used ChatGPT: chat.openai.com
- Syntax issues such as missing , {} ; () => . 
- Logic errors
- Bootstrap simplification/fixing

3. userProfileInformation.ejs
Used ChatGPT: chat.openai.com
- Helped with retrieval of images for profile picture from mongoDB.

4. orgProfile.ejs
Used ChatGPT: chat.openai.com
- Helped with retrieval of images for profile picture from mongoDB.

Mitchell MacDonald:
1. File: userType.ejs
Used ChatGPT: chat.openai.com
- Used to help in creating the hover feature on the buttons
- Used for some help on authorization

2. File: Login and Sign-up pages
Used ChatGPT: chat.openai.com
- Used for show password function

3. File: All
Used ChatGPT: chat.openai.com
- Used for most small bug fixes

Gurshaan Daula: 
1. File: index.js
Used ChatGPT: chat.openai.com
- Used to help with retrieving data from mongoDB

2. File: droneList.ejs
Used ChatGPT: chat.openai.com  
- Used to help with displaying data from mongoDB in a table format
- Used to make back button

3. Header and footer
Used ChatGPT: chat.openai.com
- Used to help with creating a responsive header and footer using bootstrap

4. userDash.ejs
Used ChatGPT: chat.openai.com
- Used to display animations

Aathavan Sriharan

1. File: UserDroneTracking
Used ChatGPT: chat.openai.com
- Used to help connect the google maps api and display the current location



## 9. Contact Information:

Gurshaan Daula:
gdaula@my.bcit.ca
gurshaandaula@gmail.com

Hugo Amuan:
hamuan@my.bcit.ca
hugo.amuan@gmail.com

Mitchell MacDonald:
mmacdonald157@my.bcit.ca
mitchell.macdonald10@gmail.com

Tanner Parkes:
Tanner.lp9@gmail.com
tparkes5@my.bcit.ca

Aathavan Sriharan:
asriharan@my.bcit.ca
