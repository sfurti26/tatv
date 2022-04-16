const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const async = require("hbs/lib/async");
const e = require("express");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const res = require("express/lib/response");
const { NULL } = require("mysql/lib/protocol/constants/types");
const dotenv=require("dotenv");

dotenv.config({path: './.env'});


// const session=require('express-session');

// app.use(session({
//     secret : 'ABCDefg',
//     resave : false,
//     saveUninitialized : true
// }));

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    // const name=req.body.name;
    // const email=req.body.email;
    // const password=req.body.password;
    // const passwordConfirm=req.body.passwordConfirm;
    // Can be written in this manner as well

    const { usertype, name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email=?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.render('register', {
                message: ' That email has been taken'
            })
        }
        else if (password !== passwordConfirm) {
            return res.render('register', {
                message: ' Passwords do not match '
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', { usertype: usertype, name: name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.redirect('/');
            }
        })
    });
}
exports.login = (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            // console.log(password);
            // console.log(results);
            // console.log(results[0].Password);
            // console.log(results[0].Name);
            // console.log(results[0].usertype);
            // console.log(results);
            // console.log(results[0].Email);
            bcrypt.compare(password, results[0].Password, function (error, result) {
                if (error) {
                    console.log(error);
                }
                //console.log(result);
                if (result) {
                    // req.session.loggedIn = true;
                    // req.session.username = results[0].Name;
                    // req.session.email = results[0].Email;
                    // req.session.bvId=results[0].Banasthali_Id;
                    const id=results[0].Email;
                    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });

                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true
                    }
                    req.session.loggedIn = true;
                    req.session.username = results[0].Name;
                    req.session.email = results[0].Email;
                    req.session.bvId=results[0].Banasthali_Id;

                    res.cookie('jwt', token, cookieOptions);
                    // res.status(200).redirect('/profile');
                    // req.session.user=results;
                    // console.log(req.session.user);
                    if (results[0].usertype == 'Student') {
                        // req.session.user = results;
                        // console.log(req.session.user);
                        // return res.render('/stud_dash', { email: req.user.email });
                        // return res.redirect('/auth/stud_dash');                
                        res.status(200).redirect('/auth/stud_dash');
                    }
                    // return res.redirect('/stud_dash');
                    if (results[0].usertype == 'Hospital Administrator') {
                        // req.session.user = results;
                        // console.log(req.session.user);
                        return res.redirect('/hadash');
                        // res.status(200).redirect('/auth/stud_dash');
                    }
                    // return res.redirect('/hadash');
                    // return res.render('login', {
                    // message: 'Login Successful'
                } else {
                    return res.render('login', {
                        message: 'Incorrect Password.'});
                    // res.send('Incorrect Password.');
                }
                // res.end();
            });
        } else {
            return res.render('login', {
                message: 'User does not exist'
            });
            // res.send('User does not exist');
            // res.end();
        }

    });
}

