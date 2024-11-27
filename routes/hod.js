var express = require('express');
var router = express.Router();
var hod=true
function verifyLogin(req,res,next){
  if(req.session.loggedIn == true){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET users listing. */
router.get('/',function(req, res,next ) {
  res.render('hod/dashboard',{ hod })
  // res.send('respond with a resource');
});
router.get('/login',(req,res)=>{
  // if(req.session.loggedIn==true){
  //   res.redirect('hod/dashboard')
  // }
  res.render('login',{hod})
})
router.get('/add-student',(req,res)=>{
 res.render('hod/add-student')
})
router.get('/view-student',(req,res)=>{
  res.render('hod/view-student')
 })
 router.get('/add-teacher',(req,res)=>{
  res.render('hod/add-teacher')
 })
 router.get('/view-teachers',(req,res)=>{
  res.render('hod/view-teachers')
 })
module.exports = router;
