import mongoose from 'mongoose';

const alertSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 75,
    },
    channels: {
      type: [String],
      default: ['in_app'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AlertSubscriptionModel = mongoose.models.AlertSubscription || mongoose.model('AlertSubscription', alertSubscriptionSchema);
