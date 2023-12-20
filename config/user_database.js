const mongoose = require("mongoose")
const connect = mongoose.connect('mongodb://127.0.0.1:27017/Signup');

//check database connected or not 
connect.then(()=>{
    console.log("Database Connected");
})
.catch(()=>{
    console.log("Database Failed");
})

//Create Schema
const SignUpSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const AdminLogin = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//collection Part
const collection = new mongoose.model("users",SignUpSchema)
const admin_collection = new mongoose.model("admin",AdminLogin)

module.exports = {collection,admin_collection}