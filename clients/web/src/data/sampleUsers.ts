import type { User } from '../types';

export const sampleUsers: User[] = [
  {
    _id: "user-001",
    password: "hashed_password_123", // Hash<string>
    issues: ["ticket-001", "ticket-006"], // Array<Ref(Ticket)>
    name: "Rahul Kumar",
    points: 85.5
  },
  {
    _id: "user-002", 
    password: "hashed_password_456",
    issues: ["ticket-002"],
    name: "Priya Singh",
    points: 42.0
  },
  {
    _id: "user-003",
    password: "hashed_password_789",
    issues: ["ticket-003"],
    name: "Amit Patel", 
    points: 120.25
  },
  {
    _id: "user-004",
    password: "hashed_password_012",
    issues: ["ticket-004"],
    name: "Meera Sharma",
    points: 33.75
  },
  {
    _id: "user-005",
    password: "hashed_password_345",
    issues: ["ticket-005"],
    name: "Suresh Kumar",
    points: 67.0
  },
  {
    _id: "user-006",
    password: "hashed_password_678",
    issues: [],
    name: "Vikash Gupta",
    points: 15.5
  }
];