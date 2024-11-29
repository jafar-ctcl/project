const db = require("../config/connection")

module.exports = {
    
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
             console.log("email not exist");``
                
                resolve({err:'Email not exist'})
            }else{
                // if(userData.email==data[0].Email){
                    if(loginData.password == data[0].Password){
                        // console.log(data[0]);
                        if(data[0].Type=="hod")
                        {

                            resolve({err:false})
                        }else{
                            // console.log("its not admin");
                            
                            resolve({err:'Email not exist '})
                        }
                    //   console.log("pasword is equal");
                    }else{
                        // console.log('Password is incorrect');
                        
                        resolve({err:'Password is incorrect'})
                    }
                    
            }
        })
    }) 
}
    // doLogin: (loginData) => {
    //     return new Promise((resolve, reject) => {
    //         db.query('select * from login_data where email = ?', loginData.email, (err, data) => {
    //             // console.log(data);
    //             if (data.length == 0) {
    //                 resolve({ err: 'Email not exist.' })
    //                 // console.log("email not exist");
    //             } else {
    //                 if (loginData.password === data[0].password) {
    //                      console.log(data[0].type==="hod");
    //                     if (data[0].type === "hod") {
    //                         resolve({ err: false, hod: data })
    //                     } else {
    //                         resolve({ err: 'Email not exist.' })
    //                     }
    //                 }
    //                 else {
    //                     resolve({ err: 'Password incorrect.' })
    //                     // console.log('password incorrect.')
    //                 }
    //             }
    //         })
    //     })
    // },
 
}