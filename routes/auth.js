const express= require('express');
const mysql=require("mysql");
const bcrypt=require('bcryptjs');
const authController = require('../controllers/auth');
const { response } = require('express');

const router=express.Router();
const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/', authController.viewappo);
router.get('/bookAppointment', authController.doc);
router.post('/bookAppointment', authController.bookAppointment);
router.get('/bookLabTest',authController.view);
router.post('/bookLabTest',authController.bookLabTest);
router.get('/hadash', authController.viewappo);
router.post('/upload',authController.upload);
router.get('/update',authController.fetch);
router.post('/update',authController.update);
router.get('/haviewappo', authController.viewappoall);
// router.get('/home',authController.home);


module.exports = router;
