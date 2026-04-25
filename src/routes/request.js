const express = require('express');
const router = express.Router();
const Connection = require('../models/connection');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');

router.get('/request/:status/:toUserId', userAuth, async (req, res) => {
  const { status, toUserId } = req.params;
  const fromUserId = req.user._id;
  try {
    const validStatuses = ['ignored', 'interested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    //check if toUserId and fromUserId are the same
    if (toUserId === fromUserId.toString()) {
      return res
        .status(400)
        .json({ error: 'Cannot send connection request to yourself' });
    }
    // check if recipient user exists
    const recipientUser = await User.findById(toUserId);
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }
    // check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: fromUserId, recipient: toUserId },
        { requester: toUserId, recipient: fromUserId },
      ],
    });
    if (existingConnection) {
      return res
        .status(400)
        .json({ error: 'Connection request already exists' });
    }
    const connection = new Connection({
      requester: fromUserId,
      recipient: toUserId,
      status,
    });
    await connection.save();
    res.json({ message: 'Connection request sent successfully', connection });
  } catch (err) {
    console.error('Error sending connection request:', err);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

router.get(
  '/request/review/:status/:connectionId',
  userAuth,
  async (req, res) => {
    const { status, connectionId } = req.params;
    const userId = req.user._id;
    try {
      const validStatuses = ['accepted', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const connection = await Connection.findOne({
        _id: connectionId,
        recipient: userId,
        status: 'interested',
      });
      if (!connection) {
        return res.status(404).json({ error: 'Connection request not found' });
      }
      connection.status = status;
      await connection.save();
      res.json({
        message: 'Connection request reviewed successfully',
        connection,
      });
    } catch (err) {
      console.error('Error reviewing connection request:', err);
      res.status(500).json({ error: 'Failed to review connection request' });
    }
  },
);

module.exports = router;
