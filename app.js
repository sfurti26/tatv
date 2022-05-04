const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const Cors = require("cors");


const fileupload = require('express-fileupload');

dotenv.config({ path: './.env' });

const app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});


const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory));

app.use(fileupload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());//Parse JSON bodies
app.use(
  Cors({
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.set('view engine', 'hbs');

db.connect((error) => {
  if (error)
    console.log(error)
  else
    console.log("Connected")
})

//Define Routes
// app.use(fileupload);
app.use('/', require('./routes/pajes'));
app.use('/auth', require('./routes/auth'));
app.use(express.static("images_tatv"));
app.use(express.static("upload"));

app.get('/labstatus/:Lab_token', (req, res) => {
  console.log(req.params.Lab_token);
  db.query('SELECT booklab.Lab_token,users.Name,users.Banasthali_Id,booklab.Test_ID,test.test_name, booklab.Date FROM booklab INNER JOIN users ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE booklab.Lab_token = ? ORDER By booklab.Date DESC', [req.params.Lab_token], (err, rows) => {
    if (!err) {
      res.render('labstatus', { rows });
    }
    console.log(rows);
  });
});
app.get('/labstatusdash/:Lab_token', (req, res) => {
  console.log(req.params.Lab_token);
  db.query('SELECT booklab.Lab_token,users.Name,users.Banasthali_Id,booklab.Test_ID,test.test_name, booklab.Date FROM booklab INNER JOIN users ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE booklab.Lab_token = ? ORDER By booklab.Date DESC', [req.params.Lab_token], (err, rows) => {
    if (!err) {
      res.render('labstatusdash', { rows });
    }
    console.log(rows);
  });
});


app.post('/labstatus/:Lab_token', (req, res) => {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // name of the input is sampleFile
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/public/images/' + sampleFile.name;

  console.log(sampleFile);

  // Use mv() to place file on the server
  sampleFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    db.query('UPDATE booklab SET Report = ? WHERE Lab_token=?', [sampleFile.name, req.params.Lab_token], (err, rows) => {
      if (!err) {
        db.query('SELECT booklab.Lab_token,users.Name,users.Banasthali_Id,booklab.Test_ID,test.test_name, booklab.Date FROM booklab INNER JOIN users ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE booklab.Lab_token = ? ORDER By booklab.Date DESC', [req.params.Lab_token], (err, rows) => {
          if (!err) {
            res.render('labstatus', { rows, alert: `updated.` });
          } else {
            console.log(err);
          }

        });
      } else {
        console.log(err);
      }
    });
  });
});

app.post('/labstatusdash/:Lab_token', (req, res) => {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // name of the input is sampleFile
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/public/images/' + sampleFile.name;

  console.log(sampleFile);

  // Use mv() to place file on the server
  sampleFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    db.query('UPDATE booklab SET Report = ? WHERE Lab_token=?', [sampleFile.name, req.params.Lab_token], (err, rows) => {
      if (!err) {
        db.query('SELECT booklab.Lab_token,users.Name,users.Banasthali_Id,booklab.Test_ID,test.test_name, booklab.Date FROM booklab INNER JOIN users ON users.Banasthali_Id=booklab.Bv_id INNER JOIN test ON test.Id=booklab.Test_ID WHERE booklab.Lab_token = ? ORDER By booklab.Date DESC', [req.params.Lab_token], (err, rows) => {
          if (!err) {
            res.render('labstatus', { rows, alert: `updated.` });
          } else {
            console.log(err);
          }

        });
      } else {
        console.log(err);
      }
    });
  });
});


app.listen(5000, () => {
  console.log("Server on port 5000")
})