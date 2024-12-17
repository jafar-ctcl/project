var express = require('express');
var router = express.Router();
const hodHelpers = require('../helpers/hodHelpers');
const { log } = require('handlebars');

var hod=true

const verifyLogin = (req, res, next) => {
  if (req.session.hodLoggedIn) {
    next()
  } else {
    res.redirect('/hod/login')
  }
}
router.get('/',verifyLogin, (req, res) => {
    hodHelpers.getAllStudents().then((resp)=>{
    res.render('hod/dashboard', {hod,students:resp})
    })
  
});
router.get('/login', (req, res) => {
  if(req.session.hodLoggedIn){
    res.redirect('/hod/dashboard')
  }else{

    res.render('hod/login', { err: req.session.hodLoginErr })
  }
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
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/hod')
})

router.get('/approve-students',verifyLogin, (req, res) => {
  hodHelpers.getAllStudents().then((resp) => {
    // console.log(resp);
    res.render('hod/approve-students', { hod, students: resp })
  })
})

router.get('/change-status/:email/:status', (req, res) => {
  hodHelpers.changeStatus(req.params).then(() => {
    res.redirect('/hod/approve-students')
  })
})
// router.get('/add-student',(req,res)=>{
//  res.render('hod/add-student',{hod})
// })
router.get('/view-students',verifyLogin,(req,res)=>{
  
hodHelpers.getApprovedStudents().then((resp) => {
    // console.log(resp);
    res.render('hod/view-students', { hod, students: resp })
  })
 })
 router.get('/approve-teacher',verifyLogin,(req,res)=>{
  // res.render('hod/approve-teacher',{hod})
 hodHelpers.getAllTeacher().then((resp) => {
 

res.render('hod/approve-teacher',{hod,teachers:resp})

 })
 })
router.get('/teacher-change-status/:email/:status', (req, res) => {
  hodHelpers.changeTeacherStatus(req.params).then(() => {
    res.redirect('/hod/approve-teacher')
  })
})
 router.get('/view-teachers',verifyLogin,(req,res)=>{
  hodHelpers.getApprovedTeachers().then((resp)=>{
  res.render('hod/view-teachers',{hod,teachers:resp})

  })

 })
 router.get('/add-timetable',verifyLogin,(req,res)=>{
  res.render('hod/add-timetable',{hod})
 })
 router.post('/add-timetable',(req,res)=>{
  // console.log("timetable",req.body);
  hodHelpers.addTimetable(req.body).then(()=>{
    console.log("...............................................");
    //  res.redirect('hod/view-timetable')
    res.redirect('/hod')
  })
  
 })
 
 router.get('/view-timetable',verifyLogin,(req,res)=>{
  hodHelpers.getTimetable().then((resp)=>{
    console.log("response",resp);
  
    // console.log("response",resp);
    // console.log("response",resp[0].time);
    // console.log("response",resp[0].year);
    // console.log("response",resp[0].teacher);
    
        res.render('hod/view-timetable',{timetable:resp})
  })
 
 })
module.exports = router;
