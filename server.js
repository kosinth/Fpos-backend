const express =require('express');
const cors = require('cors');
const bodyParse = require('body-parser');

const {readdirSync} = require('fs');
const app = express();
//app.use("view engine","jade");
const port = 5000;

//app.use(morgan('dev'));
app.use(cors());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json({limit: '10mb'}))

//const prodRoute = require('./Routes/product');

//auto route
readdirSync('./Routes')
    .map((r) => app.use('/api',require('./Routes/' +r)))

app.listen(port,(req,res) =>{
    console.log(`server is running port ==> ${port}`)
})