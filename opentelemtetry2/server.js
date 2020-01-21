var bodyParser = require('body-parser');
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

//var whitelist = ['http://localhost', 'http://localhost:3000', 'http://localhost:5000/getTest', 'http://localhost:5000/test2', 'http://localhost:5000']
var blacklist= [];
var corsOptions = {
  origin: function (origin, callback) {
    console.log("hello world");
    if (blacklist.indexOf(origin) == -1) {
      callback(null, true)
    } else {
      console.log(origin);
      callback(new Error('Not allowed by CORS'))

    }
  }
}


app.use(cors({
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
}))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 


app.get('/getTest', cors(corsOptions), function (req, res) {
  res.send("test test test");
});

app.post('/test2',cors(corsOptions), function(req,res){
  res.set("Access-Control-Allow-Origin" ,"*");
  console.log("hu hu");
  console.log(req.body);
  res.end("yes");
});

app.listen(port, () => console.log("Server is started"));

