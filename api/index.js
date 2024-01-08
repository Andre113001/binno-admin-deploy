const express = require('express');
const dotenv = require('dotenv')

const app = express();

dotenv.config();

// Require middleware functions
const corsMiddleware = require('./middlewares/corsMiddleware');
const jsonMiddleware = require('./middlewares/jsonMiddleware');
const urlencodedMiddleware = require('./middlewares/urlencodedMiddleware');

const port = process.env.PORT;

// Use Middleware
app.use(corsMiddleware);
app.use(jsonMiddleware);
app.use(urlencodedMiddleware);

// Import Route Files
const getRoute = require('./routes/getRoute');
const loginRoute = require('./routes/loginRoute');
const elementRoute = require('./routes/elementRoute');
const scheduleRoute = require('./routes/scheduleRoute');

// Use Routes
app.use('/api/login', loginRoute);
app.use('/api/elements', elementRoute);
app.use('/api/get', getRoute);
app.use('/api/schedule', scheduleRoute);

// Server Listener
app.listen(port, () => {
    console.log('====================================');
    console.log(`System Admin Server is running in ${port}`);
    console.log('====================================');
});