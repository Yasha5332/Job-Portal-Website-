const Notification = require('../models/Notification');

// ─── CREATE NOTIFICATION (helper) ─────────────────────────────────────────────
exports.createNotification = async ({ userId, title, message, type }) => {
    try {
        const notif = new Notification({
            user: userId,
            title,
            message,
            type
        });
        await notif.save();
        return notif;
    } catch (error) {
        console.error('Notification Error:', error.message);
    }
};

// ─── CREATE NOTIFICATION (manual) ─────────────────────────────────────────────
// POST /api/notifications  (protected)
exports.manualCreate = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        const notif = await exports.createNotification({
            userId: req.userId,
            title,
            message,
            type
        });
        res.status(201).json({ notification: notif });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── GET ALL NOTIFICATIONS FOR LOGGED-IN USER ─────────────────────────────────
// GET /api/notifications  (protected)
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
// PATCH /api/notifications/:id/read  (protected)
exports.markRead = async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { is_read: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ message: 'Notification not found.' });
        res.status(200).json({ notification: notif });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
// PATCH /api/notifications/read-all  (protected)
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.userId, is_read: false }, { is_read: true });
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── DISMISS (DELETE) ONE ────────────────────────────────────────────────────
// DELETE /api/notifications/:id  (protected)
exports.dismissNotification = async (req, res) => {
    try {
        const notif = await Notification.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!notif) return res.status(404).json({ message: 'Notification not found.' });
        res.status(200).json({ message: 'Notification dismissed.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// ─── GET UNREAD COUNT ────────────────────────────────────────────────────────
// GET /api/notifications/unread-count  (protected)
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.userId, is_read: false });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
