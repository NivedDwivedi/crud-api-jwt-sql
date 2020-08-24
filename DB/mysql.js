const mysql=require("mysql");

let connection;
const connect = () =>{
    return new Promise((resolve, reject) =>{
        connection = mysql.createConnection({
            host : 'localhost',
            user : 'root',
            password : 'nived@99#',
            database : 'crudDB'
        });

        connection.connect( (err, res) =>{
            if (err)
            {
                return reject(new Error('Error in connecting to databse!'));
            }
            return  resolve('Database successfully connected');
        });
    });
};

const executeQuery= (query)=>{
    return new Promise((resolve, reject)=>
    {
        connection.query(query, function (error, results, fields) {
            if (error) 
            {
                return reject(error);
            }
            return resolve(results);
          });          
    });
};

 
module.exports={connect, executeQuery};