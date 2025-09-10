const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");

// GET /api/ticket/all - Get all tickets
router.get("/all", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("authority", "email name role")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      message: "Tickets retrieved successfully",
      tickets: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /api/ticket/create - Create new ticket
router.post("/create", async (req, res) => {
  try {
    const {
      creator_email,
      creator_name,
      ticket_name,
      ticket_category,
      ticket_description,
      image_url,
      tags,
      urgency,
      location,
    } = req.body;

    // Validate required fields
    if (
      !creator_email ||
      !creator_name ||
      !ticket_name ||
      !ticket_category ||
      !ticket_description ||
      !location
    ) {
      return res.status(400).json({
        error:
          "creator_email, creator_name, ticket_name, ticket_category, ticket_description, and location are required",
      });
    }

    // Validate location format
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        error: "Location must include latitude and longitude",
      });
    }

    // Handle creator - find by email or create new user
    let creator = await User.findOne({ email: creator_email });

    if (!creator) {
      // Create new user if not found
      creator = new User({
        email: creator_email,
        password: "tempPassword123", // Default temporary password
        name: creator_name,
        role: "user",
      });
      await creator.save();
      console.log("Created new user for ticket creation:", creator);
    }

    // Validate urgency if provided
    const validUrgencies = ["critical", "moderate", "low"];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({
        error: "Invalid urgency. Must be one of: " + validUrgencies.join(", "),
      });
    }

    // Create new ticket using the email of the creator
    const newTicket = new Ticket({
      creator_email: creator.email, // Use the email, not the MongoDB ObjectId
      creator_name,
      ticket_name,
      ticket_category,
      ticket_description,
      image_url: image_url || null,
      tags: tags || [],
      urgency: urgency || "moderate",
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });

    await newTicket.save();

    // Add ticket reference to user's tickets array and award 10 points using email
    await User.findOneAndUpdate(
      { email: creator.email }, // Use the email
      {
        $push: { tickets: newTicket._id },
        $inc: { points: 10 }, // Award 10 points for creating a ticket
      }
    );

    console.log(
      `Awarded 10 points to user ${creator.name} for creating ticket: ${newTicket.ticket_name}`
    );

    // Return the populated ticket for response
    const populatedTicket = await Ticket.findById(newTicket._id);

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// PUT /api/ticket/update/:id - Update ticket
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      ticket_name,
      ticket_category,
      ticket_description,
      image_url,
      tags,
      votes,
      urgency,
      location,
      closing_time,
      authority,
    } = req.body;

    // Find ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    // Validate status if provided
    const validStatuses = ["open", "resolved", "in process"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Validate urgency if provided
    const validUrgencies = ["critical", "moderate", "low"];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({
        error: "Invalid urgency. Must be one of: " + validUrgencies.join(", "),
      });
    }

    // Validate authority if provided
    if (authority) {
      const authorityUser = await User.findById(authority);
      if (!authorityUser) {
        return res.status(404).json({
          error: "Authority user not found",
        });
      }
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (status !== undefined) {
      updateFields.status = status;
      // Auto-set closing_time when status changes to 'resolved'
      if (status === "resolved" && !ticket.closing_time) {
        updateFields.closing_time = new Date();
      }
    }
    if (ticket_name !== undefined) updateFields.ticket_name = ticket_name;
    if (ticket_category !== undefined)
      updateFields.ticket_category = ticket_category;
    if (ticket_description !== undefined)
      updateFields.ticket_description = ticket_description;
    if (image_url !== undefined) updateFields.image_url = image_url;
    if (tags !== undefined) updateFields.tags = tags;
    if (votes !== undefined) updateFields.votes = votes;
    if (urgency !== undefined) updateFields.urgency = urgency;
    if (location !== undefined) {
      // Validate location format
      if (!location.latitude || !location.longitude) {
        return res.status(400).json({
          error: "Location must include latitude and longitude",
        });
      }
      updateFields.location = location;
    }
    if (closing_time !== undefined) updateFields.closing_time = closing_time;
    if (authority !== undefined) updateFields.authority = authority;

    // Update ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("authority", "email name role");

    res.json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /api/ticket/:id - Get single ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find ticket by ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    // Get creator details
    let creator = null;
    if (ticket.creator_email) {
      creator = await User.findOne({ email: ticket.creator_email });
    }

    // Get authority details if assigned
    let authority = null;
    if (ticket.authority) {
      authority = await User.findOne({ email: ticket.authority });
    }

    // Prepare response with populated data
    const ticketResponse = {
      ...ticket.toObject(),
      creator: creator
        ? {
            _id: creator._id,
            name: creator.name,
            email: creator.email,
          }
        : null,
      authority: authority
        ? {
            _id: authority._id,
            name: authority.name,
            email: authority.email,
          }
        : null,
    };

    res.json({
      message: "Ticket retrieved successfully",
      ticket: ticketResponse,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /api/ticket/:id/upvote - Upvote a ticket
router.post("/:id/upvote", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    // Remove from downvotes if present
    ticket.votes.downvotes = ticket.votes.downvotes.filter(
      (e) => e !== userEmail
    );
    // Add to upvotes if not present
    if (!ticket.votes.upvotes.includes(userEmail)) {
      ticket.votes.upvotes.push(userEmail);
    }
    await ticket.save();
    res.json({ message: "Upvoted successfully", votes: ticket.votes });
  } catch (error) {
    console.error("Error upvoting ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/ticket/:id/downvote - Downvote a ticket
router.post("/:id/downvote", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    // Remove from upvotes if present
    ticket.votes.upvotes = ticket.votes.upvotes.filter((e) => e !== userEmail);
    // Add to downvotes if not present
    if (!ticket.votes.downvotes.includes(userEmail)) {
      ticket.votes.downvotes.push(userEmail);
    }
    await ticket.save();
    res.json({ message: "Downvoted successfully", votes: ticket.votes });
  } catch (error) {
    console.error("Error downvoting ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
