import mongoose from 'mongoose';

const signalSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    index: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for latest + score as requested
signalSchema.index({ createdAt: -1, score: -1 });

export const SignalModel = mongoose.model('Signal', signalSchema);
