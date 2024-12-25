const { log } = require("handlebars");
const db = require("../config/connection")

module.exports = {

    doLogin: (loginData) => {

        // const email = loginData.Email
        // const password = loginData.Password

        // const { email, password } = userData;

        return new Promise((resolve, reject) => {
            // Query the database for the user by email
            const query = 'SELECT * FROM login_data WHERE email = ?';
            db.query('SELECT * FROM login_data WHERE email = ?', [loginData.email], (err, data) => {
                // console.log(data[0]);

                if (data.length === 0) {
                    // No user found with the provided email
                    console.log("email not exist"); ``

                    resolve({ err: 'Email not exist' })
                } else {
                    // if(userData.email==data[0].Email){
                    if (loginData.password == data[0].password) {
                        // console.log(data[0]);
                        if (data[0].type == "hod") {

                            resolve({ err: false })
                        } else {
                            // console.log("its not admin");
                            resolve({ err: 'Email not exist ' })
                        }
                        //   console.log("pasword is equal");
                    } else {
                        // console.log('Password is incorrect');
                        resolve({ err: 'Password is incorrect' })
                    }

                }
            })
        })
    },
    getAllStudents: () => {
        return new Promise((resolve, reject) => {
            db.query('select * from login_data where type="student"', (err, data) => {
                resolve(data)
            })
        })
    },
    changeStatus: (data) => {
        return new Promise((resolve, reject) => {
            if (data.status == 0) {
                db.query("DELETE FROM students WHERE email=?", [data.email], (err, result) => {
                    if (err) return reject(err)
                })

            }
            // Update the status in login_data
            db.query('UPDATE login_data SET status=? WHERE email = ?', [data.status, data.email], (err, result) => {
                if (err) return reject(err);

                // Call getApprovedTeachers only if the status is 1
                if (data.status == 1) {
                    db.query('select * from login_data where type="student" AND status= 1', (err, data) => {
                        // console.log("approved", data);
                        let user = data[0]
                        let result = data.map((user) => {
                            db.query('SELECT * FROM  students WHERE email = ?', [user.email], (err, result) => {
                                if (err) return reject(err)
        
                                if (result.length > 0) {
                                    // If the teacher already exists, skip insertion
                                    // console.log(`Student ${user.email} already exists, skipping.`);
                                } else {
                                    db.query(
                                        'INSERT INTO students (name, email,year,course,phone, gender) VALUES (?,?,?, ?, ?, ?)',
                                        [user.name, user.email, user.year, user.course, user.phone, user.gender],
                                        (err, Result) => {
                                            if (err) return reject(err)
                                        })
        
                                }
        
                                
                            })
        
        
                        })
        
                        resolve(data)
        
                    })
                } else {
                    resolve(); // Resolve directly if the status is not 1
                }
            });

            // db.query('update login_data set status=? where email = ?', [data.status, data.email], (err, data) => {
            //     resolve()
            // })
        })
    },
    getApprovedStudents: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM students',(err,data)=>
                {
                    if(err)reject(err)
                    resolve(data)
                })
        })
    },
    getTeacher: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM login_data WHERE type="teacher" ', (err, data) => {
                resolve(data)
            })
        })
    },
    changeTeacherStatus: (data) => {
        return new Promise((resolve, reject) => {
            // console.log("status", data);

            // If status is 0, delete the teacher
            if (data.status == 0) {
                db.query("DELETE FROM teachers WHERE email=?", [data.email], (err, result) => {
                    if (err) return reject(err);
                });
            }

            // Update the status in login_data
            db.query('UPDATE login_data SET status=? WHERE email = ?', [data.status, data.email], (err, result) => {
                if (err) return reject(err);

                // Call getApprovedTeachers only if the status is 1
                if (data.status == 1) {
                    db.query('select * from login_data where type="teacher" AND status= 1', (err, data) => {
                        // console.log(data);
                        resolve(data)
                        data.map((user) => {
                            db.query('SELECT * FROM  teachers WHERE email = ?', [user.email], (err, result) => {
                                if (err) return reject(err)
        
                                if (result.length > 0) {
                                    // If the teacher already exists, skip insertion
                                    console.log(`Teacher ${user.email} already exists, skipping.`);
                                } else {
                                    db.query(
                                        'INSERT INTO teachers (name, email, phone, gender) VALUES (?, ?, ?, ?)',
                                        [user.name, user.email, user.phone, user.gender],
                                        (err, Result) => {
                                            if (err) return reject(err)
                                        })
        
                                }
                            })
                        })
                    })
                } else {
                    resolve(); // Resolve directly if the status is not 1
                }
            });
        });
    },

    getAllTeachers: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teachers',(err,data)=>
            {
                
                if(err)reject(err)
                resolve(data)
            })
            // db.query('select * from login_data where type="teacher" AND status= 1', (err, data) => {
            //     // console.log(data);
            //     resolve(data)
            //     data.map((user) => {
            //         db.query('SELECT * FROM  teachers WHERE email = ?', [user.email], (err, result) => {
            //             if (err) return reject(err)

            //             if (result.length > 0) {
            //                 // If the teacher already exists, skip insertion
            //                 console.log(`Teacher ${user.email} already exists, skipping.`);
            //             } else {
            //                 db.query(
            //                     'INSERT INTO teachers (name, email, phone, gender) VALUES (?, ?, ?, ?)',
            //                     [user.name, user.email, user.phone, user.gender],
            //                     (err, Result) => {
            //                         if (err) return reject(err)
            //                     })

            //             }
            //         })
            //     })
            // })
           
        })
    },

    addTimetable: (timetableData) => {
        return new Promise((resolve, reject) => {
            const { day, timeSlot, year, teacher, subject } = timetableData;

            // Ensure all arrays (timeSlot, teacher, subject) have the same length
            if (timeSlot.length !== teacher.length || teacher.length !== subject.length) {
                return reject(new Error("timeSlot, teacher, and subject arrays must have the same length"));
            }

            // Iterate over the arrays and insert each row into the database
            const insertPromises = timeSlot.map((time, index) => {
                // console.log(time,index);

                return new Promise((resolve, reject) => {
                    const currentTeacher = teacher[index];
                    const currentSubject = subject[index];


                    // Insert each combination into the timetable
                    db.query(
                        'INSERT INTO timetable (day, time, year, teacher, subject) VALUES (?, ?, ?, ?, ?)',
                        [day, time, year, currentTeacher, currentSubject],
                        (err, result) => {
                            if (err) {
                                console.error("Error inserting data:", err);
                                return reject(err);
                            }
                            resolve(result);
                        }
                    );
                });
            });

            // Wait for all insert operations to complete
            Promise.all(insertPromises)
                .then(() => resolve('Timetable data inserted successfully'))
                .catch((err) => reject(err));
        });
    },


    getTimetable: () => {
        return new Promise((resolve, reject) => {
            // Fetch all timetable data from the database after insertion
            db.query('SELECT * FROM timetable', (err, data) => {
                if (err) {
                    console.error("Error fetching data:", err);
                    return reject(err); // Reject the promise if fetching data fails
                }

                // Resolve the promise with the fetched data
                resolve(data);
            });

        })
    },
    manageTeacher: (teacherManageData) => {
        return new Promise((resolve, reject) => {
          const { name, email, teacherId, classTeacher, subjects } = teacherManageData;
      
          // Convert subjects to a comma-separated string
          const subjectsString = subjects ? subjects.join(', ') : '';
      
          db.query(
            'UPDATE teachers SET teacher_id = ?, class_teacher = ?, subjects = ? WHERE email = ?',
            [teacherId, classTeacher, subjectsString, email],
            (err, result) => {
              if (err) {
                console.log("Error updating teacher details:", err);
                reject(err);
              } else {
                console.log("Teacher details updated successfully.");
                resolve({ result, status: true });
              }
            }
          );
        });
      },
}

