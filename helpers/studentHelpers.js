let db = require('../config/connection')

module.exports={
    // doSignup:(userData)={
    //     return new Promise((resolve, reject) => {
    //         db.query('insert into students values ')
          
    //     })
    // }
 // Make sure you have a MySQL connection pool or client setup

 doSignup : (loginData) => {
    const { name,type, course ,year, email, password,aadhar,gender} = loginData;
    return new Promise((resolve, reject) => {
        // Define the SQL query
        // const query = 'INSERT INTO students (name,type, course ,year, email, password,gender) VALUES (?, ?, ?, ?, ?,?,?)';
        // Execute the query
        db.query( 'INSERT INTO login_data (name,type, course ,year, email, password,aadhar,gender) VALUES (?, ?, ?, ?, ?,?,?,?)', [name,type, course ,year, email,  password,aadhar,gender], (err, results) => {
            if (err) {
                console.error('Error inserting into database:',err);
                throw err
                // Reject the promise on error
            } 
            resolve()
        });
    });
},
doLogin :(loginData)=>{

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
            //   console.log("email not exist");``
                
                resolve({err:'Email not exist'})
            }else{
                // if(userData.email==data[0].Email){
                    if(loginData.password == data[0].Password){
                    //    console.log("pasword is equal");
                          resolve({err:false})
                    }else{
                        resolve({err:'Password is incorrect'})
                    }
                    
            }
        })
    }) 
}
}    

