let db = require('../config/connection')

module.exports={
    // doSignup:(userData)={
    //     return new Promise((resolve, reject) => {
    //         db.query('insert into students values ')
          
    //     })
    // }
 // Make sure you have a MySQL connection pool or client setup

 doSignup : (userData) => {
    const { name,type, course ,year, email, password,gender} = userData;
    return new Promise((resolve, reject) => {
        // Define the SQL query
        // const query = 'INSERT INTO students (name,type, course ,year, email, password,gender) VALUES (?, ?, ?, ?, ?,?,?)';
        // Execute the query
        db.query( 'INSERT INTO students (name,type, course ,year, email, password,gender) VALUES (?, ?, ?, ?, ?,?,?)', [name,type, course ,year, email, password,gender], (err, results) => {
            if (err) {
                console.error('Error inserting into database:', err);
                reject(err); // Reject the promise on error
            } else {
                console.log('Insert successful:', results);
                resolve(results); // Resolve the promise on success
            }
        });
    });
},
doLogin :(userData)=>{
    let status = false
    // const email = loginData.Email
    // const password = loginData.Password
   
    // const { email, password } = userData;

    return new Promise((resolve, reject) => {
        // Query the database for the user by email
        const query = 'SELECT * FROM students WHERE email = ?';
        db.query('SELECT * FROM students WHERE email = ?', [userData.email], (err, data) => {
            console.log(data[0]);
           
            if (data.length === 0) {
                // No user found with the provided email
                console.log("email not exist");
                
                resolve({err:'email not exist'})
            }else{
                // if(userData.email==data[0].Email){
                    if(userData.password == data[0].Password){
                        status=true  
                        resolve(status)
                    }
                    return resolve(status)
                // }
                
                
                
            }

           
        })
    }) 
}
}    

