const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    creator_email: {
      type: String,
    },
    creator_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "in process"],
      default: "open",
    },
    ticket_name: {
      type: String,
      required: true,
    },
    ticket_category: {
      type: String,
      required: true, // e.g., water, electric ticket
    },
    ticket_description: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: String,
      },
    ],
    votes: {
      upvotes: {
        type: Number,
        default: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
      },
    },
    urgency: {
      type: String,
      enum: ["critical", "moderate", "low"],
      default: "moderate",
    },
    location: {
      type: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
      required: true,
    },
    opening_time: {
      type: Date,
      default: Date.now,
    },
    closing_time: {
      type: Date,
      default: null,
    },
    authority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ticketSchema.index({ status: 1 });
ticketSchema.index({ creator_email: 1 });
ticketSchema.index({ urgency: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
