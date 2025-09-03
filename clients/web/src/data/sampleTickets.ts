import type { Ticket } from '../types';

export const sampleTickets: Ticket[] = [
  {
    _id: "ticket-001",
    creator_id: "user-001",
    creator_name: "Rahul Kumar",
    status: "in process",
    issue_name: "Water Pipeline Leakage",
    issue_category: "water",
    issue_description: "Major water leakage from main pipeline causing water wastage and flooding in the area",
    image_url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800",
    tags: ["water", "pipeline", "emergency"],
    votes: {
      upvotes: 45,
      downvotes: 2
    },
    urgency: "critical",
    location: {
      address: "123 MG Road, Sector 4",
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    opening_time: new Date("2023-08-01T08:30:00Z"),
    closing_time: null,
    authority: "auth-water-dept",
    sub_authority: "sub-auth-sector4"
  },
  {
    _id: "ticket-002",
    creator_id: "user-002",
    creator_name: "Priya Singh",
    status: "open",
    issue_name: "Street Light Not Working",
    issue_category: "electric issue",
    issue_description: "Multiple street lights not working in sector 7, causing safety issues during night hours",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    tags: ["electricity", "street light", "safety"],
    votes: {
      upvotes: 23,
      downvotes: 1
    },
    urgency: "moderate",
    location: {
      address: "Sector 7, Main Road",
      coordinates: { lat: 19.0820, lng: 72.8800 }
    },
    opening_time: new Date("2023-08-02T19:45:00Z"),
    closing_time: null,
    authority: "auth-electricity-dept",
    sub_authority: "sub-auth-sector7"
  },
  {
    _id: "ticket-003",
    creator_id: "user-003",
    creator_name: "Amit Patel",
    status: "resolved",
    issue_name: "Potholes on Road",
    issue_category: "roads",
    issue_description: "Several deep potholes on the main road causing traffic issues and vehicle damage",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    tags: ["roads", "potholes", "traffic"],
    votes: {
      upvotes: 30,
      downvotes: 0
    },
    urgency: "moderate",
    location: {
      address: "Main Road, Near Bus Stand",
      coordinates: { lat: 19.0750, lng: 72.8777 }
    },
    opening_time: new Date("2023-07-28T14:20:00Z"),
    closing_time: new Date("2023-08-05T16:30:00Z"),
    authority: "auth-roads-dept",
    sub_authority: "sub-auth-central"
  },
  {
    _id: "ticket-004",
    creator_id: "user-004",
    creator_name: "Meera Sharma",
    status: "in process",
    issue_name: "Garbage Collection Delay",
    issue_category: "sanitation",
    issue_description: "Garbage not collected for past two days, creating unhygienic conditions",
    image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    tags: ["garbage", "sanitation", "hygiene"],
    votes: {
      upvotes: 15,
      downvotes: 1
    },
    urgency: "low",
    location: {
      address: "Sector 5, Near Park",
      coordinates: { lat: 19.0780, lng: 72.8790 }
    },
    opening_time: new Date("2023-08-03T07:15:00Z"),
    closing_time: null,
    authority: "auth-sanitation-dept",
    sub_authority: "sub-auth-sector5"
  },
  {
    _id: "ticket-005",
    creator_id: "user-005",
    creator_name: "Suresh Kumar",
    status: "open",
    issue_name: "Public Toilet Maintenance",
    issue_category: "sanitation",
    issue_description: "Public toilet in bad condition, needs immediate maintenance and cleaning",
    image_url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
    tags: ["toilet", "maintenance", "public facility"],
    votes: {
      upvotes: 8,
      downvotes: 0
    },
    urgency: "moderate",
    location: {
      address: "Sector 4, Opposite Community Hall",
      coordinates: { lat: 19.0770, lng: 72.8780 }
    },
    opening_time: new Date("2023-08-04T11:00:00Z"),
    closing_time: null,
    authority: "auth-sanitation-dept",
    sub_authority: "sub-auth-sector4"
  },
  {
    _id: "ticket-006",
    creator_id: "user-006",
    creator_name: "Vikash Gupta",
    status: "open",
    issue_name: "Water Supply Shortage",
    issue_category: "water",
    issue_description: "Irregular water supply causing inconvenience to residents",
    image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    tags: ["water", "supply", "shortage"],
    votes: {
      upvotes: 32,
      downvotes: 2
    },
    urgency: "critical",
    location: {
      address: "Sector 6, Residential Block A",
      coordinates: { lat: 19.0795, lng: 72.8815 }
    },
    opening_time: new Date("2023-08-05T06:00:00Z"),
    closing_time: null,
    authority: "auth-water-dept",
    sub_authority: "sub-auth-sector6"
  }
];

// Sample authorities (complete Authority model)
export const sampleAuthorities = [
  {
    _id: "auth-water-dept",
    password: "hashed_auth_password_water",
    name: "Water Department",
    location: {
      address: "Municipal Water Dept, City Center",
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    issues: ["ticket-001", "ticket-006"]
  },
  {
    _id: "auth-electricity-dept",
    password: "hashed_auth_password_electricity", 
    name: "Electricity Department",
    location: {
      address: "Electricity Board Office, Sector 3",
      coordinates: { lat: 19.0780, lng: 72.8800 }
    },
    issues: ["ticket-002"]
  },
  {
    _id: "auth-roads-dept",
    password: "hashed_auth_password_roads",
    name: "Roads & Infrastructure Department", 
    location: {
      address: "PWD Office, Government Complex",
      coordinates: { lat: 19.0770, lng: 72.8790 }
    },
    issues: ["ticket-003"]
  },
  {
    _id: "auth-sanitation-dept",
    password: "hashed_auth_password_sanitation",
    name: "Sanitation Department",
    location: {
      address: "Municipal Health Office, Sector 2",
      coordinates: { lat: 19.0750, lng: 72.8785 }
    },
    issues: ["ticket-004", "ticket-005"]
  }
];

// Sample sub-authorities
export const sampleSubAuthorities = [
  { _id: "sub-auth-sector4", name: "Sector 4 Office", authority_id: "auth-water-dept" },
  { _id: "sub-auth-sector5", name: "Sector 5 Office", authority_id: "auth-sanitation-dept" },
  { _id: "sub-auth-sector6", name: "Sector 6 Office", authority_id: "auth-water-dept" },
  { _id: "sub-auth-sector7", name: "Sector 7 Office", authority_id: "auth-electricity-dept" },
  { _id: "sub-auth-central", name: "Central Office", authority_id: "auth-roads-dept" }
];