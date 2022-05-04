const express= require('express');
const mysql=require("mysql");
const bcrypt=require('bcryptjs');
const authController = require('../controllers/auth');
const { response } = require('express');
const res = require('express/lib/response');

const router=express.Router();
const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    port: process.env.DATABASE_PORT,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

router.get('/stud_dash',(req,res)=>{
    res.render('stud_dash');
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

router.get('/editUser',authController.editUser);
router.post('/editUser',authController.updateUser);

router.get('/editHa',authController.editHa);
router.post('/editHa',authController.updateHa);

router.get('/logout',authController.logout);
// router.get('/home',authController.home);



module.exports = router;
