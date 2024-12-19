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
  res.render('teacher/dashboard', { title: 'SASC', teacher, name: req.session.teacher.name });
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


      // console.log("teacher logged" ,resp.data  );
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
  // console.log(req.body);
  teacherHelpers.doSignup(req.body).then(() => {
    res.render('teacher/login')
  })
})
// 
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/teacher')
})

router.get('/add-attendence', verifyLogin, (req, res) => {
  teacherHelpers.getAllStudents().then((resp) => {
// req.session.firstYearStudents=resp.filter((item) => item.year === 1);
// req.session.secondYearStudents=resp.filter((item) => item.year === 2);
// req.session.thirdYearStudents=resp.filter((item) => item.year === 3);

    const firstYearStudents = resp.filter((item) => item.year === 1);
    const secondYearStudents = resp.filter((item) => item.year === 2);
    const thirdYearStudents = resp.filter((item) => item.year === 3);

    // Render the template and pass separated student data
    res.render('teacher/add-attendence', {
      teacher,
      name: req.session.teacher.name,
      firstYearStudents,
      secondYearStudents,
      thirdYearStudents,
    });
  }).catch((err) => {
    console.error("Error fetching students:", err);
    res.status(500).send("Error fetching students");
  });

});
router.post('/add-attendence', (req, res) => {
  const { attendanceDate, ...attendanceData } = req.body;
  
  
   const attendanceRecords = [];

  // Prepare attendance records
  for (let key in attendanceData) {
    if (attendanceData.hasOwnProperty(key)) {
      const studentId = key.match(/\d+/)[0];
      const status = attendanceData[key]; // 'Present' or 'Absent'
      attendanceRecords.push({ studentId, status, attendanceDate });
    }
    // console.log(attendanceRecords);
    
  }

  // Save attendance to the database
  teacherHelpers.saveAttendance(attendanceRecords)
    .then(() => {
      res.send("Attendance saved successfully");
    })
    .catch((err) => {
      res.status(500).send("Error saving attendance: " + err.message);
    });
});



router.get('/view-attendence', (req, res) => {
  res.render('teacher/view-attendence', { teacher, name: req.session.teacher.name })
})




module.exports = router;
