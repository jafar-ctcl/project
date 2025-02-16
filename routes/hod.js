var express = require('express');
var router = express.Router();
const hodHelpers = require('../helpers/hodHelpers');
const { log } = require('handlebars');
const teacherHelpers = require('../helpers/teacherHelpers');

var hod = true

const verifyLogin = (req, res, next) => {
  if (req.session.hodLoggedIn) {
    next()
  } else {
    res.redirect('/hod/login')
  }
}
router.get('/', verifyLogin, async (req, res) => {

  // // Wait for both promises to resolve
  // const [students, teachers] = await Promise.all([
  //   hodHelpers.getApprovedStudents(),
  //   hodHelpers.getAllTeachers()
  // ]);
  // console.log("teachers", teachers);
  let students = await hodHelpers.getAllStudents()
  let teachers = await hodHelpers.getAllTeachers()

  res.render('hod/dashboard', {

    hod,
    students,
    teachers
  });

});

router.get('/login', (req, res) => {
  if (req.session.hodLoggedIn) {
    res.redirect('/hod/dashboard')
  } else {

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
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/hod')
})

router.get('/approve-students', verifyLogin, (req, res) => {
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
router.get('/view-students', verifyLogin, (req, res) => {

  hodHelpers.getApprovedStudents().then((resp) => {
    // console.log(resp);
    res.render('hod/view-students', { hod, students: resp })
  })
})
router.get('/approve-teacher', verifyLogin, (req, res) => {
  // res.render('hod/approve-teacher',{hod})
  hodHelpers.getTeacher().then((resp) => {


    res.render('hod/approve-teacher', { hod, teachers: resp })

  })
})
router.get('/teacher-change-status/:email/:status', verifyLogin, (req, res) => {
  hodHelpers.changeTeacherStatus(req.params).then(() => {
    res.redirect('/hod/approve-teacher')
  })
})
router.get('/view-teachers', verifyLogin, (req, res) => {
  hodHelpers.getAllTeachers().then((resp) => {

    res.render('hod/view-teachers', { hod, teachers: resp })

  })

})
// router.get('/set-timetable',async (req, res) => {
//   let period = await hodHelpers.getPeriod()
//   //  console.log("period",period);

//    hodHelpers.getTimetableData()
//      .then(({ courses, classTeachers }) => {
//        // console.log("Class Teachers:", classTeachers);
//        // console.log("Courses:", courses);

//        res.render('hod/set-timetable', {
//          hod,    
//          period,         // Assuming 'hod' is available in the scope
//          courses,         // Pass unique courses
//          classTeachers    // Pass class teachers
//        });
//      })
//      .catch((error) => {
//        console.error("Error fetching timetable data:", error);
//        res.status(500).send("An error occurred while fetching timetable data.");
//      });
//  });
router.post('/set-timetable', (req, res) => {
  const periods = req.body.periods; // Period data sent from the client
  console.log('Received periods data:', periods);

  hodHelpers.setTimetable(periods)
    .then((response) => {
      console.log(response.message);

      // Respond with a success message and flag (for AJAX)
      res.json({
        success: true,
        message: 'Periods saved successfully!',
      });
    })
    .catch((error) => {
      console.error('Error saving periods:', error);

      // Respond with failure (for AJAX)
      res.status(500).json({
        success: false,
        message: 'Failed to save periods. Please try again.',
      });
    });
});


router.get('/add-timetable', verifyLogin, async (req, res) => {
  let period = await hodHelpers.getPeriod()
  // console.log("periods", period);

  hodHelpers.getTimetableData().then(({ teachersInfo, courses, classTeachers }) => {


    res.render('hod/add-timetable', {
      hod,
      period,
      teachersInfo,   // Pass teacher names and subjects
      courses,        // Pass unique courses
      classTeachers,  // Pass unique class teachers
    });
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
});
router.post('/add-timetable', async (req, res) => {
  const timetableData = req.body;
  // addTimetable(timetableData)
  const { course, semester, day } = req.body;
  // console.log(timetableData);
  let period = await hodHelpers.getPeriod()
  let { teachersInfo, courses, classTeachers } = await hodHelpers.getTimetableData()
  hodHelpers
    .addTimetable(course, semester, day)
    .then((resp) => {
      // res.redirect('/hod/add-timetable');
      console.log("resp",resp);
      
      if (resp.success) {
        res.render('hod/create-timetable', {
          hod, period, teachersInfo,   // Pass teacher names and subjects
          courses,        // Pass unique courses
          classTeachers,
          course, semester, day
        })
      } else {
        
        res.render('hod/add-timetable', {
          hod: true,
          errorMessage:resp.message, // Pass the error message
        });
        
      }
    })
    .catch((error) => {
      // console.error('Error:', error.message);

      // General error handling
      res.render('hod/add-timetable', {
        hod: true,
        errorMessage: error.message, // Pass the error message
      });

    });
});
router.get('/create-timetable', verifyLogin, async (req, res) => {
  let period = await hodHelpers.getPeriod()
  let { teachersInfo, courses, classTeachers } = await hodHelpers.getTimetableData()
  res.render('hod/create-timetable', {
    hod, period, teachersInfo,   // Pass teacher names and subjects
    courses,        // Pass unique courses
    classTeachers,
  })
})
router.post('/create-timetable',(req,res)=>{
  const timetableData = req.body;
  console.log("timetabledata",req.body);
  hodHelpers.createTimetable(timetableData).then((resp)=>{
    console.log("after create post method");
    
    res.redirect('/hod/add-timetable')
  })
})
router.get('/view-timetable', verifyLogin, async (req, res) => {
  let teacherData = await hodHelpers.getTimetableData()
  // console.log("teacherData",teacherData.teachersInfo);


  hodHelpers.getTimetable().then((timetableData) => {
    // Pass the grouped data to the view
    res.render('hod/view-timetable', { timetable: timetableData, teachersInfo: teacherData.teachersInfo });
  }).catch(err => {
    console.error(err);
    res.status(500).send('Error fetching timetable data');
  });
});



// Handle POST request for editing timetable
router.post('/edit-timetable', (req, res) => {
  console.log("Edit Timetable Data:", req.body);

  // Destructure data from the request body
  // const { time, teacher, subject, day, course, semester } = req.body;

  // Call the editTimetable method
  hodHelpers
    .editTimetable(req.body)
    .then((response) => {
      // Send success message back to the client
      res.redirect('/hod/view-timetable')
    })
    .catch((error) => {
      console.error("Error updating timetable:", error);
      // Send error message back to the client
      res.status(500).json({ message: "Failed to update timetable.", error });
    });
});

// Route to render the semester timetable
router.get('/semester-timetable', verifyLogin, async (req, res) => {
  let teacherData = await hodHelpers.getTimetableData()

  hodHelpers
    .getSemTimetable()  // Fetch the timetable data from the helper
    .then((timetableData) => {
      // console.log("timetableData", timetableData);

      // Deconstruct the timetable data to pass to the view
      const { days, times, timetable } = timetableData;

      // Render the view and pass timetableData to the template
      res.render('hod/semester-timetable', {
        days,        // Array of days (e.g., Monday, Tuesday)
        times,       // Array of time slots (e.g., "09:30 AM - 10:30 AM")
        timetable, //The full timetable data with semester and course info
        teachersInfo: teacherData.teachersInfo
      });
    })
    .catch((err) => {
      console.error('Error fetching timetable data:', err);
      res.status(500).send('Error fetching timetable data');
    });
});
router.post('/edit-semester-timetable', (req, res) => {
  console.log("Edit semester Timetable Data:", req.body);

  // Destructure data from the request body
  // const { time, teacher, subject, day, course, semester } = req.body;

  // Call the editTimetable method
  hodHelpers
    .editTimetable(req.body)
    .then((response) => {
      // Send success message back to the client
      res.redirect('/hod/semester-timetable')
    })
    .catch((error) => {
      console.error("Error updating timetable:", error);
      // Send error message back to the client
      res.status(500).json({ message: "Failed to update timetable.", error });
    });
});


router.get('/manage-teacher/:name/:email', verifyLogin, (req, res) => {
  const { name, email } = req.params; // Destructure name and email from params

  // Pass the data as an object under teacherData
  res.render('hod/manage-teacher', { teacherData: { name, email } });
});
router.post('/manage-teacher', (req, res) => {
  console.log("manage teachers", req.body);

  const teacherManageData = req.body; // Get data from form submission

  hodHelpers.manageTeacher(teacherManageData)
    .then((result) => {
      // console.log(result);

      // If the teacher is updated successfully, redirect or show success message
      res.redirect('/hod/view-teachers');
    })
    .catch((error) => {
      // If teacher already exists, show error message
      res.render('hod/manage-teacher', {
        errorMessage: error.message,
        teacherData: teacherManageData
      });
    });
});


router.get('/view-managed-teacher/:email', verifyLogin, async (req, res) => {
  // console.log("teacher email", req.session.teacherData[0].email);
  // console.log(req.params);
  let { email } = req.params
  let timetableData = await hodHelpers.getTeacherTimetable(email)
  const { days, times, timetable } = timetableData
  console.log("teacher timetable", timetableData);

  hodHelpers.viewManagedTeacher(email).then((resp) => {
    let teacherData = resp[0];
    // Pass teacherData and subjects to the view
    let subjects = resp[0].subjects.split(",").map(subject => subject.trim()); // Convert subjects to array if it's a comma-separated string
    res.render('hod/view-managed-teacher', { teacherData, subjects, timetable: timetableData ,days, times, timetable });
  });
});

router.post('/edit-teacher', (req, res) => {
  console.log(req.body);
  const teacherManageData = req.body; // Get data from form submission

  hodHelpers.updateTeacher(teacherManageData)
    .then((result) => {
      // If the teacher is updated successfully, send a success response
      res.json({ success: true });
    })
    .catch((error) => {
      // If an error occurs, send an error response with the error message
      res.status(500).json({ success: false, message: error.message });
    });
});
router.get('/view-all-teachers', verifyLogin, (req, res) => {
  hodHelpers.viewAllManagedTeachers().then((teachers) => {
    // console.log("Managed Teachers:", teachers); // Debugging log

    // Pass the full list of managed teachers to the view
    res.render('hod/view-all-teachers', { teachers });
  }).catch((err) => {
    console.log("Error fetching managed teachers:", err);
    res.status(500).send('Error fetching teachers data');
  });
});



router.get('/view-mark', (req, res) => {
  res.render('hod/view-mark')
})
router.get('/about-student/:email', async (req, res) => {
  try {
    console.log("Fetching details for student with email:", req.params.email);
    const email = req.params.email; // Get the email from the route parameter

    // Fetch marks and attendance data for the student
    let marks = await hodHelpers.getStdentMarks(email);
    let { attendanceByMonth, attendancePercentages, overallPercentage } = await hodHelpers.getStudentAttendance(email);

    // Render the view with the fetched data
    res.render('hod/about-student', {
      title: "About Student",
      marks,
      attendanceByMonth,
      attendancePercentages,  // Pass monthly percentages
      overallPercentage,      // Pass overall attendance percentage
      // Pass the condonation status (true/false)
    });

  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).send("An error occurred while fetching student details.");
  }
});

router.get('/add-event',verifyLogin, (req, res) => {
  res.render('hod/add-event', { hod })
})
router.post('/add-event', (req, res) => {
  // Log the request body to verify the data
  console.log("Event data:", req.body);
  // Call the addEvent function from your helpers
  hodHelpers.addEvent(req.body).then((resp) => {
    res.redirect('/hod/view-event')


  }).catch((err) => {
    // Error case: Send a failure response with the error message
    console.error("Error adding event:", err);

  });
});

router.get('/view-event',verifyLogin, (req, res) => {
  // Fetch event data from the database or any other source
  hodHelpers.getEvents().then((events) => {
    // Pass the event data to the Handlebars view
    res.render('hod/view-event', { events });
  }).catch((err) => {
    console.error("Error fetching events:", err);
    res.status(500).send("Error fetching events.");
  });
});

router.get('/add-winners/:title/:date', verifyLogin, (req, res) => {
  const { title, date } = req.params
  console.log("title", title, date);

  res.render('hod/add-winners', { title, date })
})
router.get("/view-winners/:title/:date", verifyLogin, (req, res) => {
  const { title, date } = req.params;

  hodHelpers.getWinners(title, date).then((winners) => {
    console.log("winners", winners);

    if (winners.length > 0) {
      res.render("hod/view-winners", { event: winners[0] }); // Pass only the first event object
    } else {
      res.render("hod/view-winners", { event: null }); // Handle no data case
    }
  }).catch((error) => {
    console.error("Error fetching winners:", error);
    res.status(500).send("Server Error");
  });
});

router.post('/add-winners', (req, res) => {
  // console.log("Received Data:", req.body);

  let { date, title, first, second, third } = req.body;


  hodHelpers.addWinners({ date, title, first, second, third }).then(() => {
    res.redirect('/hod/view-event')

  }).catch(err => {
    console.error("Error adding winners:", err);
    res.status(500).send("Error saving winners");
  });
});

router.get('/add-noticeboard',(req,res)=>{
  res.render('hod/add-noticeboard')
})
router.post('/add-noticeboard',(req,res)=>{
  console.log("add notice",req.body);
  
})

module.exports = router;


