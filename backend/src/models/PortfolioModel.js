import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    avgPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    holdings: {
      type: [holdingSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PortfolioModel = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);
