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
      creator_email,
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

    // Handle creator - first try to find by MongoDB ObjectId, then by Firebase UID via email or create new user
    let creator = null;
    
    // Check if creator_id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(creator_id)) {
      creator = await User.findById(creator_id);
    }
    
    // If not found and we have email, try to find by email or create user
    if (!creator) {
      if (creator_email) {
        creator = await User.findOne({ email: creator_email });
        
        if (!creator) {
          // Create new user with Firebase UID as password (for consistency)
          creator = new User({
            email: creator_email,
            password: creator_id, // Use Firebase UID as password
            name: creator_name,
            role: 'user'
          });
          await creator.save();
          console.log('Created new user for ticket creation:', creator);
        }
      } else {
        // If no email provided, create a temporary user entry
        const tempEmail = `user_${creator_id}@civix.temp`;
        creator = new User({
          email: tempEmail,
          password: creator_id,
          name: creator_name,
          role: 'user'
        });
        await creator.save();
        console.log('Created temporary user for ticket creation:', creator);
      }
    }

    // Validate urgency if provided
    const validUrgencies = ['critical', 'moderate', 'low'];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({ 
        error: 'Invalid urgency. Must be one of: ' + validUrgencies.join(', ') 
      });
    }

    // Create new ticket using the MongoDB _id of the creator
    const newTicket = new Ticket({
      creator_id: creator._id, // Use the MongoDB ObjectId, not the Firebase UID
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

    // Add ticket reference to user's issues array and award 10 points using MongoDB _id
    await User.findByIdAndUpdate(
      creator._id, // Use the MongoDB ObjectId
      { 
        $push: { issues: newTicket._id },
        $inc: { points: 10 } // Award 10 points for creating a ticket
      }
    );

    console.log(`Awarded 10 points to user ${creator.name} for creating ticket: ${newTicket.issue_name}`);

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

// GET /api/ticket/:id - Get single ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find ticket by ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ 
        error: 'Ticket not found' 
      });
    }

    // Get creator details
    let creator = null;
    if (ticket.creator_id) {
      creator = await User.findOne({ email: ticket.creator_id });
    }

    // Get authority details if assigned
    let authority = null;
    if (ticket.authority) {
      authority = await User.findOne({ email: ticket.authority });
    }

    // Prepare response with populated data
    const ticketResponse = {
      ...ticket.toObject(),
      creator: creator ? {
        _id: creator._id,
        name: creator.name,
        email: creator.email
      } : null,
      authority: authority ? {
        _id: authority._id,
        name: authority.name,
        email: authority.email
      } : null
    };

    res.json({
      message: 'Ticket retrieved successfully',
      ticket: ticketResponse
    });

  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;