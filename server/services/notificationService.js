/**
 * Notification Service for Civix
 * Handles admin notifications for assignment scenarios requiring manual intervention
 */

let notifications = []; // In-memory storage for notifications (in production, use database)

/**
 * Notification types for different scenarios
 */
const NotificationTypes = {
    ISSUE_UNCLASSIFIED: 'issue_unclassified',
    LLM_ASSIGNMENT_PENDING: 'llm_assignment_pending', 
    NO_TECHNICIANS_AVAILABLE: 'no_technicians_available',
    ASSIGNMENT_OVERRIDE_NEEDED: 'assignment_override_needed',
    MANUAL_ASSIGNMENT_REQUIRED: 'manual_assignment_required'
};

/**
 * Create a notification for admin
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} data - Additional data (ticket info, suggestions, etc.)
 * @param {string} priority - Notification priority (low, medium, high, critical)
 * @returns {Object} - Created notification
 */
function createNotification(type, title, message, data = {}, priority = 'medium') {
    const notification = {
        _id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        message,
        data,
        priority,
        read: false,
        actionable: true, // This notification requires admin action
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notifications.unshift(notification); // Add to beginning
    
    // Keep only last 100 notifications to prevent memory issues
    if (notifications.length > 100) {
        notifications = notifications.slice(0, 100);
    }
    
    console.log(`📢 Admin Notification Created: ${title}`);
    return notification;
}

/**
 * Create notification for unclassified issue (fallback case)
 * @param {Object} ticket - The ticket that couldn't be classified
 * @returns {Object} - Created notification
 */
function notifyUnclassifiedIssue(ticket) {
    return createNotification(
        NotificationTypes.ISSUE_UNCLASSIFIED,
        '🔍 Issue Classification Failed',
        `Issue "${ticket.issue_name}" could not be automatically classified and requires manual assignment.`,
        {
            ticketId: ticket._id,
            ticketName: ticket.issue_name,
            description: ticket.issue_description,
            location: ticket.location,
            urgency: ticket.urgency,
            actions: ['classify_manually', 'assign_manually']
        },
        ticket.urgency === 'critical' ? 'critical' : 'high'
    );
}

/**
 * Create notification for LLM assignment that needs admin approval
 * @param {Object} ticket - The ticket
 * @param {Object} suggestedTechnician - The technician suggested by LLM
 * @param {Array} allSuggestions - All available technician suggestions
 * @returns {Object} - Created notification
 */
function notifyLLMAssignmentPending(ticket, suggestedTechnician, allSuggestions = []) {
    return createNotification(
        NotificationTypes.LLM_ASSIGNMENT_PENDING,
        '🤖 AI Assignment Suggestion',
        `AI suggests assigning "${ticket.issue_name}" to ${suggestedTechnician.name}. Please review and approve.`,
        {
            ticketId: ticket._id,
            ticketName: ticket.issue_name,
            suggestedTechnician,
            allSuggestions,
            issueCategory: ticket.issue_category,
            urgency: ticket.urgency,
            actions: ['approve_assignment', 'override_assignment', 'manual_assignment']
        },
        'medium'
    );
}

/**
 * Create notification when no technicians are available for a specialization
 * @param {Object} ticket - The ticket that needs assignment
 * @param {string} specialization - The specialization that has no available technicians
 * @returns {Object} - Created notification
 */
function notifyNoTechniciansAvailable(ticket, specialization) {
    return createNotification(
        NotificationTypes.NO_TECHNICIANS_AVAILABLE,
        '⚠️ No Available Technicians',
        `No ${specialization} technicians are available for "${ticket.issue_name}". Manual assignment required.`,
        {
            ticketId: ticket._id,
            ticketName: ticket.issue_name,
            specialization,
            issueCategory: ticket.issue_category,
            urgency: ticket.urgency,
            location: ticket.location,
            actions: ['assign_from_other_specialization', 'create_technician', 'escalate_issue']
        },
        ticket.urgency === 'critical' ? 'critical' : 'high'
    );
}

/**
 * Create notification when manual assignment is required
 * @param {Object} ticket - The ticket that needs manual assignment
 * @param {string} reason - Reason why manual assignment is needed
 * @param {Array} availableTechnicians - Available technicians (may be empty)
 * @returns {Object} - Created notification
 */
function notifyManualAssignmentRequired(ticket, reason, availableTechnicians = []) {
    return createNotification(
        NotificationTypes.MANUAL_ASSIGNMENT_REQUIRED,
        '✋ Manual Assignment Required',
        `"${ticket.issue_name}" requires manual assignment. Reason: ${reason}`,
        {
            ticketId: ticket._id,
            ticketName: ticket.issue_name,
            reason,
            availableTechnicians,
            issueCategory: ticket.issue_category,
            urgency: ticket.urgency,
            actions: ['assign_manually', 'escalate_issue']
        },
        ticket.urgency === 'critical' ? 'critical' : 'high'
    );
}

/**
 * Get all notifications with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Array} - Array of notifications
 */
function getNotifications(filters = {}) {
    let filteredNotifications = [...notifications];
    
    if (filters.read !== undefined) {
        filteredNotifications = filteredNotifications.filter(n => n.read === filters.read);
    }
    
    if (filters.type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }
    
    if (filters.priority) {
        filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
    }
    
    if (filters.actionable !== undefined) {
        filteredNotifications = filteredNotifications.filter(n => n.actionable === filters.actionable);
    }
    
    return filteredNotifications;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Object|null} - Updated notification or null if not found
 */
function markNotificationRead(notificationId) {
    const notification = notifications.find(n => n._id === notificationId);
    if (notification) {
        notification.read = true;
        notification.updatedAt = new Date().toISOString();
        return notification;
    }
    return null;
}

/**
 * Remove notification
 * @param {string} notificationId - Notification ID
 * @returns {boolean} - True if removed, false if not found
 */
function removeNotification(notificationId) {
    const index = notifications.findIndex(n => n._id === notificationId);
    if (index > -1) {
        notifications.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Get unread notification count
 * @returns {number} - Number of unread notifications
 */
function getUnreadCount() {
    return notifications.filter(n => !n.read).length;
}

/**
 * Get actionable notification count
 * @returns {number} - Number of actionable notifications
 */
function getActionableCount() {
    return notifications.filter(n => n.actionable && !n.read).length;
}

/**
 * Mark all notifications as read
 * @returns {number} - Number of notifications marked as read
 */
function markAllAsRead() {
    const unreadCount = getUnreadCount();
    notifications.forEach(n => {
        if (!n.read) {
            n.read = true;
            n.updatedAt = new Date().toISOString();
        }
    });
    return unreadCount;
}

/**
 * Clear old notifications (older than 30 days)
 * @returns {number} - Number of notifications cleared
 */
function clearOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const initialCount = notifications.length;
    notifications = notifications.filter(n => new Date(n.createdAt) > thirtyDaysAgo);
    
    return initialCount - notifications.length;
}

module.exports = {
    NotificationTypes,
    createNotification,
    notifyUnclassifiedIssue,
    notifyLLMAssignmentPending,
    notifyNoTechniciansAvailable,
    notifyManualAssignmentRequired,
    getNotifications,
    markNotificationRead,
    removeNotification,
    getUnreadCount,
    getActionableCount,
    markAllAsRead,
    clearOldNotifications
};