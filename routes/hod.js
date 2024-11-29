var express = require('express');
var router = express.Router();
const hodHelpers = require('../helpers/hodHelpers');

var hod=true

const verifyLogin = (req, res, next) => {
  if (req.session.hodLoggedIn) {
    next()
  } else {
    res.redirect('/hod/login')
  }
}

router.get('/',verifyLogin, (req, res) => {
  res.render('hod/dashboard', {hod})
});
router.get('/login', (req, res) => {
  res.render('hod/login', { err: req.session.hodLoginErr })
})
router.post('/login', (req, res) => {
  hodHelpers.doLogin(req.body).then((resp) => {
    console.log("resp",resp)
    if (resp.err) {
       req.session.hodLoginErr = resp.err

      res.redirect('/hod/login')
    } else {
       req.session.hodLoggedIn = true
  
      res.redirect('/hod')
    }
  })
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
 router.get('/add-timetable',(req,res)=>{
  res.render('hod/add-timetable')
 })
 
 router.get('/view-timetable',(req,res)=>{
  res.render('hod/view-timetable')
 })
module.exports = router;
