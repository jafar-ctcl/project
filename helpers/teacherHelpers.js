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
                    return reject(err); // Reject the promise on error
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
    getStudents: (year) => {
        return new Promise((resolve, reject) => {
            db.query('select * from students where year=?', [year],(err, data) => {
                resolve(data)
            })
        })
    },
    saveAttendance: (attendanceData) => {
      return new Promise((resolve, reject) => {
        const { year, attendanceDate } = attendanceData[0]; // Extract year and date from the first record
    
        // Check if attendance for the same date and year already exists
        const checkSql = 'SELECT COUNT(*) AS count FROM attendance WHERE year = ? AND date = ?';
        db.query(checkSql, [year, attendanceDate], (err, result) => {
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
            record.year,
            record.name,
            record.attendanceDate,
            record.status,
          ]);
          const insertSql = 'INSERT INTO attendance (year, name, date, status) VALUES ?';
    
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
    
        getLastAttendance: (stdYear) => {
          return new Promise((resolve, reject) => {
            // Query to fetch the latest attendance record to get the most recent date
            db.query('SELECT * FROM attendance    ORDER BY date DESC LIMIT 1 ', (err, result) => {
              if (err) {
                console.error('Error fetching last attendance:', err);
                reject(err); // Reject the promise in case of error
              } else {
                const lastAttendance = result[0]; // Get the most recent attendance record
                
                if (lastAttendance && lastAttendance.date) {
                  const lastAttendanceDate = lastAttendance.date;
      
                  // Query to fetch all attendance records for the last attendance date
                  db.query('SELECT * FROM attendance WHERE date = ? AND year = ?', [lastAttendanceDate,stdYear], (err, allRecords) => {
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
    getAttendance: (date,year, ) => {
        return new Promise((resolve, reject) => {
            // console.log("helpers", year, date);
            db.query('SELECT * FROM attendance WHERE year = ? AND date = ?', [year, date], (err, data) => {
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
    
      getAllAttendance: () => {
        return new Promise((resolve, reject) => {
          const query = `
            SELECT * FROM attendance
            ORDER BY date
          `;
    
          db.query(query, (err, results) => {
            if (err) {
              console.log('Error fetching attendance data:', err);
              return reject('Error fetching attendance data');
            }
    
            if (results.length === 0) {
              console.log('No attendance data found.');
              return resolve({}); // Return an empty object if no data is found
            }
    
            // Group the results by year and month
            const groupedData = results.reduce((acc, record) => {
              const year = new Date(record.date).getFullYear(); // Extract the year
              const month = new Date(record.date).getMonth() + 1; // Get month as 1-based (January = 1, December = 12)
    
              if (!acc[year]) {
                acc[year] = {}; // Initialize the year object if it doesn't exist
              }
              
              if (!acc[year][month]) {
                acc[year][month] = []; // Initialize the month array if it doesn't exist
              }
              
              acc[year][month].push(record); // Group by year and month
    
              return acc;
            }, {});
    
            // Prepare formatted data for easy access
            const monthNames = [
              "January", "February", "March", "April", "May", "June", 
              "July", "August", "September", "October", "November", "December"
            ];
    
            // Convert groupedData into an array for rendering
            const formattedData = Object.keys(groupedData).map(year => {
              const yearData = groupedData[year];
              const monthsData = Object.keys(yearData).map(month => {
                return {
                  monthName: monthNames[month - 1],  // Get the name of the month
                  monthNumber: month,
                  attendance: yearData[month]        // Attendance records for this month
                };
              });
    
              return {
                year: year,
                months: monthsData
              };
            });
             
              
            resolve(formattedData); // Resolve with the formatted data
          });
        });
      },
      getMonthAttendance: (month, year, stdYear) => {
        return new Promise((resolve, reject) => {
          console.log("Month and Year:", month, year);
      
          const query = `
            SELECT * FROM attendance
            WHERE YEAR(date) = ? AND MONTH(date) = ? AND year = ?
            ORDER BY date
          `;
      
          db.query(query, [year, month, stdYear], (err, results) => {
            if (err) {
              console.error("Error fetching attendance data:", err);
              return reject("Error fetching attendance data");
            }
            console.log("Query Results:", results);
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
      
      getAvailableYears: (stdYear) => {
        return new Promise((resolve, reject) => {
          const query = `
            SELECT DISTINCT YEAR(date) AS year 
            FROM attendance 
            WHERE year = ? 
            ORDER BY year DESC;
          `;
        
          db.query(query, [stdYear], (err, results) => {
            if (err) {
              console.log("Error fetching years:", err);
              return reject("Error fetching years");
            }
        
            const years = results.map(record => record.year); // Extract years from the query result
            resolve(years);  // Resolve the promise with the years
          });
        });
      },
      
      }
      
      
  
