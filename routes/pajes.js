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
router.get('/admindash',(req,res)=>{
    res.render('admindash');
});
router.get('/bookAppointment', (req, res)=>{
    res.render('bookAppointment');
});
router.get('/bookLabTest',(req,res)=>{
    res.render('bookLabTest');
});
router.get('/hospitalAdministrator',(req,res)=>{
    res.render('hospitalAdministrator');
});
router.get('/appostat',(req,res)=>{
    res.render('appostat');
})
router.get('/appostatdash',(req,res)=>{
    res.render('appostatdash');
})
router.get('/labstatus',(req,res)=>{
    res.render('labstatus');
})
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
router.get('/deletetest/:Id',authController.deleteTest);
router.get('/delete/:Id',authController.deleteUser);
router.get('/admindash/:usertype', authController.admin);
router.post('/appostat/:token',authController.appostatupdate);
router.get('/appostat/:token',authController.appostat);
router.post('/appostatdash/:token',authController.appostatupdatedash);
router.get('/appostatdash/:token',authController.appostatdash);
// router.get('/labstatus/:Lab_token',authController.report);
// router.post('/labstatus/:Lab_token',authController.reportupdate);
// (req, res) => {
//     connection.query('SELECT * FROM user WHERE id = "1"', (err, rows) => {
//       if (!err) {
//         res.render('index', { rows });
//       }
//     });
// });
//router.get('/logout',authController.logout);

// router.get('/hospitalAdministrator/:usertype', authController.admin);
// router.post('/upload/:Lab_token',authController.report);
// router.get('/home',authController.logout);
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
