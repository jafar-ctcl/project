// const db=require('../config/connection')

let db = require('../config/connection')

module.exports = {
    // const { name, email, password,phone, gender } = teacherData;
    doSignup: (teacherData) => {
        const { name, email, password, phone, gender } = teacherData;

        return new Promise((resolve, reject) => {

            db.query(' INSERT INTO login_data (name,type, email, password, phone, gender, status)  VALUES (?,?, ?, ?, ?, ?,?)', [name, type = "teacher", email, password, phone, gender, 0], (err, results) => {
                if (err) {
                    console.error('Error inserting into database:', err.message);
                    return reject(new Error("already assigned  email")); // Reject the promise on error
                }
                resolve(results); // Resolve the promise with query results
            });
        });
    },
    doLogin: (loginData) => {
        return new Promise((resolve, reject) => {
            // Query the database to find a user by email
            db.query('SELECT * FROM login_data WHERE email= ?', [loginData.email], (err, data) => {
                if (err) {
                    // Handle query error (database issue)
                    console.error("Database error: ", err);
                    reject(err);
                } else if (data.length === 0) {
                    // If no user is found with the provided email
                    resolve({ err: "Email not exist" });
                } else {
                    const user = data[0]; // Get the user data

                    // Check if the provided password matches the one stored in the database
                    if (loginData.password === user.password) {

                        // Check if the user is a teacher and if their account is active
                        if (user.type === "teacher") {
                            if (user.status) {
                                // If active, resolve with user data
                                resolve({ err: false, data: user });
                            } else {
                                // If inactive, return account is inactive error
                                resolve({ err: "Account is inactive" });
                            }
                        } else {
                            // If the email is not a teacher's email
                            resolve({ err: "Email not exist" });
                        }
                    } else {
                        // If password is incorrect
                        resolve({ err: "Password is incorrect" });
                    }
                }
            });
        });
    },

    // doLogin:(loginData)=>{
    //     // console.log(loginData);

    //     return new Promise((resolve,reject)=>{
    //         db.query('SELECT * FROM login_data WHERE email= ?',[loginData.email],(err,data)=>{
    //             if(data.length===0){
    //                 resolve({ err: "Email not exist" })

    //             }else{
    //                 if (loginData.password == data[0].password) {
    //                     // console.log(data[0].status);
    //                     if (data[0].type === "teacher") {
    //                         if (data[0].status) {

    //                             resolve({ err: false, data })
    //                         } else {

    //                             resolve({ err: "Account is inactive" })
    //                         }
    //                         //  console.log(".................");
    //                     } else {
    //                         resolve({ err: "Email not exist" })
    //                     }

    //                 } else {
    //                     resolve({ err: 'Password is incorrect' })
    //                 }
    //             }
    //         })
    //     })
    // },
    getTeacher: (email) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teachers WHERE email=? ',[email] ,(err, data) => {
                resolve(data)
            })
        })
    },
    getStudents : (sem,course) => {
      console.log("sem",sem);
      console.log("course",course);
      
      return new Promise((resolve, reject) => {
          const query = 'SELECT * FROM students WHERE semester = ? AND course = ?';
          db.query(query, [sem,course], (err, results) => {
              if (err) {
                  console.error('Database error:', err);
                  reject(err);
              } else {
                  // console.log('Query results:', results);
                  resolve(results);
              }
          });
      });
  },
  
    saveAttendance: (attendanceData) => {
      return new Promise((resolve, reject) => {
        const { sem,course, attendanceDate } = attendanceData[0]; // Extract year and date from the first record
    
        // Check if attendance for the same date and year already exists
        const checkSql = 'SELECT COUNT(*) AS count FROM attendance WHERE semester = ? AND date = ? AND course=?';
        db.query(checkSql, [sem, attendanceDate,course], (err, result) => {
          if (err) {
            console.error('Error checking existing attendance records:', err);
            return reject(err);
          }
    
          if (result[0].count > 0) {
            // Attendance already exists for the given date and year
            return reject(new Error(`Attendance for this ${attendanceDate} already added.`));
          }
    
          // If no duplicate exists, insert attendance data
          const values = attendanceData.map(record => [
            record.sem,
            record.course,
            record.name,
            record.attendanceDate,
            record.status,
          ]);
          const insertSql = 'INSERT INTO attendance (semester,course, name, date, status) VALUES ?';
    
          db.query(insertSql, [values], (insertErr, insertResult) => {
            if (insertErr) {
              console.error('Error inserting attendance records:', insertErr);
              return reject(insertErr);
            }
            console.log('Attendance records inserted successfully');
            resolve(insertResult);
          });
        });
      });
    },
    
        getLastAttendance: (sem,course) => {
          return new Promise((resolve, reject) => {
            // Query to fetch the latest attendance record to get the most recent date
            db.query('SELECT * FROM attendance  where course=? AND semester = ?  ORDER BY date DESC LIMIT 1 ',[course,sem] ,(err, result) => {
              if (err) {
                console.error('Error fetching last attendance:', err);
                reject(err); // Reject the promise in case of error
              } else {
                const lastAttendance = result[0]; // Get the most recent attendance record
                
                if (lastAttendance && lastAttendance.date) {
                  const lastAttendanceDate = lastAttendance.date;
      
                  // Query to fetch all attendance records for the last attendance date
                  db.query('SELECT * FROM attendance WHERE date = ? AND semester = ? AND course=?', [lastAttendanceDate,sem,course], (err, allRecords) => {
                    if (err) {
                      console.error('Error fetching all attendance for the last date:', err);
                      reject(err);
                    } else {
                      // Process the records to add the day of the week
                      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      allRecords.forEach(record => {
                        const attendanceDate = new Date(record.date);
                        record.dayOfWeek = daysOfWeek[attendanceDate.getDay()];
                      });
      
                      resolve(allRecords); // Resolve the promise with all attendance records for the last date
                    }
                  });
                } else {
                  resolve([]); // If no attendance records exist, return an empty array
                }
              }
            });
          });
        
      
    },
    getAttendance: (date,sem,course) => {
        return new Promise((resolve, reject) => {
            // console.log("helpers", year, date);
            db.query('SELECT * FROM attendance WHERE semester = ? AND date = ? AND course=?', [sem, date,course], (err, data) => {
                if (err) {
                  console.log("error", err);
                  return;
                }
              
                // console.log("get  attendance", data);
              
                if (data.length > 0) {
                  // Loop through all rows and format the date along with the attendance data
                  const formattedData = data.map(row => {
                    const originalDate = new Date(row.date);
              
                    // Get the full day name (e.g., "Monday", "Tuesday", etc.)
                    const dayName = originalDate.toLocaleString('en-US', { weekday: 'long' });
              
                    // Include both the original row data and the day name
                    return {
                      ...row, // Spread the existing row data
                      day: dayName, // Add the day of the week to the row
                    };
                  });
              
                  // console.log("Formatted Data:", formattedData); // Log all formatted data with day names
              
                  // Resolve with the formatted data including the day of the week
                  resolve(formattedData);
                } else {
                  // console.log("No data found");
                  resolve([]); // Return an empty array if no data
                }
              });
              




        })
    },
    updateAttendence: (updData) => {
        return new Promise((resolve, reject) => {
          db.query('UPDATE attendance SET status = ? WHERE id = ?', [updData.status, updData.id], (err, result) => {
            if (err) {
              console.log("Error updating attendance:", err);
              reject({ success: false, message: 'Error updating attendance' }); // Reject the promise if there's an error
            } else {
              console.log('Attendance updated successfully');
              resolve({ success: true }); // Resolve the promise with success
            }
          });
        });
      },
    
      
      getMonthAttendance: (month, year, sem,course) => {
        return new Promise((resolve, reject) => {
          // console.log("Month and Year:", month, year);
      
          const query = `
            SELECT * FROM attendance
            WHERE YEAR(date) = ? AND MONTH(date) = ? AND semester = ? AND course=?
            ORDER BY date
          `;
      
          db.query(query, [year, month, sem,course], (err, results) => {
            if (err) {
              console.error("Error fetching attendance data:", err);
              return reject("Error fetching attendance data");
            }
            // console.log("Query Results:", results);
            if (results.length === 0) {
              console.log("No attendance data found for the given month and year.");
            }
          
          
      
            // Process the attendance data
            const studentsMap = {};
      
            results.forEach((record) => {
              const day = new Date(record.date).getDate(); // Extract the day from the date
      
              if (!studentsMap[record.name]) {
                studentsMap[record.name] = {
                  name: record.name,
                  attendance: Array(31).fill(null), // Initialize attendance array for the month
                };
              }
      
              // Assign the status (e.g., present, absent) for the specific day
              studentsMap[record.name].attendance[day - 1] = record.status;
            });
      
            // Convert studentsMap to an array for rendering
            const students = Object.values(studentsMap);
        // console.log("studerts",students);
           
            resolve({ students });
          });
        });
      },
      
      getAvailableYears: (sem,course) => {
        return new Promise((resolve, reject) => {
          const query = `
            SELECT DISTINCT YEAR(date) AS year 
            FROM attendance 
            WHERE semester = ?  AND course = ?
            ORDER BY year DESC;
          `;
        
          db.query(query, [sem,course], (err, results) => {
            if (err) {
              console.log("Error fetching years:", err);
              return reject("Error fetching years");
            }
        
            const years = results.map(record => record.year); // Extract years from the query result
            resolve(years);  // Resolve the promise with the years
          });
        });
      },
      getTeacherData: (email) => {
        return new Promise((resolve, reject) => {
          db.query('SELECT course, semester, subject FROM timetable WHERE email = ?', [email], (err, result) => {
            if (err) {
              console.log("Error:", err);
              reject(err);
            } else {
              // Process the result to format it as required
              const formattedResult = result.reduce((acc, row) => {
                if (!acc.course.includes(row.course)) acc.course.push(row.course);
                if (!acc.semester.includes(row.semester)) acc.semester.push(row.semester);
                if (!acc.subject.includes(row.subject)) acc.subject.push(row.subject);
                return acc;
              }, { course: [], semester: [], subject: [] });
      
              // console.log("Formatted Result:", formattedResult);
              resolve(formattedResult);
            }
          });
        });
      },
      addMark: (markData) => {
        return new Promise((resolve, reject) => {
          let { subject, name, semester, email, marks, course } = markData;
      
          // Normalize the single-value fields to arrays
          const normalizeSingleValue = (field) => {
            if (!Array.isArray(field)) {
              return [field];
            }
            return field;
          };
      
          // Normalize name, email, and marks to arrays if they are not already
          name = normalizeSingleValue(name);
          email = normalizeSingleValue(email);
          marks = normalizeSingleValue(marks);
      
          // Validate that all arrays (name, email, marks) have the same length
          if (name.length !== email.length || name.length !== marks.length) {
            return reject(new Error("Mismatched array lengths for name, email, or marks."));
          }
      
          // Since subject, semester, and course are single values, we use them as is
          const rows = name.map((_, i) => [
            subject,
            name[i],
            semester, // always one value
            email[i],
            marks[i],
            course // always one value
          ]);
      
          // Check if the marks for the subject, email, and semester already exist in the database
          const checkQuery = "SELECT COUNT(*) AS count FROM mark WHERE subject = ? AND semester = ? AND email = ?";
          
          db.query(checkQuery, [subject, semester, email[0]], (err, result) => {
            if (err) return reject(err);
      
            // If the count is greater than 0, data already exists
            if (result[0].count > 0) {
              return reject(new Error("Mark entry already exists for this subject, semester, and email."));
            }
      
            // Query to insert the data if no existing records found
            const query = "INSERT INTO mark (subject, name, semester, email, marks, course) VALUES ?";
            db.query(query, [rows], (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });
        });
      },
      
      getMarks: (stdData) => {
        const { course, semester, subject } = stdData;
        return new Promise((resolve, reject) => {
          const query = "SELECT * FROM mark WHERE course = ? AND semester = ? AND subject = ?";  // Fixed the query
          db.query(query, [course, semester, subject], (err, result) => {
            if (err) {
              return reject(err);
            }
            const groupedMarks = result.reduce((acc, mark) => {
              if (!acc[mark.course]) {
                acc[mark.course] = [];
              }
              acc[mark.course].push(mark);
              return acc;
            }, {});
            resolve(groupedMarks);  // Resolving with the marks data
          });
        });
      },
      
      
      
      
      
      }
      
      
  
