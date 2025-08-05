const mysql = require('mysql2/promise');
require('dotenv').config();


const connect = async(dbName)=> { 
    const HOST_NAME = process.env.HOST_NAME
    const MYSQL_USERNAME = process.env.MYSQL_USERNAME
    const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
    const MYSQL_PORT = process.env.MYSQL_PORT
    let connection =''
    try {
            connection = await mysql.createConnection({
            host : `${HOST_NAME}`,
            user : `${MYSQL_USERNAME}`,
            password : `${MYSQL_PASSWORD}`,
            database : dbName,
            port:`${MYSQL_PORT}`,
            insecureAuth: true,
            multipleStatements: true,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        })

        // ---create connect Pool

        // connection = await mysql.creatPool({
        //     host : `${HOST_NAME}`,
        //     user : `${MYSQL_USERNAME}`,
        //     password : `${MYSQL_PASSWORD}`,
        //     database : dbName,
        //     port:`${MYSQL_PORT}`,
        //     insecureAuth: true,
        //     multipleStatements: true,
        //     pool: {
        //         max: 10,
        //         min: 0,
        //         acquire: 30000,
        //         idle: 10000
        //     }
        // })



        // if (connection){
        //     return connection;
        // }
        //connection = await mysql.createConnection(db_config);
        //console.log('xxx ',connection)
        
        return connection;
    }catch (error) {
        console.error('Error connecting to Db :', error);
        connection = undefined;
        setTimeout(connect, 5000);
    }
}

module.exports = connect;
// V1.0