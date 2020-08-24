const express= require('express');
const app=express();
const fs=require("fs");
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');
const db = require('./DB/mysql');




app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// const myMiddleware=(req, res, next)=>{
//     const token = req.headers.token;
//     if(token=="12345")
//     {
//             next();
//     }
//     else{
//         console.error(`Invalid Token : ${token}`);
//         res.send("Token is not valid");
//     }
// };
const courseR=require('./routes/courseR');
const studentR=require('./routes/studentR');
const authR=require('./routes/auth');
const mysql=require('./DB/mysql');


try {
    let promise = mysql.connect()
    promise.then((result) => {
      console.log({"Data":result, "Error":null})
    })
  } catch (err) {
    console.log({"Data":null, "Error": err})
}




//auth middleware 
let salt='ThisIsMySalt';

const validateToken=async(req, res, next) => {
    let userdata;
    let token=req.headers.authorization;
    try {
        token=token.split('Bearer ')[1];
    } catch (err) {
        return res.json({data: null,error: 'Please add token'});
    }
    
    try 
    {
        userdata=jwt.verify(token, salt);
    } 
    catch(err) {
        return res.json({data: null,error:err});
    }
    // jwt.verify(token, salt,function(err, decode){
    //     if(err)
    //     {
    //         return res.json({data:null, error:err});
    //     }
    //     userdata=decode;
    // });

    if(userdata==undefined)
    {
        return res.json({data:null, error:"Something went wrong"});
    }

    let query=`SELECT COUNT(*) AS sum FROM user WHERE EMAIL="${userdata.email}" AND ID=${userdata.id}`;
    let [errs, data]=await to (db.executeQuery(query));
    if(errs)
    {
        return res.json({data:null, error:errs});
    }
    else{
        if(data[0].sum==0)
        {
            return res.json({data: null,error: 'invalid token'});
        }
        else{
            req.id=userdata.id;
            next();
        }
    }
    
};









// app.use(myMiddleware);
app.use('/api/auth', authR);
app.use(validateToken);
app.use('/api/course/', courseR);
app.use('/api/students/', studentR);



const PORT=process.env.PORT || 3000;
app.listen(PORT, (req, res)=>console.log(`We are at port ${PORT}`));