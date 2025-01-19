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
 let  email = req.session.teacher.email
  teacherHelpers.getTeacher(email).then((resp)=>{
    req.session.teacherData = resp[0]
// console.log("teaches", req.session.teacherData);

  
res.render('teacher/dashboard', { title: 'SASC', teacher, name: req.session.teacherData.name });
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
  // Destructure necessary data from the request body
  const { name, email, password, phone, gender } = req.body;

  // Input validation (optional but recommended)
  if (!name || !email || !password || !phone || !gender) {
      return res.status(400).render('teacher/signup', {
          errorMessage: 'Please fill out all required fields.'
      });
  }

  // Call the signup helper function
  teacherHelpers.doSignup(req.body)
      .then(() => {
          // Successful signup, redirect to login page
          res.render('teacher/login', {
              successMessage: 'Sign up successful! Please log in.'
          });
      })
      .catch((err) => {
          // Handle errors during signup
          console.error("Error during signup:", err);
          res.status(500).render('teacher/signup', {
              errorMessage: 'An error occurred during signup. Please try again later.'
          });
      });
});

// 
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/teacher')
})
router.get('/students',verifyLogin,(req,res)=>{
  const teacherData = req.session.teacherData;

  // console.log("Session teacherData:", teacherData);
  
  let sem = req.session.teacherData.class_teacher
  let course = req.session.teacherData.course
  
  //console.log("studens year",sem);
  
  teacherHelpers.getStudents(sem,course).then((resp)=>{
    res.render('teacher/students',{teacher,name:req.session.teacherData.name,students:resp})
  })
})
router.get('/add-attendance', verifyLogin, (req, res) => {
 //  console.log(req.session.teacherData);
 let sem = req.session.teacherData.class_teacher
 let course = req.session.teacherData.course
 //console.log("req.session",sem,course);
 
  teacherHelpers.getStudents(sem,course).then((resp) => {

 //console.log("studetns",resp);
 let students = resp

    // Render the template and pass separated student data
    res.render('teacher/add-attendance', {
      teacher,
      name: req.session.teacher.name,
      sem,
      course,
      students,
      // firstYearStudents,
      // secondYearStudents,
      // thirdYearStudents,
    });
  }).catch((err) => {
    console.error("Error fetching students:", err);
    res.status(500
).send("Error fetching students");
  });
});

router.post('/add-attendance', (req, res) => {
  // console.log(req.body);
  
  const { attendanceDate, sem,course, ...attendanceData } = req.body;

  const attendanceRecords = [];
  for (let key in attendanceData) {
    if (attendanceData.hasOwnProperty(key)) {
      const studentId = key.match(/\d+/)[0];
      const [status, name] = attendanceData[key].split('|');
      attendanceRecords.push({ name, sem,course, status, attendanceDate });
    }
  }
console.log(attendanceRecords);

  teacherHelpers
    .saveAttendance(attendanceRecords)
    .then(() => {
      res.redirect('/teacher/view-attendance');
    })
    .catch((err) => {
      res.render('teacher/add-attendance', {
        errorMessage: err.message, // Pass the error message to the template
        sem,
        course,
        students: req.body.students, // Pass existing data back to the template
      });
    });
});

router.get('/view-attendance',verifyLogin, (req, res) => {
  const sem = req.session.teacherData.class_teacher
  const course = req.session.teacherData.course
  //console.log(course);
  
  // Fetch the last added attendance using the helper function
  teacherHelpers.getLastAttendance(sem,course).then((attendanceRecords) => {
    // Render the view with the attendance records for the last day
    res.render('teacher/view-attendance', { teacher,name:req.session.teacher.name,attendance: attendanceRecords });
  })
      // res.render('teacher/view-attendance',{teacher,name:req.session.teacher.name});

});


router.post('/view-attendance',verifyLogin, (req, res) => {
  const sem = req.session.teacherData.class_teacher
  const course = req.session.teacherData.course

  const { date } = req.body; // Expecting `year` and `date` in the POST body
  // console.log("Year:", year, "Date:", date);

  teacherHelpers.getAttendance(date,sem,course).then((resp) => {
    // console.log("Attendance Data:", resp);

    // Render the view with the attendance data and year
    res.render('teacher/view-attendance', {attendance: resp, sem,teacher,name:req.session.teacherData.name});
  })
});
router.post('/edit-attendance/:id', (req, res) => {
  const { id } = req.params; // Get the student ID from the URL
  const { status } = req.body; // Get the updated status from the body

  // Prepare the data to send to the helper function
  const updData = { id, status };

  // Call the updateAttendence helper
  teacherHelpers.updateAttendence(updData)
    .then((response) => {
      // Successfully updated attendance, send the response to the client
      res.json(response); // Respond with success message
    })
    .catch((err) => {
      // Handle any errors and send the response
      res.status(500).json(err); // Respond with error message
    });
});

