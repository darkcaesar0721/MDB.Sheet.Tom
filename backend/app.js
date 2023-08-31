require('dotenv').config();

/* BEGIN: Create a mongodb server and mongodb client */
require('./database/server');
require('./database/client');
/* END: Create a mongodb server and mongodb client */

const controllers = require('./controllers');

const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false })); // extended: false - does not allow nested objects in query strings
app.use(express.json()); //use .json(), not .urlencoded()
app.use(express.static("public")); // we need to tell express to use the public directory for static files... this way our app will find index.html as the route of the application! We can then attach React to that file!

app.use('/api', controllers);

// process port
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
