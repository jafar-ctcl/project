var express = require('express');
const studentHelpers = require('../helpers/studentHelpers');
const session = require('express-session');
const { log } = require('handlebars');
var router = express.Router();
var student = true
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn == true) {
    next()
  } else {

    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'SASC' });
});
router.get('/student', verifyLogin, (req, res) => {
  let name = req.session.student.name
  //console.log(name);

  res.render('student/dashboard', { student, name });
});
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/login')
  } else {
    res.render('student/login', { title: 'Student', err: req.session.loginErr });
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
      // console.log("name", resp.data.name);


      res.redirect('/student')
    }
  })
})
router.get('/signup', (req, res) => {
  res.render('student/signup')
})
router.post('/signup', (req, res) => {
  //console.log(req.body);
  studentHelpers.doSignup(req.body).then(() => {
    res.redirect('/login'); // Redirect to the login page on success
  })
    .catch((error) => {
      console.error('Signup error:', error);
      console.log("error", error.message);

      // Render the signup page with the error message
      res.render('student/signup', { error: error.message });
    });
});
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/student')
})
router.get('/student', verifyLogin, (req, res) => {
  // console.log(req.session.student[0]);
  let name = req.session.student.name
  res.render('student/dashboard', { name })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get("/timetable", verifyLogin, (req, res) => {
  // Get course and semester from session
  let course = req.session.student.course;
  let semester = req.session.student.semester;

  // Call getTimetable function with course and semester
  studentHelpers.getTimetable(course, semester)
      .then((timetableData) => {
          // Extract times and timetable from the resolved data
          const { times, timetable } = timetableData;

          // Render the timetable view with times and timetable data
          res.render("student/view-timetable", {
              times: times,
              timetable: timetable
          });
      })
      .catch((err) => {
          // Handle errors if any
          console.error("Error fetching timetable:", err);
          res.status(500).send("Internal Server Error");
      });
});
router.get('/attendance',verifyLogin, (req, res) => {
  const email = req.session.student.email; // Assuming you store the student's email in session
// console.log("email",email);

  studentHelpers.getAttendance(email).then((attendanceRecords) => {
    if (attendanceRecords.length > 0) {
      // console.log("attemda",attendanceRecords);
      
      res.render('student/attendance', { attendance: attendanceRecords });
    } else {
      res.render('student/attendance', { attendance: [], errorMessage: 'No attendance records found for this student.' });
    }
  }).catch((err) => {
    console.log(err);
    res.render('student/attendance', { errorMessage: 'There was an error fetching the attendance records.' });
  });
});
router.post('/attendance-reason', (req, res) => {
  const { email, date, reason } = req.body;

  // Ensure that all necessary fields are present
  if (!email || !date || !reason) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  studentHelpers.updateAttendanceReason(email, date, reason)
    .then((result) => {
      // Send success response
      res.json({ success: true, message: 'Attendance reason updated successfully' });
    })
    .catch((err) => {
      // Send error response
      console.error('Error updating reason:', err);
      res.status(500).json({ success: false, message: 'Failed to update attendance reason' });
    });
});






module.exports = router;
