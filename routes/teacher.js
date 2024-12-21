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

router.get('/add-attendance', verifyLogin, (req, res) => {
  teacherHelpers.getAllStudents().then((resp) => {


    const firstYearStudents = resp.filter((item) => item.year === 1);
    const secondYearStudents = resp.filter((item) => item.year === 2);
    const thirdYearStudents = resp.filter((item) => item.year === 3);
    console.log("Fisrt", firstYearStudents);

    // Render the template and pass separated student data
    res.render('teacher/add-attendance', {
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

// 
router.post('/add-attendance', (req, res) => {


  const { attendanceDate, year, ...attendanceData } = req.body;
  // console.log("abcs",year);
  const attendanceRecords = [];

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

// router.get('/view-attendence', (req, res) => {

//  teacherHelpers.getAttedence(req.body.id)
//   res.render('teacher/view-attendence',{teacher,name:req.session.teacher.name})
// })
router.get('/view-attendance', (req, res) => {
  res.render('teacher/view-attendance')
}
);
router.post('/view-attendance', (req, res) => {
  const { year, date } = req.body; // Expecting `year` and `date` in the POST body
  console.log("Year:", year, "Date:", date);

  teacherHelpers.getAttendance(req.body).then((resp) => {
    console.log("Attendance Data:", resp);

    // Render the view with the attendance data and year
    res.render('teacher/view-attendance', { attendance: resp, year });
  }).catch((err) => {
    console.log("Error:", err);
    res.status(500).send('Server Error');
  });
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
// // Route to fetch monthly attendance for the current year, grouped by month
// router.get('/monthly-attendance', (req, res) => {
//   //const currentYear = new Date().getFullYear();  // Get current year

//   const currentYear = new Date().getFullYear();  // Get current year

//   teacherHelpers.getAttendanceByYear(currentYear)
//     .then(formattedData => {
//       // Check if formattedData is an array and contains the expected data
//       if (!Array.isArray(formattedData)) {
//         console.error('Formatted data is not an array:', formattedData);
//         return res.status(500).send('Error: Invalid data format');
//       }

//       // Log the formattedData to inspect the structure
//       console.log('Formatted Attendance Data:', formattedData);

//       // Loop through the formattedData array and log attendance details
//       formattedData.forEach(month => {
//         console.log(`Attendance for ${month.monthName}:`);
        
//         // Loop through the attendance array for each month and log student details
//         if (month.attendance && Array.isArray(month.attendance)) {
//           month.attendance.forEach(student => {
//             console.log(`Student: ${student.name}, Roll Number: ${student.id}, Status: ${student.status}`);
//           });
//         } else {
//           console.error('Attendance data for month is not an array:', month.attendance);
//         }
//       });

//       // Render the view and pass the data
//       res.render('teacher/monthly-attendance', {
//         attendanceByMonth: formattedData,
//         year: currentYear
//       });
//     })
//     .catch(err => {
//       console.log('Error fetching attendance data:', err);
//       res.status(500).send('Error fetching attendance data');
//     });
// });

router.get('/monthly-attendance', (req, res) => {
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
    res.render('teacher/monthly-attendance', {
      attendanceData: formattedData // Pass the attendance data to the view
    });
  })
  .catch(err => {
    console.log('Error fetching attendance data:', err);
    res.status(500).send('Error fetching attendance data');
  });

  // teacherHelpers.getAllAttendance()
  // .then(formattedData => {
  //   // Log the formatted data for debugging purposes
  //   console.log("Formatted Data:", formattedData);

  //   // Loop through the formattedData (year and month wise)
  //   formattedData.forEach(yearData => {
  //     console.log(`Year: ${yearData.year}`); // Access the year
    
  //     // Loop through each month within the year
  //     yearData.months.forEach(month => {
  //       console.log(`Month: ${month.monthName} (${month.monthNumber})`); // Access the month name and number
    
  //       // Loop through attendance for each student in the month
  //       month.attendance.forEach(student => {
  //         console.log(`Student: ${student.name}, Roll Number: ${student.id}, Status: ${student.status}`);
  //       });
  //     });
  //   });

  //   // After separating the data and debugging, pass it to the view for rendering
  //   res.render('teacher/monthly-attendance', {
  //     attendanceData: formattedData // Pass the attendance data to the view
  //   });
  // })
  // .catch(err => {
  //   console.log('Error fetching attendance data:', err);
  //   res.status(500).send('Error fetching attendance data');
  // });


});




module.exports = router;
