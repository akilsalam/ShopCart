var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt')
const {collection} = require("../config/user_database")
const productData = require('../data/product_data')
const products = productData.products
/* GET home page. */
router.get('/',async function(req, res, next) {
  if(req.session.loggedIn){
    res.render('index', { products ,ExistingUser:req.session.ExistingUser,loggedIn:true,user})
  }
  else{
    res.redirect('/login')
  }
}); 

router.post('/',async function(req,res){
if(req.session.loggedIn){
  res.render('index', { products ,ExistingUser:req.session.ExistingUser,loggedIn:true,user})
}
else{
  res.redirect('/login')
}
})

router.get('/login', function(req,res){
    if(!req.session.loggedIn){
      res.render('login',{LoginPasswordErr:req.session.LoginPasswordErr,LoginUserErr:req.session.LoginUserErr})
      req.session.LoginPasswordErr=false
      req.session.LoginUserErr=false
    }
    else{
      res.redirect('/')
    }
})

router.post('/login',async function(req,res){
try{
  const check = await collection.findOne({email:req.body.email})
  if(!check){
    req.session.LoginUserErr="!!User Name Cannot Found!!"
    res.redirect('/login')
  }else{
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if(isPasswordMatch){
      user = req.body.email
      req.session.loggedIn=true
      res.redirect('/')
    }else{
      req.session.LoginPasswordErr="!!Invalid Password!!"
      res.redirect("/login")
    }
  }
}
catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error')
}
})

router.get('/signup', function(req,res,next){
  res.render("signup",{ExistingUser:req.session.ExistingUser,signup:true})
  req.session.ExistingUser=false
})

router.post('/signup',async function(req,res){
  console.log(req.body);
  const data = {
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    email:req.body.email,
    password:req.body.pw
  }
  const existingUser = await collection.findOne({email: data.email})
  if(existingUser){
    req.session.ExistingUser='!!User already exist.Please use another email!!'
    res.render("signup",{ExistingUser:req.session.ExistingUser,signup:true})
    
  }
  else{
    user = req.body.email
    const saltRounds =10;
    const hashedPassword = await bcrypt.hash(data.password,saltRounds)
    data.password = hashedPassword;
    const userdata = await collection.insertMany([data])
    req.session.loggedIn=true
    if(!req.session.loggedIn){
      res.redirect('/signup')
    }
    else{
      res.redirect('/')
    }
  }
})

router.get('/logout',function (req,res){
  req.session.destroy()
  res.redirect('/login')
})

module.exports = router;
