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
//  console.log("teaches", req.session.teacherData.name);

  
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

router.get('/add-attendance', verifyLogin, (req, res) => {
  console.log(req.session.teacherData.class_teacher);
 let year = req.session.teacherData.class_teacher
  teacherHelpers.getStudents(year).then((resp) => {

 console.log("studetns",resp);
 let students = resp
    // const firstYearStudents = resp.filter((item) => item.year === 1);
    // const secondYearStudents = resp.filter((item) => item.year === 2);
    // const thirdYearStudents = resp.filter((item) => item.year === 3);
    // console.log("Fisrt", firstYearStudents);

    // Render the template and pass separated student data
    res.render('teacher/add-attendance', {
      teacher,
      name: req.session.teacher.name,
      year,
      students,
      // firstYearStudents,
      // secondYearStudents,
      // thirdYearStudents,
    });
  }).catch((err) => {
    console.error("Error fetching students:", err);
    res.status(500).send("Error fetching students");
  });

});

// 
router.post('/add-attendance', (req, res) => {

  const { attendanceDate, year, ...attendanceData } = req.body;
  // console.log("abcs",year);
  const attendanceRecords = [];
console.log("req",req.body);

  // Prepare attendance records
  for (let key in attendanceData) {
    if (attendanceData.hasOwnProperty(key)) {
      const studentId = key.match(/\d+/)[0]; // Extract the numeric part of the key
      const [status, name] = attendanceData[key].split('|'); // Split value into status and name
      attendanceRecords.push({ name, year, status, attendanceDate });
    
      
    }
  }

  // Save attendance to the database
  teacherHelpers.saveAttendance(attendanceRecords)
    .then(() => {
      res.redirect('/teacher');
    })
    .catch((err) => {
      res.status(500).send("Error saving attendance: " + err.message);
    });
});

router.get('/view-attendance',verifyLogin, (req, res) => {
  // Fetch the last added attendance using the helper function
  teacherHelpers.getLastAttendance().then((attendanceRecords) => {
    // Render the view with the attendance records for the last day
    res.render('teacher/view-attendance', { teacher,name:req.session.teacher.name,attendance: attendanceRecords });
  })
      // res.render('teacher/view-attendance',{teacher,name:req.session.teacher.name});

});


router.post('/view-attendance',verifyLogin, (req, res) => {
  const { year, date } = req.body; // Expecting `year` and `date` in the POST body
  // console.log("Year:", year, "Date:", date);

  teacherHelpers.getAttendance(req.body).then((resp) => {
    // console.log("Attendance Data:", resp);

    // Render the view with the attendance data and year
    res.render('teacher/view-attendance', {attendance: resp, year});
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


router.get('/year-attendance', (req, res) => {
  teacherHelpers.getAllAttendance()
  .then(formattedData => {
    // Log the formatted data for debugging purposes
    console.log("Formatted Data:", formattedData);

    // Add the first date of each year to the formattedData
    formattedData.forEach(yearData => {
      // Find the first date of attendance for that year
      const firstAttendanceDate = new Date(yearData.months[0].attendance[0].date); // Assuming attendance has a date field
      yearData.firstDate = firstAttendanceDate.toLocaleDateString(); // Format the date
    });

    // Send the separated data to the view
    res.render('teacher/year-attendance', {
      attendanceData: formattedData // Pass the attendance data to the view
    });
  })
  .catch(err => {
    console.log('Error fetching attendance data:', err);
    res.status(500).send('Error fetching attendance data');
  });

});
router.get('/monthly-attendance',verifyLogin, (req, res) => {
  const stdYear = req.session.teacherData.class_teacher;
  const date = new Date();
  const monthNumber = date.getMonth() + 1; // Get current month number (1-12)
  const year = date.getFullYear(); // Get current year

  teacherHelpers.getMonthAttendance(monthNumber, year,stdYear)
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
      name:req.session.teacher.name,
      monthName: date.toLocaleString('default', { month: 'long' }),
      year,
      students,
      daysInMonth,
    });
  })
  .catch((err) => {
    console.error('Error fetching attendance:', err);
    res.status(500).send('Internal Server Error');
  });

});



  











module.exports = router;
