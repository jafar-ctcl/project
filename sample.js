let db = require('../config/connection')

module.exports={
    doSignup: (userData) => { 
    
        const { name,type, course ,year, email, password,aadar,abcd,gender} = userData;
        userData.status=0
        
        return new Promise((resolve, reject) => {
            // Define the SQL query
            // const query = 'INSERT INTO students (name,type, course ,year, email, password,gender) VALUES (?, ?, ?, ?, ?,?,?)';
            // Execute the query
          db.query( 'INSERT INTO login_data VALUES (?, ?, ?, ?, ?,?,?,?,?)', [name,type, course ,year, email, password,aadar,abcd,gender], (err, results) => {
                if (err) {
                    throw err
                }
                resolve()
            })
        })
    },
 doLogin: (loginData) => {
   
    return new Promise((resolve, reject) => {
        db.query('select * from login_data where email = ?', loginData.email, (err, data) => {
            // console.log(data);
            if (data.length == 0) {
                resolve({ err: 'Email not exist.' })
                // console.log("email not exist");
            } else {
                if (loginData.password === data[0].password) {
                    resolve({err:false})
                    // console.log("success");
                    if (data[0].type === "student") {
                        if(data[0].status){
                            resolve({ err: false })
                        }else{
                            resolve({err: 'Account is inactive.'})
                        }
                    } else {
                        resolve({ err: 'Email not exist.' })
                    }
                    // resolve({err:'password incorrect'})
                }
                else {
                    resolve({ err: 'Password incorrect.' })
                    // console.log('password incorrect.')
                }
            }
        })

    })
},
 
doSignup: (userData) => {
    const { name, type, course, year, email, password, aadhar, gender } = userData; // Removed 'abcd'
  
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO login_data (name, type, course, year, email, password, aadhar, gender) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [name, type, course, year, email, password, aadhar, gender]; // Removed 'abcd'
  
      console.log('Executing query:', db.format(query, values));
  
      db.query(query, values, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  },  
}
