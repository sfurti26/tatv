const express= require('express');
const authController = require('../controllers/auth');
const router=express.Router();

router.get('/',(req,res)=>{
    res.render('home');
});

router.get('/register',(req,res)=>{
    res.render('register');
});

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/about',(req,res)=>{
    res.render('about');
});

router.get('/contact',(req,res)=>{
    res.render('contact');
});

router.get('/stud_dash',(req,res)=>{
    res.render('stud_dash');
});
router.get('/bookAppointment', (req, res)=>{
    res.render('bookAppointment');
});
router.get('/bookLabTest',(req,res)=>{
    res.render('bookLabTest');
});
router.get('/upload',(req,res)=>{
    res.render('upload');
});

router.get('/haviewappo', authController.viewappoall);
router.get('/update',authController.fetch);
router.post('/update',authController.update);
router.get('/hadash',authController.viewappo);

module.exports=router;
