const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      required: true,
    },
  },
  { timestamps: true },
);

connectionSchema.pre('save', async function (next) {
  const connection = this;
  if (connection.requester.toString() === connection.recipient.toString()) {
    throw new Error('Cannot create connection with yourself');
  }
  next();
});

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
