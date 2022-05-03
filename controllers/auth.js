const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
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
         
            bcrypt.compare(password, results[0].Password, function (error, result) {
                if (error) {
                    console.log(error);
                }

                if (result) {
                    
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
                    req.session.Id=results[0].Id

                    res.cookie('jwt', token, cookieOptions);
                    
                    if (results[0].usertype == 'Student' && req.session.loggedIn) {
                                      
                        res.status(200).redirect('/auth/stud_dash');
                    }else if (results[0].usertype == 'Hospital Administrator' && req.session.loggedIn) {
                        // req.session.user = results;
                        // console.log(req.session.user);
                        return res.redirect('/hadash');
                        // res.status(200).redirect('/auth/stud_dash');
                    }else if (results[0].usertype == 'Administrator' && req.session.loggedIn) {
                        // req.session.user = results;
                        // console.log(req.session.user);
                        return res.redirect('/admindash/student');
                        // res.status(200).redirect('/auth/stud_dash');
                    }else{
                        return res.render('login');
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
    const mail = req.session.email;
    if (mail && req.session.loggedIn){
    db.query('SELECT users.Name, bookappoint.Bv_Id, bookappoint.Status, doctors.doc_name,doctors.doc_day,doctors.doc_time1,doctors.doc_time2,bookappoint.problem FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id WHERE users.Email = ? ',[mail],function (err, rows) {
        if (err) {
        console.error(err);
        res.send("Error: " + err.message);
    } else {
        db.query('SELECT users.Name, users.Banasthali_Id,test.Id, test.test_name, booklab.Status, booklab.Report, booklab.Date FROM users INNER JOIN booklab ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE users.Email=?',[mail], function (err, result) {
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
    else{
        return res.render('login')
    }
}
exports.bookAppointment = (req, res) => {
    console.log(req.body);

    const { studentid, problem, Date, docid } = req.body;
    const mail=req.session.email;

    if(mail && req.session.loggedIn){
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
                    console.log('The data from the user table(BOOK APPOINTMENT): \n', rows);
                });
            }
        });
    }
    else return res.render('login');
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
        console.log('The data from the user table(DOC): \n', rows);
    });
}
exports.bookLabTest = (req, res) => {

    console.log(req.body);

    const sid = req.body.student_id;
    const Date = req.body.Date;
    const tid = req.body.test_id;

    const mail=req.session.email;
    if(mail && req.session.loggedIn){

    db.query('INSERT INTO booklab SET ?', { Test_ID: tid, Bv_id: sid, Date: Date }, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log(results);
          
            return db.query('SELECT * FROM test', (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render('bookLabTest', { rows, message: "Appointment Booked" });
                }
                console.log('The data from the user table (BOOK LABTEST): \n', rows);
            });
        }
    });
}
else{
    return res.render('login');
}

}

