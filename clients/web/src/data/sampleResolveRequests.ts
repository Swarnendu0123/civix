import type { ResolveRequest } from '../types';

export const sampleResolveRequests: ResolveRequest[] = [
  {
    _id: "resolve-001",
    creator: "worker-001", // Workers<uuid>
    name: "Water Pipeline Repair Request",
    description: "Request to approve pipeline repair work for the water leakage issue in Sector 4. Materials and timeline have been assessed.",
    image_url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400",
    sub_authority: "sub-auth-sector4", // Ref<SubAuthority>
    authority: "auth-water-dept" // Ref<Authority>
  },
  {
    _id: "resolve-002",
    creator: "worker-001",
    name: "Water Supply Restoration Plan",
    description: "Detailed plan to restore water supply in Sector 6 including pipe replacement and testing schedule.",
    image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
    sub_authority: "sub-auth-sector6",
    authority: "auth-water-dept"
  },
  {
    _id: "resolve-003", 
    creator: "worker-002",
    name: "Street Light Replacement Request",
    description: "Request for approval to replace faulty street lights in Sector 7 with LED fixtures.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    sub_authority: "sub-auth-sector7",
    authority: "auth-electricity-dept"
  },
  {
    _id: "resolve-004",
    creator: "worker-004",
    name: "Public Toilet Renovation Proposal",
    description: "Comprehensive renovation proposal for public toilet facility including plumbing and sanitation upgrades.",
    image_url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400", 
    sub_authority: "sub-auth-sector4",
    authority: "auth-sanitation-dept"
  }
];