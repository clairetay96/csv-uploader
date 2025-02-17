import mongoose from 'mongoose'

const CsvRowSchema = new mongoose.Schema({
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

CsvRowSchema.index({ valuesAsString: 'text'})
CsvRowSchema.index({ csvId: 1 })

export const Csv = mongoose.model("Csv", CsvRowSchema);
Csv.createIndexes()
// Create collection of Model 
Csv.createCollection().then(function () { 
  console.log('Collection is created!'); 
});
