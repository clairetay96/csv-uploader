const mongoose = require("mongoose");

const CsvSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Number,
    required: true,
  },
  rows: {
    required: true,
    type: Array
  }
});

export const Csv = mongoose.model("Csv", CsvSchema);