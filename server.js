/**
 * Setup server & Routes
 */
const express = require('express');                                     // Import the Express module
require('dotenv').config();
const routes = require('./controllers');                                // Import the routes from the controllers file
const sequelize = require('./config/connection.js');                  // Import the Sequelize instance from the dbconnection.js file
const app = express();                                                  // Create an instance of the Express application
const PORT = process.env.PORT || 3001;                                  // Define the port for the server to listen on
const exphbs = require('express-handlebars');                           // Import the Express Handlebars module
const session = require('express-session');                             // used for session cookies
const path = require('path');                                           // Import the path module
const helpers = require('./utils/helpers');                             // Import the helper functions
const Session = require('./models/sessions');
var cookieParser = require('cookie-parser')
const { Op } = require('sequelize');
const hbs = exphbs.create({                                             // Create an instance of Express Handlebars with helpers and default layout
    helpers: helpers,
    defaultLayout: 'main' 
});        
               

app.engine('handlebars', hbs.engine);                            // Set the handlebars engine for rendering views
app.set('view engine', 'handlebars');

app.use(cookieParser())
app.use(express.json());                                         // Parse JSON bodies sent in requests
// sets up your cookies
app.use(session({
    secret: process.env.SECRET,                                 // the secret helps with hashing the session cookie I think?
    resave: false,                                              // set resave to false to prevent potentially problematic race conditions.
    saveUninitialized: false,
    cookie: { 
        secure: false,                                          // `true` for HTTPS, `false` for HTTP
        httpOnly: true,                                         // Blocks client-side JavaScript from accessing the cookie
        maxAge:  3600000,                                       // The duration in milliseconds for which the cookie is valid
        sameSite: false,
        proxy: false                                            //Trust the reverse proxy when setting secure cookies (via the "X-Forwarded-Proto" header).
    }
}));

app.use(express.urlencoded({ extended: true }));                // Parse URL-encoded bodies sent in requests
app.use(express.static(path.join(__dirname, 'public')));        // Serve static files from the 'public' directory
app.use(routes); // Use the defined routes

sequelize.sync({ force: false }).then(() => {
    // Start the server and listen on the specified port
    app.listen(PORT, () => console.log('Server Listening!'));   
  
    // Set up interval to find expired sessions and clean them up every hour
    setInterval(async () => {                                   
      try {
        await Session.findExpiredSessions();
      } catch (err) {
        console.error('Error in finding expired sessions: ', err);
      }
    }, 60 * 60 * 1000); // Every hour
  
    setInterval(async () => {
      try {
        let tokenArray = await Session.getAllSessionTokens();       // Every 5 minutes, this will run and delete any sessions that are 30 minutes old
        for(let token of tokenArray){                               // it will also calculate the users time every 5 minutes, this feature needs more work though
        }
        const cutoff = new Date(Date.now() - (30 * 60 * 1000));     // 30 minutes ago,
        await Session.clearExpiredSessions(cutoff);                 // if updated_at is less than (rightNow - 30 minutes), delete the session.
      } catch (err) {
        console.error('Error in handling sessions: ', err);
      }
    }, 5 * 60 * 1000);                                              // Every 5 minutes this will run
  });