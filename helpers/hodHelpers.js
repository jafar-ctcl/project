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

                        //console.log("students", user);

                        data.map((user) => {
                            db.query('SELECT * FROM  students WHERE email = ?', [user.email], (err, result) => {
                                if (err) return reject(err)

                                if (result.length > 0) {
                                    // If the teacher already exists, skip insertion
                                    // console.log(`Student ${user.email} already exists, skipping.`);
                                } else {
                                    db.query(
                                        'INSERT INTO students (name, email,year,dob,course,phone, gender) VALUES (?,?,?,?, ?, ?, ?)',
                                        [user.name, user.email, user.year, user.dob, user.course, user.phone, user.gender],
                                        (err, Result) => {
                                            if (err) return reject(err)
                                        })

                                }


                            })


                        })

                        resolve()

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
            db.query('SELECT * FROM students', (err, data) => {
                if (err) reject(err)
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
            db.query('SELECT * FROM teachers', (err, data) => {

                if (err) reject(err)
                resolve(data)
            })

        })
    },

    addTimetable: (timetableData) => {
        return new Promise((resolve, reject) => {
            const { day, year, timeslots, teachers, subjects } = timetableData;
            console.log(" teachers.length", teachers.length);
            console.log(" subjects.length", subjects.length);
            console.log(" timeslots.length", timeslots.length);
          
            // Ensure all arrays (timeslots, teachers, subjects) have the same length
            if (timeslots.length !== teachers.length || teachers.length !== subjects.length) {
                return reject(new Error("timeslots, teachers, and subjects arrays must have the same length"));
            }
    
            // Iterate over the arrays and insert each row into the database
            const insertPromises = timeslots.map((time, index) => {
                const currentTeacher = teachers[index];
                const currentSubject = subjects[index];
    
                // Check if the combination already exists in the database
                return new Promise((resolve, reject) => {
                    db.query(
                        'SELECT * FROM timetable WHERE day = ? AND time = ? AND year = ?  ',
                        [day, time, year],
                        (err, result) => {
                            if (err) {
                                console.error("Error checking for duplicates:", err);
                                return reject(err);
                            }
    
                            // If a duplicate exists, reject the promise
                            if (result.length > 0) {
                                return reject(new Error(`Duplicate entry found for ${day} ${time} ${currentTeacher} ${currentSubject}`));
                            }
    
                            // If no duplicate, insert the new timetable entry
                            db.query(
                                'INSERT INTO timetable (day, time, year, teacher, subject) VALUES (?, ?, ?, ?, ?)',
                                [day, time, year, currentTeacher, currentSubject],
                                (err, result) => {
                                    if (err) {
                                        console.error("Error inserting data:", err);
                                        return reject(err);
                                    }
                                    // Resolve with the day and year after successful insertion
                                    resolve();
                                }
                            );
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

            // Ensure subjects is an array (even if it's just one subject)
            const subjectsArray = Array.isArray(subjects) ? subjects : [subjects];

            // Convert subjects to a comma-separated string
            const subjectsString = subjectsArray.join(', ');

            // Check if the teacher with the same email and class_teacher already exists
            db.query('SELECT * FROM teachers WHERE email = ? AND class_teacher = ?', [email, classTeacher], (err, data) => {

                if (data.length > 0) {
                    // Teacher already exists with the same email and class_teacher
                    console.warn("class has already been assigned");

                    // Pass the error message to the view (e.g., Handlebars)
                    return reject(new Error(`The ${classTeacher} class has already been assigned to another teacher.`));

                } else {
                    // Teacher doesn't exist, update the teacher's details

                    db.query(
                        'UPDATE teachers SET teacher_id = ?, class_teacher = ?, subjects = ?, isManaged = 1 WHERE email = ?',
                        [teacherId, classTeacher, subjectsString, email],
                        (err, result) => {
                            if (err) {
                                console.log("Error updating teacher details:", err);
                                return reject(new Error(`${err.sqlMessage}`));
                            } else {
                                console.log("Teacher details added successfully, and isManaged set to 1.");
                                resolve(result);
                            }
                        }
                    );
                }
            });
        });
    },

    // manageTeacher: (teacherManageData) => {
    //     // console.log(teacherManageData);

    //     return new Promise((resolve, reject) => {
    //         const { name, email, teacherId, classTeacher, subjects } = teacherManageData;

    //         // Ensure subjects is an array (even if it's just one subject)
    //         const subjectsArray = Array.isArray(subjects) ? subjects : [subjects];

    //         // Convert subjects to a comma-separated string
    //         const subjectsString = subjectsArray.join(', ');

    //         // console.log("subjects:", subjectsString);


    //         // Check if the teacher with the same email and class_teacher already exists
    //         db.query('SELECT * FROM teachers WHERE email = ? AND class_teacher = ?', [email, classTeacher], (err, data) => {

    //             if (data.length > 0) {
    //                 // Teacher already exists with the same email and class_teacher
    //                 console.warn("class has already been assigned");

    //                 // Pass the error message to the view (e.g., Handlebars)
    //                 return reject(new Error(`The ${classTeacher} class has already been assigned to another teacher.`));

    //             }
    //             else {
    //                 // Teacher doesn't exist, update the teacher's details

    //                 db.query(
    //                     'UPDATE teachers SET teacher_id = ?, class_teacher = ?, subjects = ? WHERE email = ?',
    //                     [teacherId, classTeacher, subjectsString, email],
    //                     (err, result) => {
    //                         if (err) {
    //                             console.log("Error updating teacher details:", err);
    //                             // reject(err);
    //                             return reject(new Error(`${err.sqlMessage}`));
    //                         } else {
    //                             console.log("Teacher details added successfully.");
    //                             resolve(result);
    //                         }
    //                     }
    //                 );
    //             }
    //         });
    //     });
    // },

    viewManagedTeacher: (email) => {
        console.log("Fetching details for:", email);

        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM teachers WHERE email = ?';

            db.query(query, [email], (err, data) => {
                if (err) {
                    console.error("Error fetching teacher details:", err);
                    return reject(err);
                }

                if (data.length === 0) {
                    console.warn("No teacher found with the provided email:", email);
                    return reject(new Error("Teacher not found"));
                }

                console.log("Successfully fetched teacher details:", data);
                resolve(data);
            });
        });
    },
    updateTeacher: (teacherManageData) => {
        const { name, email, teacherId, classTeacher, subjects } = teacherManageData;

        return new Promise((resolve, reject) => {
            // Assuming you're using a database query here to update teacher data
            db.query(
                'UPDATE teachers SET teacher_id = ?, class_teacher = ?, subjects = ? WHERE email = ?',
                [
                    teacherId,  // teacher_id to update
                    classTeacher,  // class_teacher to update
                    subjects.join(','),  // subjects as comma-separated string
                    email  // identifying teacher by email
                ],
                (err, result) => {
                    if (err) {
                        console.log(err);

                        return reject(new Error(err.sqlMessage)); // Passing SQL error message
                    } else {
                        resolve({ result, status: true }); // If successful
                    }
                }
            );
        });
    },
    viewAllManagedTeachers: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM teachers WHERE isManaged = 1';

            db.query(query, (err, result) => {
                if (err) {
                    console.error("Error fetching managed teachers:", err);
                    return reject(new Error(err.sqlMessage));
                }

                // Map the result to extract only the email addresses
                // const emails = result.map(row => row.email);
                // console.log("Managed Teachers Emails:", emails); // Debug log

                resolve(result);
            });
        });
    },
  




}

