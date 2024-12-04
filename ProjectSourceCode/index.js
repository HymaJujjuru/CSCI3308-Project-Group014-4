// *****************************************************
// <!-- Importing Dependencies -->
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

Handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

// *****************************************************
// <!-- Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/src/views/layouts',
    partialsDir: __dirname + '/src/views/partials',
});

// database configuration
const dbConfig = {
    host: process.env.host, // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const proddbConfig = {
    host: process.env.host, // the database server
    port: 5432, // the database port
    database: process.env.database, // the database name
    user: process.env.user, // the user account to connect with
    password: process.env.password, // the password of the user account
};

const db = pgp(proddbConfig);

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
// <!-- App Settings -->
// *****************************************************

app.use(express.static(path.join(__dirname, 'public')));


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

// const username = session.user.username;
// const first_name = session.user.first_name;
// const last_name = session.user.last_name;
// const email = session.user.email;


// *****************************************************
// <!-- API Routes -->
// *****************************************************

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

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

//Checks for authentication
app.use(auth);

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    maxAge: 20000
}));

//Home
app.get('/home', (req, res) => {
    res.render('pages/home');
});

//Events
app.get('/events', async(req, res) => {
    try{
        const response = `SELECT * FROM EventInfo;`;
        const courses = `SELECT * FROM Course;`;

        db.task('get-everything', task => {
            return task.batch([task.any(response), task.any(courses)]);
        })
            .then(events => {
                console.log(events);
                res.render('pages/events', {events: events[0], Course: events[1]});
            })
            .catch(err => {
                res.render('pages/events', {
                    events: [],
                    error: true,
                    message: err.message,
                });
            });
        
    }catch(err){
        console.log(err);
        res.render('pages/events', {message: "No Events Upcoming!!"});
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('pages/login', { message: 'Logged Out Successfully!' });
});



// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
