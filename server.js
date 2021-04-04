const express = require('express')
const app = express();
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const {authMiddleware, generateAuthToken} = require("../middlewares/auth");
const {startSchedule} = require("./cronjob");
const User = require('../models/User')
const {changePassword} = require("../models/User");

app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'ejs')
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', async (req, res) => {
    res.redirect('/operate')
})

app.get('/login', async (req, res) => {
    res.render('login.ejs')
})

app.post('/login', async (req, res) => {
    const {email, password, universalPassword} = req.body

    const token = await User.login(email, password, universalPassword)

    if(token) {
        res.cookie('token', token, {maxAge: 900000, httpOnly: true})
        return res.json({'successUrl':'/operate'})
    }
    res.status(401).end()
})

app.post('/changePassword', async (req, res) => {
    const {email, password, universalPassword} = req.body
    const passwordChanged = await changePassword(email, password, universalPassword)
    res.json({'passwordChanged': passwordChanged})
})

app.use(authMiddleware)

app.get('/operate', (req, res) => {
    res.render('operate.ejs')
})

app.post('/schedule', async (req, res) => {
    await startSchedule(req.cookies.token)
    res.status(200).end()
})

app.get('/logout', async (req, res) => {
    res.cookie('token', null, {maxAge: 0, httpOnly: true})
    await User.removeToken(req.cookies.token)
    res.redirect('/login')
})

app.listen(3000)