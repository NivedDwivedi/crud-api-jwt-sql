const express=require("express");
const fs=require("fs");
const router=express.Router();
const bcrypt  = require('bcrypt');
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');
const db = require('../DB/mysql');



//Encryption
const encrypt=async (password)=>{
    const saltRounds=10;
    const [err, encrypt] = await to(bcrypt.hash(password, saltRounds));
    if (err) {
        return res.send("Encryption failed!");
    }
    return encrypt;
};
let salt='ThisIsMySalt';


//token generation
const generateToken=(usersData) => {
    
    let token=jwt.sign(usersData, salt, {
        expiresIn: `60m`,
    });
    return token;
};


//Signup
router.post('/signup', async(req, res)=>{
    let id=req.body.id;
    let name=req.body.name;
    let email=req.body.email;
    let password=req.body.password;
    
    if(typeof name!="string" || typeof email!="string" || typeof id!="number")
    {
        return res.json({data:null, error:"Invalid Entry!"});
    }

    //encrypt password
    let encryptedPassword=await encrypt(password);
    let query=`SELECT COUNT(*) AS sum FROM user WHERE ID=${req.body.id};`;
    let [err, uFound]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err})
    }
    else{
        if(uFound[0].sum!=0)
        {
            return res.json({data:null,error:"Already have an Account Please login"})
        }
        else{
            query=`INSERT INTO user VALUES(${req.body.id},"${req.body.name}", "${req.body.email}", "${encryptedPassword}");`;
            let [errs, ndata]=await to(db.executeQuery(query));
            if(errs)
            {
                return res.json({data:"failed", error:errs});
            }
            return res.json({data:"success", error:null});
        }
    }

});

//Login
router.post('/login', async(req, res)=>{
    let email=req.body.email;
    let password=req.body.password;
    
    if(typeof password!="string" || typeof email!="string")
    {
        return res.json({data:null, error:"Invalid Entry!"});
    }
    let id=0;
    let query=`SELECT * FROM user WHERE EMAIL="${req.body.email}";`;
    let [err, data]=await to (db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    else{
        if(data[0]==null)
        {
            return res.json({data:null, error:"Email id is not registered"});
        }
        else{
            let userPassword=data[0].PASSWORD;
            let sdata={
                "id":data[0].ID,
                "email":email
            };
            let [errs, isValid] = await to(
                bcrypt.compare(password, userPassword )
            );
            if(isValid){
               return res.json({data: {token:generateToken(sdata)},error:null});
            } else{
                return res.json({data:null,error:'Invalid password'})
            }
        }
    }   

});

module.exports = router;