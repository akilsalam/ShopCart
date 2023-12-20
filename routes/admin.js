var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt")
const {collection} = require('../config/user_database')
const {admin_collection} = require("../config/user_database")

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.admin_loggedIn){
    res.redirect('/admin/admin-home')
  }else{
    res.render('admin/admin-login',{ admin:true,PasswordErr:req.session.PasswordErr,UserErr:req.session.UserErr})
    req.session.PasswordErr=false
    req.session.UserErr=false
  }
});

router.post('/',async function(req, res, next) {
  if(req.session.admin_loggedIn){
    res.redirect('/admin/admin-home')
  }else{
  res.render('admin/admin-login',{ admin:true,PasswordErr:req.session.PasswordErr,UserErr:req.session.UserErr})
  req.session.PasswordErr=false
  req.session.UserErr=false
  }


});

router.get('/admin-home',async function(req, res, next) {
  try{
    const users = await collection.aggregate([
      { $sort: { email: -1 } }
    ]);
    if(req.session.admin_loggedIn){
    res.render('admin/admin-home',{admin:true,admin_logged:true,users,Deleted:req.session.Deleted})
    req.session.Deleted=false
    }
    else{
      res.redirect('/admin')

    } 
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error")
  }


});

router.post('/admin-home',async (req, res, next)=> {
  const users = await collection.aggregate([
    { $sort: { email: -1 } }
  ]);
  try{
    const check = await admin_collection.findOne({email:req.body.email})
    if(!check){
      req.session.UserErr="!!User name cannot found!!"
      res.redirect('/admin')
    }else{
      const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
      if(isPasswordMatch){
        req.session.admin_loggedIn=true
        res.render('admin/admin-home',{admin:true,admin_logged:true,users,Deleted:req.session.Deleted})
        req.session.Deleted=false
      }
      else{
        req.session.PasswordErr="!!Invalid Password!!"
        res.redirect('/admin')
  
      }
    }
  }
catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error')
  }
});

router.get('/create-user',function(req,res){
      res.render('admin/create-user',{admin:true,admin_logged:true,ExistingUser:req.session.ExistingUser})
      req.session.ExistingUser=false
})

router.post('/create-user',async function(req,res){
  const data = {
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    email:req.body.email,
    password:req.body.pw
  }
  const existingUser = await collection.findOne({email: data.email})
  if(existingUser){
    req.session.ExistingUser="!!User already exists.Please choose a different username.!!"
    res.render('admin/create-user',{admin:true,admin_logged:true,ExistingUser:req.session.ExistingUser})

  }
  else{
    const saltRounds =10;
    const hashedPassword = await bcrypt.hash(data.password,saltRounds)
    data.password = hashedPassword;
    const userdata = await collection.insertMany([data])
    req.session.loggedIn=true
    if(req.session.loggedIn){
      res.redirect('/admin/admin-home')
    }
    else{
      res.redirect('/admin')

    }
  }

})

router.get('/edit-user/:id',async (req,res)=>{
  const userId = req.params.id;
  const selectUser = await collection.findById(userId);
  if (!selectUser) return res.status(404).send('User not found');
  res.render("admin/edit-user", { admin: true, admin_logged: true ,selectUser})
})

router.post('/edit-user/:id', async (req, res,next) => {
  const userId = req.params.id;
  const updates = req.body; 
  await collection.findByIdAndUpdate(userId, updates);
  res.redirect('/admin/admin-home');
});

router.get('/delete/:id', async (req, res, next) => {
  try {
    const deletedDocument = await collection.findOneAndDelete({ _id: req.params.id });

    if (deletedDocument) {
      req.session.Deleted="Data Deleted Succefully"      
      res.redirect('/admin/admin-home')
    } 
    else {
      console.log(`Document with ID ${req.params.id} not found`);
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error(`Error deleting document with ID ${req.params.id}: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/admin-logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin')
});


module.exports = router;

