const Message = require('../models/Message');
const Notification = require('../models/Notification');

// --- Messages ---
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const newMessage = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      content
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent', data: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: contactId },
        { sender: contactId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Notifications ---
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};