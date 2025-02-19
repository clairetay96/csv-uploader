import express from 'express'
import cors from 'cors'
import multer from 'multer'
import mongoose from 'mongoose'
import { Csv } from './models/csvs'
import http from 'http'
import { Server } from 'socket.io'
import 'dotenv/config'
import { csvRow, csvFile } from './controllers'

// Express App
export const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  })

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }))

app.use(function(_, res, next){
    res.io = io;
    next();
});

// API endpoints
app.get('/:id', cors(), csvRow.get)
const upload = multer({ dest: 'tmp/csv/' });
app.post('/upload-csv', cors(), upload.single('file'), csvFile.upload)

// Start app
const start = async () => {
    try {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
    } else {
        throw new Error('Mongo URI is undefined')
    }
    } catch (err) {
        console.log(err)
    }

    Csv.createIndexes()
    Csv.createCollection()

    server.listen(process.env.PORT);
}
start()