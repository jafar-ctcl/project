var express = require('express');
const studentHelpers = require('../helpers/studentHelpers');
const session = require('express-session');
const { log } = require('handlebars');
var router = express.Router();
var student=true
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn == true){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:'SASC' ,student });
});
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/student')
  } else {
    res.render('login', { title: 'Student', err: req.session.loginErr,student });
   // req.session.loginErr = false
  }
});
router.post('/login', (req, res) => {
  studentHelpers.doLogin(req.body).then((resp) => {
    if (resp.err) {
      req.session.loginErr = resp.err
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.student = resp.data
      // console.log("data",resp.data);
      console.log("name",resp.data.name);

      
      res.redirect('/student')
    }
  })
})

// router.post('/login', (req, res) => {
//   studentHelpers.doLogin(req.body).then((resp) => {
//     if (resp.err) {
//       req.session.loginErr = resp.err
//       res.redirect('/login')
//     } else {
//       req.session.loggedIn = true
//       req.session.student = resp.name
//       console.log(resp.data);
      
//       res.redirect('/student')
//     }
//   })
// })  
router.get('/signup',(req,res)=>{
  res.render('signup')
})
router.post('/signup',(req,res)=>{
  console.log(req.body);
  studentHelpers.doSignup(req.body).then(()=>{
        res.redirect('/login')
  })
})
router.get('/student',verifyLogin,(req,res)=>{
  // console.log(req.session.student[0]);
  let name = req.session.student.name
  
  res.render('student/dashboard',{name})
})
router.get('/timetable',(req,res)=>{
  
  res.render('student/dashboard',{student})
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
// router.get('/teacher',(req,res)=>{
//   res.render('teacher/view-attendence')
// })
module.exports = router;
