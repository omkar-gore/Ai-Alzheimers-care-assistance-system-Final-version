import Message from '../models/Message.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User.js';

// Get conversation between caregiver and doctor
export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: currentUserId,
        },
      ],
    })
      .populate('sender', 'name role profileImage')
      .populate('receiver', 'name role profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);

    res.status(500).json({
      message: 'Failed to load messages',
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiver, message } = req.body;

    if (!receiver || !message?.trim()) {
      return res.status(400).json({
        message: 'Receiver and message are required',
      });
    }

    if (senderId.toString() === receiver.toString()) {
      return res.status(400).json({
        message: 'You cannot send a message to yourself',
      });
    }

    const receiverUser = await User.findById(receiver);

    if (!receiverUser) {
      return res.status(404).json({
        message: 'Receiver not found',
      });
    }

    const senderUser = await User.findById(senderId);

    if (!senderUser) {
      return res.status(404).json({
        message: 'Sender not found',
      });
    }

    // For now, CareMate chat is limited to caregiver ↔ doctor communication.
    const validConversation =
      (senderUser.role === 'caregiver' && receiverUser.role === 'doctor') ||
      (senderUser.role === 'doctor' && receiverUser.role === 'caregiver');

    if (!validConversation) {
      return res.status(403).json({
        message: 'Chat is available between caregivers and doctors only',
      });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver,
      message: message.trim(),
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name role profileImage')
      .populate('receiver', 'name role profileImage');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);

    res.status(500).json({
      message: 'Failed to send message',
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
      });
    }

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.json({
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark messages read error:', error);

    res.status(500).json({
      message: 'Failed to mark messages as read',
    });
  }
};

// Get available doctors for caregiver chat
export const getChatDoctors = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Only caregivers can access doctor list',
      });
    }

    const doctors = await User.find({
      role: 'doctor',
    }).select('name email phone profileImage role');

    res.json(doctors);
  } catch (error) {
    console.error('Get chat doctors error:', error);

    res.status(500).json({
      message: 'Failed to load doctors',
    });
  }
};