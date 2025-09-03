import type { Worker } from '../types';

export const sampleWorkers: Worker[] = [
  {
    _id: "worker-001",
    password: "hashed_worker_password_123", // Hash<string>
    name: "Raj Sharma",
    dept: "plumber", // plumber or electrician
    issues_assigned: ["ticket-001", "ticket-006"], // Array<Ref(Ticket)>
    pulls_created: ["resolve-001", "resolve-002"] // Array<Ref(Pull_Request)>
  },
  {
    _id: "worker-002",
    password: "hashed_worker_password_456",
    name: "Priya Patel",
    dept: "electrician",
    issues_assigned: ["ticket-002"],
    pulls_created: ["resolve-003"]
  },
  {
    _id: "worker-003",
    password: "hashed_worker_password_789",
    name: "Kumar Singh",
    dept: "plumber",
    issues_assigned: ["ticket-004"],
    pulls_created: []
  },
  {
    _id: "worker-004",
    password: "hashed_worker_password_012",
    name: "Meera Gupta",
    dept: "plumber",
    issues_assigned: ["ticket-005"],
    pulls_created: ["resolve-004"]
  },
  {
    _id: "worker-005",
    password: "hashed_worker_password_345",
    name: "Arjun Das",
    dept: "electrician",
    issues_assigned: [],
    pulls_created: []
  }
];