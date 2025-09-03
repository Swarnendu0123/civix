import type { Technician } from '../types';

export const sampleTechnicians: Technician[] = [
  {
    id: "TECH-001",
    name: "Raj Sharma",
    contact: "+91 98765-43210",
    specialization: "Water Supply",
    openTickets: 3,
    avgResolutionTime: "1.5 days",
    status: "active",
    totalResolved: 145,
    rating: 4.8
  },
  {
    id: "TECH-002", 
    name: "Priya Patel",
    contact: "+91 98765-43211",
    specialization: "Electricity",
    openTickets: 5,
    avgResolutionTime: "2.1 days", 
    status: "active",
    totalResolved: 98,
    rating: 4.5
  },
  {
    id: "TECH-003",
    name: "Kumar Singh",
    contact: "+91 98765-43212",
    specialization: "Roads",
    openTickets: 2,
    avgResolutionTime: "3.2 days",
    status: "on_site",
    totalResolved: 67,
    rating: 4.2
  },
  {
    id: "TECH-004",
    name: "Meera Gupta", 
    contact: "+91 98765-43213",
    specialization: "Sanitation",
    openTickets: 4,
    avgResolutionTime: "1.8 days",
    status: "active", 
    totalResolved: 123,
    rating: 4.7
  },
  {
    id: "TECH-005",
    name: "Arjun Das",
    contact: "+91 98765-43214",
    specialization: "General",
    openTickets: 1,
    avgResolutionTime: "2.5 days",
    status: "on_leave",
    totalResolved: 89,
    rating: 4.3
  }
];