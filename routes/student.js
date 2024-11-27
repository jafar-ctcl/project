var express = require('express');
const studentHelpers = require('../helpers/studentHelpers');
const session = require('express-session');
const { log } = require('handlebars');
var router = express.Router();
var student=true
// function verifyLogin(req,res,next){
//   if(req.session.loggedIn == true){
//     next()
//   }else{
//     res.redirect('/login')
//   }
// }
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:'SASC' ,student });
});
router.get('/login',(req,res)=>{
 
  res.render('login',{title:'SASC',student})
})
router.post('/login',(req,res)=>{
 studentHelpers.doLogin(req.body).then((status)=>{
 if( status == true){
  res.render('student/user-view')
 }else{
  res.redirect('login')
 }
} )
//  console.log(req.body);
 
})
router.get('/signup',(req,res)=>{
  res.render('signup')
})
router.post('/signup',(req,res)=>{
  console.log(req.body);
  studentHelpers.doSignup(req.body).then((res)=>{

 // req.session.loggedIn=true
    res.redirect('login')
  })
})
module.exports = router;
