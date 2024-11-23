let mysql = require('mysql')
let db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'project'
})

module.exports=db