// API service for Civix mobile app
// load from environment variable or default to localhost
const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// User Management API (matches server implementation)
export const userAPI = {
  async register(email: string, password: string, name?: string, phone?: string, address?: string, location?: { latitude: number; longitude: number }) {
    const response = await apiRequest('/api/user/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        name: name || null, 
        phone: phone || null, 
        address: address || null, 
        location: location || null 
      }),
    });
    
    if (response.user) {
      setCurrentUser(response.user);
    }
    
    return response;
  },

  async updateDetails(email: string, data: { name?: string; phone?: string; address?: string; location?: { latitude: number; longitude: number } }) {
    const response = await apiRequest(`/api/user/update/details/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (response.user) {
      setCurrentUser(response.user);
    }
    
    return response;
  },

  async updateRole(email: string, role: string, isTechnician?: boolean) {
    const response = await apiRequest(`/api/user/update/role/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify({ role, isTechnician }),
    });
    
    if (response.user) {
      setCurrentUser(response.user);
    }
    
    return response;
  },

  async getProfile() {
    return getCurrentUser();
  },

  logout() {
    setCurrentUser(null);
  }
};

// Legacy auth API for backward compatibility
export const authAPI = {
  async login(email: string, password: string) {
    // Server doesn't have login endpoint, so we'll simulate by getting user info
    // In a real app, you'd implement proper authentication on the server
    throw new Error('Login functionality requires server-side authentication implementation');
  },

  async register(name: string, email: string, password: string, role: string = 'user', firebaseUid?: string) {
    return userAPI.register(email, password, name);
  },

  logout() {
    userAPI.logout();
  }
};

// Health check API
export const healthAPI = {
  async checkHealth() {
    return apiRequest('/health');
  }
};

// Legacy Analytics API (server doesn't implement these yet)
export const analyticsAPI = {
  async getAnalytics() {
    // Mock analytics based on ticket data
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];
    
    return {
      totalTickets: allTickets.length,
      openTickets: allTickets.filter((t: any) => t.status === 'open').length,
      resolvedTickets: allTickets.filter((t: any) => t.status === 'resolved').length,
      inProgressTickets: allTickets.filter((t: any) => t.status === 'in process').length,
      criticalTickets: allTickets.filter((t: any) => t.urgency === 'critical').length,
    };
  }
};

