let db = require('../config/connection')

module.exports={
    doSignup:(userData)={
        return new Promise((resolve, reject) => {
            db.query('insert into students(Name) values (userData.name)' )
          
        })
    }
}