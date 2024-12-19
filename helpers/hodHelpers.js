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
            db.query('update login_data set status=? where email = ?', [data.status, data.email], (err, data) => {
                resolve()
            })
        })
    },
    getApprovedStudents: () => {
        return new Promise((resolve, reject) => {
            db.query('select * from login_data where type="student" AND status= 1', (err, data) => {
                 console.log("approved",data);

                resolve(data)
                
            })
        })
    },
    getAllTeacher: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM login_data WHERE type="teacher" ', (err, data) => {
                resolve(data)
            })
        })
    },
    changeTeacherStatus: (data) => {
        return new Promise((resolve, reject) => {
            db.query('update login_data set status=? where email = ?', [data.status, data.email], (err, data) => {
                resolve()
            })
        })
    },
    getApprovedTeachers: () => {
        return new Promise((resolve, reject) => {
            db.query('select * from login_data where type="teacher" AND status= 1', (err, data) => {
                // console.log(data);

                resolve(data)
            })
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


}

