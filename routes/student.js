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
router.get('/attendance', verifyLogin, (req, res) => {
  const email = req.session.student.email; // Get student email from session

  studentHelpers.getAttendance(email)
    .then(({ attendanceByMonth, attendancePercentage }) => {
      if (Object.keys(attendanceByMonth).length > 0) {
        res.render('student/attendance', { attendanceByMonth, attendancePercentage });
      } else {
        res.render('student/attendance', { attendanceByMonth: {}, attendancePercentage: 0, errorMessage: 'No attendance records found.' });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render('student/attendance', { attendanceByMonth: {}, attendancePercentage: 0, errorMessage: 'Error fetching attendance records.' });
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
router.get('/month-attendance', verifyLogin, (req, res) => {
  const email = req.session.student.email; // Get student email from session

  studentHelpers.getAllMonthAttendance(email).then(({ months }) => {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1); // Create an array of days (1 to 31)
    console.log(months);  // Log the months data

    // Process each month
    months.forEach((month) => {
      // Map the attendance status to the required symbols
      month.attendance = month.attendance.map(status => {
        if (status === 'present') return '✖';  // Replace 'present' with ✖
        if (status === 'absent') return 'A';   // Replace 'absent' with A
        if (status === 'half') return '/';     // Replace 'half' with /
        return '-';                             // Replace null/undefined with -
      });
    });

    // Render the page with the processed months data
    res.render('student/month-attendance', { months, daysInMonth });
  }).catch(err => {
    console.error("Error fetching attendance data:", err);
    res.render('student/month-attendance', { months: [], daysInMonth: [] });
  });
});

router.get("/view-marks", (req, res) => {
  const email = req.session.student.email; // Get the logged-in student's email from the session
  studentHelpers.getMarks(email)
    .then((marks) => {
      res.render("student/view-marks", { marks }); // Pass the marks data to the HBS template
    })
    .catch((err) => {
      console.error("Error fetching marks:", err);
      res.status(500).send("Error fetching marks");
    });
});


router.get('/view-event', (req, res) => {
  // Fetch event data from the database or any other source
  studentHelpers.getEvents().then((events) => {
    // Pass the event data to the Handlebars view
    res.render('student/view-event', { events });
  }).catch((err) => {
    console.error("Error fetching events:", err);
    res.status(500).send("Error fetching events.");
  });
});

router.get("/view-winners/:title/:date", verifyLogin, (req, res) => {
  const { title, date } = req.params;

  studentHelpers.getWinners(title, date).then((winners) => {
    console.log("winners", winners);

    if (winners.length > 0) {
      res.render("student/view-winners", { event: winners[0] }); // Pass only the first event object
    } else {
      res.render("student/view-winners", { event: null }); // Handle no data case
    }
  }).catch((error) => {
    console.error("Error fetching winners:", error);
    res.status(500).send("Server Error");
  });
});
module.exports = router;
