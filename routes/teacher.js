var express = require('express');
const teacherHelpers = require('../helpers/teacherHelpers');
var router = express.Router();
var teacher = true
const verifyLogin = (req, res, next) => {
  if (req.session.teacherLoggedIn == true) {
    next()
  } else {
    res.redirect('/teacher/login')
  }
}
/* GET home page. */
router.get('/', verifyLogin, function (req, res, next) {
 teacherHelpers.getAllTeacher().then((resp)=>{
 
 
 
  res.render('teacher/dashboard', { title: 'SASC', teacher,name: req.session.teacher[0].Name});
 })
});
router.get('/login', (req, res) => {
  // res.render('teacher/login');
  if (req.session.teacherLoggedIn) {
    res.redirect('/teacher')
  } else {
    res.render('teacher/login', { err: req.session.teacherLoggedInErr });

    req.session.teacherloginErr = false
  }

});
router.post('/login', (req, res) => {
  //  console.log('.............clicked')

  teacherHelpers.doLogin(req.body).then((resp) => {

    if (resp.err) {
      req.session.teacherLoggedInErr = resp.err
      res.redirect('/teacher/login')

    } else {
      req.session.teacher = resp.data
      
      // console.log("teacher logged"   );
      req.session.teacherLoggedIn = true
      // req.session.student = resp.data
      res.redirect('/teacher')
    }
  })
})
router.get('/signup', (req, res) => {
  res.render('teacher/signup')
})
router.post('/signup', (req, res) => {
  console.log(req.body);
  teacherHelpers.doSignup(req.body).then(() => {
    res.render('teacher/login')
  })
})
// 

router.get('/view-attendence', (req, res) => {
  res.render('teacher/view-attendence')
})
router.get('/add-attendence', (req, res) => {
  console.log("quaery data" ,req.query);
  
  const selectedClass = req.query.class || null;
 

  
  // Perform some logic based on the class parameter
  if (selectedClass) {
    console.log(`Selected class: ${selectedClass}`);
  }

  res.render('teacher/add-attendence', { selectedClass });
   teacherHelpers.getClass(selectedClass)
});





module.exports = router;
