import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const connect = async (req, res) => {
  const { userId } = req.body;
  try {
    const existingConnection = await Connection.findOne({
      $or: [
        { userId: req.user.id, connectedUserId: userId },
        { userId: userId, connectedUserId: req.user.id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({ message: "Connection already exists" });
    }

    const connection = new Connection({
      userId: req.user.id,
      connectedUserId: userId,
      status: "pending",
    });
    await connection.save();

    const user = await User.findById(req.user.id);
    const notification = new Notification({
      userId,
      message: `${user.name} sent you a connection request`,
    });
    await notification.save();

    res.status(200).json({ message: "Connection request sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptConnection = async (req, res) => {
  const { userId } = req.body;
  try {
    const connection = await Connection.findOne({
      userId: userId,
      connectedUserId: req.user.id,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connection.status = "connected";
    await connection.save();

    const user = await User.findById(req.user.id);
    const notification = new Notification({
      userId,
      message: `${user.name} accepted your connection request`,
    });
    await notification.save();

    res.status(200).json({ message: "Connection accepted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeConnection = async (req, res) => {
  const { userId } = req.body;
  try {
    await Connection.deleteOne({
      $or: [
        { userId: req.user.id, connectedUserId: userId, status: "connected" },
        { userId: userId, connectedUserId: req.user.id, status: "connected" },
      ],
    });

    res.status(200).json({ message: "Connection removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ userId: req.user.id }, { connectedUserId: req.user.id }],
    });

    const connectionDetails = await Promise.all(
      connections.map(async (conn) => {
        const otherUserId =
          conn.userId.toString() === req.user.id ? conn.connectedUserId : conn.userId;
        const user = await User.findById(otherUserId).select("name role profilePicture");
        return {
          _id: user._id,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          status: conn.status,
        };
      })
    );

    res.status(200).json(connectionDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};