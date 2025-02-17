import express from 'express'
import cors from 'cors'
import * as fs from 'fs'
import multer from 'multer'
import * as path from 'path'
import * as csv from 'fast-csv'
import mongoose from 'mongoose'
import progress from 'progress-stream'
import { Csv } from './models/csvs.ts'
import { v4 as uuidv4 } from 'uuid';

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


app.get('/:id', cors(), async (req, res) => {
    const csvId = req.params.id
    const { page, search } = req.query

    const filter = { csvId }
    if (search) {
        filter['$text'] = { $search : search }
    }

    const skipNumber = isNaN(Number(page)) ? 0 : (Number(page) - 1) * 50

    const rows = await Csv
                .find(filter)
                .sort({ rowNumber: 1 })
                .skip(skipNumber)
                .limit(50)

    res.status(200)
    res.send({ rows, headers: rows[0] ? Object.keys(rows[0].data) : [] })


})
const upload = multer({ dest: 'tmp/csv/' });

app.post('/upload-csv', cors(), upload.single('file'), async function (req, res) {
    // open uploaded file
    const filePath = req.file?.path ?? ''
    const fileName = req.file?.filename ?? ''
    const csvId = uuidv4()
    const uploadedAt = Date.now()

    const stat = fs.statSync(path.resolve(filePath))
    var str = progress({
        length: stat.size,
        time: 100 /* ms */
    });

    str.on('progress', function(progress) {
        // publish event on progress
        console.log(progress)
    })

    let rowNumber = 0
    fs.createReadStream(path.resolve(filePath))
        .pipe(str)
        .pipe(csv.parse({ headers: true }))
        .on('data', async (row) => { 
            rowNumber +=  1
            let valuesAsString = ''
            for (const x of Object.values(row)) {
                valuesAsString += `|${x}|`
            }
            await Csv.create({ csvName: fileName, csvId, data: row, uploadedAt, valuesAsString, rowNumber })
        })
        .on('end', async (rowCount: number) => {
            fs.unlink(filePath, (err) => {
                if (err) throw err;
                console.log('file was deleted');
            }); 
            console.log(`Parsed ${rowCount} rows`)

            const rows = await Csv
                .find({ csvId })
                .sort({ rowNumber: 1 })
                .skip(0)
                .limit(50)

            res.status(200)
            res.send({ rows, csvId })
        });
    })

const start = async () => {
    await mongoose.connect(
        "mongodb://0.0.0.0:27017/csv-uploader"
      ); 
    app.listen(PORT, (error) =>{
        if(!error)
            {console.log("Server is Successfully Running, and App is listening on port "+ PORT) }
        else 
            {console.log("Error occurred, server can't start", error)}
        }
    )

}

start()