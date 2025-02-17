import express from 'express'
import cors from 'cors'
import * as fs from 'fs'
import multer from 'multer'
import * as path from 'path'
import * as csv from 'fast-csv'
import mongoose from 'mongoose'
import progress from 'progress-stream'

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
    const filePath = req.file?.path ?? ''

    const stat = fs.statSync(path.resolve(filePath))
    var str = progress({
        length: stat.size,
        time: 100 /* ms */
    });

    str.on('progress', function(progress) {
        console.log(progress)
    })

    fs.createReadStream(path.resolve(filePath))
      .pipe(str)
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => {})
      .on('end', (rowCount) => {
        fs.unlink(filePath, (err) => {
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