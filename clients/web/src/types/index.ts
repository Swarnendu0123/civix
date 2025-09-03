export interface User {
  id: string;
  email: string;
  role: 'admin' | 'technician' | 'citizen';
  name: string;
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