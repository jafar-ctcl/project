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
    getAllTeacher: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM login_data WHERE type="teacher" ', (err, data) => {
                resolve(data)
            })
        })
    },
    getAllStudents: () => {
        return new Promise((resolve, reject) => {
            db.query('select * from login_data where type="student" AND status=1', (err, data) => {
                resolve(data)
            })
        })
    },
    saveAttendance: (attendanceData) => {
        return new Promise((resolve, reject) => {
            // Prepare an array of values for the SQL query
            const values = attendanceData.map(record => [
                // record.studentId,
                record.year,
                record.name,
                record.attendanceDate,
                record.status,
            ]);

            // Create a single INSERT INTO statement with multiple rows
            const sql = 'INSERT INTO attendance (year, name, date, status) VALUES ?';

            // Execute the query with the prepared values
            db.query(sql, [values], (err, result) => {
                if (err) {
                    console.error('Error inserting attendance records:', err);
                    reject(err); // Reject the promise if there is an error
                } else {
                    console.log('Attendance records inserted successfully');
                    resolve(result); // Resolve the promise after successful insertion
                }
            });
        });
    },
    getAttendance: (viewData) => {
        return new Promise((resolve, reject) => {
            console.log("helpers", viewData.year, viewData.date);
            db.query('SELECT * FROM attendance WHERE year = ? AND date = ?', [viewData.year, viewData.date], (err, data) => {
                if (err) {
                  console.log("error", err);
                  return;
                }
              
                console.log("data", data);
              
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
              
                  console.log("Formatted Data:", formattedData); // Log all formatted data with day names
              
                  // Resolve with the formatted data including the day of the week
                  resolve(formattedData);
                } else {
                  console.log("No data found");
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
        // getAttendanceByYear: (year) => {
        //   return new Promise((resolve, reject) => {
        //     const query = `
        //       SELECT * FROM attendance
        //       WHERE YEAR(date) = ?
        //       ORDER BY date
        //     `;
      
        //     db.query(query, [year], (err, results) => {
        //       if (err) {
        //         console.log('Error fetching attendance data:', err);
        //         return reject('Error fetching attendance data');
        //       }
      
        //       if (results.length === 0) {
        //         console.log('No attendance data found for the year:', year);
        //         return resolve([]); // Return an empty array if no data is found
        //       }
      
        //       // Group the results by month
        //       const groupedData = results.reduce((acc, record) => {
        //         const month = new Date(record.date).getMonth() + 1; // Get month as 1-based (January = 1, December = 12)
      
        //         if (!acc[month]) {
        //           acc[month] = [];
        //         }
        //         acc[month].push(record); // Group by month
      
        //         return acc;
        //       }, {});
      
        //       // Prepare formatted data for easy access
        //       const monthNames = [
        //         "January", "February", "March", "April", "May", "June", 
        //         "July", "August", "September", "October", "November", "December"
        //       ];
      
        //       // Convert groupedData into an array for rendering
        //       const formattedData = Object.keys(groupedData).map(month => {
        //         return {
        //           monthName: monthNames[month - 1],  // Get the name of the month
        //           monthNumber: month,
        //           attendance: groupedData[month]   // Attendance records for this month
        //         };
        //       });
      
        //       console.log('Grouped and formatted data:', formattedData); // Log the data for debugging
        //       resolve(formattedData); // Resolve with the formatted data
        //     });
        //   });
        // },
      }
      
      
      


//   const day = originalDate.getDate(); // Day of the month
//   const month = originalDate.getMonth() + 1; // Months are 0-indexed, so add 1
//   const year = originalDate.getFullYear(); // Full year

//   console.log(`Formatted Date: Day: ${day}, Month: ${month}, Year: ${year}`);


