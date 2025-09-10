// API service for Civix mobile app
// Load from environment variable or default to localhost
// In web mode, use the current origin to avoid CORS tickets
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Running in web browser - use current origin with port 3000
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3000`;
  }
  // Running in React Native - use localhost
  return process.env.BACKEND_URL || "http://localhost:3000";
};

const API_BASE_URL = getApiBaseUrl();

// Simple user storage for this implementation (no JWT tokens in server)
let currentUser: any = null;

export const setCurrentUser = (user: any) => {
  currentUser = user;
  // In a real app, you would store this in secure storage like expo-secure-store
};

export const getCurrentUser = () => {
  return currentUser;
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`Making API request to: ${url}`);
  console.log("Request options:", options);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || "API request failed" };
      }
      throw new Error(error.error || "API request failed");
    }

    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error: Cannot connect to server. Please check if the server is running."
      );
    }
    throw error;
  }
};

// User Management API (matches server implementation)
export const userAPI = {
  async register(
    email: string,
    password: string,
    name?: string,
    phone?: string,
    address?: string,
    location?: { latitude: number; longitude: number }
  ) {
    try {
      const response = await apiRequest("/api/user/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name: name || null,
          phone: phone || null,
          address: address || null,
          location: location || null,
        }),
      });

      if (response.user) {
        setCurrentUser(response.user);
      }

      return response;
    } catch (error) {
      console.error("User registration failed:", error);
      throw error;
    }
  },

  async findOrCreateUser(firebaseUser: any) {
    try {
      // First try to find user by email
      // Since we don't have a find endpoint, we'll try to register and handle existing user error
      const userData = {
        email: firebaseUser.email,
        password: firebaseUser.uid, // Use Firebase UID as password for backend sync
        name: firebaseUser.displayName || "User",
      };

      try {
        const response = await this.register(
          userData.email,
          userData.password,
          userData.name
        );
        return response.user;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          // User already exists, create a user object with Firebase data
          // In a real app, you'd implement a proper find endpoint
          return {
            _id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            role: "user",
            points: 0,
          };
        }
        throw error;
      }
    } catch (error) {
      console.error("Find or create user failed:", error);
      throw error;
    }
  },

  async updateDetails(
    email: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      location?: { latitude: number; longitude: number };
    }
  ) {
    const response = await apiRequest(
      `/api/user/update/details/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (response.user) {
      setCurrentUser(response.user);
    }

    return response;
  },

  async updateRole(email: string, role: string, isTechnician?: boolean) {
    const response = await apiRequest(
      `/api/user/update/role/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        body: JSON.stringify({ role, isTechnician }),
      }
    );

    if (response.user) {
      setCurrentUser(response.user);
    }

    return response;
  },

  async getProfile() {
    return getCurrentUser();
  },

  async createDemoUser() {
    // Create a demo user for testing purposes
    const demoUser = {
      email: `demo_${Date.now()}@civix.app`,
      password: "demopassword",
      name: "Demo User",
    };

    try {
      const response = await this.register(
        demoUser.email,
        demoUser.password,
        demoUser.name
      );
      return response.user;
    } catch (error) {
      console.error("Demo user creation failed:", error);
      throw error;
    }
  },

  logout() {
    setCurrentUser(null);
  },
};

// Legacy auth API for backward compatibility
export const authAPI = {
  async login(email: string, password: string) {
    // Server doesn't have login endpoint, so we'll simulate by getting user info
    // In a real app, you'd implement proper authentication on the server
    throw new Error(
      "Login functionality requires server-side authentication implementation"
    );
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: string = "user",
    firebaseUid?: string
  ) {
    return userAPI.register(email, password, name);
  },

  logout() {
    userAPI.logout();
  },
};

// Health check API
export const healthAPI = {
  async checkHealth() {
    return apiRequest("/health");
  },
};

export const fetchUserDetails = async (current_user_email: string) => {
  return apiRequest("/api/user/profile/" + current_user_email);
};

// Legacy Analytics API (server doesn't implement these yet)
export const analyticsAPI = {
  async getAnalytics() {
    // Mock analytics based on ticket data
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];

    return {
      totalTickets: allTickets.length,
      openTickets: allTickets.filter((t: any) => t.status === "open").length,
      resolvedTickets: allTickets.filter((t: any) => t.status === "resolved")
        .length,
      inProgressTickets: allTickets.filter(
        (t: any) => t.status === "in process"
      ).length,
      criticalTickets: allTickets.filter((t: any) => t.urgency === "critical")
        .length,
    };
  },
};

// Tickets API (matches server implementation)
export const ticketsAPI = {
  async getTickets() {
    const response = await apiRequest("/api/ticket/all");
    return response;
  },

  async getTicket(id: string) {
    try {
      return await apiRequest(`/api/ticket/${id}`);
    } catch (error) {
      console.error("Server not available, using mock data");
    }
  },

  async createTicket(data: {
    creator_id: string;
    creator_name: string;
    creator_email?: string;
    ticket_name: string;
    ticket_category: string;
    ticket_description: string;
    image_url?: string;
    tags?: string[];
    urgency?: "critical" | "moderate" | "low";
    location: { latitude: number; longitude: number };
  }) {
    return apiRequest("/api/ticket/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createTicketFromFormData(formData: FormData) {
    // Convert FormData to JSON format expected by server
    const data: any = {};
    formData.forEach((value, key) => {
      if (key === "location") {
        data[key] = JSON.parse(value as string);
      } else if (key === "tags") {
        data[key] = JSON.parse(value as string);
      } else {
        data[key] = value;
      }
    });

    return this.createTicket(data);
  },

  async updateTicket(
    id: string,
    data: {
      status?: "open" | "resolved" | "in process";
      ticket_name?: string;
      ticket_category?: string;
      ticket_description?: string;
      image_url?: string;
      tags?: string[];
      votes?: { upvotes: number; downvotes: number };
      urgency?: "critical" | "moderate" | "low";
      location?: { latitude: number; longitude: number };
      authority?: string;
    }
  ) {
    return apiRequest(`/api/ticket/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async voteTicket(id: string, type: "upvote" | "downvote") {
    // Get current ticket to update votes
    const currentTicket = await this.getTicket(id);
    const currentVotes = currentTicket.ticket.votes || {
      upvotes: 0,
      downvotes: 0,
    };

    const newVotes = {
      upvotes:
        type === "upvote" ? currentVotes.upvotes + 1 : currentVotes.upvotes,
      downvotes:
        type === "downvote"
          ? currentVotes.downvotes + 1
          : currentVotes.downvotes,
    };

    return this.updateTicket(id, { votes: newVotes });
  },

  async updateTicketStatus(
    id: string,
    status: "open" | "resolved" | "in process"
  ) {
    return this.updateTicket(id, { status });
  },
};

// Utility functions to transform data for mobile app format
export const transformers = {
  // Transform API ticket to mobile app format
  ticketToMobileFormat: (ticket: any) => ({
    id: ticket._id,
    title: ticket.ticket_name,
    description: ticket.ticket_description,
    category: ticket.ticket_category,
    location: `${ticket.location.latitude}, ${ticket.location.longitude}`,
    timestamp: new Date(
      ticket.opening_time || ticket.createdAt
    ).toLocaleString(),
    upvotes: ticket.votes?.upvotes || 0,
    distance: "0.5 km", // Would calculate based on user location
    status: ticket.urgency,
    statusColor:
      ticket.urgency === "critical"
        ? "red"
        : ticket.urgency === "moderate"
        ? "orange"
        : "green",
    actualStatus: ticket.status,
  }),

  // Transform API task to mobile format for technicians
  taskToMobileFormat: (task: any) => ({
    id: task._id,
    title: task.ticket_name,
    description: task.ticket_description,
    location: `${task.location.latitude}, ${task.location.longitude}`,
    category: task.ticket_category,
    urgency: task.urgency,
    status: task.status,
    assignedAt: new Date(task.opening_time || task.createdAt).toLocaleString(),
    estimatedTime: "2-4 hours", // Would come from backend
    materialsRequired: ["Basic tools"], // Would come from backend
    imageUrl: task.image_url,
  }),

  // Transform UI data to API format for ticket creation
  uiToTicketAPI: (ticketData: any, user: any) => ({
    creator_id: user.id || user._id,
    creator_name: user.name,
    ticket_name: ticketData.title,
    ticket_category: ticketData.category,
    ticket_description: ticketData.description,
    image_url: ticketData.attachments?.[0] || null,
    tags: ticketData.tags || [],
    urgency: ticketData.priority || "moderate",
    location: {
      latitude: ticketData.location?.latitude || 0,
      longitude: ticketData.location?.longitude || 0,
    },
  }),

  // Transform API user to mobile format
  userToMobileFormat: (user: any) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    location: user.location,
    role: user.role,
    isTechnician: user.isTechnician,
    tickets: user.tickets || [],
    points: user.points || 0,
  }),
};

export default {
  auth: authAPI,
  user: userAPI,
  health: healthAPI,
  analytics: analyticsAPI,
  tickets: ticketsAPI,
  transformers,
  // Helper functions
  setCurrentUser,
  getCurrentUser,
};
