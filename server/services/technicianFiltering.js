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
 * Get technician suggestions for an issue with enhanced notification support
 * @param {Object} issue - The issue object
 * @param {Object} options - Additional options for notifications
 * @returns {Promise<Object>} - Filtered technicians with metadata and notification triggers
 */
async function getTechnicianSuggestions(issue, options = {}) {
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
        
        // Check if no technicians are available for this specialization
        if (technicians.length === 0) {
            // Check if there are any technicians of this specialization (even if busy)
            const allSpecializationTechs = await filterTechniciansForIssue(issue_category, {
                location: location?.coordinates,
                // Remove workload limit to see all technicians
            });
            
            if (allSpecializationTechs.length === 0) {
                // No technicians of this specialization exist
                if (options.enableNotifications) {
                    const { notifyNoTechniciansAvailable } = require('./notificationService');
                    notifyNoTechniciansAvailable(issue, issue_category);
                }
                
                return {
                    suggestions: [],
                    totalAvailable: 0,
                    issueCategory: issue_category,
                    urgency: urgency,
                    requiresManualAssignment: true,
                    reason: 'no_technicians_of_specialization'
                };
            } else {
                // Technicians exist but all are busy
                if (options.enableNotifications) {
                    const { notifyManualAssignmentRequired } = require('./notificationService');
                    notifyManualAssignmentRequired(
                        issue, 
                        `All ${issue_category} technicians are currently busy`,
                        allSpecializationTechs
                    );
                }
                
                return {
                    suggestions: allSpecializationTechs.slice(0, 5), // Show busy technicians as potential options
                    totalAvailable: 0,
                    totalBusy: allSpecializationTechs.length,
                    issueCategory: issue_category,
                    urgency: urgency,
                    requiresManualAssignment: true,
                    reason: 'all_technicians_busy'
                };
            }
        }
        
        // Add distance calculation and scoring (placeholder for now)
        const enrichedTechnicians = technicians.map(tech => ({
            ...tech.toObject(),
            // Placeholder metrics - in a real app, these would be calculated
            distance: Math.random() * 10, // km
            estimatedArrival: Math.floor(Math.random() * 60) + 15, // minutes
            workloadScore: calculateWorkloadScore(tech),
            overallScore: calculateOverallScore(tech)
        }));
        
        // Sort by overall score (highest first)
        enrichedTechnicians.sort((a, b) => b.overallScore - a.overallScore);
        
        const result = {
            suggestions: enrichedTechnicians.slice(0, 10), // Top 10 suggestions
            totalAvailable: technicians.length,
            issueCategory: issue_category,
            urgency: urgency,
            requiresManualAssignment: false
        };
        
        // If AI classification was used and we have suggestions, create approval notification
        if (options.classificationMethod === 'ai_classification' && 
            enrichedTechnicians.length > 0 && 
            options.enableNotifications) {
            
            const { notifyLLMAssignmentPending } = require('./notificationService');
            notifyLLMAssignmentPending(issue, enrichedTechnicians[0], enrichedTechnicians.slice(0, 5));
        }
        
        return result;
        
    } catch (error) {
        console.error('Error getting technician suggestions:', error);
        
        // In case of error, create manual assignment notification
        if (options.enableNotifications) {
            const { notifyManualAssignmentRequired } = require('./notificationService');
            notifyManualAssignmentRequired(issue, 'System error during technician matching');
        }
        
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

/**
 * Auto-assign issue with best available technician (if enabled and suitable technicians exist)
 * @param {Object} issue - The issue object
 * @param {Object} classificationResult - Result from intent recognition
 * @returns {Promise<Object>} - Assignment result with notification status
 */
async function autoAssignIssue(issue, classificationResult) {
    try {
        // Get technician suggestions with notification support
        const suggestions = await getTechnicianSuggestions(issue, {
            enableNotifications: true,
            classificationMethod: classificationResult.classificationMethod
        });
        
        // If manual assignment is required, return early
        if (suggestions.requiresManualAssignment) {
            return {
                assigned: false,
                requiresManualIntervention: true,
                reason: suggestions.reason,
                suggestions: suggestions.suggestions
            };
        }
        
        // If no suggestions available, require manual assignment
        if (!suggestions.suggestions || suggestions.suggestions.length === 0) {
            const { notifyManualAssignmentRequired } = require('./notificationService');
            notifyManualAssignmentRequired(issue, 'No suitable technicians found');
            
            return {
                assigned: false,
                requiresManualIntervention: true,
                reason: 'no_suitable_technicians',
                suggestions: []
            };
        }
        
        // If classification was AI-based, don't auto-assign - wait for admin approval
        if (classificationResult.classificationMethod === 'ai_classification') {
            return {
                assigned: false,
                requiresAdminApproval: true,
                suggestedTechnician: suggestions.suggestions[0],
                allSuggestions: suggestions.suggestions.slice(0, 5),
                reason: 'ai_classification_requires_approval'
            };
        }
        
        // For direct classifications with high confidence, auto-assign to best technician
        if (classificationResult.confidence >= 0.9 && suggestions.suggestions.length > 0) {
            const bestTechnician = suggestions.suggestions[0];
            const assignmentResult = await assignIssueToTechnician(issue._id, bestTechnician._id);
            
            return {
                assigned: true,
                assignmentResult,
                selectedTechnician: bestTechnician,
                reason: 'auto_assigned_high_confidence'
            };
        }
        
        // For lower confidence, require manual review
        const { notifyLLMAssignmentPending } = require('./notificationService');
        notifyLLMAssignmentPending(issue, suggestions.suggestions[0], suggestions.suggestions.slice(0, 5));
        
        return {
            assigned: false,
            requiresAdminApproval: true,
            suggestedTechnician: suggestions.suggestions[0],
            allSuggestions: suggestions.suggestions.slice(0, 5),
            reason: 'requires_admin_approval'
        };
        
    } catch (error) {
        console.error('Error in auto-assignment:', error);
        
        // Create notification for manual assignment due to error
        const { notifyManualAssignmentRequired } = require('./notificationService');
        notifyManualAssignmentRequired(issue, 'System error during auto-assignment');
        
        return {
            assigned: false,
            requiresManualIntervention: true,
            reason: 'system_error',
            error: error.message
        };
    }
}

module.exports = {
    filterTechniciansForIssue,
    getTechnicianSuggestions,
    assignIssueToTechnician,
    autoAssignIssue,
    calculateWorkloadScore,
    calculateOverallScore
};