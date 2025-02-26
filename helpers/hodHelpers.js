const { log } = require("handlebars");
const db = require("../config/connection")
const moment = require("moment"); // Ensure moment is installed: npm install moment

module.exports = {

    doLogin: (loginData) => {

        // const email = loginData.Email
        // const password = loginData.Password

        // const { email, password } = userData;
        return new Promise((resolve, reject) => {
            // Query the database to find a user by email
            db.query('SELECT * FROM admin WHERE email = ?', [loginData.email], (err, data) => {
              if (err) {
                console.error("Database error:", err);
                return reject(err);
              }
      
              if (data.length === 0) {
                return resolve({ err: "Email not exist" });
              }
      
              const user = data[0]; // Get the user data
      
              // Check if the provided password matches the one stored in the database
              if (loginData.password !== user.password) {
                return resolve({ err: "Password is incorrect" });
              }
      
      
              // Successful login
              resolve({ err: false, data: user });
            });
          });
        // return new Promise((resolve, reject) => {
        //     // Query the database for the user by email
        //     // const query = 'SELECT * FROM login_data WHERE email = ?';
        //     db.query('SELECT * FROM admin WHERE email = ?', [loginData.email], (err, data) => {
        //         // console.log(data[0]);

        //         if (data.length === 0) {
        //             // No user found with the provided email
        //             console.log("email not exist"); ``

        //             resolve({ err: 'Email not exist' })
        //         } else {
        //             // if(userData.email==data[0].Email){
        //             if (loginData.password == data[0].password) {
        //                 // console.log(data[0]);
        //                 if (data[0].type == "hod") {

        //                     resolve({ err: false })
        //                 } else {
        //                     // console.log("its not admin");
        //                     resolve({ err: 'Email not exist ' })
        //                 }
        //                 //   console.log("pasword is equal");
        //             } else {
        //                 // console.log('Password is incorrect');
        //                 resolve({ err: 'Password is incorrect' })
        //             }

        //         }
        //     })
        // })
    },
    getAllStudents: () => {
        return new Promise((resolve, reject) => {
            db.query('select * from students', (err, data) => {
                // db.query('select * from login_data where type="student"', (err, data) => {
                resolve(data)
            })
        })
    },
    changeStatus: (data) => {
        return new Promise((resolve, reject) => {
            console.log("status", data.status);

            const updateQuery = `
                UPDATE attendance, mark 
                SET attendance.isStudent = ?, mark.isStudent = ? 
                WHERE attendance.email = ? AND mark.email = ?
            `;

            const studentQuery = `UPDATE students SET status = ? WHERE email = ?`;

            db.query(studentQuery, [data.status, data.email], (err) => {
                if (err) return reject(err);
                resolve("Student status updated successfully");
            });
        });

    },
    getApprovedStudents: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM students where status = 1', (err, data) => {
                // db.query('SELECT * FROM login_data WHERE type="student" AND status=1', (err, data) => {

                if (err) reject(err)
                resolve(data)
            })
        })
    },
    filterStudents: () => {
        return new Promise((resolve, reject) => {
            db.query("SELECT DISTINCT course, semester FROM students", (err, result) => {
                if (err) return reject(err);
    
                // Extract unique courses and semesters
                const courses = [...new Set(result.map(row => row.course))];
                const semesters = [...new Set(result.map(row => row.semester))];
    
                resolve({ courses, semesters });
            });
        });
    },
    getFilteredStudents:(course,semester)=>{
        return new Promise((resolve,reject)=>{
            db.query('SELECT * FROM students where course=? AND semester=? AND status = 1 ', [course,semester],(err, data) => {
                // db.query('SELECT * FROM login_data WHERE type="student" AND status=1', (err, data) => {

                if (err) reject(err)
                resolve(data)
            })
        })
    },
    
    getTeacher: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teachers', (err, data) => {
                resolve(data)
            })
        })
        // return new Promise((resolve, reject) => {
        //     db.query('SELECT * FROM login_data WHERE type="teacher" ', (err, data) => {
        //         resolve(data)
        //     })
        // })
    },
    changeTeacherStatus: (data) => {
        return new Promise((resolve, reject) => {


            // Update the status in login_data
            db.query('UPDATE teachers SET status=? WHERE email = ?', [data.status, data.email], (err, result) => {
                if (err) return reject(err);
                resolve("Teacher status updated successfully")
            })
        })
 
    },

    getAllTeachers: () => {
        return new Promise((resolve, reject) => {
            // db.query('SELECT * FROM teachers', (err, data) => {
            db.query('SELECT * FROM teachers where status=1', (err, data) => {
                if (err) reject(err)
                resolve(data)
            })

        })
       
    },
    getDashboardData: () => {
        return new Promise((resolve, reject) => {
            db.query("SELECT COUNT(*) AS total_students FROM students WHERE status = 1", (err, studentCountResult) => {
                if (err) return reject(err);
    
                db.query("SELECT id, name, course, semester FROM students WHERE status = 1", (err, studentDataResult) => {
                    if (err) return reject(err);
    
                    db.query("SELECT COUNT(*) AS total_teachers FROM teachers WHERE status = 1", (err, teacherCountResult) => {
                        if (err) return reject(err);
    
                        db.query("SELECT id, name, subjects, class_teacher FROM teachers WHERE status = 1", (err, teacherDataResult) => {
                            if (err) return reject(err);
    
                            resolve({
                                totalStudents: studentCountResult[0]?.total_students || 0,
                                students: studentDataResult || [],
                                totalTeachers: teacherCountResult[0]?.total_teachers || 0,
                                teachers: teacherDataResult || []
                            });
                        });
                    });
                });
            });
        });
    },
    
    

    
    getTimetableData: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teachers where status=1', (err, result) => {
                if (err) return reject(err);
                //    console.log("get timetable teachers",result);

                // Create an array to hold teacher names and their subjects
                const teachersInfo = result.map((teacher) => ({
                    name: teacher.name,
                    subjects: teacher.subjects,
                    email: teacher.email,
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


    addTimetable: (course, semester, day ) => {
        return new Promise((resolve, reject) => {
            // const { course, semester, day } = timetableData;
            console.log(course, semester, day);
            
            const checkQuery = `SELECT * FROM timetable WHERE semester = ? AND course = ? AND day = ?`;
            db.query(checkQuery, [semester, course, day], (err, existing) => {
                if (err) {
                    console.error("Error checking existing timetable entry", err);
                    return reject({ message: "Error checking existing timetable entry", error: err });
                }

                console.log("Existing entries found:", existing.length); // Log existing entries for debugging

                // If an entry already exists, resolve with a message
                if (existing.length > 0) {
                    return resolve({ message: "The timetable is already exist..." });
                }else{

                // If no existing entry is found, resolve with a success message
                return resolve({success:true});
                }

            });
        });
    },
    createTimetable: (timetableData) => {
        return new Promise((resolve, reject) => {
            const { course, semester, day, periods, teachers, teacherEmails, subjects } = timetableData;
    
            // Insert data for each period
            const insertPromises = periods.map((period, i) => {
                const query = `INSERT INTO timetable (course, semester, day, time, teacher, email, subject) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)`;
                return new Promise((resolve, reject) => {
                    db.query(query, [course, semester, day, period, teachers[i], teacherEmails[i], subjects[i]], (err) => {
                        if (err) {
                            console.error("Error inserting timetable entry for period:", period, err);
                            return reject({ message: "Error inserting timetable entry", error: err });
                        }
                        resolve();
                    });
                });
            });
    
            // Wait for all insertions to complete
            Promise.all(insertPromises)
                .then(() => resolve("Timetable created successfully"))
                .catch(reject);
        });
    },
    

    getTimetable: () => {
        return new Promise((resolve, reject) => {
            // Fetch all timetable data from the database
            db.query('SELECT * FROM timetable', (err, data) => {
                if (err) {
                    console.error("Error fetching data:", err);
                    return reject(err); // Reject the promise if fetching data fails
                }

                // Grouping data by semester, course, and day
                const groupedData = data.reduce((acc, current) => {
                    // Create a new entry for each semester if it doesn't exist
                    if (!acc[current.semester]) {
                        acc[current.semester] = {
                            semester: current.semester,
                            courses: [] // Array to store courses for each semester
                        };
                    }

                    // Check if the course already exists for the current semester
                    let courseObj = acc[current.semester].courses.find(course => course.course === current.course);

                    if (!courseObj) {
                        // If the course does not exist, create a new course object
                        courseObj = {
                            course: current.course,
                            days: [] // Array to store days for the current course
                        };
                        acc[current.semester].courses.push(courseObj);
                    }

                    // Check if the day already exists for the current course
                    let dayObj = courseObj.days.find(day => day.day === current.day);

                    if (!dayObj) {
                        // If the day does not exist, create a new day object
                        dayObj = {
                            day: current.day,
                            timeSlots: [] // Array to store time slots for the day
                        };
                        courseObj.days.push(dayObj);
                    }

                    // Add the time slot to the day
                    dayObj.timeSlots.push({
                        time: current.time,
                        teacher: current.teacher,
                        subject: current.subject,
                        course: current.course,
                        semester: current.semester
                    });

                    return acc;
                }, {});

                // Resolve the promise with the grouped data
                resolve(Object.values(groupedData)); // Convert to array for easy rendering
            });
        });
    },
    editTimetable: (editTimetableData) => {
        return new Promise((resolve, reject) => {
            const { time, teacher, teacherEmails, subject, day, course, semester } = editTimetableData;

            // SQL query to update the timetable
            const query = `
                UPDATE timetable 
                SET teacher = ?, subject = ? , email = ?
                WHERE time = ? AND day = ? AND course = ? AND semester = ?
            `;

            // Values for the query
            const values = [teacher, subject, teacherEmails, time, day, course, semester];

            // Execute the query
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error("Error updating timetable:", err);
                    return reject({ message: "Error updating timetable entry", error: err });
                }

                // Resolve with success if the query executes properly
                resolve({ message: "Timetable updated successfully", result });
            });
        });
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
                'SELECT * FROM teachers WHERE course = ? AND class_teacher = ? ',
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
            // // Check if the teacher with the same teacherId or classTeacher already exists
            // db.query(
            //     'SELECT * FROM teachers WHERE course = ? AND class_teacher = ? ',
            //     [course, classTeacherValue], // Use the determined value
            //     (err, data) => {
            //         if (err) {
            //             console.error("Error checking teacher existence:", err);
            //             return reject(new Error("Error checking teacher existence."));
            //         }

            //         if (data.length > 0) {
            //             console.warn("course or Class Teacher is already assigned.");
            //             return reject(new Error("course or Class Teacher is already assigned."));
            //         }

            //         // Update the teacher's details
            //         db.query(
            //             'UPDATE teachers SET  class_teacher = ?,course = ?, subjects = ?, isManaged = 1 WHERE email = ?',
            //             [classTeacherValue, course, subjectsString, email], // Use the determined value
            //             (err, result) => {
            //                 if (err) {
            //                     console.error("Error updating teacher details:", err);
            //                     return reject(new Error("Error updating teacher details."));
            //                 }

            //                 resolve(result);
            //             }
            //         );
            //     }
            // );
        });
    },




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
            let query = 'SELECT * FROM teachers WHERE course = ? AND class_teacher = ? AND email != ? AND status=1';
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


    viewAllManagedTeachers: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM teachers WHERE isManaged = 1 AND status=1';

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
    setTimetable: (periodData) => {
        return new Promise((resolve, reject) => {
            console.log("setTimetable", periodData);

            // Prepare data for insertion
            const values = periodData.map(period => [period.period_name, period.time]);

            // SQL query for bulk insert
            const sql = `INSERT INTO admin (periods,period_time) VALUES ?`;

            // Execute the query
            db.query(sql, [values], (err, result) => {
                if (err) {
                    console.error("Error inserting timetable:", err);
                    return reject(err);
                }
                resolve({ success: true, message: 'Timetable set successfully' });
            });
        });

        // return new Promise((resolve, reject) => {
        //     console.log("setTimetable", periodData);

        //     // Create an array to hold all the promises for the database operations
        //     const promises = [];

        //     periodData.forEach((period) => {
        //         const checkQuery = 'SELECT * FROM periods WHERE period_name = ? OR time = ?';
        //         const values = [period.period_name, period.time];

        //         // Check if the period and time already exist
        //         const periodPromise = new Promise((resolvePeriod, rejectPeriod) => {
        //             db.query(checkQuery, values, (err, result) => {
        //                 if (err) {
        //                     console.error('Error checking existing periods:', err);
        //                     return rejectPeriod(err); // Reject if there's an error
        //                 }

        //                 console.log("length", result.length);

        //                 // If no matching period exists, insert a new period
        //                 if (result.length === 0) {
        //                     const insertQuery = 'INSERT INTO periods (period_name, time) VALUES (?, ?)';
        //                     db.query(insertQuery, values, (err) => {
        //                         if (err) {
        //                             console.error('Error inserting period:', err);
        //                             return rejectPeriod(err); // Reject if there's an error
        //                         }
        //                         console.log(`Inserted: ${period.period_name} - ${period.time}`);
        //                         resolvePeriod(); // Resolve when insertion is successful
        //                     });
        //                 } else {
        //                     console.log(`Duplicate entry for: ${period.period_name} - ${period.time}`);
        //                     resolvePeriod(); // Resolve even if it's a duplicate (no insertion)
        //                 }
        //             });
        //         });

        //         // Add the promise to the promises array
        //         promises.push(periodPromise);
        //     });

        //     // Wait for all promises to resolve before resolving the outer promise
        //     Promise.all(promises)
        //         .then(() => {
        //             // Return success response with a message after all periods are saved
        //             resolve({ success: true, message: 'Timetable set successfully' });
        //         })
        //         .catch((err) => {
        //             // Log the error and send failure response
        //             console.error('Error in saving timetable:', err);
        //             reject({ success: false, message: 'Failed to save timetable' });
        //         });
        // });
    },
    getPeriod: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT  periods, period_time FROM admin', (err, result) => {
                if (err) {
                    console.error("Error fetching periods:", err);
                    return reject("Error fetching periods");
                }
                // Filter out any rows where period_name or period_time is null
                const filteredResult = result.filter(row => row.periods && row.period_time)
                    .map(row => ({

                        periods: row.periods,
                        period_time: row.period_time
                    }));

                resolve(filteredResult);
            });
        });
        // return new Promise((resolve, reje) => {
        //     db.query('SELECT *FROM periods', (err, result) => {
        //         if (err) reject(err)
        //         // console.log("result",result);

        //         resolve(result)
        //     })
        // })
    },
    addEvent: (eventData) => {
        return new Promise((resolve, reject) => {
            // Extract the necessary fields
            const { eventTitle, eventDate, startTime, startAmPm, endTime, endAmPm, eventPlace, guestNames } = eventData;

            // Format the time range as "03:42 AM - 03:24 AM"
            const formattedTimeRange = `${startTime} ${startAmPm} - ${endTime} ${endAmPm}`;
            console.log(eventTitle, eventDate, formattedTimeRange, eventPlace, guestNames);

            // Insert data into the events table
            const query = `
                INSERT INTO events (eventTitle, eventDate, eventPlace, guestNames, formattedTimeRange)
                VALUES ('${eventTitle}', '${eventDate}', '${eventPlace}', '${guestNames}', '${formattedTimeRange}')
            `;

            // Execute the query (assuming `db` is your database connection object)
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },
    getEvents: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM events', (err, results) => {
                if (err) {
                    return reject(err);
                }

                const formattedEvents = results.map(event => {
                    // Format eventDate as MM-DD-YYYY
                    const date = new Date(event.eventDate);
                    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;

                    // Return the event with the formatted date
                    return {
                        ...event,
                        eventDate: formattedDate
                    };
                });

                resolve(formattedEvents);
            });
        });
    },
    getTeacherTimetable: (email) => {
        return new Promise((resolve, reject) => {
          console.log("Fetching timetable for email:", email);
    
          db.query("SELECT day, time, subject, course, semester FROM timetable WHERE email = ?", [email], (err, data) => {
            if (err) {
              console.error("Error fetching timetable:", err);
              return reject(err);
            }
    
            if (data.length === 0) {
              console.log("No timetable found for the given email.");
              return resolve({ days: [], times: [], timetable: {} });
            }
    
            // Extract unique days and times
            const days = [...new Set(data.map(row => row.day))]; // Unique days
            const times = [...new Set(data.map(row => row.time))]; // Unique times
    
            // Sort times (you can use the same sorting logic here)
            const sortedTimes = times.sort((a, b) => {
              const parseTime = (time) => {
                const [hour, minute, period] = time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                const isPM = period === 'PM';
                const hour24 = isPM && hour !== '12' ? +hour + 12 : hour === '12' ? 0 : +hour;
                return hour24 * 60 + +minute;
              };
              const startTimeA = parseTime(a.split(' - ')[0]);
              const startTimeB = parseTime(b.split(' - ')[0]);
              return startTimeA - startTimeB;
            });
    
            // Organize timetable data by day and time
            const timetable = {};
    
            // Loop through each day
            days.forEach(day => {
              timetable[day] = []; // Initialize an array for each day
    
              // Group by time slot for the specific day
              const timesForDay = data.filter(row => row.day === day);
    
              // Loop through each time slot for the day
              sortedTimes.forEach(time => {
                // Find subjects for the given time and day
                const subjectsAtTime = timesForDay.filter(row => row.time === time);
    
                // If subjects exist for this time slot, add them
                if (subjectsAtTime.length > 0) {
                  timetable[day].push({
                    time,
                    subjects: subjectsAtTime.map(row => ({
                      subject: row.subject,
                      course: row.course,
                      semester: row.semester
                    }))
                  });
                } else {
                  // Otherwise, add a null object for the time slot
                  timetable[day].push({
                    time,
                    subjects: null
                  });
                }
              });
            });
    
            // console.log("Timetable:", timetable);
    
            // Resolve with the timetable data including days, times, and structured subjects
            resolve({ days, times: sortedTimes, timetable });
          });
        });
      },
    getSemTimetable: () => {
        return new Promise((resolve, reject) => {
            // Query to fetch distinct days, times, courses, semesters, subjects, and teachers
            db.query('SELECT day, time, subject, teacher, course, semester FROM timetable', (err, data) => {
                if (err) {
                    console.error('Error fetching data:', err);
                    return reject(err);
                }

                // Extract unique days and times
                const days = [...new Set(data.map(row => row.day))];  // Unique days
                const times = [...new Set(data.map(row => row.time))]; // Unique times

                // Organize timetable data by day and course with semesters
                const timetable = {};

                days.forEach(day => {
                    timetable[day] = [];  // Initialize an array for each day

                    // Group by course and semester
                    const courses = data.filter(row => row.day === day);

                    courses.forEach(row => {
                        // Find or create the course entry for the day
                        let courseEntry = timetable[day].find(entry => entry.course === row.course);

                        if (!courseEntry) {
                            // If the course entry doesn't exist, create a new one
                            courseEntry = {
                                course: row.course,
                                semesters: []  // Changed to 'semesters' to handle multiple semesters
                            };
                            timetable[day].push(courseEntry);
                        }

                        // Find or create the semester entry for the course
                        let semesterEntry = courseEntry.semesters.find(semester => semester.semester === row.semester);

                        if (!semesterEntry) {
                            // If the semester entry doesn't exist, create a new one
                            semesterEntry = {
                                semester: row.semester,
                                subjects: []  // Store subjects for this semester
                            };
                            courseEntry.semesters.push(semesterEntry);
                        }

                        // Add the subject to the appropriate semester for the course
                        semesterEntry.subjects.push({
                            subject: row.subject,
                            teacher: row.teacher,
                            time: row.time
                        });
                    });
                });

                // console.log("Unique Days:", days);
                // console.log("Unique Times:", times);
                // console.log("Timetable:", timetable);

                // Resolve with the timetable data including days, times, and structured courses with semesters
                resolve({ days, times, timetable });
            });
        });
    },
    getStdentMarks: (email) => {
        return new Promise((resolve, reject) => {

            db.query(
              // "SELECT subject, marks FROM mark WHERE email = ? AND isStudent=1",
              "SELECT m.subject, m.marks FROM mark m JOIN students s ON m.email = s.email WHERE m.email = ? AND s.status = 1",
              [email],
              (err, result) => {
                if (err) reject(err);
                resolve(result);
              }
            );
          });
    },
    getStudentAttendance: (email) => {
        return new Promise((resolve, reject) => {
            db.query(
              // 'SELECT * FROM attendance WHERE email = ? AND isStudent=1 ORDER BY date ASC',
              "SELECT a.* FROM attendance a JOIN students s ON a.email = s.email WHERE a.email = ? AND s.status = 1 ORDER BY a.date ASC",
               [email], (err, results) => {
              if (err) {
                return reject(err); // Return error if query fails
              }
      
              if (results.length === 0) {
                return resolve({ attendanceByMonth: {}, attendancePercentages: {}, overallPercentage: 0 });
              }
      
              const attendanceByMonth = {};
              const attendancePercentages = {};
              let totalPointsAllMonths = 0;
              let totalDaysAllMonths = 0;
      
              results.forEach((row) => {
                const originalDate = new Date(row.date);
                const monthName = originalDate.toLocaleString('en-US', { month: 'long' });
                const year = originalDate.getFullYear();
                const monthYearKey = `${monthName} ${year}`; // Example: "February 2024"
      
                if (!attendanceByMonth[monthYearKey]) {
                  attendanceByMonth[monthYearKey] = [];
                  attendancePercentages[monthYearKey] = { totalDays: 0, totalPoints: 0 };
                }
      
                const formattedDate = originalDate.toLocaleDateString('en-GB'); // e.g., "05-02-2024"
                const dayName = originalDate.toLocaleString('en-US', { weekday: 'long' });
      
                // Assign points based on attendance status
                let attendancePoints = 0;
                if (row.status.toLowerCase() === "present") {
                  attendancePoints = 1;
                } else if (row.status.toLowerCase() === "half") {
                  attendancePoints = 0.5;
                } // "Absent" defaults to 0 points
      
                attendanceByMonth[monthYearKey].push({
                  ...row,
                  formattedDate,
                  day: dayName,
                  reason: row.reason || null,
                });
      
                // Update monthly and overall statistics
                attendancePercentages[monthYearKey].totalDays += 1;
                attendancePercentages[monthYearKey].totalPoints += attendancePoints;
                totalDaysAllMonths += 1;
                totalPointsAllMonths += attendancePoints;
              });
      
              // Calculate percentages for each month
              Object.keys(attendancePercentages).forEach((month) => {
                const { totalDays, totalPoints } = attendancePercentages[month];
                attendancePercentages[month] = totalDays > 0 ? ((totalPoints / totalDays) * 100).toFixed(2) : "0.00";
              });
      
              // Calculate overall percentage
              const overallPercentage = totalDaysAllMonths > 0 ? ((totalPointsAllMonths / totalDaysAllMonths) * 100).toFixed(2) : "0.00";
      
              // Sort months based on the latest added attendance entry (latest month first)
              const sortedMonths = Object.keys(attendanceByMonth).sort((a, b) => {
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
      
                // Convert month-year into a date for sorting
                const dateA = new Date(`${monthA} 1, ${yearA}`);
                const dateB = new Date(`${monthB} 1, ${yearB}`);
      
                // Compare to get the latest month first
                return dateB - dateA; // Reverse order for latest month first
              });
      
              // Prepare the response by reorganizing the months in reverse order
              const sortedAttendanceByMonth = sortedMonths.reduce((acc, month) => {
                acc[month] = attendanceByMonth[month];
                return acc;
              }, {});
      
              const sortedAttendancePercentages = sortedMonths.reduce((acc, month) => {
                acc[month] = attendancePercentages[month];
                return acc;
              }, {});
              console.log("sortedMonths ", sortedMonths);
      
              resolve({
                attendanceByMonth: sortedAttendanceByMonth,
                attendancePercentages: sortedAttendancePercentages,
                overallPercentage,
                // sortedMonths // You can use sortedMonths to display in the correct order
              });
            });
          });
    },



    addWinners: (data) => {
        return new Promise((resolve, reject) => {
            console.log("Received Data:", data);

            // Extract values from the data object
            const { date, title, first, second, third } = data;

            if (!date || !title) {
                console.error("Missing required fields:", data);
                return reject(new Error("All fields (date, title, first, second, third) are required."));
            }

            // Convert 'MM-DD-YYYY' to 'YYYY-MM-DD' (format used in MySQL)
            const formattedDate = moment(date, "MM-DD-YYYY", true).format("YYYY-MM-DD");

            if (!formattedDate || formattedDate === "Invalid date") {
                console.error("Invalid date format received:", date);
                return reject(new Error("Invalid date format. Expected MM-DD-YYYY"));
            }

            console.log("Formatted Date:", formattedDate);

            const sql = "UPDATE events SET first = ?, second = ?, third = ? WHERE eventDate = ? AND eventTitle = ?";
            const values = [first, second, third, formattedDate, title];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Error updating winners:", err);
                    return reject(err);
                }

                if (result.affectedRows === 0) {
                    return reject(new Error("No event found with the given date and title."));
                }

                resolve(result);
            });
        });
    },
    getWinners: (title,date) => {
        console.log("add winners",title,date);
          // Convert 'MM-DD-YYYY' to 'YYYY-MM-DD' (format used in MySQL)
          const formattedDate = moment(date, "MM-DD-YYYY", true).format("YYYY-MM-DD");

          if (!formattedDate || formattedDate === "Invalid date") {
              console.error("Invalid date format received:", date);
              return reject(new Error("Invalid date format. Expected MM-DD-YYYY"));
          }
        
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM events where eventTitle=? AND eventDate=?",[title,formattedDate], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
        })
    },
    addNoticeBoard:({title,content,date})=>{
        return new Promise((resolve, reject) => {
            console.log("titel",title,content);
            
            const query = "INSERT INTO admin (notice_title, notice_content,notice_date) VALUES (?, ?,?)";
            db.query(query, [title, content,date], (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
        })
    },
    

    getNotice: () => {
        return new Promise((resolve, reject) => {
          // First, get the last 3 distinct dates
          db.query(
            "SELECT DISTINCT notice_date FROM admin WHERE notice_date IS NOT NULL ORDER BY notice_date DESC LIMIT 3",
            (err, dateResult) => {
              if (err) {
                reject(err);
              } else {
                const lastThreeDates = dateResult.map(row => row.notice_date);
      
                // Fetch notices from only those dates
                db.query(
                  "SELECT notice_title AS title, notice_content AS content, notice_date AS date FROM admin WHERE notice_date IN (?) ORDER BY notice_date DESC",
                  [lastThreeDates],
                  (err, noticeResult) => {
                    if (err) {
                      reject(err);
                    } else {
                      // Format the date before sending
                      const formattedNotices = noticeResult.map(notice => ({
                        ...notice,
                        date: moment(notice.date).format('DD-MM-YYYY') // Formatting date
                      }));
      
                      console.log("Last 3 Date Notices:", formattedNotices);
                      resolve(formattedNotices);
                    }
                  }
                );
              }
            }
          );
        });
      },

      
      
}

