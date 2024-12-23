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
    hodHelpers.getApprovedStudents().then((resp)=>{
       hodHelpers.getApprovedTeachers().then((teacherData)=>{
        res.render('hod/dashboard', {hod,students:resp,teachers:teacherData})
       })
   
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
    // console.log("resp",resp)
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
    console.log("resp",resp);
    
  res.render('hod/view-teachers',{hod,teachers:resp})

  })

 })
 router.get('/add-timetable',verifyLogin,(req,res)=>{
  res.render('hod/add-timetable',{hod})
 })
 router.post('/add-timetable',(req,res)=>{
  // console.log("timetable",req.body);
  hodHelpers.addTimetable(req.body).then(()=>{
    res.redirect('/hod/add-timetable')
  })
  
 })
 
router.get('/view-timetable',verifyLogin,(req,res)=>{
     hodHelpers.getTimetable().then((resp)=>{
  

// Separate data by day (Monday to Friday)
const mondayData = resp.filter(item => item.day === 'monday');
const tuesdayData = resp.filter(item => item.day === 'tuesday');
const wednesdayData = resp.filter(item => item.day === 'wednesday');
const thursdayData = resp.filter(item => item.day === 'thursday');
const fridayData = resp.filter(item => item.day === 'friday');

// Group data by year for each day
const mondayByYear = {
  firstYear: mondayData.filter(item => item.year === 1),
  secondYear: mondayData.filter(item => item.year === 2),
  thirdYear: mondayData.filter(item => item.year === 3)
};

const tuesdayByYear = {
  firstYear: tuesdayData.filter(item => item.year === 1),
  secondYear: tuesdayData.filter(item => item.year === 2),
  thirdYear: tuesdayData.filter(item => item.year === 3)
};

const wednesdayByYear = {
  firstYear: wednesdayData.filter(item => item.year === 1),
  secondYear: wednesdayData.filter(item => item.year === 2),
  thirdYear: wednesdayData.filter(item => item.year === 3)
};

const thursdayByYear = {
  firstYear: thursdayData.filter(item => item.year === 1),
  secondYear: thursdayData.filter(item => item.year === 2),
  thirdYear: thursdayData.filter(item => item.year === 3)
};

const fridayByYear = {
  firstYear: fridayData.filter(item => item.year === 1),
  secondYear: fridayData.filter(item => item.year === 2),
  thirdYear: fridayData.filter(item => item.year === 3)
};

// console.log("Monday Data by Year:", mondayByYear);
// console.log("Tuesday Data by Year:", tuesdayByYear);
// console.log("Wednesday Data by Year:", wednesdayByYear);
// console.log("Thursday Data by Year:", thursdayByYear);
// console.log("Friday Data by Year:", fridayByYear);

    // Pass the grouped data to the template
    res.render('hod/view-timetable', {
      hod,
      mondayByYear,
      tuesdayByYear,
      wednesdayByYear,
      thursdayByYear,
      fridayByYear
    });
     })
    
  })
  router.post('/manage-teacher', (req, res) => {
    const teacherManageData = req.body;  // Get all the form data
  
    // Call the helper function to manage the teacher
    hodHelpers.manageTeacher(teacherManageData)
      .then((resp) => {
        res.status(200).json({ success: true, message: 'Teacher saved successfully!' });
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: 'Failed to save teacher data', error: error });
      });
  });
  


module.exports = router;
