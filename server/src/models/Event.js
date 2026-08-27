const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    aggregateId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'CONTAINER_CREATED',
        'LOADED_ON_SHIP',
        'TEMPERATURE_SPIKE',
        'ARRIVED_AT_PORT',
        'CUSTOMS_CLEARED'
      ]
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      required: true
    }
  },
  {
    // Append-only event store: no updatedAt field or automatic versionKey
    timestamps: { createdAt: 'timestamp', updatedAt: false },
    versionKey: false
  }
);

// Compound index to guarantee fast sequential lookup and enforce uniqueness per aggregate version
EventSchema.index({ aggregateId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('Event', EventSchema);
