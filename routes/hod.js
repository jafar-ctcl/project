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

  hodHelpers.getAllStudents().then((resp) => {
    const students = resp
    hodHelpers.getAllTeachers().then((resp) => {
      req.session.teacherData = resp
      const teachers = resp
      //  console.log(req.session.teacherData);

      // Render the dashboard once both promises are resolved
      res.render('hod/dashboard', {

        hod,
        students,
        teachers
      });

    })
  })


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
router.get('/add-timetable', verifyLogin, (req, res) => {


  hodHelpers.getAllTeachers().then((resp) => {
    // console.log("add time resp",resp);



    const teachersInfo = resp.map((teacher) => ({
      name: teacher.name,
      subjects: teacher.subjects// Split subjects into an array
    }));
    // console.log("teachersInfo:",teachersInfo);
    // Pass teachersInfo directly to the Handlebars template
    res.render('hod/add-timetable', {
      hod,
      teachersInfo: teachersInfo // Pass teachers data to the template
    });
  });
});
router.post('/add-timetable', (req, res) => {
  
  hodHelpers.addTimetable(req.body).then((resp) => {
   
   

    // Redirect to the same page (or a different page if needed)
    res.redirect('/hod/add-timetable',);
  }).catch((err) => {
    console.error("Error:", err);
    res.status(500).send("Error inserting timetable data");
  });
});


  // router.post('/add-timetable', (req, res) => {
  //   // console.log("timetable",req.body);
  //   hodHelpers.addTimetable(req.body).then(() => {
  //     res.redirect('/hod/add-timetable')
  //   })

  // })

  router.get('/view-timetable', verifyLogin, (req, res) => {
    hodHelpers.getTimetable().then((resp) => {


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
  // router.post('/manage-teacher', (req, res) => {
  //   console.log("...........", req.body);

  //   const teacherManageData = req.body;  // Get all the form data

  //   // Call the helper function to manage the teacher
  //   hodHelpers.manageTeacher(teacherManageData)
  //     .then((resp) => {
  //       res.status(200).json({ success: true, message: 'Teacher saved successfully!' });
  //     })
  //     .catch((error) => {
  //       res.status(500).json({ success: false, message: 'Failed to save teacher data', error: error });
  //     });
  // });
  router.get('/manage-teacher/:name/:email', verifyLogin, (req, res) => {
    const { name, email } = req.params; // Destructure name and email from params

    // Pass the data as an object under teacherData
    res.render('hod/manage-teacher', { teacherData: { name, email } });
  });
  router.post('/manage-teacher', (req, res) => {
    console.log(req.body);

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


  router.get('/view-managed-teacher/:email', verifyLogin, (req, res) => {
    // console.log("teacher email", req.session.teacherData[0].email);
    console.log(req.params);

    let { email } = req.params
    hodHelpers.viewManagedTeacher(email).then((resp) => {
      // console.log("response", resp);

      let teacherData = resp[0];
      // console.log("Subjects:", resp[0].subjects);

      // Pass teacherData and subjects to the view
      let subjects = resp[0].subjects.split(",").map(subject => subject.trim()); // Convert subjects to array if it's a comma-separated string
      res.render('hod/view-managed-teacher', { teacherData, subjects });
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



  router.get('/add-event', (req, res) => {
    res.render('hod/add-event', { hod })
  })

  router.get('/view-event', (req, res) => {
    res.render('hod/view-event', { hod })
  })
  router.get('/view-mark', (req, res) => {
    res.render('hod/view-mark')
  })
  

  module.exports = router;
