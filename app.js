const express=require("express");
const path=require("path");
const mysql=require("mysql");
const dotenv=require("dotenv");
const { ppid } = require("process");
var cookieParser=require('cookie-parser');
var session = require('express-session');



dotenv.config({path: './.env'});

const app=express();

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    // host:'localhost',
    // user:'root',
    // password:'',
    // database: 'loginpractice'
    database: process.env.DATABASE
});

const publicDirectory=path.join(__dirname,'./public' )
app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false}));
app.use(express.json());//Parse JSON bodies

app.use(session({
    secret : 'ABCDefg',
    resave : false,
    saveUninitialized : true
}));

app.set('view engine','hbs');

db.connect((error)=> {
    if(error)
    console.log(error)
    else
    console.log("Connected")
})

//Define Routes
app.use('/',require('./routes/pajes'));
app.use('/auth',require('./routes/auth'));
app.use(express.static("images"));

app.listen(5000,()=>{
    console.log("Server on port 5000")
})