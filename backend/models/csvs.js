"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Csv = void 0;
var mongoose_1 = require("mongoose");
var CsvRowSchema = new mongoose_1.default.Schema({
    csvName: {
        type: String,
        required: true,
    },
    csvId: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Number,
        required: true,
    },
    data: {
        required: true,
        type: Object,
    },
    valuesAsString: {
        type: String,
    },
    rowNumber: {
        type: Number,
        required: true,
    }
});
CsvRowSchema.index({ valuesAsString: 'text' });
CsvRowSchema.index({ csvId: 1 });
exports.Csv = mongoose_1.default.model("Csv", CsvRowSchema);
exports.Csv.createIndexes();
// Create collection of Model 
exports.Csv.createCollection().then(function () {
    console.log('Collection is created!');
});
