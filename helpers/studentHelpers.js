let db = require('../config/connection')

module.exports = {
    // doSignup:(userData)={
    //     return new Promise((resolve, reject) => {
    //         db.query('insert into students values ')

    //     })
    // }
    // Make sure you have a MySQL connection pool or client setup

    doSignup: (loginData) => {
        const { name, course, year, phone, email, password,dob, aadhar, gender } = loginData;
        
        // console.log(loginData);
        
        return new Promise((resolve, reject) => {
            // Define the SQL query
            // const query = 'INSERT INTO students (name,type, course ,year, email, password,gender) VALUES (?, ?, ?, ?, ?,?,?)';
            // Execute the query
            db.query('INSERT INTO login_data (name, type, course, year, phone, email, password,dob, aadhar, gender,status) VALUES (?, ?, ?,?, ?, ?,?,?,?,?,?)', [name, type="student", course, year, phone, email, password,dob, aadhar, gender, 0], (err, results) => {
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

        // const email = loginData.Email
        // const password = loginData.Password

        // const { email, password } = userData;

        return new Promise((resolve, reject) => {
            // Query the database for the user by email
            const query = 'SELECT * FROM login_data WHERE email = ?';
            db.query('SELECT * FROM login_data WHERE email = ?', [loginData.email], (err, data) => {
                 console.log("student",data[0]);

                if (data.length === 0) {
                    // No user found with the provided email
                    //   console.log("email not exist");``

                    resolve({ err: 'Email not exist' })
                } else {

                    if (loginData.password == data[0].password) {
                        console.log(data[0].status);
                        if (data[0].type === "student") {
                            if (data[0].status) {

                                resolve({ err: false, data })
                            } else {

                                resolve({ err: "Account is inactive" })
                            }
                            //  console.log(".................");
                        } else {
                            resolve({ err: "Email not exist" })
                        }

                    } else {
                        resolve({ err: 'Password is incorrect' })
                    }

                }
            })
        })
    }
}

