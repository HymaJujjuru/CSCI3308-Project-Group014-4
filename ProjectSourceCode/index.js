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

Handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

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

//Checks for authentication
app.use(auth);

//Home
app.get('/home', (req, res) => {
    res.render('pages/home');
});

//Events
app.get('/events', async(req, res) => {
    try{
        const response = `SELECT * FROM EventInfo;`;

        db.any(response)
            .then(events => {
                console.log(events);
                res.render('pages/events', { events });
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

//Calendar
app.get('/calendar', (req, res) => {
    res.render('pages/calendar');
});

//Profile
app.get('/profile', (req, res) => {
    res.render('pages/profile', {
        username: req.session.user.username,
        first_name: req.session.user.first_name,
        last_name: req.session.user.last_name,
        email: req.session.user.email,
        year: req.session.user.year,
        major: req.session.user.major,
        degree: req.session.user.degree,
    });

});
// Profile forms
// Profile username update 
app.post('/profile_username', async (req, res) => {
        /*
            CREATE TABLE IF NOT EXISTS   users(
                username VARCHAR(50) PRIMARY KEY,
                password CHAR(60) NOT NULL,
                major VARCHAR(50),
                courses VARCHAR(50),
                year VARCHAR(50)
            );
        */

    try{
      
        const updateUsername = await db.any('UPDATE users SET username = $1;', [req.body.event_username]);
        if (updateUsername){
            res.render('pages/profile', { message: 'Profile username successfully updated.', error: false });
        }
    }
    catch(err){
        console.error(err);
        res.render('pages/profile', { message: "Profile username could not be updated, please try again.", error: true }); 
    }
});

// Profile year update
app.post('/profile_year', async (req, res) => {
    /*
        CREATE TABLE IF NOT EXISTS   users(
            username VARCHAR(50) PRIMARY KEY,
            password CHAR(60) NOT NULL,
            major VARCHAR(50),
            year VARCHAR(50)
            degree VARCHAR(50)
        );
    */
    try{   
        const updateYear = await db.any('UPDATE users SET year = $1;', [req.body.event_year]);
        if (updateYear)
        {
            res.render('pages/profile', { message: 'Profile year successfully updated.', error: false });
        }
    }
    catch(err){
        console.error(err);
        res.render('pages/profile', { message: "Profile year could not be updated, please try again.", error: true }); 
    }
});

// Profile major update
app.post('/profile_major', async (req, res) => {
        /*
            CREATE TABLE IF NOT EXISTS   users(
                username VARCHAR(50) PRIMARY KEY,
                password CHAR(60) NOT NULL,
                major VARCHAR(50),
                courses VARCHAR(50),
                year VARCHAR(50)
            );
        */


    try{
        // update major
        const updateMajor = await db.any('UPDATE users SET major = $1;', [req.body.event_major]);
        res.render('pages/profile', { message: 'Profile major successfully updated.', error: false });

    }
    catch(err){
        console.error(err);
        res.render('pages/profile', { message: "Profile major could not be updated, please try again.", error: true }); 
    }


});
// Profile degree update
app.post('/profile_degree', async (req, res) => {
        /*
            CREATE TABLE IF NOT EXISTS   users(
                username VARCHAR(50) PRIMARY KEY,
                password CHAR(60) NOT NULL,
                major VARCHAR(50),
                courses VARCHAR(50),
                year VARCHAR(50),
                degree VARCHAR(50)
            );
        */


    try{
            const updateDegree = await db.any('UPDATE users SET degree = $1;', [req.body.event_degrees]);
            if (updateDegree)
            {
                res.render('pages/profile', { message: 'Profile degree successfully updated.', error: false });
            }
    }
    catch(err){
        console.error(err);
        res.render('pages/profile', { message: "Profile degree could not be updated, please try again.", error: true }); 
    }


});

app.post('/create_session', async (req, res) => {
    /* 
    EventInfo Database:
        event_no SERIAL PRIMARY KEY,        --
        location VARCHAR(120),              --
        date DATE NOT NULL,                 --
        filter_no INT,                      What is this?
        reoccuring_status boolean NOT NULL, --
        start_time TIME NOT NULL,           --
        end_time TIME NOT NULL,             --
        hidden_users VARCHAR(45),           How to insert into db?
        course_no INT,                      --
        organizer_no VARCHAR(45) NOT NULL   How to insert into db?
    */
    if (!req.body.study_reoccur)
    {
        req.body.study_reoccur = false;
    }

    let strArr = req.body.study_class.split(" ");
    courseno = strArr[1];
    var event_no = await db.one("SELECT COUNT(*) as total FROM EventInfo;");

    try{
        const insertResult = 
            await db.any(`INSERT INTO EventInfo(event_no, location, date, reoccuring_status, start_time, end_time, hidden_users, course_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`, 
                [(event_no.total) + 1, req.body.study_location, req.body.study_day, req.body.study_reoccur, req.body.study_time1, req.body.study_time2, null, courseno])
        .then(data =>{
            res.render('pages/events', { message: 'Study session successfully created.', error: false });
        }).catch(err => {
            res.render('pages/events', { message: 'Study session could not be created, please try again.', error: true });
        });
    }
    catch(err){
        console.error(err);
        res.render('pages/events', { message: "Study session could not be created, please try again.", error: true }); 
    }

});


app.get('/filter_events', async(req, res) => {
    try{
        const course_code = req.query.course_code;
        const course_no = req.query.course_no;
        const day_range_start = req.query.day_range_start;
        const day_range_end = req.query.day_range_end;
        const location = req.query.location_filter;
        const reoccuring_status = req.query.reoccuring_status;
        let response;



        
        if (course_code){
            response = `SELECT * FROM Course as C INNER JOIN EventInfo as E ON C.course_no = E.course_no WHERE c.course_code = '${course_code}'`;
            if (course_no){
                response += ` AND course_no = ${course_no}`;
                console.log(response);
            }
            if (day_range_start){
                response += ` AND date > date('${day_range_start}')`;
                console.log(response);
            }
            if (day_range_end){
                response += ` AND date < date('${day_range_end}')`;
                console.log(response);
            }
            if (location){
                response += ` AND location = '${location}'`;
                console.log(response);
            }
            if (reoccuring_status){
                response += ` AND reoccuring_status = True`;
            }
            response += `;`;
            console.log(response);
        }
        if (course_no){
            response = `SELECT * FROM EventInfo WHERE course_no = ${course_no}`;
            if (day_range_start){
                response += ` AND date > date('${day_range_start}')`;
                console.log(response);
            }
            if (day_range_end){
                response += ` AND date < date('${day_range_end}')`;
                console.log(response);
            }
            if (location){
                response += ` AND location = '${location}'`;
                console.log(response);
            }
            if (reoccuring_status){
                response += ` AND reoccuring_status = True`;
            }
            response += `;`;
            console.log(response);
        } else if (day_range_start){
            response = `SELECT * FROM EventInfo WHERE date > date('${day_range_start}')`;
            if (day_range_end){
                response += ` AND date < date('${day_range_end}')`;
                console.log(response);
            }
            if (location){
                response += ` AND location = '${location}'`;
                console.log(response);
            }
            if (reoccuring_status){
                response += ` AND reoccuring_status = True`;
            }
            response += `;`;
            
            console.log(response);
        } else if (day_range_end){
            response = `SELECT * FROM EventInfo WHERE date > date('${day_range_end}')`;
            if (location){
                response += ` AND location = '${location}'`;
                console.log(response);
            }
            if (reoccuring_status){
                response += ` AND reoccuring_status = True`;
            }
            response += `;`;
            console.log(response);
        } else if (location){
            response = `SELECT * FROM EventInfo WHERE location = '${location}'`;
            if (reoccuring_status){
                response += ` AND reoccuring_status = True`;
            }
            response += `;`;
            console.log(response);
        } else if (reoccuring_status){
            response = `SELECT * FROM EventInfo WHERE reoccuring_status = True;`;
            console.log(response);
        }
        
        

        db.any(response, [course_no], [day_range_start], [day_range_end], [location], [reoccuring_status])
            .then(events => {
                console.log( [course_no], [day_range_start], [day_range_end], [location], [reoccuring_status])
                console.log(events);
                res.render('pages/events', { events });
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

app.get('/calendar', (req, res) => {
    res.render('pages/calendar');
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
