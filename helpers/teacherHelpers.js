// const db=require('../config/connection')

let db = require('../config/connection')

module.exports={
    // const { name, email, password,phone, gender } = teacherData;
    doSignup: (teacherData) => {
      const { name,email, password, phone, gender } = teacherData;
    
        return new Promise((resolve, reject) => {
  
            db.query(' INSERT INTO login_data (name,type, email, password, phone, gender, status)  VALUES (?,?, ?, ?, ?, ?,?)', [name, type="teacher",email, password, phone, gender, 0], (err, results) => {
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
        return new Promise((resolve,reject) => {
            db.query('SELECT * FROM login_data WHERE type="teacher" ', (err,data)=> {
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
           
            // console.log("dataaaa", attendanceData);
    
            // Prepare an array of values for the SQL query
            const values = attendanceData.map(record => [
                record.studentId, 
                record.attendanceDate, 
                record.status
            ]);
            // console.log(values);
            
    
            // Create a single INSERT INTO statement with multiple rows
            const sql = 'INSERT INTO attendance (id, date, status) VALUES ?';
    
            // Execute the query with the prepared values
            db.query(sql, [values], (err, result) => {
                if (err) {
                    console.error('Error inserting attendance records:', err);
                    reject(err); // Reject the promise if there is an error
                } else {
                    console.log('Attendance records inserted successfully');
                    resolve(result);  // Resolve the promise after successful insertion
                }
            });
        });
    },
    
            
    
            // // Wait for all insert operations to complete
            // Promise.all(insertPromises)
            //     .then(() => {
            //         console.log('All attendance records inserted successfully');
            //         resolve();  // Resolve the main promise after all inserts
            //     })
            //     .catch((err) => {
            //         console.error('Error inserting attendance records:', err);
            //         reject(err);  // Reject the main promise if there was any error
            //     });
    

}
    // saveAttendance: (attendanceData) => {
       
    

    //     return new Promise((resolve, reject) => {
    //         console.log("dataaaa",attendanceData);
    //         // dataaaa [
    //         //     { studentId: '1', status: 'present', attendanceDate: '2024-12-13' },
    //         //     { studentId: '2', status: 'present', attendanceDate: '2024-12-13' },
    //         //     { studentId: '3', status: 'present', attendanceDate: '2024-12-13' }
    //         //   ]
    //         resolve()
    //     })
        //   // Loop through each attendance record in the array
          
      
      
        //     // Ensure you log the attendanceDate to check if it's correct
        //     // console.log("Attendance Date:", attendanceDate);
      
        //     // Insert the record into the database
        //     db.query(
        //         'INSERT INTO attendance (id, date, status) VALUES(?, ?, ?)', 
        //         [studentId, attendanceDate, status], 
        //         (err, data) => {
        //           if (err) {
        //             console.error('Error inserting attendance for student ID:', studentId, err);
        //             // Optionally reject or handle the error
        //           } else {
        //             console.log('Attendance recorded for student ID:', studentId);
        //             resolve()
        //         }
        //   })

        // })


      