router.get('/monthly-attendance', verifyLogin, (req, res) => {
  const sem = req.session.teacherData.class_teacher;
  const course = req.session.teacherData.course;
  const date = new Date();
  const monthNumber = date.getMonth() + 1; // Get current month number (1-12)
  const year = date.getFullYear(); // Get current year
//  console.log("course",course);
 
  teacherHelpers.getAvailableYears(sem,course) // Fetch the available years
    .then((availableYears) => {
      teacherHelpers.getMonthAttendance(monthNumber, year, sem,course)
        .then((data) => {
          const students = data.students; // Data returned by the helper function
          const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1); // Days of the month (1-31)

          // Preprocess attendance data
          students.forEach(student => {
            student.attendance = student.attendance.map(status => {
              if (status === 'present') return '✔';  // Replace 'present' with ✔
              if (status === 'absent') return '✖';   // Replace 'absent' with ✖
              return '-';                             // Replace null/undefined with -
            });
          });

          // Render the attendance page with the required data
          res.render('teacher/monthly-attendance', {
            name: req.session.teacherData.name,
            monthName: date.toLocaleString('default', { month: 'long' }),
            year,
            students,
            daysInMonth,
            availableYears, // Pass available years to the view
          });
        })
        .catch((err) => {
          console.error('Error fetching attendance:', err);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch((err) => {
      console.error('Error fetching available years:', err);
      res.status(500).send('Internal Server Error');
    });
});

router.post('/monthly-attendance', (req, res) => {
  const stdYear = req.session.teacherData.class_teacher;
  const course = req.session.teacherData.course
  const { year, month } = req.body;

  // Log input data
  // console.log("POST Parameters:", { year, month, stdYear,course });
  teacherHelpers.getAvailableYears(stdYear,course) // Fetch the available years
  .then((availableYears) => {
  teacherHelpers.getMonthAttendance(month, year, stdYear,course)
    .then((data) => {
      const students = data.students;
      // console.log("Fetched Students:", students); // Debug log

      const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

      // Preprocess attendance data
      students.forEach(student => {
        student.attendance = student.attendance.map(status => {
          if (status === 'present') return '✔';
          if (status === 'absent') return '✖';
          return '-';
        });
      });

      // Render with fetched data
      res.render('teacher/monthly-attendance', {
        name: req.session.teacherData.name,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        year,
        students,
        daysInMonth,
        availableYears, 
      });
    })
    .catch((err) => {
      console.error("Error fetching attendance:", err);
      res.status(500).send('Internal Server Error');
      });
    })
});

router.get('/students-list', verifyLogin,(req, res) => {
  const email = req.session.teacherData.email
  teacherHelpers.getTeacherData(email) // Assuming user email is stored in session
    .then((resp) => {
      const { course, semester, subject } = resp;
      
      // Pass the data to the view
      res.render('teacher/students-list', {
        teacher,
        name:req.session.teacherData.name,
        courses: course,
        semesters: semester,
        subjects: subject
      });
    })
    .catch(err => {
      console.error("Error fetching teacher data", err);
      res.status(500).send('Error fetching teacher data');
    });
});
// Route to fetch students based on selected course and semester and render the marks page
router.post('/students-list', (req, res) => {
  // console.log("Teacher marks request:", req.body);

  let { course, semester, subject} = req.body;
console.log("subjects",subject);

  // Fetch students based on course and semester
  teacherHelpers.getStudents(semester,course).then((students) => {
    // console.log("Fetched students:", students);

    // Render the add-mark page with course, semester, subjects, and students data
    res.render('teacher/add-mark', {
      teacher,
      name:req.session.teacherData.name,
      course,
      semester,
      subject,
      students
    });
  }).catch((err) => {
    console.error("Error fetching students:", err);
    res.status(500).send("Error fetching students");
  });
});
// GET route to view marks
// GET route to view marks grouped by course
router.get('/view-marks',verifyLogin, (req, res) => {
  teacherHelpers.getMarks().then((marks) => {
    // Group marks by course
    const groupedMarks = marks.reduce((acc, mark) => {
      if (!acc[mark.course]) {
        acc[mark.course] = [];
      }
      acc[mark.course].push(mark);
      return acc;
    }, {});

    // Render the marks with the grouped data
    res.render('teacher/view-marks', { teacher,groupedMarks: groupedMarks });
  }).catch((err) => {
    console.error(err);
    res.status(500).send("Error fetching marks");
  });
});


// Route to render the add-mark page initially (if needed)
router.get('/add-mark',verifyLogin, (req, res) => {
  res.render('teacher/add-mark',{teacher,name:req.session.teacherData.name});
});
router.post('/add-mark', (req, res) => {
  console.log("mark dtls", req.body);

  teacherHelpers.addMark(req.body)
    .then((resp) => {
      // After success, redirect to the view marks page
      res.redirect('/teacher/view-marks');
    })
    .catch((err) => {
      console.error(err);

      // Render the add-mark page with the error message and retry option
      res.render('teacher/add-mark', {
        errorMessage: 'An error occurred while adding marks. Please check the data and try again.',
        teacher,
        name:req.session.teacherData.name,
      });
    });
});






module.exports = router;
