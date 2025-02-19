"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var fs = require("fs");
var multer_1 = require("multer");
var path = require("path");
var csv = require("fast-csv");
var mongoose_1 = require("mongoose");
var progress_stream_1 = require("progress-stream");
var csvs_ts_1 = require("./models/csvs.ts");
var uuid_1 = require("uuid");
var app = (0, express_1.default)();
var PORT = 3001;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.get('/', (0, cors_1.default)(), function (req, res) {
    res.status(200);
    res.send("Welcome to root URL of Server");
});
app.get('/:id', (0, cors_1.default)(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var csvId, _a, page, search, filter, skipNumber, rows, rowCount;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                csvId = req.params.id;
                _a = req.query, page = _a.page, search = _a.search;
                filter = { csvId: csvId };
                if (search) {
                    filter['$text'] = { $search: search };
                }
                skipNumber = isNaN(Number(page)) ? 0 : (Number(page) - 1) * 50;
                return [4 /*yield*/, csvs_ts_1.Csv
                        .find(filter)
                        .sort({ rowNumber: 1 })
                        .skip(skipNumber)
                        .limit(50)];
            case 1:
                rows = _b.sent();
                return [4 /*yield*/, csvs_ts_1.Csv.countDocuments(filter)];
            case 2:
                rowCount = _b.sent();
                res.status(200);
                res.send({ rows: rows, headers: rows[0] ? Object.keys(rows[0].data) : [], rowCount: rowCount, filename: rows[0] ? Object.keys(rows[0].csvName) : [] });
                return [2 /*return*/];
        }
    });
}); });
var upload = (0, multer_1.default)({ dest: 'tmp/csv/' });
app.post('/upload-csv', (0, cors_1.default)(), upload.single('file'), function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileName, csvId, uploadedAt, stat, str, rowNumber, createPromises;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    filePath = (_b = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : '';
                    fileName = (_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.filename) !== null && _d !== void 0 ? _d : '';
                    csvId = (0, uuid_1.v4)();
                    uploadedAt = Date.now();
                    stat = fs.statSync(path.resolve(filePath));
                    str = (0, progress_stream_1.default)({
                        length: stat.size,
                        time: 100 /* ms */
                    });
                    str.on('progress', function (progress) {
                        // publish event on progress
                        console.log(progress);
                    });
                    rowNumber = 0;
                    createPromises = [];
                    fs.createReadStream(path.resolve(filePath))
                        .pipe(str)
                        .pipe(csv.parse({ headers: true }))
                        .on('data', function (row) {
                        rowNumber += 1;
                        var valuesAsString = '';
                        for (var _i = 0, _a = Object.values(row); _i < _a.length; _i++) {
                            var x = _a[_i];
                            valuesAsString += "|".concat(x, "|");
                        }
                        createPromises.push(csvs_ts_1.Csv.create({ csvName: fileName, csvId: csvId, data: row, uploadedAt: uploadedAt, valuesAsString: valuesAsString, rowNumber: rowNumber }));
                    })
                        .on('end', function () {
                        fs.unlink(filePath, function (err) {
                            if (err)
                                throw err;
                            console.log('file was deleted');
                        });
                    });
                    return [4 /*yield*/, Promise.allSettled(createPromises)];
                case 1:
                    _e.sent();
                    res.status(201);
                    res.send({ csvId: csvId });
                    return [2 /*return*/];
            }
        });
    });
});
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.connect(
                // "mongodb://0.0.0.0:27017/csv-uploader"
                "mongodb+srv://clairetay96:bBfWRuz9QQ1LpFEf@cluster0.3rztf.mongodb.net/")];
            case 1:
                _a.sent();
                app.listen(PORT, function (error) {
                    if (!error) {
                        console.log("Server is Successfully Running, and App is listening on port " + PORT);
                    }
                    else {
                        console.log("Error occurred, server can't start", error);
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
start();
