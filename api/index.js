const express = require('express')
const dotenv = require('dotenv')

const app = express()

dotenv.config()

// Require middleware functions
const corsMiddleware = require('./middlewares/corsMiddleware')
const jsonMiddleware = require('./middlewares/jsonMiddleware')
const urlencodedMiddleware = require('./middlewares/urlencodedMiddleware')

const port = process.env.PORT

// Use Middleware
app.use(corsMiddleware)
app.use(jsonMiddleware)
app.use(urlencodedMiddleware)

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    next()
})

// Import Route Files
const getRoute = require('./routes/getRoute')
const loginRoute = require('./routes/loginRoute')
const elementRoute = require('./routes/elementRoute')
const scheduleRoute = require('./routes/scheduleRoute')
const applicationRoute = require('./routes/applicationRoute')
const metricRoute = require('./routes/metricRoute')

// Use Routes
app.use('/api/login', loginRoute)
app.use('/api/elements', elementRoute)
app.use('/api/get', getRoute)
app.use('/api/schedule', scheduleRoute)
app.use('/api/application', applicationRoute)

app.use('/api/metrics', metricRoute)

// Server Listener
app.listen(port, () => {
    console.log('====================================')
    console.log(`System Admin Server is running in ${port}`)
    console.log('====================================')
})
