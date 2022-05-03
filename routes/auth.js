const express= require('express');
const mysql=require("mysql");
const bcrypt=require('bcryptjs');
const authController = require('../controllers/auth');
const { response } = require('express');

const fileupload=require('express-fileupload');
const async = require('hbs/lib/async');
const app=express();

app.use(fileupload);

const router=express.Router();
const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/stud_dash', authController.viewappostd);
router.get('/bookAppointment', authController.doc);
router.post('/bookAppointment', authController.bookAppointment);
router.get('/bookLabTest',authController.view);
router.post('/bookLabTest',authController.bookLabTest);
router.get('/hadash', authController.viewappo);
router.post('/upload',authController.report);
router.get('/doctors',authController.fetch);
router.post('/doctors',authController.add);
router.get('/haviewappo', authController.viewappoall);
router.get('/logout',authController.logout);
// router.get('/admindash', authController.student);
// router.post('/upload',authController.report);
// router.post('/:Id',authController.deleteDoc);
// router.get('/home',authController.logout);
// router.get('/home',authController.home);

// db.method.generateAuthToken = async function() {
//     try{
//         let token=jwt.sign({Id:this.Id}, process.env.SECRET_KEY)
//     }catch(err){
//         console.log(err);
//     }
// }

module.exports = router;
