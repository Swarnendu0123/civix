const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// GET /api/ticket/all - Get all tickets
router.get('/all', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('creator_id', 'email name')
      .populate('authority', 'email name role')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      message: 'Tickets retrieved successfully',
      tickets: tickets
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST /api/ticket/create - Create new ticket
router.post('/create', async (req, res) => {
  try {
    const {
      creator_id,
      creator_name,
      issue_name,
      issue_category,
      issue_description,
      image_url,
      tags,
      urgency,
      location
    } = req.body;

    // Validate required fields
    if (!creator_id || !creator_name || !issue_name || !issue_category || !issue_description || !location) {
      return res.status(400).json({ 
        error: 'creator_id, creator_name, issue_name, issue_category, issue_description, and location are required' 
      });
    }

    // Validate location format
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({ 
        error: 'Location must include latitude and longitude' 
      });
    }

    // Validate creator exists
    const creator = await User.findById(creator_id);
    if (!creator) {
      return res.status(404).json({ 
        error: 'Creator user not found' 
      });
    }

    // Validate urgency if provided
    const validUrgencies = ['critical', 'moderate', 'low'];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({ 
        error: 'Invalid urgency. Must be one of: ' + validUrgencies.join(', ') 
      });
    }

    // Create new ticket
    const newTicket = new Ticket({
      creator_id,
      creator_name,
      issue_name,
      issue_category,
      issue_description,
      image_url: image_url || null,
      tags: tags || [],
      urgency: urgency || 'moderate',
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    });

    await newTicket.save();

    // Add ticket reference to user's issues array
    await User.findByIdAndUpdate(
      creator_id,
      { $push: { issues: newTicket._id } }
    );

    // Populate creator and authority info for response
    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('creator_id', 'email name')
      .populate('authority', 'email name role');

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: populatedTicket
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PUT /api/ticket/update/:id - Update ticket
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      issue_name,
      issue_category,
      issue_description,
      image_url,
      tags,
      votes,
      urgency,
      location,
      closing_time,
      authority
    } = req.body;

    // Find ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ 
        error: 'Ticket not found' 
      });
    }

    // Validate status if provided
    const validStatuses = ['open', 'resolved', 'in process'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    // Validate urgency if provided
    const validUrgencies = ['critical', 'moderate', 'low'];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({ 
        error: 'Invalid urgency. Must be one of: ' + validUrgencies.join(', ') 
      });
    }

    // Validate authority if provided
    if (authority) {
      const authorityUser = await User.findById(authority);
      if (!authorityUser) {
        return res.status(404).json({ 
          error: 'Authority user not found' 
        });
      }
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (status !== undefined) {
      updateFields.status = status;
      // Auto-set closing_time when status changes to 'resolved'
      if (status === 'resolved' && !ticket.closing_time) {
        updateFields.closing_time = new Date();
      }
    }
    if (issue_name !== undefined) updateFields.issue_name = issue_name;
    if (issue_category !== undefined) updateFields.issue_category = issue_category;
    if (issue_description !== undefined) updateFields.issue_description = issue_description;
    if (image_url !== undefined) updateFields.image_url = image_url;
    if (tags !== undefined) updateFields.tags = tags;
    if (votes !== undefined) updateFields.votes = votes;
    if (urgency !== undefined) updateFields.urgency = urgency;
    if (location !== undefined) {
      // Validate location format
      if (!location.latitude || !location.longitude) {
        return res.status(400).json({ 
          error: 'Location must include latitude and longitude' 
        });
      }
      updateFields.location = location;
    }
    if (closing_time !== undefined) updateFields.closing_time = closing_time;
    if (authority !== undefined) updateFields.authority = authority;

    // Update ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('creator_id', 'email name')
     .populate('authority', 'email name role');

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;