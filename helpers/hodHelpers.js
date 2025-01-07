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
                                        'INSERT INTO students (name, email,semester,dob,course,phone, gender) VALUES (?,?,?,?, ?, ?, ?)',
                                        [user.name, user.email, user.semester, user.dob, user.course, user.phone, user.gender],
                                        (err, Result) => {
                                            if (err) {
                                                // return reject(err)
                                                console.log(err);
                                            }

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
    getTimetableData: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teachers', (err, result) => {
                if (err) return reject(err);
    
                // Create an array to hold teacher names and their subjects
                const teachersInfo = result.map((teacher) => ({
                    name: teacher.name,
                    subjects: teacher.subjects,
                }));
    
                // Create sets to store unique courses and class teachers
                const uniqueCourses = new Set();
                const uniqueClassTeachers = new Set();
    
                // Loop through the result to add unique courses and class teachers to the sets
                result.forEach((teacher) => {
                    if (teacher.course) {
                        uniqueCourses.add(teacher.course); // Add course to uniqueCourses set
                    }
                    if (teacher.class_teacher) {
                        uniqueClassTeachers.add(teacher.class_teacher); // Add class_teacher to uniqueClassTeachers set
                    }
                });
    
                // Convert sets to arrays to pass them to Handlebars
                const courses = Array.from(uniqueCourses);
                const classTeachers = Array.from(uniqueClassTeachers);
            //    console.log("courses",courses);
            //    console.log("classTeachers",classTeachers);
            //    console.log("teachersInfo",teachersInfo);
               
                // Resolve with the filtered data: teachers' names and subjects, and unique courses/class teachers
                resolve({ teachersInfo, courses, classTeachers });
            });
        });
    
    
    },

    addTimetable: (timetableData) => {
        return new Promise((resolve, reject) => {
            console.log("Received timetable data:", timetableData); // Log the full data
            const { course, semester, day, timeslots, teachers, subjects } = timetableData;
    
            // Ensure the arrays (timeslots, teachers, subjects) are defined and have the same length
            if (!timeslots || !teachers || !subjects) {
                return reject(new Error("Missing one or more required fields: timeslots, teachers, or subjects"));
            }
    
            if (timeslots.length !== teachers.length || teachers.length !== subjects.length) {
                return reject(new Error("timeslots, teachers, and subjects arrays must have the same length"));
            }
    
            // Loop through each time slot, teacher, and subject to insert into the database
            const insertPromises = timeslots.map((time, index) => {
                const teacher = teachers[index];
                const subject = subjects[index];
    
                // Check if the same day, time, and course already exists
                const checkQuery = `SELECT * FROM timetable WHERE day = '${day}' AND time = '${time}' AND semester = ${semester} AND course = '${course}'`;
                return new Promise((resolve, reject) => {
                    db.query(checkQuery, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            // If data exists, reject the promise with an error message
                            if (result.length > 0) {
                                reject(new Error(`Timetable entry for ${day} at ${time} for course ${course} already exists.`));
                            } else {
                                // If no duplicate, proceed with inserting the new timetable entry
                                const insertQuery = `INSERT INTO timetable (day, time, semester, teacher, subject, course) 
                                                     VALUES ('${day}', '${time}', ${semester}, '${teacher}', '${subject}', '${course}')`;
                                db.query(insertQuery, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                });
                            }
                        }
                    });
                });
            });
    
            // Wait for all insert operations to complete
            Promise.all(insertPromises)
                .then(() => resolve('Timetable entries added successfully'))
                .catch((err) => reject(err));
        });
    },
    // timetableData:()=>{
    //     return new Promise((resolve, reject) => {
    //         const query = "SELECT * FROM timetable WHERE course = ? AND semester = ?";  // Query for the timetable
    
    //         db.query(query, [course, semester], (err, result) => {
    //             if (err) {
    //                 reject(err);  // Reject if error occurs
    //             } else {
    //                 resolve(result);  // Resolve with the result if no error
    //             }
    //         });
    //     });
    // },



    getTimetable: () => {
        return new Promise((resolve, reject) => {
            // Fetch all timetable data from the database after insertion
            db.query('SELECT * FROM timetable', (err, data) => {
                if (err) {
                    console.error("Error fetching data:", err);
                    return reject(err); // Reject the promise if fetching data fails
                }
                // console.log("timetable data",data);
                // Resolve the promise with the fetched data
                resolve(data);
            });

        })
    },
    manageTeacher: (teacherManageData) => {
        return new Promise((resolve, reject) => {
            const { name, email, classTeacher, course, subjects } = teacherManageData;

            // Handle subjects as an array and convert to a string
            const subjectsArray = Array.isArray(subjects) ? subjects : [subjects];
            const subjectsString = subjectsArray.join(', ');

            // Check if `classTeacher` is empty or only whitespace, and set to null
            const classTeacherValue = (classTeacher && classTeacher.trim() !== "") ? classTeacher : null;

            // Check if the teacher with the same teacherId or classTeacher already exists
            db.query(
                'SELECT * FROM teachers WHERE course = ? AND class_teacher = ?',
                [course, classTeacherValue], // Use the determined value
                (err, data) => {
                    if (err) {
                        console.error("Error checking teacher existence:", err);
                        return reject(new Error("Error checking teacher existence."));
                    }

                    if (data.length > 0) {
                        console.warn("course or Class Teacher is already assigned.");
                        return reject(new Error("course or Class Teacher is already assigned."));
                    }

                    // Update the teacher's details
                    db.query(
                        'UPDATE teachers SET  class_teacher = ?,course = ?, subjects = ?, isManaged = 1 WHERE email = ?',
                        [classTeacherValue, course, subjectsString, email], // Use the determined value
                        (err, result) => {
                            if (err) {
                                console.error("Error updating teacher details:", err);
                                return reject(new Error("Error updating teacher details."));
                            }

                            resolve(result);
                        }
                    );
                }
            );
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
        // console.log("Fetching details for:", email);

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

                // console.log("Successfully fetched teacher details:", data);
                resolve(data);
            });
        });
    },
    updateTeacher: (teacherManageData) => {
        return new Promise((resolve, reject) => {
            const { name, email, course, classTeacher, subjects } = teacherManageData;

            // Convert subjects to a comma-separated string
            const subjectList = Array.isArray(subjects) ? subjects.join(', ') : subjects;

            // Build the query and parameters dynamically
            let query = 'SELECT * FROM teachers WHERE course = ? AND class_teacher = ? AND email != ?';
            let params = [course, classTeacher, email]; // Exclude the current teacher

            // First, check for duplicate entry with the same `course` and `class_teacher` (excluding the current teacher)
            db.query(query, params, (err, data) => {
                if (err) {
                    console.error("Error checking teacher existence:", err);
                    return reject(new Error("Error checking teacher existence."));
                }

                if (data.length > 0) {
                    // Conflict found: `course` and `class_teacher` are already assigned to another teacher
                    console.warn("Duplicate course and class_teacher detected:", data);
                    return reject(
                        new Error(
                            `Conflict: The course "${course}" and class "${classTeacher || 'N/A'}" are already assigned to another teacher.`
                        )
                    );
                }

                // No conflicts, proceed to update the teacher's data
                db.query(
                    'UPDATE teachers SET course = ?, class_teacher = ?, subjects = ? WHERE email = ?',
                    [course || null, classTeacher || null, subjectList, email], // Pass `null` if empty
                    (err, result) => {
                        if (err) {
                            console.error("Error updating teacher details:", err);
                            return reject(new Error("Error updating teacher details."));
                        }

                        if (result.affectedRows === 0) {
                            // No teacher found with the given email to update
                            return reject(
                                new Error("No teacher found with the provided email to update.")
                            );
                        }

                        // Successfully updated
                        resolve({
                            message: 'Teacher updated successfully.',
                            status: true,
                            affectedRows: result.affectedRows,
                        });
                    }
                );
            });
        });
    },



    // updateTeacher: (teacherManageData) => {
    //     const { name, email, teacherId, classTeacher, subjects } = teacherManageData;

    //     return new Promise((resolve, reject) => {
    //         // Assuming you're using a database query here to update teacher data
    //         db.query(
    //             'UPDATE teachers SET teacher_id = ?, class_teacher = ?, subjects = ? WHERE email = ?',
    //             [
    //                 teacherId,  // teacher_id to update
    //                 classTeacher,  // class_teacher to update
    //                 subjects.join(','),  // subjects as comma-separated string
    //                 email  // identifying teacher by email
    //             ],
    //             (err, result) => {
    //                 if (err) {
    //                     console.log(err);

    //                     return reject(new Error(err.sqlMessage)); // Passing SQL error message
    //                 } else {
    //                     resolve({ result, status: true }); // If successful
    //                 }
    //             }
    //         );
    //     });
    // },
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

