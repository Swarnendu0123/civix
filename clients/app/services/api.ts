// API service for Civix mobile app
// load from environment variable or default to localhost
const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Simple authentication token storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  // In a real app, you would store this in secure storage like expo-secure-store
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

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

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  async register(name: string, email: string, password: string, role: string = 'citizen', firebaseUid?: string) {
    const body: any = { name, email, password, role };
    if (firebaseUid) {
      body.firebaseUid = firebaseUid;
    }
    
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout() {
    setAuthToken(null);
  }
};

// User API
export const userAPI = {
  async getProfile() {
    return apiRequest('/users/profile');
  },

  async updateProfile(data: { name?: string; contact?: string }) {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};

// Analytics API
export const analyticsAPI = {
  async getAnalytics() {
    return apiRequest('/analytics');
  }
};

// Tickets API
export const ticketsAPI = {
  async getTickets(params: {
    status?: string;
    category?: string;
    urgency?: string;
    page?: number;
    limit?: number;
    userId?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/tickets${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  async getTicket(id: string) {
    return apiRequest(`/tickets/${id}`);
  },

  async createTicket(formData: FormData) {
    const url = `${API_BASE_URL}/tickets`;
    const headers: HeadersInit = {};

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create ticket');
    }

    return response.json();
  },

  async voteTicket(id: string, type: 'upvote' | 'downvote') {
    return apiRequest(`/tickets/${id}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ type }),
    });
  },

  async updateTicketStatus(id: string, status: string) {
    return apiRequest(`/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

// Technicians API (for technician users)
export const techniciansAPI = {
  async getTechnicians(params: {
    specialization?: string;
    status?: string;
    department?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    
    const endpoint = `/technicians${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  async getTechnician(id: string) {
    return apiRequest(`/technicians/${id}`);
  },

  async getTechnicianTasks(id: string, status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiRequest(`/technicians/${id}/tasks${params}`);
  }
};

// File upload API
export const uploadAPI = {
  async uploadFile(file: File | any) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/upload`;
    const headers: HeadersInit = {};

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  }
};

// Utility functions to transform data for mobile app format
export const transformers = {
  // Transform API ticket to mobile app format
  ticketToMobileFormat: (ticket: any) => ({
    id: ticket._id,
    title: ticket.issue_name,
    description: ticket.issue_description,
    category: ticket.issue_category,
    location: ticket.location.address,
    timestamp: new Date(ticket.opening_time).toLocaleString(),
    upvotes: ticket.votes.upvotes,
    distance: '0.5 km', // Would calculate based on user location
    status: ticket.urgency,
    statusColor: ticket.urgency === 'critical' ? 'red' : 
                 ticket.urgency === 'moderate' ? 'orange' : 'green'
  }),

  // Transform API task to mobile format for technicians
  taskToMobileFormat: (task: any) => ({
    id: task._id,
    title: task.issue_name,
    description: task.issue_description,
    location: task.location.address,
    category: task.issue_category,
    urgency: task.urgency,
    status: task.status,
    assignedAt: new Date(task.opening_time).toLocaleString(),
    estimatedTime: '2-4 hours', // Would come from backend
    materialsRequired: ['Basic tools'], // Would come from backend
    imageUrl: task.image_url
  })
};

export default {
  auth: authAPI,
  user: userAPI,
  analytics: analyticsAPI,
  tickets: ticketsAPI,
  technicians: techniciansAPI,
  upload: uploadAPI,
  transformers
};