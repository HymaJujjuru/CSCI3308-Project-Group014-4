// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

//TODO

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

//TODO

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

//Copied from Lab 8
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

// Register
app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    // To-DO: Insert username and hashed password into the 'users' table
    try {
        const insertResult = await db.any('INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *;', [req.body.username, hash]);

        if (insertResult) {
            res.redirect('/login');
        }
        else {
            res.render('pages/register', { message: 'Username already in use.', error: true });
        }
    }
    catch (err) {
        console.error();
        res.redirect('/register');
    }
});

app.post('/login', async (req, res) => {


    try {
        const user = await db.one(`SELECT * FROM users WHERE username = $1`, [req.body.username]);

        if (!user) {
            res.render('pages/register', { message: 'Incorrect username. Please register to login!' });
        }
        // check if password from request matches with password in DB
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            //save user details in session like in lab 7
            req.session.user = user;
            req.session.save();
            res.redirect('/home');
        }
        else {
            res.render('pages/login', { message: 'Incorrect password', error: true });
        }
    }
    catch (err) {
        console.error(err);
        res.render('pages/register', { message: "Invalid username, please register to log in.", error: true });
    }

});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to login page.
        return res.redirect('/login');
    }
    next();
};

app.post('/create_session', async (req, res) => {
    //Need databases before this action can be completed, however code should work once uncommented
    //Using pages/home as a temporary render

/*
    try{
        const insertResult = 
        await db.any('INSERT INTO sessions(class, day, start_time, end_time, location) VALUES ($1, $2, $3, $4, $5) RETURNING *;', 
        [req.body.study_class, req.body.study_day, req.body.study_time1, req.body.study_time2, req.body.study_location]);

        if (insertResult) {
            res.render('pages/home', { message: 'Study session successfully created.', error: false });
        }
        else {
            res.render('pages/home', { message: 'Study session could not be created, please try again.', error: true });
    }
    catch(err){
        console.error(err);
        res.render('pages/home', { message: "Study session could not be created, please try again.", error: true }); 
    }
*/
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('pages/logout');
  });