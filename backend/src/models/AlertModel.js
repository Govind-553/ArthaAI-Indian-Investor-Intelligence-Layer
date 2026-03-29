import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    signalType: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['triggered', 'sent'],
      default: 'triggered',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AlertModel = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
