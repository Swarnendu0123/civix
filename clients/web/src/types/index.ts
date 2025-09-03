export interface User {
  id: string;
  email: string;
  role: 'admin' | 'technician' | 'citizen';
  name: string;
}

export interface Ticket {
  id: string;
  category: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  images?: string[];
}

export interface Technician {
  id: string;
  name: string;
  contact: string;
  openTickets: number;
  avgResolutionTime: number;
  status: 'active' | 'on_leave' | 'on_site';
}

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
//   priority: "low" | "medium" | "high";   // ✅ Added priority
//   priority: string;   // ✅ Added priority
//   status: "pending" |"in_progress" | "resolved";
  status: string;
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