// Tickets API (matches server implementation)
export const ticketsAPI = {
  async getTickets() {
    const response = await apiRequest('/api/ticket/all');
    return response;
  },

  async getTicket(id: string) {
    // For individual ticket, we'll get all and filter (since server doesn't have individual endpoint)
    const response = await apiRequest('/api/ticket/all');
    const ticket = response.tickets?.find((t: any) => t._id === id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return { ticket };
  },

  async createTicket(data: {
    creator_id: string;
    creator_name: string;
    issue_name: string;
    issue_category: string;
    issue_description: string;
    image_url?: string;
    tags?: string[];
    urgency?: 'critical' | 'moderate' | 'low';
    location: { latitude: number; longitude: number };
  }) {
    return apiRequest('/api/ticket/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createTicketFromFormData(formData: FormData) {
    // Convert FormData to JSON format expected by server
    const data: any = {};
    formData.forEach((value, key) => {
      if (key === 'location') {
        data[key] = JSON.parse(value as string);
      } else if (key === 'tags') {
        data[key] = JSON.parse(value as string);
      } else {
        data[key] = value;
      }
    });

    return this.createTicket(data);
  },

  async updateTicket(id: string, data: {
    status?: 'open' | 'resolved' | 'in process';
    issue_name?: string;
    issue_category?: string;
    issue_description?: string;
    image_url?: string;
    tags?: string[];
    votes?: { upvotes: number; downvotes: number };
    urgency?: 'critical' | 'moderate' | 'low';
    location?: { latitude: number; longitude: number };
    authority?: string;
  }) {
    return apiRequest(`/api/ticket/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async voteTicket(id: string, type: 'upvote' | 'downvote') {
    // Get current ticket to update votes
    const currentTicket = await this.getTicket(id);
    const currentVotes = currentTicket.ticket.votes || { upvotes: 0, downvotes: 0 };
    
    const newVotes = {
      upvotes: type === 'upvote' ? currentVotes.upvotes + 1 : currentVotes.upvotes,
      downvotes: type === 'downvote' ? currentVotes.downvotes + 1 : currentVotes.downvotes
    };

    return this.updateTicket(id, { votes: newVotes });
  },

  async updateTicketStatus(id: string, status: 'open' | 'resolved' | 'in process') {
    return this.updateTicket(id, { status });
  }
};

// Technicians API (limited functionality without full server implementation)
export const techniciansAPI = {
  async getTechnicians() {
    // Get users with technician role from tickets
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];
    
    // Extract unique authorities/technicians
    const technicians = allTickets
      .filter((t: any) => t.authority)
      .map((t: any) => t.authority)
      .filter((tech: any, index: number, arr: any[]) => 
        arr.findIndex(t => t._id === tech._id) === index
      );
    
    return { technicians };
  },

  async getTechnician(id: string) {
    const techList = await this.getTechnicians();
    const technician = techList.technicians.find((t: any) => t._id === id);
    if (!technician) {
      throw new Error('Technician not found');
    }
    return { technician };
  },

  async getTechnicianTasks(id: string, status?: string) {
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];
    
    let tasks = allTickets.filter((t: any) => t.authority && t.authority._id === id);
    
    if (status) {
      tasks = tasks.filter((t: any) => t.status === status);
    }
    
    return { tasks };
  }
};

// File upload API (server doesn't implement this yet)
export const uploadAPI = {
  async uploadFile(file: File | any) {
    // For now, return a mock URL since server doesn't implement file upload
    // In production, you'd implement file upload on the server
    const filename = file.name || `image_${Date.now()}.jpg`;
    
    // For React Native, we might get a URI instead of File object
    if (typeof file === 'string') {
      return {
        url: file, // Use the local URI directly
        filename: filename,
        size: 0
      };
    }
    
    return {
      url: file.uri || `data:image/jpeg;base64,${await fileToBase64(file)}`,
      filename: filename,
      size: file.size || 0
    };
  }
};

// Helper function to convert file to base64 (for React Native)
const fileToBase64 = async (file: any): Promise<string> => {
  // This would need to be implemented using react-native file system
  // For now, return empty string
  return '';
};

// Utility functions to transform data for mobile app format
export const transformers = {
  // Transform API ticket to mobile app format
  ticketToMobileFormat: (ticket: any) => ({
    id: ticket._id,
    title: ticket.issue_name,
    description: ticket.issue_description,
    category: ticket.issue_category,
    location: `${ticket.location.latitude}, ${ticket.location.longitude}`,
    timestamp: new Date(ticket.opening_time || ticket.createdAt).toLocaleString(),
    upvotes: ticket.votes?.upvotes || 0,
    distance: '0.5 km', // Would calculate based on user location
    status: ticket.urgency,
    statusColor: ticket.urgency === 'critical' ? 'red' : 
                 ticket.urgency === 'moderate' ? 'orange' : 'green',
    actualStatus: ticket.status
  }),

  // Transform API task to mobile format for technicians
  taskToMobileFormat: (task: any) => ({
    id: task._id,
    title: task.issue_name,
    description: task.issue_description,
    location: `${task.location.latitude}, ${task.location.longitude}`,
    category: task.issue_category,
    urgency: task.urgency,
    status: task.status,
    assignedAt: new Date(task.opening_time || task.createdAt).toLocaleString(),
    estimatedTime: '2-4 hours', // Would come from backend
    materialsRequired: ['Basic tools'], // Would come from backend
    imageUrl: task.image_url
  }),

  // Transform UI data to API format for ticket creation
  uiToTicketAPI: (issueData: any, user: any) => ({
    creator_id: user.id || user._id,
    creator_name: user.name,
    issue_name: issueData.title,
    issue_category: issueData.category,
    issue_description: issueData.description,
    image_url: issueData.attachments?.[0] || null,
    tags: issueData.tags || [],
    urgency: issueData.priority || 'moderate',
    location: {
      latitude: issueData.location?.latitude || 0,
      longitude: issueData.location?.longitude || 0
    }
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
    issues: user.issues || [],
    points: user.points || 0
  })
};

export default {
  auth: authAPI,
  user: userAPI,
  health: healthAPI,
  analytics: analyticsAPI,
  tickets: ticketsAPI,
  technicians: techniciansAPI,
  upload: uploadAPI,
  transformers,
  // Helper functions
  setCurrentUser,
  getCurrentUser
};