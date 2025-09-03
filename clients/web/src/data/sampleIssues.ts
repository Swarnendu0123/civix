export const sampleIssues = [
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
    priority: "high",
    createdAt: new Date("2023-08-01"),
    createdBy:{
        name: "Rahul Kumar",
        contact: "+91 98765-43210"
    }
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
    priority: "medium",
    createdAt: new Date("2023-08-02"),
    createdBy:{
        name: "Rahul Kumar",
        contact: "+91 98765-43210"
    }
  },
  {
    id: "ISS-003",
    title: "Potholes on Road",
    description: "Several potholes on the main road causing traffic issues",
    category: "Roads",
    location: {
      address: "Main Road, Near Bus Stand",
      coordinates: { lat: 19.0750, lng: 72.8777 }
    },
    upvotes: 30,
    status: "resolved",
    priority: "high",
    createdAt: new Date("2023-07-28"),
    createdBy:{
        name: "Rahul Kumar",
        contact: "+91 98765-43210"
    }
  },
  {
    id: "ISS-004",
    title: "Garbage Collection Delay",
    description: "Garbage not collected for past two days",
    category: "Sanitation",
    location: {
      address: "Sector 5, Near Park",
      coordinates: { lat: 19.0780, lng: 72.8790 }
    },
    upvotes: 10,
    status: "in_progress",
    priority: "low",
    createdAt: new Date("2023-08-03"),
    createdBy:{
        name: "Rahul Kumar",
        contact: "+91 98765-43210"
    }
  },
  {
    id: "ISS-005",
    title: "Public Toilet Maintenance",
    description: "Public toilet in bad condition, needs immediate attention",
    category: "Sanitation",
    location: {
      address: "Sector 4, Opposite Community Hall",
      coordinates: { lat: 19.0770, lng: 72.8780 }
    },
    upvotes: 5,
    status: "pending",
    priority: "medium",
    createdAt: new Date("2023-08-04"),
    createdBy:{
        name: "Rahul Kumar",
        contact: "+91 98765-43210"
    }
  }
];
