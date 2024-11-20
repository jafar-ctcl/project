var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { hod:false });
});
router.get('/login',(req,res)=>{
  res.render('login')
})

router.get('/signup',(req,res)=>{
  res.render('signup')
})
module.exports = router;