exports.view = (req, res) => {
    db.query('SELECT * FROM test', (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('bookLabTest', { rows });
        }
        console.log('The data from the user table(VIEW): \n', rows);
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
    const mail=req.session.email;
    if(mail && req.session.loggedIn){
    db.query('SELECT bookappoint.token,users.Name,bookappoint.Bv_Id, doctors.doc_name,bookappoint.problem,doctors.doc_day,doctors.doc_time1,doctors.doc_time2,bookappoint.Status FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id WHERE doctors.doc_day=CURRENT_DATE', function (err, rows) {
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
else{
    res.render('login');
}


}
exports.viewappoall = (req, res) => {
    db.query('SELECT bookappoint.token,bookappoint.Status,users.Name,bookappoint.Bv_Id, doctors.doc_name,bookappoint.problem,doctors.doc_day,doctors.doc_time1,doctors.doc_time2 FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id ORDER BY doctors.doc_day DESC', (err, rows) => {

        if (!err) {
            res.render('haviewappo', { rows });
        } else {
            console.log(err);
        }

        console.log("data from appointment table: \n", rows);
    });


}
exports.appostat =(req,res)=>{
   console.log(req.params.token);
    db.query('SELECT bookappoint.token,users.Name,bookappoint.Bv_Id, doctors.doc_name,bookappoint.problem,doctors.doc_day,doctors.doc_time1,doctors.doc_time2 FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id WHERE bookappoint.token=? ORDER BY doctors.doc_day DESC',[req.params.token], (err, rows) => {
        if (!err) {
            res.render('appostat', { rows });
        } else {
            console.log(err);
        }
          //console.log('The data from doctors table(DELETE): \n', rows)
    });
}
exports.appostatupdate=(req, res) => {
    // User the connection
    const{status}=req.body;
    db.query('UPDATE bookappoint SET Status=? WHERE token=?', [status,req.params.token], (err, rows) => {
        if (!err) {
            // User the connection
            db.query('SELECT bookappoint.token,bookappoint.Status, users.Name,bookappoint.Bv_Id, doctors.doc_name,bookappoint.problem,doctors.doc_day,doctors.doc_time1,doctors.doc_time2 FROM users INNER JOIN bookappoint ON users.Banasthali_Id = bookappoint.Bv_Id INNER JOIN doctors ON doctors.Id=bookappoint.doc_id WHERE bookappoint.token=? ORDER BY doctors.doc_day DESC',[req.params.token],(err, rows) => {
                if (!err) {
                    res.render('appostat', { rows, alert: `updated.` });
                  } else {
                    console.log(err);
                  }
                  //console.log('The data from doctors table(DELETE): \n', rows)
            });
        }else {
            console.log(err);
          }
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
      console.log('The data from doctors table(EDIT): \n', rows);
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
        console.log('The data from user table(UPDATE-1): \n', rows);
      });
    } else {
      console.log(err);
    }
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
      console.log('The data from doctors table(DELETE): \n', rows);
    });
}

exports.report=(req,res)=>{
    console.log(req.files);
    var file=req.files.pdf;
    console.log(req.body);

    const { pdf } = req.body;
    console.log("$$$$$$$$$4");
    console.log(file);
    console.log("!!!!!!!11");
    if (!pdf)
                return res.status(400).send('No files were uploaded.');
        var file = req.body.pdf;
        console.log("*********");
        console.log(file);
        console.log("_____________");
        // var img_name=file.name;
         if(file.mimetype == "application/pdf" ){
                                
              file.mv('public/reports/'+file.name, function(err) {
                            
                if (err)
                    return res.status(500).send(err);
                db.query('UPDATE bookLab SET Report=? WHERE Lab_token=?',[pdf,req.params.Lab_token],(err,files)=>{
                        res.redirect('upload');
                });
            });
          } else {
            message = "This format is not allowed , please upload file with '.pdf'";
            res.render('index.ejs',{message: message});
          }

}
exports.admin= (req, res) => {
    console.log(req.params.usertype);
    if(req.params.usertype =='student'){
        console.log("*********In student*********");
        db.query('SELECT Id,Banasthali_Id,Name,Email,Hostel,Contact FROM users WHERE usertype=?',[req.params.usertype], (err, rows) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('admindash', { rows });
            }
            console.log('The data from the user table(student): \n', rows);
        });
    }
    if(req.params.usertype =='Hospital Administrator'){
        console.log("*********In HA*********");
        db.query('SELECT Id,Name,Email,Contact FROM users WHERE usertype=?',[req.params.usertype], (err, rows) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('hospitalAdministrator', { rows });
            }
            console.log('The data from the user table(HA): \n', rows);
        });
    }
    if(req.params.usertype =='Administrator'){
        db.query('SELECT Id,Name,Email,Contact FROM users WHERE usertype=?',[req.params.usertype], (err, rows) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('admin', { rows });
            }
            console.log('The data from the user table(admin): \n', rows);
        });
    }
}
exports.deleteUser = (req, res) => {
    // User the connection
    
    db.query('SELECT usertype FROM users WHERE Id = ?', [req.params.Id], (err, results) => {
        console.log(results);
      if (!err) {
          db.query('DELETE FROM users WHERE Id=? ', [req.params.Id], (error, rows) => {
              if(!error){
                if(results[0].usertype=='students'){
                    res.redirect('/admindash/student');
                  }
                  else 
                    res.redirect('/admindash/Hospital Administrator');
                  
                 
              }
             else {
                console.log(err);
              }
              console.log('The data from uers table(DELETE): \n', rows);
          });
      } else {
        console.log(err);
      }
});
}

exports.logout = (req,res) => {
    console.log("************");
    console.log("In log out right now");
    req.session.loggedIn=false;
    console.log(req.session.loggedIn)
    req.session.email=null;
    console.log(req.session.email)
    req.session.destroy((err) =>{
       res.redirect('/');
    })
};