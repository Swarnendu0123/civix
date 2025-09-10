// API service for Civix backend
import { BACKEND_BASE_URL } from '../config';
import type { Technician, ticket } from '../types';

const API_BASE_URL = BACKEND_BASE_URL || 'http://localhost:3000';

// Simple user storage for this implementation (no JWT tokens in server)
let currentUser: any = null;

export const setCurrentUser = (user: any) => {
  currentUser = user;
  if (user) {
    localStorage.setItem('civix_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('civix_current_user');
  }
};

export const getCurrentUser = () => {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('civix_current_user');
  if (stored) {
    currentUser = JSON.parse(stored);
  }
  return currentUser;
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
  async login() {
    // Server doesn't have login endpoint, so we'll simulate by getting user info
    // In a real app, you'd implement proper authentication on the server
    throw new Error('Login functionality requires server-side authentication implementation');
  },

  async register(name: string, email: string, password: string) {
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
    ticket_name: string;
    ticket_category: string;
    ticket_description: string;
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
    ticket_name?: string;
    ticket_category?: string;
    ticket_description?: string;
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

  async assignTicket(id: string, authorityId: string) {
    return this.updateTicket(id, { authority: authorityId });
  },

  async updateTicketStatus(id: string, status: 'open' | 'resolved' | 'in process') {
    return this.updateTicket(id, { status });
  },

  async getTechnicianSuggestions(_ticketId?: string) {
    // This would need to be implemented on the server
    return { suggestions: [] };
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

// Technicians API (limited functionality without server implementation)
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

  async createTechnician(data: {
    name: string;
    email: string;
    contact: string;
    specialization: string;
    dept?: string;
  }) {
    // Would need to register user and set role to technician
    return userAPI.register(data.email, 'temp_password', data.name, data.contact);
  },

  async updateTechnician(_id: string, _data: any) {
    throw new Error('Update technician requires server-side implementation');
  },

  async deleteTechnician(_id: string) {
    throw new Error('Delete technician requires server-side implementation');
  },

  async getTechnicianTasks(id: string, status?: string) {
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];
    
    let tasks = allTickets.filter((t: any) => t.authority && t.authority._id === id);
    
    if (status) {
      tasks = tasks.filter((t: any) => t.status === status);
    }
    
    return { tasks };
  },

  async getFiltered(ticketType: string) {
    // Filter technicians by specialization/category
    const technicians = await this.getTechnicians();
    return { 
      technicians: technicians.technicians.filter((t: any) => 
        t.specialization?.toLowerCase().includes(ticketType.toLowerCase())
      )
    };
  }
};

// File upload API (server doesn't implement this yet)
export const uploadAPI = {
  async uploadFile(file: File) {
    // For now, return a mock URL since server doesn't implement file upload
    // In production, you'd implement file upload on the server
    return {
      url: `data:${file.type};base64,${await fileToBase64(file)}`,
      filename: file.name,
      size: file.size
    };
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

// Admin APIs (enhanced to work with current server implementation)
export const adminAPI = {
  // User Management
  async getUsers(options?: { 
    role?: string; 
    page?: number; 
    limit?: number; 
    search?: string 
  }) {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.role && options.role !== 'all') params.append('role', options.role);
  if (options?.search) params.append('search', options.search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/api/user/all${query}`);
  },

  async updateUserStatus(email: string, status: string) {
    // Would use user role update endpoint
    return userAPI.updateRole(email, status);
  },

  async deleteUser(_userId: string) {
    throw new Error('Delete user requires server-side implementation');
  },

  // Promote user to technician
  async promoteUserToTechnician(email: string, _data?: any) {
    return userAPI.updateRole(email, 'technician', true);
  },

  // Notifications Management (mock implementation)
  async getNotifications(_options?: { limit?: number }) {
    return { notifications: [] };
  },

  async markNotificationRead(_id: string) {
    return { success: true };
  },

  // Category Management (mock implementation)
  async getCategories() {
    return { 
      categories: [
        { name: 'Water', description: 'Water related tickets' },
        { name: 'Electric', description: 'Electrical tickets' },
        { name: 'Road', description: 'Road and infrastructure' },
        { name: 'Waste', description: 'Waste management' },
        { name: 'Other', description: 'Other civic tickets' }
      ]
    };
  },

  async createCategory(data: {
    name: string;
    description: string;
    color?: string;
  }) {
    // Mock implementation
    return { category: { ...data, id: Date.now().toString() } };
  },

  // Analytics using ticket data
  async getReports() {
    const analytics = await analyticsAPI.getAnalytics();
    return { reports: analytics };
  },

  async getPerformanceAnalytics() {
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];
    
    const resolved = allTickets.filter((t: any) => t.status === 'resolved');
    const avgResolutionTime = resolved.length > 0 
      ? resolved.reduce((sum: number, t: any) => {
          if (t.closing_time && t.opening_time) {
            return sum + (new Date(t.closing_time).getTime() - new Date(t.opening_time).getTime());
          }
          return sum;
        }, 0) / resolved.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      totalTickets: allTickets.length,
      resolvedTickets: resolved.length,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      resolutionRate: allTickets.length > 0 ? (resolved.length / allTickets.length * 100) : 0
    };
  },

  // System Settings (mock)
  async getSettings() {
    return { 
      settings: {
        siteName: 'Civix',
        maxFileSize: '10MB',
        allowedFileTypes: 'jpg,png,pdf',
        autoAssignment: true
      }
    };
  },

  async updateSettings(settings: any) {
    return { settings };
  },

  // Enhanced Assignment APIs
  async manualAssign(ticketId: string, data: {
    authorityId: string;
    technicianId?: string;
    ticketCategory?: string;
    notes?: string;
  }) {
    return ticketsAPI.assignTicket(ticketId, data.authorityId);
  },

  async approveAssignment(ticketId: string, data: {
    authorityId: string;
    technicianId?: string;
    approved: boolean;
    notes?: string;
  }) {
    if (data.approved) {
      return ticketsAPI.assignTicket(ticketId, data.authorityId);
    }
    return { success: true };
  },

  async getNotificationCounts() {
    const tickets = await ticketsAPI.getTickets();
    const allTickets = tickets.tickets || [];
    
    return {
      unreadNotifications: 0,
      pendingTickets: allTickets.filter((t: any) => t.status === 'open').length,
      criticalTickets: allTickets.filter((t: any) => t.urgency === 'critical').length
    };
  }
};

// Utility functions to transform data between API and UI formats
export const transformers = {
  // Transform API ticket to UI ticket format for backward compatibility
  ticketToticket: (ticket: any): ticket => ({
    id: ticket._id,
    title: ticket.ticket_name,
    description: ticket.ticket_description,
    category: ticket.ticket_category,
    location: {
      address: `${ticket.location.latitude}, ${ticket.location.longitude}`,
      coordinates: { lat: ticket.location.latitude, lng: ticket.location.longitude }
    },
    upvotes: ticket.votes?.upvotes || 0,
    status: ticket.status,
    priority: ticket.urgency,
    createdAt: new Date(ticket.opening_time || ticket.createdAt),
    createdBy: {
      name: ticket.creator_name
    },
    attachments: ticket.image_url ? [ticket.image_url] : [],
    updates: ticket.closing_time ? [{
      date: new Date(ticket.closing_time),
      status: 'resolved',
      note: 'ticket resolved',
      officer: ticket.authority?.name || 'System'
    }] : []
  }),

  // Transform API user to UI format
  userToUI: (user: any) => ({
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
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  }),

  // Transform API technician to UI Technician format
  apiTechnicianToUI: (tech: any): Technician => ({
    id: tech._id,
    name: tech.name,
    contact: tech.phone || tech.email,
    openTickets: 0, // Would need to calculate from tickets
    avgResolutionTime: '2-3 days', // Would calculate from resolved tickets
    status: tech.role === 'technician' ? 'active' : 'on_leave',
    specialization: tech.specialization || 'General',
    totalResolved: 0, // Would calculate from tickets
    rating: 4.5 // Mock rating
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
    urgency: ticketData.priority || 'moderate',
    location: {
      latitude: ticketData.location?.coordinates?.lat || 0,
      longitude: ticketData.location?.coordinates?.lng || 0
    }
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
  admin: adminAPI,
  transformers,
  // Helper functions
  setCurrentUser,
  getCurrentUser
};