exports.viewappostd = (req, res) => {
    // console.log("**************");
    // console.log(req.session.username);
    // console.log("--------------");
    // console.log(req.session.loggedIn)
    // if (req.session.loggedIn) {
    // 	// Output username
    // 	res.send('Welcome back, ' + req.session.username + '!');

    // } else {
    // 	// Not logged in
    // 	res.send('Please login to view this page!');
    // }
    // res.end();
    const mail = req.session.email;
    if (req.session.loggedIn){
    db.query('SELECT users.Name, bookappoint.Bv_Id, doctors.doc_name,doctors.doc_day,doctors.doc_time1,doctors.doc_time2,bookappoint.problem FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id WHERE users.Email = ? ',[mail],function (err, rows) {
        if (err) {
        // done();
        console.error(err);
        res.send("Error: " + err.message);
    } else {
        db.query('SELECT users.Name, users.Banasthali_Id,test.Id, test.test_name, booklab.Date FROM users INNER JOIN booklab ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE users.Email=?',[mail], function (err, result) {
            // done();
            if (err) {
                console.error(err);
                res.send("Error: " + err.message);
            } else {
                console.log(rows);
                console.log(result);
                res.render('stud_dash', {
                    rows: rows,
                    result: result
                });
            }
        });
    }
});
    }
}
exports.bookAppointment = (req, res) => {
    console.log(req.body);

    const { studentid, problem, Date, docid } = req.body;
    const mail=req.session.email;

    // db.query('SELECT user_id FROM bookappoint WHERE user_id = ?', [studentid], (err, results) => {
    //     // db.query('SELECT Id FROM users WHERE Email= ?', [mail], (err, results) => {
    //     if (err) {
    //         console.log(err);
    //     }

        // if (results.length > 0) {

        //     return db.query('SELECT * FROM doctors where doc_day=curdate()', (err, rows) => {
        //         if (err) {
        //             console.log(err);
        //         }
        //         else {
        //             res.render('bookAppointment', { rows, message: 'Appointment already booked' });
        //         }
        //         console.log('The data from the user table: \n', rows);
        //     });
        // }
        db.query('INSERT INTO bookappoint SET ? ', { Bv_id: studentid, problem: problem, Date: Date, doc_id: docid }, (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(results);
                return db.query('SELECT * FROM doctors where doc_day=curdate()', (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.render('bookAppointment', { rows, message: 'Appointment booked!' });
                    }
                    console.log('The data from the user table: \n', rows);
                });
            }
        });
    // });
}

exports.doc = (req, res) => {
    db.query('SELECT * FROM doctors where doc_day=curdate()', (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('bookAppointment', { rows });
        }
        console.log('The data from the user table: \n', rows);
    });
}
exports.bookLabTest = (req, res) => {

    console.log(req.body);

    const sid = req.body.student_id;
    const Date = req.body.Date;
    const tid = req.body.test_id;

    // db.query('SELECT * FROM test',(err, rows)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         res.render('bookLabTest', { rows ,message:"Appointment Booked" });
    //     }
    //     console.log('The data from the user table: \n', rows);
    // });

    //for inserting values into the database
    db.query('INSERT INTO booklab SET ?', { Test_ID: tid, Bv_id: sid, Date: Date }, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log(results);
            /* return res.render('bookLabTest',{
            message: 'Appointment Booked'
            }) */
            return db.query('SELECT * FROM test', (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render('bookLabTest', { rows, message: "Appointment Booked" });
                }
                console.log('The data from the user table: \n', rows);
            });
        }
    });

}

