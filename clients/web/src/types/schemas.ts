export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface User {
  _id: string;
  name: string | null;
  points: number;
  issues: string[]; // Array of Ticket IDs
}

export interface Ticket {
  _id: string;
  creator_id: string;
  creator_name: string;
  status: 'open' | 'resolved' | 'in_process';
  issue_name: string;
  issue_category: string;
  issue_description: string;
  image_url: string;
  tags: string[];
  votes: {
    upvotes: number;
    downvotes: number;
  };
  urgency: 'critical' | 'moderate' | 'low';
  location: Location;
  opening_time: Date;
  closing_time: Date | null;
  authority: string; // Authority ID
  sub_authority: string | null; // SubAuthority ID
}

export interface Worker {
  _id: string;
  name: string;
  dept: string;
  issues_assigned: string[]; // Array of Ticket IDs
  pulls_created: string[]; // Array of Pull Request IDs
}

export interface Authority {
  _id: string;
  name: string;
  location: Location;
  issues: string[]; // Array of Ticket IDs
}
