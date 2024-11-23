var express = require('express');
var router = express.Router();
var student=true
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:'SASC' ,student });
});
router.get('/login',(req,res)=>{
  res.render('login',{title:'User',student})
})
router.post('/login',(req,res)=>{
 
console.log(req.body);
 
})
router.get('/signup',(req,res)=>{
  res.render('signup')
})
router.post('/signup',(req,res)=>{
  console.log(req.body);
  
})
module.exports = router;
