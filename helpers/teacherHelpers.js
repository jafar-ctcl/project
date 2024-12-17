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
    doLogin:(loginData)=>{
        console.log(loginData);
        
        return new Promise((resolve,reject)=>{
            db.query('SELECT * FROM login_data WHERE email= ?',[loginData.email],(err,data)=>{
                if(data.length===0){
                    resolve({ err: "Email not exist" })

                }else{
                    if (loginData.password == data[0].password) {
                        console.log(data[0].status);
                        if (data[0].type === "teacher") {
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
    },
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
    
    getClass:(classData)=>{
        console.log("", classData);
    }
    
}