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

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/src/views/layouts',
    partialsDir: __dirname + '/src/views/partials',
});

// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });
// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.use(express.static(__dirname + '/'));

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

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
    //Using pages/home as a temporary render
    /* 
    EventInfo Database:
        event_no SERIAL PRIMARY KEY,        --
        location VARCHAR(120),              --
        date DATE NOT NULL,                 --
        filter_no INT,
        reoccuring_status boolean NOT NULL, --
        start_time TIME NOT NULL,           --
        end_time TIME NOT NULL,             --
        hidden_users VARCHAR(45),
        course_no INT,                      --
        organizer_no VARCHAR(45) NOT NULL
    */
    courseno = db.one('SELECT Course.course_no FROM Course WHERE Course.course_name = req.body.study_class RETURNING *;');

    try{
        const insertResult = 
        await db.any('INSERT INTO EventInfo(course_no, date, start_time, end_time, location, reoccuring_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;', 
        [courseno, req.body.study_day, req.body.study_time1, req.body.study_time2, req.body.study_location, req.body.study_reoccur]);
        if (insertResult) {
            res.render('pages/home', { message: 'Study session successfully created.', error: false });
        }
        else {
            res.render('pages/home', { message: 'Study session could not be created, please try again.', error: true });
        }
    }
    catch(err){
        console.error(err);
        res.render('pages/home', { message: "Study session could not be created, please try again.", error: true }); 
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('pages/logout');
  });

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');