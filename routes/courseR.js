const express=require('express');
const fs=require('fs');
const router=express.Router();
const db = require('../DB/mysql');
const {to} = require('await-to-js');


const courseData='json/course.json';
const studentData='json/student.json';




// all courses details
router.get('/', async(req, res)=>{
    let query=`SELECT *  FROM course`;
    let[err, data ]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    return res.json({data, error:null}); 
});


//Specific course detail
router.get('/:id', async(req, res)=>{
    
    let query=`SELECT * FROM course WHERE ID=${req.params.id}`;
    let[err, data]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    if(data.length==0)
    {
        return res.json({data:null, error:"No course exist with the given ID"});
    }
    query=`select student.ID, student.NAME from student inner join enrollment on  student.ID=enrollment.STUDENT_ID  where enrollment.COURSE_ID=${req.params.id};`;
    let enrolled_data;
    [err, enrolled_data]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    data[0]["ENROLLED_STUDENT"]=enrolled_data;

    return res.json({data, error:null});
    
});




//Adding a course
router.post('/', async(req,res)=>{
    let id=0;
    let name = req.body.name;
    let description = req.body.description;
    let availableSlots = req.body.availableSlots;
    if (!name  || !description || !availableSlots )
    {
        return res.json({data:null, error:"Invalid Entry"});
    }

    
    if(typeof name == "string" && typeof description=="string" && typeof availableSlots=="number" && availableSlots>0)
    {
        let query=`INSERT INTO course VALUES(${id},"${req.body.name}", "${req.body.description}", ${req.body.availableSlots}, ${req.id})`;


        let [err, data]=await to(db.executeQuery(query));
        if(err)
        {
            return res.json({data:"sucess", error:err})
        }
        return res.json({data:"success", error:null});
    }
    else{
        return res.json({data:"failed", error:"Invalid Entry"});
    }
    
});





//Enroll a student to a course if stots are available
router.post('/:id/enroll', async(req, res)=>{
    let studentId=req.body.studentId;

    if(typeof studentId!='number')
    {
        return res.json({data:null, error:"Invalid Entry"});
    }
    let query=`SELECT COUNT(*) AS sum FROM student WHERE ID=${req.body.studentId};`;
    let [err, sFound]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err})
    }
    else{
        if(sFound[0].sum==0)
        {
            return res.json({data:null, error:"No student exist with the given Id"})
        }
    }
    
    query=`SELECT COUNT(*)AS sum FROM course WHERE ID=${req.params.id};`;
    let[err2, cFound]=await to(db.executeQuery(query));
    if(err2)
    {
        return res.json({data:null, error:err2});
    }
    else{
        if(cFound[0].sum==0)
        {
            return res.json({data:null, error:"No course exist with the given Id"})
        }
    }
    
    query=`select AVAILABLE_SLOTS from course where ID=${req.params.id};`;
    let[err3, available_slots]=await to(db.executeQuery(query));
    if(err3)
    {
        return res.json({data:null, error:err3});
    }
    else{
        if(available_slots[0]==0)
        {
            return res.json({data:null,error:"No slots available"});
        }
    }
    query=`SELECT OWNER FROM course WHERE ID=${req.params.id};`;
    let [errs, owner]=await to(db.executeQuery(query));
    if(errs)
    {
        return res.json({data:null, error:errs})
    }
    if(owner[0]==req.id || studentId==req.id)
    {
        query=`UPDATE course SET AVAILABLE_SLOTS=AVAILABLE_SLOTS-1 WHERE ID=${req.params.id};`;
        let[err4, data]=await to(db.executeQuery(query));
        if(err4)
        {
            return res.json({data:null, error:err4});
        }
        query=`INSERT INTO enrollment VALUES(${req.body.studentId}, ${req.params.id});`;
        let[err5, no_data]=await to(db.executeQuery(query));
        if(err5)
        {
            return res.json({data:null, error:err5});
        }

        return res.json({data:"success", error:null});
    }
    
    return res.json({data:null, error:"You can not add other or You are not owner"});
});









//Remove a student from course 
router.put('/:id/deregister', async(req, res)=>{
    let studentId=req.body.studentId;
    if(typeof studentId!="number")
    {
        return res.send("Invalid student id");
    }
    let query=`SELECT COUNT(*) AS sum FROM student WHERE ID=${req.body.studentId};`;
    let [err, sFound]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err})
    }
    else{
        if(sFound[0].sum==0)
        {
            return res.json({data:null, error:"No student exist with the given Id"})
        }
    }
    
    query=`SELECT COUNT(*)AS sum FROM course WHERE ID=${req.params.id};`;
    let[err2, cFound]=await to(db.executeQuery(query));
    if(err2)
    {
        return res.json({data:null, error:err2});
    }
    else{
        if(cFound[0].sum==0)
        {
            return res.json({data:null, error:"No course exist with the given Id"})
        }
    }

    //checking if student is enrolled in the course
    query=`SELECT COUNT(*) AS sum FROM enrollment WHERE STUDENT_ID=${req.body.studentId} AND COURSE_ID=${req.params.id};`;
    let [errc, eFound]=await to(db.executeQuery(query));
    if(errc)
    {
        return res.json({data:null, error:errc})
    }
    else{
        if(eFound[0].sum==0)
        {
            return res.json({data:null, error:`Student with the Id:${req.body.studentId} is not enrolled in the course:${req.params.id}`})
        }
    }

    query=`SELECT OWNER FROM course WHERE ID=${req.params.id};`;
    let [errs, owner]=await to(db.executeQuery(query));
    if(errs)
    {
        return res.json({data:null, error:errs})
    }

    if(studentId==req.id || owner[0]==req.id)
    {
        query=`UPDATE course SET AVAILABLE_SLOTS=AVAILABLE_SLOTS+1 WHERE ID=${req.params.id};`;
        let[err3, data]=await to(db.executeQuery(query));
        if(err3)
        {
            return res.json({data:null, error:err3});
        }
        query=`DELETE FROM enrollment WHERE STUDENT_ID=${req.body.studentId}`;
        let[err4, no_data]=await to(db.executeQuery(query));
        if(err4)
        {
            return res.json({data:null, error:err4});
        }

        return res.json({data:"success", error:null});
    }
    return res.json({data:null, error:"You can not deregister other or You are not owner"});
});






//Delete a course
router.put('/:id/delete', async(req, res)=>{
    
    let query=`SELECT COUNT(*) AS sum FROM course WHERE ID=${req.params.id};`;
    let[err, cFound]=await to(db.executeQuery(query));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    else{
        if(cFound[0].sum==0)
        {
            return res.json({data:null, error:"No course exist with the given Id"})
        }
    }

    query=`SELECT OWNER FROM course WHERE ID=${req.params.id};`;
    let [errs, owner]=await to(db.executeQuery(query));
    if(errs)
    {
        return res.json({data:null, error:errs})
    }

    if(owner[0]==req.id)
    {
        query=`DELETE FROM enrollment WHERE COURSE_ID=${req.params.id}`;
        let[err4, no_data]=await to(db.executeQuery(query));
        if(err4)
        {
            return res.json({data:null, error:err4});
        }

        query=`DELETE FROM course WHERE COURSE_ID=${req.params.id}`;
        let[errd, n_data]=await to(db.executeQuery(query));
        if(errd)
        {
            return res.json({data:null, error:errd});
        }

        return res.json({data:"success", error:null});
    }
    return res.json({data:null , error:"You are not Owner"});
});

module.exports=router;