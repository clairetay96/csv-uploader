const express = require('express')
const cors = require('cors')
const fs = require('fs')
const multer = require('multer');
const path = require('path')
const csv = require('fast-csv');
const mongoose = require('mongoose')

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

const upload = multer({ dest: 'tmp/csv/' });

app.post('/upload-csv', cors(), upload.single('file'), function (req, res) {
    const fileRows = []
    // open uploaded file

    fs.createReadStream(path.resolve(req.file.path))
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => console.log(row))
      .on('end', (rowCount) => {
        console.log(req.file.path)
        fs.unlink(req.file.path, (err) => {
            if (err) throw err;
            console.log('file was deleted');
        }); 
        console.log(`Parsed ${rowCount} rows`)
    });
    res.status(200)
    res.send('Upload success')
  })

const start = async () => {
    // await mongoose.connect(
    //     "mongodb://0.0.0.0:27017/test"
    //   ); 
    app.listen(PORT, (error) =>{
        if(!error)
            {console.log("Server is Successfully Running, and App is listening on port "+ PORT) }
        else 
            {console.log("Error occurred, server can't start", error)}
        }
    )

}

start()