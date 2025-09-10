const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Ticket = require("../models/Ticket");

// POST /api/user/register - Register user after Firebase auth
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, address, location } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "User already exists with this email",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name: name || null,
      phone: phone || null,
      address: address || null,
      location: location || null,
    });

    await newUser.save();

    // Populate tickets to return full ticket objects
    const populatedUser = await User.findById(newUser._id).populate("tickets");

    // Return user without password
    const userResponse = {
      _id: populatedUser._id,
      email: populatedUser.email,
      name: populatedUser.name,
      phone: populatedUser.phone,
      address: populatedUser.address,
      location: populatedUser.location,
      role: populatedUser.role,
      isTechnician: populatedUser.isTechnician,
      tickets: populatedUser.tickets,
      points: populatedUser.points,
      createdAt: populatedUser.createdAt,
      updatedAt: populatedUser.updatedAt,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// PUT /api/user/update/details/:email - Update user details
router.put("/update/details/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name, phone, address, location } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Update only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (location !== undefined) updateFields.location = location;

    const updatedUser = await User.findOneAndUpdate({ email }, updateFields, {
      new: true,
      runValidators: true,
    }).populate("tickets");

    // Return user without password
    const userResponse = {
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      location: updatedUser.location,
      role: updatedUser.role,
      isTechnician: updatedUser.isTechnician,
      tickets: updatedUser.tickets,
      points: updatedUser.points,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.json({
      message: "User details updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// PUT /api/user/update/role/:email - Update user role
router.put("/update/role/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { role, isTechnician } = req.body;

    // Validate role if provided
    const validRoles = ["user", "technician", "authority", "admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be one of: " + validRoles.join(", "),
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Update only provided fields
    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (isTechnician !== undefined) updateFields.isTechnician = isTechnician;

    const updatedUser = await User.findOneAndUpdate({ email }, updateFields, {
      new: true,
      runValidators: true,
    }).populate("tickets");

    // Return user without password
    const userResponse = {
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      location: updatedUser.location,
      role: updatedUser.role,
      isTechnician: updatedUser.isTechnician,
      tickets: updatedUser.tickets,
      points: updatedUser.points,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.json({
      message: "User role updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /api/user/tickets/:email - Get tickets created by user
router.get("/tickets/:email", async (req, res) => {
  try {
    const { email } = req.params;

    console.log(email);

    // Find the issues with creator_email matching the user's email

    const tickets = await Ticket.find({ creator_email: email });
    if (!tickets) {
      return res.status(404).json({
        error: "No tickets found for this user",
      });
    }

    res.json({
      message: "User tickets retrieved successfully",
      tickets,
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /api/user/profile/:email - Get user profile by email
router.get("/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find user by email
    const user = await User.findOne({ email }).populate("tickets");
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      location: user.location,
      role: user.role,
      isTechnician: user.isTechnician,
      tickets: user.tickets,
      points: user.points,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      message: "User profile retrieved successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;
