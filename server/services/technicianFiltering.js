const { User } = require('../models');

/**
 * Filter technicians based on issue type and availability
 * @param {string} issueType - The classified issue type (sanitation, electricity, water, road)
 * @param {Object} options - Additional filtering options
 * @returns {Promise<Array>} - Array of available technicians
 */
async function filterTechniciansForIssue(issueType, options = {}) {
    try {
        // Build filter criteria
        const filter = {
            role: 'technician',
            status: 'active' // Only active technicians
        };
        
        // Map issue types to specializations
        const specializationMap = {
            'sanitation': ['sanitation', 'waste management', 'cleaning'],
            'electricity': ['electricity', 'electrical', 'power', 'lighting'],
            'water': ['water', 'plumbing', 'drainage', 'water supply'],
            'road': ['road', 'roads', 'infrastructure', 'traffic', 'pavement']
        };
        
        // Add specialization filter if issue type is recognized
        if (issueType && specializationMap[issueType]) {
            const specializations = specializationMap[issueType];
            filter.specialization = { 
                $in: specializations.map(spec => new RegExp(spec, 'i'))
            };
        }
        
        // Additional filters from options
        if (options.location) {
            // TODO: Add location-based filtering using geo-spatial queries
            // For now, we'll just get all matching technicians
        }
        
        if (options.maxWorkload !== undefined) {
            filter.openTickets = { $lte: options.maxWorkload };
        }
        
        // Query technicians
        const technicians = await User.find(filter)
            .select('-password') // Exclude password
            .sort({ 
                openTickets: 1,      // Prefer technicians with fewer open tickets
                rating: -1,          // Prefer higher-rated technicians  
                totalResolved: -1    // Prefer more experienced technicians
            });
        
        return technicians;
        
    } catch (error) {
        console.error('Error filtering technicians:', error);
        throw new Error('Failed to filter technicians');
    }
}

/**
 * Get technician suggestions for an issue
 * @param {Object} issue - The issue object
 * @returns {Promise<Object>} - Filtered technicians with metadata
 */
async function getTechnicianSuggestions(issue) {
    try {
        const { issue_category, location, urgency } = issue;
        
        // Determine max workload based on urgency
        const urgencyWorkloadMap = {
            'critical': 3,
            'high': 5,
            'moderate': 8,
            'low': 10
        };
        
        const maxWorkload = urgencyWorkloadMap[urgency] || 8;
        
        const technicians = await filterTechniciansForIssue(issue_category, {
            location: location?.coordinates,
            maxWorkload
        });
        
        // Add distance calculation and scoring (placeholder for now)
        const enrichedTechnicians = technicians.map(tech => ({
            ...tech.toObject(),
            // Placeholder metrics - in a real app, these would be calculated
            distance: Math.random() * 10, // km
            estimatedArrival: Math.floor(Math.random() * 60) + 15, // minutes
            workloadScore: calculateWorkloadScore(tech),
            overallScore: calculateOverallScore(tech)
        }));
        
        return {
            suggestions: enrichedTechnicians.slice(0, 10), // Top 10 suggestions
            totalAvailable: technicians.length,
            issueCategory: issue_category,
            urgency: urgency
        };
        
    } catch (error) {
        console.error('Error getting technician suggestions:', error);
        throw new Error('Failed to get technician suggestions');
    }
}

/**
 * Calculate workload score for a technician (lower is better)
 * @param {Object} technician 
 * @returns {number}
 */
function calculateWorkloadScore(technician) {
    const openTickets = technician.openTickets || 0;
    const maxCapacity = 10;
    return (openTickets / maxCapacity) * 100;
}

/**
 * Calculate overall score for a technician (higher is better)
 * @param {Object} technician 
 * @returns {number}
 */
function calculateOverallScore(technician) {
    const ratingScore = (technician.rating || 0) * 20; // 0-100
    const experienceScore = Math.min((technician.totalResolved || 0) * 2, 50); // 0-50
    const workloadPenalty = calculateWorkloadScore(technician); // 0-100
    
    return Math.max(0, ratingScore + experienceScore - workloadPenalty);
}

/**
 * Assign an issue to a technician
 * @param {string} issueId - Issue ID
 * @param {string} technicianId - Technician ID
 * @returns {Promise<Object>} - Updated issue and technician
 */
async function assignIssueToTechnician(issueId, technicianId) {
    try {
        const Ticket = require('../models/Ticket');
        
        // Update the ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
            issueId,
            {
                assigned_technician: technicianId,
                status: 'in process'
            },
            { new: true }
        );
        
        if (!updatedTicket) {
            throw new Error('Issue not found');
        }
        
        // Update technician's workload
        const updatedTechnician = await User.findByIdAndUpdate(
            technicianId,
            {
                $addToSet: { issues_assigned: issueId },
                $inc: { openTickets: 1 }
            },
            { new: true }
        );
        
        if (!updatedTechnician) {
            throw new Error('Technician not found');
        }
        
        return {
            ticket: updatedTicket,
            technician: updatedTechnician
        };
        
    } catch (error) {
        console.error('Error assigning issue to technician:', error);
        throw new Error('Failed to assign issue to technician');
    }
}

module.exports = {
    filterTechniciansForIssue,
    getTechnicianSuggestions,
    assignIssueToTechnician,
    calculateWorkloadScore,
    calculateOverallScore
};