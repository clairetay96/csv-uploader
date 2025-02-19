import express from 'express'
import cors from 'cors'
import * as fs from 'fs'
import multer from 'multer'
import * as path from 'path'
import * as csv from 'fast-csv'
import mongoose from 'mongoose'
import { Csv } from './models/csvs.ts'
import { v4 as uuidv4 } from 'uuid';
import http from 'http'
import { Server } from 'socket.io'

const ROWS_PER_PAGE = 30

const app = express();
const PORT = 5001;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }))

app.use(function(_, res, next){
    res.io = io;
    next();
});

app.get('/', cors(), (_, res)=>{
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

    const skipNumber = isNaN(Number(page)) ? 0 : (Number(page) - 1) * ROWS_PER_PAGE

    const rows = await Csv
                .find(filter)
                .sort({ rowNumber: 1 })
                .skip(skipNumber)
                .limit(ROWS_PER_PAGE)

    const rowCount = await Csv.countDocuments(filter)

    res.status(200)
    res.send({ rows, headers: rows[0] ? Object.keys(rows[0].data) : [], rowCount, filename: rows[0] ? rows[0].csvName : []})
})

const upload = multer({ dest: 'tmp/csv/' });
app.post('/upload-csv', cors(), upload.single('file'), async function (req, res) {
    // open uploaded file
    const filePath = req.file?.path ?? ''
    const fileName = req.body?.filename ?? ''
    const csvId = uuidv4()
    const uploadedAt = Date.now()

    let rowNumber = 0
    let fulfilledCount = 0
    let rejectedCount = 0
    const createPromises: Array<Promise<any>> = []
    fs.createReadStream(path.resolve(filePath))
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => { 
            rowNumber +=  1
            let valuesAsString = ''
            for (const x of Object.values(row)) {
                valuesAsString += `|${x}|`
            }
            createPromises.push(
                Csv.create({ csvName: fileName, csvId, data: row, uploadedAt, valuesAsString, rowNumber })
                .then(() => { fulfilledCount += 1 })
                .catch(() => { rejectedCount += 1 })
            )
        })
        .on('end', async () => {
            fs.unlink(filePath, (err) => {
                if (err) throw err;
            }); 

            const allPromises = createPromises.length
            while (fulfilledCount + rejectedCount < allPromises) {
                res.io.to(req.body.socketId).emit('uploadProgress', {uploadProgress: (fulfilledCount + rejectedCount)/allPromises} )
                await new Promise(res => setTimeout(res, 1000))
            }

            await Promise.allSettled(createPromises)
            res.status(201)
            res.send({ csvId })
        });
})

const start = async () => {

    try {
    await mongoose.connect(
        "mongodb+srv://clairetay96:bBfWRuz9QQ1LpFEf@cluster0.3rztf.mongodb.net/"
      );
    } catch (err) {
        console.log(err)
    }

    Csv.createIndexes()
    Csv.createCollection()

    server.listen(PORT);
}

start()