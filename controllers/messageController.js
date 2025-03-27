import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const startConversation = async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    return res.status(400).json({ message: "Recipient ID is required" });
  }

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, recipientId],
        messages: [],
      });
      await conversation.save();
    }

    await conversation.populate("participants", "name profilePicture");
    await conversation.populate("messages");
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  const { conversationId, content } = req.body;
  if (!conversationId || !content) {
    return res.status(400).json({ message: "Conversation ID and content are required" });
  }

  try {
    const message = new Message({
      conversationId,
      sender: req.user.id,
      content,
    });
    await message.save();

    const conversation = await Conversation.findById(conversationId);
    conversation.messages.push(message._id);
    await conversation.save();

    const recipientId = conversation.participants.find(
      (id) => id.toString() !== req.user.id.toString()
    );
    const sender = await User.findById(req.user.id);
    const notification = new Notification({
      userId: recipientId,
      message: `You have a new message from ${sender.name}`,
      type: "message",
      relatedId: conversationId,
    });
    await notification.save();

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "name profilePicture")
      .populate("messages");
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};