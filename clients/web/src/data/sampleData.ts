import { Issue } from '../types';

export const sampleIssues: Issue[] = [
  {
    id: "ISS-001",
    title: "Water Pipeline Leakage",
    description: "Major water leakage from main pipeline causing water wastage",
    category: "Water",
    location: {
      address: "123 MG Road, Sector 4",
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    upvotes: 45,
    status: "in_progress",
    createdAt: new Date("2023-08-01"),
    createdBy: {
      name: "Rahul Kumar",
      contact: "+91 98765-43210"
    },
    attachments: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    updates: [
      {
        date: new Date("2023-08-01"),
        status: "pending",
        note: "Issue reported",
      }
    ]
  },
  {
    id: "ISS-002",
    title: "Street Light Not Working",
    description: "Multiple street lights not working in sector 7",
    category: "Electricity",
    location: {
      address: "Sector 7, Main Road",
      coordinates: { lat: 19.0820, lng: 72.8800 }
    },
    upvotes: 23,
    status: "pending",
    createdAt: new Date("2023-08-02"),
    createdBy: {
      name: "Priya Singh"
    },
    updates: [
      {
        date: new Date("2023-08-02"),
        status: "pending",
        note: "New issue reported",
      }
    ]
  },
  {
    id: "ISS-003",
    title: "Garbage Collection Delayed",
    description: "Regular garbage collection not happening for past 3 days",
    category: "Sanitation",
    location: {
      address: "Green Park Colony",
      coordinates: { lat: 19.0830, lng: 72.8820 }
    },
    upvotes: 67,
    status: "resolved",
    createdAt: new Date("2023-08-03"),
    createdBy: {
      name: "Amit Patel",
      contact: "+91 98765-43211"
    },
    updates: [
      {
        date: new Date("2023-08-03"),
        status: "resolved",
        note: "Issue resolved - Schedule normalized",
        officer: "Sanitation Dept"
      }
    ]
  }
];
