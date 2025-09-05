// API service for Civix backend
import { BACKEND_BASE_URL } from '../config';
import type { Technician, Issue } from '../types';

const API_BASE_URL = BACKEND_BASE_URL + '/api';

// Simple authentication token storage
let authToken: string | null = localStorage.getItem('civix_auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('civix_auth_token', token);
  } else {
    localStorage.removeItem('civix_auth_token');
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge additional headers if provided
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

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

  async register(name: string, email: string, password: string, role: string = 'citizen') {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
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
    const headers: Record<string, string> = {};

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData, // FormData for file uploads
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

  async assignTicket(id: string, technicianId: string) {
    return apiRequest(`/tickets/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ technicianId }),
    });
  },

  async updateTicketStatus(id: string, status: string) {
    return apiRequest(`/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

// Technicians API
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

  async createTechnician(data: {
    name: string;
    email: string;
    contact: string;
    specialization: string;
    dept?: string;
  }) {
    return apiRequest('/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTechnicianTasks(id: string, status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiRequest(`/technicians/${id}/tasks${params}`);
  }
};

// File upload API
export const uploadAPI = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/upload`;
    const headers: Record<string, string> = {};

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

// Utility functions to transform data between API and UI formats
export const transformers = {
  // Transform API ticket to UI Issue format for backward compatibility
  ticketToIssue: (ticket: any): Issue => ({
    id: ticket._id,
    title: ticket.issue_name,
    description: ticket.issue_description,
    category: ticket.issue_category,
    location: {
      address: ticket.location.address,
      coordinates: ticket.location.coordinates
    },
    upvotes: ticket.votes.upvotes,
    status: ticket.status,
    priority: ticket.urgency,
    createdAt: new Date(ticket.opening_time),
    createdBy: {
      name: ticket.creator_name
    },
    attachments: ticket.image_url ? [ticket.image_url] : [],
    updates: ticket.closing_time ? [{
      date: new Date(ticket.closing_time),
      status: 'resolved',
      note: 'Issue resolved',
      officer: ticket.assigned_technician || 'System'
    }] : []
  }),

  // Transform API technician to UI Technician format
  apiTechnicianToUI: (tech: any): Technician => ({
    id: tech._id,
    name: tech.name,
    contact: tech.contact,
    openTickets: tech.openTickets,
    avgResolutionTime: tech.avgResolutionTime,
    status: tech.status,
    specialization: tech.specialization,
    totalResolved: tech.totalResolved,
    rating: tech.rating
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