exports.view = (req, res) => {
    db.query('SELECT * FROM test', (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('bookLabTest', { rows });
        }
        console.log('The data from the user table: \n', rows);
    });
}
exports.upload = (req, res) => {
    console.log("upload mein hai");
    db.query('SELECT booklab.Lab_token,users.Name,users.Banasthali_Id,booklab.Test_ID,test.test_name, booklab.Date FROM booklab INNER JOIN users ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID ORDER By booklab.Date DESC', (error, rows) => {

        if (error) {
            console.log(error);
        } else {
            console.log(rows);
            return res.render('upload', {rows});
        }
    });
}
exports.add = (req, res) => {
    console.log(req.body);
    const { name, specialty, email, date, time1, time2, tel, address } = req.body;
    db.query('SELECT doc_email FROM doctors WHERE doc_email=?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return db.query('SELECT * FROM doctors', (error, rows) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(rows);
                    return res.render('doctors', { rows, message: 'Doctor already in Database' })
                }
            });
        }
        db.query('INSERT INTO doctors SET ?', { doc_email: email, doc_name: name, specialty: specialty, doc_contact: tel, address: address, doc_day: date, doc_time1: time1, doc_time2: time2 }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return db.query('SELECT * FROM doctors', (error, rows) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(rows);
                        return res.render('doctors', { rows, message: 'Schedule updated' })
                    }
                });
            }
        })
    });
}
exports.fetch = (req, res) => {
    db.query('SELECT * FROM doctors', (error, rows) => {
        if (error) {
            console.log(error);
        } else {
            console.log(rows);
            return res.render('doctors', { rows })
        }
    });
}
exports.viewappo = (req, res) => {

    db.query('SELECT bookappoint.token,users.Name,bookappoint.Bv_Id, doctors.doc_name,bookappoint.problem,doctors.doc_day,doctors.doc_time1,doctors.doc_time2 FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id WHERE doctors.doc_day=CURRENT_DATE', function (err, rows) {
        if (err) {
            // done();
            console.error(err);
            res.send("Error: " + err.message);
        } else {
            db.query('SELECT booklab.Lab_token,users.Name,users.Banasthali_Id,booklab.Test_ID,test.test_name, booklab.Date FROM booklab INNER JOIN users ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE booklab.Date=CURRENT_DATE', function (err, result) {
                // done();
                if (err) {
                    console.error(err);
                    res.send("Error: " + err.message);
                } else {
                    console.log(rows);
                    console.log(result);
                    res.render('hadash', {
                        rows: rows,
                        result: result
                    });
                }
            });
        }
    });


}
exports.viewappoall = (req, res) => {
    db.query('SELECT bookappoint.token,users.Name,bookappoint.Bv_Id, doctors.doc_name,bookappoint.problem,doctors.doc_day,doctors.doc_time1,doctors.doc_time2 FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id ORDER BY doctors.doc_day DESC', (err, rows) => {

        if (!err) {
            res.render('haviewappo', { rows });
        } else {
            console.log(err);
        }

        console.log("data from appointment table: \n", rows);
    });


}
exports.edit = (req, res) => {
    // User the connection
    db.query('SELECT * FROM doctors WHERE Id = ?', [req.params.Id], (err, rows) => {
      if (!err) {
        res.render('edit-doctors', { rows });
      } else {
        console.log(err);
      }
      console.log('The data from user table: \n', rows);
    });
  }
exports.update=(req,res)=>{
    // res.render('edit-doctors');
    const { name,specialty ,email,date,time1,time2,tel,address} = req.body;
  // User the connection
  db.query('UPDATE doctors SET doc_name = ?,doc_email = ?, specialty=?, doc_contact = ?, address = ?,doc_day=?,doc_time1=?,doc_time2=? WHERE id = ?', [name,email,specialty,tel,address,date,time1,time2, req.params.Id], (err, rows) => {

    if (!err) {
      // User the connection
      db.query('SELECT * FROM doctors WHERE Id = ?', [req.params.Id], (err, rows) => {
        
        if (!err) {
          res.render('edit-doctors', { rows, alert: `${name} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from user table: \n', rows);
      });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}
exports.deleteDoc = (req, res) => {
    // User the connection
    db.query('DELETE FROM doctors WHERE Id = ?', [req.params.Id], (err, rows) => {
      if (!err) {
        res.redirect('doctors');
      } else {
        console.log(err);
      }
      console.log('The data from user table: \n', rows);
    });
}

// exports.report=(req,res)=>{
//     const {status}= req.body;
//     console.log("***********"+req.params.Lab_token+"***************");
//     db.query('UPDATE bookLab SET Status=? WHERE Lab_token=?',[status,req.params.Lab_token],(err,files)=>{
//         console.log("++++++++++++");
//         console.log("In report");
//         console.log("*********");
//         if (!err) {
//             // User the connection
//             db.query('SELECT * FROM booklab WHERE Lab_token = ?', [req.params.Lab_token], (err, rows) => {
              
//               if (!err) {
//                 res.redirect('upload', { rows, alert: `${Bv_id} has been updated.` });
//               } else {
//                 console.log(err);
//               }
//             //   console.log('The data from user table: \n', rows);
//             });
//           } else {
//             console.log(err);
//           }
//           console.log("Last part of report *****************");
//           console.log('The data from user table: \n', files);
//   });
// }

exports.logout = (req,res) => {
    console.log("************");
    console.log("In log out right now");

    res.clearCookie('jwt');
    res.session.loggedIn=false;
    req.session.destroy((err) =>{
       res.redirect('/');
    })
};