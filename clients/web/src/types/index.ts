// Location interface
export interface Location {
  coordinates: { lat: number; lng: number; };
  address: string;
}

// User model (Admin only - no normal users in admin panel)
export interface User {
  _id: string; // uuid
  password: string; // Hash<string>
  issues: string[]; // Array<Ref(Ticket)>
  name: string | null;
  points: number; // integer/float
}

// Ticket model
export interface Ticket {
  _id: string; // uuid
  creator_id: string; // uuid
  creator_name: string;
  status: 'open' | 'resolved' | 'in process';
  issue_name: string;
  issue_category: string; // water, electric issue
  issue_description: string;
  image_url: string;
  tags: string[];
  votes: {
    upvotes: number;
    downvotes: number;
  };
  urgency: 'critical' | 'moderate' | 'low';
  location: Location;
  opening_time: Date; // Time
  closing_time: Date | null; // Time/null
  authority: string; // Ref(Authority)
  sub_authority: string | null; // Ref(SubAuthority)/null
}

// Resolve Request by Technicians
export interface ResolveRequest {
  _id: string; // uuid
  creator: string; // Workers<uuid>
  name: string;
  description: string;
  image_url: string;
  sub_authority: string; // Ref<SubAuthority>
  authority: string; // Ref<Authority>
}

// Worker/Technician model
export interface Worker {
  _id: string; // uuid
  password: string; // Hash<string>
  name: string; // uuid (note: this seems like it should be string, but keeping as per spec)
  dept: string; // plumber or electrician
  issues_assigned: string[]; // Array<Ref(Ticket)>
  pulls_created: string[]; // Array<Ref(Pull_Request)>
}

// Authority model (for login)
export interface Authority {
  _id: string; // uuid
  password: string; // Hash<string>
  name: string;
  location: Location;
  issues: string[]; // Array<Ref(Ticket)>
}

// SubAuthority interface
export interface SubAuthority {
  _id: string;
  name: string;
  authority_id: string;
}

// Legacy interfaces for backward compatibility (can be removed later)
export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number; }
  };
  upvotes: number;
  status: string;
  priority: string;
  createdAt: Date;
  createdBy: {
    name: string;
    contact?: string;
  };
  attachments?: string[];
  updates?: Array<{
    date: Date;
    status: string;
    note: string;
    officer?: string;
  }>;
}

export interface Technician {
  id: string;
  name: string;
  contact: string;
  openTickets: number;
  avgResolutionTime: string;
  status: 'active' | 'on_leave' | 'on_site';
  specialization?: string;
  totalResolved?: number;
  rating?: number;
}