
import { Csv } from '../models/csvs'
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs'
import * as path from 'path'
import * as csv from 'fast-csv'

const ROWS_PER_PAGE = 30

export const csvFile = {
    upload: async function (req, res) {
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
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
    
                await Promise.allSettled(createPromises)
                res.status(201)
                res.send({ csvId })
            });
    }
}

export const csvRow = {
    get: async (req, res) => {
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
    }
}