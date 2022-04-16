const express= require('express');
const authController = require('../controllers/auth');
const router=express.Router();
const multer = require('multer');

router.get('/',(req,res)=>{
    res.render('home');
});
// router.get('/auth',(req,res)=>{
//     res.render('home');
// });

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
// router.get('/upload',(req,res)=>{
//     res.render('upload');
// });

router.get('/haviewappo', authController.viewappoall);
router.get('/doctors',authController.fetch);
router.post('/doctors',authController.add);
router.get('/upload',authController.upload);
router.get('/hadash',authController.viewappo);
router.get('/edit-doctors/:Id',authController.edit);
router.post('/edit-doctors/:Id',authController.update);
router.get('/:Id',authController.deleteDoc);
// router.get('/home',authController.logout);
router.get('/logout',authController.logout);
// router.post('/upload',authController.report);
// router.get('/:Lab_token',authController.report);
// router.get('/logout',(req,res) => {
//     req.session.destroy((err) => {
//         if(err) {
//             return console.log(err);
//         }
//         res.redirect('/');
//     });

// });
// np

module.exports=router;
