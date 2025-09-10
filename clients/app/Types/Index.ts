interface Location {
  _id: string;
  latitude: number;
  longitude: number;
}

interface Votes {
  _id: string;
  upvotes: string[];
  downvotes: string[];
}

export interface Ticket {
  _id: string;
  creator_email: string;
  creator_name: string;
  status: "open" | "resolved" | "in process";
  ticket_name: string;
  ticket_category: string;
  ticket_description: string;
  image_url?: string;
  tags: string[];
  votes: Votes;
  urgency: "critical" | "moderate" | "low";
  location: Location;
  opening_time: string;
  closing_time?: string;
  authority?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

