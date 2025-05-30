var express = require('express');
var router = express.Router();

var path = require('path');
var env = require('dotenv').config();

const Client = require('pg').Client;
const client = new Client({
  connectionString: process.env.DATABASE_URL
}); 
client.connect(); // connect to the DATABASE_URL

var passport = require('passport');
var bcrypt = require('bcryptjs');

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) {
      console.log("unable to logout:", err);
      return next(err);
    }
  });   //passport provide it
  res.redirect('/exam'); // Successful. redirect to localhost:3000/exam
}); 

// localhost:3000/exam
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname,'..', 'public','exam.html'));
});

// localhost:3000/exam
router.post('/',
  // depends on the fields "isAdmin", redirect to the different path: admin or notAdmin
  passport.authenticate('local', { failureRedirect: 'exam?message=Incorrect+credentials', failureFlash:true }),
  function(req, res, next) {
    console.log
    if (req.user.isadmin == 'admin'){
      res.redirect('/exam/admin');
    }
    else {
      res.redirect('/exam/notAdmin');
    }
});

// localhost:3000/exam/admin
router.get('/admin', function(req, res){
  res.sendFile(path.join(__dirname,'..', 'public','admin.html'));
});

router.get('/notAdmin',function(req, res, next){
  res.sendFile(path.join(__dirname,'..', 'public','notAdmin.html'));
});

router.get('/notAdminOut',function(req, res, next){
  client.query('SELECT * FROM assignment WHERE username=$1',[req.user.username], function(err,result){
    if (err) {
      console.log("exam.js: sql error ");
      next(err); // throw error
    }
    else if (result.rows.length > 0) {
      console.log("There is at least one assignment ");
      res.json(result.rows);
    }
    else{
      console.log("This student does not have any assignment");
      let username=req.user.username;
      res.redirect('/exam/notAdmin?message='+username+" does not exist");
    }
  });
});

router.get('/whoami',function(req,res,next) {
  res.json({"user": req.user.username});
});

router.get('/addAssignment',function(req, res, next) {
  res.sendFile(path.join(__dirname,'..', 'public','addAssignment.html'));
});

router.post('/addAssignment',function(req, res, next) {
  client.query('SELECT * FROM examusers WHERE username = $1', [req.body.username], function(err, result) {
    if (err) {
      console.log("unable to query SELECT");
      next(err);
    }
    if (result.rows.length > 0) {
        console.log("User exist. Let's add assignment");
        client.query('INSERT INTO assignment (username, description, due) VALUES($1, $2, $3)', [req.body.username, req.body.description,req.body.due], function(err, result) {
          if (err) {
            console.log("unable to query INSERT");
            next(err);
          }
          console.log("Assignment creation is successful");
          res.redirect("/exam/addAssignment?message=Assignment+creation+is+successful")
        });
    }
    else {
      console.log("user doesn't exist");
      res.redirect("/exam/addAssignment?message=User+does+not+exist");

    }

  });
});

router.get('/changePassword',function(req, res, next) {
  res.sendFile(path.join(__dirname,'..', 'public','changePassword.html'));
});

router.post('/changePassword', function(req, res, next) {
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    const confirmPassword = req.body.confirmPassword
    const username = req.user.username

    client.query("SELECT password FROM examusers WHERE username = $1", [username], function(err, result){
      if (err){
        console.log("unable to query SELECT");
        next(err);
      }
      const encryptedPassword = result.rows[0].password;

      bcrypt.compare(currentPassword, encryptedPassword, function(err, match){
        if (err) {
          console.log("unable to bcrypt")
          next(err)
        }
        else if (!match){
          console.log("current password does not match")
          res.redirect("/exam/changePassword?message=current+password+does+not+match");
        }
        else if (newPassword !== confirmPassword){
          console.log("The two passwords you entered are not the same");
          res.redirect("/exam/changePassword?message=The+two+password+you+entered+are+not+the+same");
        }
      else {
      bcrypt.hash(newPassword, 10, function(err, hashedPassword){
        if (err){
          console.log("unable to bcrypt")
          next(err)
        }
      client.query("UPDATE examusers set password = $1 where username=$2", [hashedPassword, username], function(err, result){
        if (err){
          console.log("unable to query UPDATE");
          next(err);
        }
        console.log("You successfully changed password");
        res.redirect("/exam/changePassword?message=You+successfully+changed+password");
          });
        });
      }
    });
  });
});


router.get('/addUSer',function(req, res, next) {
  res.sendFile(path.join(__dirname,'..', 'public','addUSer.html'));
});

router.post('/addUser', function(req, res, next){
  const username = req.body.username;
  const password = req.body.password;
  const isadmin = req.body.isadmin;

  bcrypt.hash(password, 10, function(err, hashedPassword){
    if (err){
      console.log("unable to bcrypt");
      return next(err);
    }

    client.query('SELECT * FROM examusers WHERE username = $1', [username], function(err, result) {
      if (err){
        console.log("unable to query SELECT")
        next(err);
      }
      if (result.rows.length > 0){
        console.log("User exits")
        res.redirect("/exam/addUser?message=User+exists");
      }
      else {

    client.query('INSERT INTO examusers (username, password, isadmin) VALUES ($1, $2, $3)', [username, hashedPassword, isadmin], function(err, result) {
      if (err) {
        console.log("unable to query INSERT");
        next(err);
      }

      console.log("User creation is successful");
      res.redirect("/exam/addUser?message=User+creation+is+successful");
    });
    }
    });
  });
});

module.exports = router;