const express=require('express');
const fs=require('fs');
const router=express.Router();
const db = require('../DB/mysql');
const {to} = require('await-to-js');
const studentData='json/student.json';




//Get details of all the student
router.get('/', async(req, res)=>{
    let query=`SELECT * FROM  student;`;

    let [err, data]=await to (db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    
    return res.json({data, error:null});
});


//Get student details by id
router.get('/:id', async(req, res)=>{
    let query = `SELECT * FROM student where id= ${req.params.id};`;
    let[err, data]=await to (db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    else if(data.length==0)
    {
        return res.json({data:null, error:"No student Exist with the given ID"});
    }

    return res.json({data, error:null});
    

});


//Add a student
router.post('/', async(req, res)=>{
    let name=req.body.name;
    
    if(typeof name!="string")
    {
        return res.json({data:null, error:"Invalid Entry!"});
    }
    let query=`SELECT * FROM student WHERE ID=${req.id};`;
    let [err, data]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    if(data.length==0)
    {
        query=`INSERT INTO student VALUES(${req.id}, "${req.body.name}");`;
        [err, data]=await to(db.executeQuery(query));
        if(err)
        {
            return res.json({data:null, error:err});
        }
        return res.json({data:"Success", error:null});
    }
    return res.json({data:null, error:"Already added or you are adding others as student"});
});



//update your details
// router.put('/', async(req, res)=>{
//     const name=req.body.name;
//     if(typeof name!="string")
//     {
//         return res.json({data:null, error:"Invalid Entry"});
//     }
//     let query=`SELECT * FROM student WHERE ID=${req.id}`
//     let[err, data]=await to(bd.executeQuery(query));
//     if(err)
//     {
//         return res.json({data:null, error:err});
//     }
//     if(data.length==0)
//     {
//         return res.json({data:null, error:"Please add youself as student"});
//     }
//     else{
//         query=`UPDATE student SET NAME="${req.body.name}" WHERE ID=${req.id};`;
//         [err, data]=await to(bd.executeQuery(query));
//         if(err)
//         {
//             return res.json({data:null, error:err});
//         }

//         return res.json({data:"Your name updated", error:null})
//     }
// })
module.exports=router;