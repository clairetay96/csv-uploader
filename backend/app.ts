const express = require('express')
const cors = require('cors')

const app = express();
const PORT = 3001;



app.use(cors({
    origin: 'http://localhost:3000/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }))

app.get('/', cors(), (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});

app.listen(PORT, (error) =>{
    if(!error)
        {console.log("Server is Successfully Running, and App is listening on port "+ PORT) }
    else 
        {console.log("Error occurred, server can't start", error)}
    }
)