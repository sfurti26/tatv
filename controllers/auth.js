const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const async = require("hbs/lib/async");
const e = require("express");

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

    db.query('SELECT usertype,password FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            console.log(password);
            console.log(results);
            console.log(results[0].password);
            console.log(results[0].usertype);
            bcrypt.compare(password, results[0].password, function (error, result) {
                if (error) {
                    console.log(error);
                }
                console.log(result);
                if (result) {
                    if (results[0].usertype == 'Student')
                        return res.redirect('/stud_dash');
                    if (results[0].usertype == 'Hospital Administrator')
                        return res.redirect('/hadash');
                    // return res.render('login', {
                    // message: 'Login Successful'
                } else {
                    console.log('first else');
                    return res.render('login', {
                        message: 'Wrong email password combination!!!!!'
                    });
                }
            });
        } else {
            console.log('secnd else');
            return res.render('login', {
                message: 'Wrong email password combination'
            });
        }

    });
}

exports.viewappo = (req, res) => {

    db.query('SELECT * FROM appointment WHERE date=curdate()', function (err, rows) {
        if (err) {
            // done();
            console.error(err);
            res.send("Error: " + err.message);
        } else {
            db.query('SELECT * FROM labappointment', function (err, result) {
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
exports.bookAppointment = (req, res) => {
    console.log(req.body);

    const { studentid, problem, Date, docid } = req.body;

    db.query('SELECT studentid FROM bookappoint WHERE studentid = ?', [studentid], (error, results) => {
        if (error) {
            console.log(err);
        }

        if (results.length > 0) {

            return db.query('SELECT * FROM doctors where doc_day=curdate()', (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render('bookAppointment', { rows, message: 'Appointment already booked' });
                }
                console.log('The data from the user table: \n', rows);
            });
        }
        db.query('INSERT INTO bookappoint SET ? ', { studentid: studentid, problem: problem, Date: Date, doc_id: docid }, (error, results) => {
            if (error) {
                console.log(err);
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
    });
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
    db.query('INSERT INTO booklab SET ?', { Test_ID: tid, Student_ID: sid, Date: Date }, (error, results) => {
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
    console.log(req.body);
    db.query('SELECT * FROM labAppointment', (error, results) => {
        db.release();

        if (error) {
            console.log(error);
        } else {
            console.log(results);
            return res.render('upload', { results })
        }
    });
}
exports.update = (req, res) => {
    console.log(req.body);

    // const name=req.body.name;
    // const email=req.body.email;
    // const password=req.body.password;
    // const passwordConfirm=req.body.passwordConfirm;
    //Can be written in this manner as well

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
                    return res.render('update', { rows, message: 'That email has been taken' })
                }
            });
            // return res.render('update', {
            //     message: ' That email has been taken'
            // })
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
                        return res.render('update', { rows, message: 'Schedule updated' })
                    }
                });
                // return res.render('update', {
                //     message: 'Schedule updated'
                // })
            }
        })

        // db.query('SELECT * FROM doctors', (error, rows) => {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log(rows);
        //         return res.render('update', { rows })
        //     }
        // });
    });
}
exports.fetch = (req, res) => {
    db.query('SELECT * FROM doctors', (error, rows) => {
        if (error) {
            console.log(error);
        } else {
            console.log(rows);
            return res.render('update', { rows })
        }
    });
}
exports.viewappo = (req, res) => {

    db.query('SELECT * FROM appointment WHERE appo_date=curdate()', function (err, rows) {
        if (err) {
            // done();
            console.error(err);
            res.send("Error: " + err.message);
        } else {
            db.query('SELECT * FROM labappointment WHERE test_date=curdate()', function (err, result) {
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
    db.query('SELECT * FROM appointment ORDER BY appo_date', (err, rows) => {

        if (!err) {
            res.render('haviewappo', { rows });
        } else {
            console.log(err);
        }

        console.log("data from appointment table: \n", rows);
    });

}