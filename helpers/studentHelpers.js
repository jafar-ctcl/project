let db = require('../config/connection')

module.exports = {
    // doSignup:(userData)={
    //     return new Promise((resolve, reject) => {
    //         db.query('insert into students values ')

    //     })
    // }
    // Make sure you have a MySQL connection pool or client setup

    doSignup: (loginData) => {
        console.log("signup data",loginData);
        
        // const { name, course, year, phone, email, password,dob, aadhar, gender } = loginData;
        const { name, course,sem, phone, email, password,dob, aadhar, gender } = loginData;

        // console.log(loginData);
        
        return new Promise((resolve, reject) => {
            // Define the SQL query
            // const query = 'INSERT INTO students (name,type, course ,year, email, password,gender) VALUES (?, ?, ?, ?, ?,?,?)';
            // Execute the query
            db.query('INSERT INTO login_data (name, type, course,semester, phone, email, password,dob, aadhar, gender,status) VALUES (?, ?, ?,?, ?, ?,?,?,?,?,?)', [name, type="student", course,sem, phone, email, password,dob, aadhar, gender, 0], (err, results) => {
                if (err) {
                    console.error('Error inserting into database:', err);
                    throw err
                    // Reject the promise on error
                }
                resolve()
            });
        });
    },
    doLogin: (loginData) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM login_data WHERE email = ?';
            db.query(query, [loginData.email], (err, data) => {
                if (err) {
                    console.error("Error querying login_data:", err);
                    reject(err);
                } else if (data.length === 0) {
                    // No user found with the provided email
                    resolve({ err: 'Email does not exist' });
                } else {
                    
                    const user = data[0]; // Retrieved user data
                    console.log('useru',user);
                    if (loginData.password === user.password) {
                        if (user.type === "student") {
                            if (user.status === 1) {
                                 resolve({ err: false, data: user });
                                // If the student is active, insert into the `students` table
                                // const insertQuery = `
                                //     INSERT IGNORE INTO students (name, email,year, department_id)
                                //     VALUES (?, ?, ?, ?)
                                // `;
                                // db.query(insertQuery, [user.name, user.email,user.year, user.department_id], (insertErr, insertResult) => {
                                //     if (insertErr) {
                                //         console.error("Error inserting into students table:", insertErr);
                                //         reject(insertErr);
                                //     } else {
                                //         resolve({ err: false, data: user });
                                //     }
                                // });
                            } else {
                                resolve({ err: 'Account is inactive' });
                            }
                        } else {
                            resolve({ err: 'Email does not exist' });
                        }
                    } else {
                        resolve({ err: 'Password is incorrect' });
                    }
                }
            });
        });
    },
}
//     doLogin: (loginData) => {

//         // const email = loginData.Email
//         // const password = loginData.Password

//         // const { email, password } = userData;

//         return new Promise((resolve, reject) => {
//             // Query the database for the user by email
//             const query = 'SELECT * FROM login_data WHERE email = ?';
//             db.query('SELECT * FROM login_data WHERE email = ?', [loginData.email], (err, data) => {
//                  console.log("student",data[0]);

//                 if (data.length === 0) {
//                     // No user found with the provided email
//                     //   console.log("email not exist");``

//                     resolve({ err: 'Email not exist' })
//                 } else {

//                     if (loginData.password == data[0].password) {
//                         console.log(data[0].status);
//                         if (data[0].type === "student") {
//                             if (data[0].status) {

//                                 resolve({ err: false, data })
//                             } else {

//                                 resolve({ err: "Account is inactive" })
//                             }
//                             //  console.log(".................");
//                         } else {
//                             resolve({ err: "Email not exist" })
//                         }

//                     } else {
//                         resolve({ err: 'Password is incorrect' })
//                     }

//                 }
//             })
//         })
//     }
// }

