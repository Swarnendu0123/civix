const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (API key would be from environment variables in production)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

/**
 * Recognizes issue intent using Gemini LLM for issues marked as 'other'
 * @param {string} issueDescription - The description of the issue
 * @param {string} issueTitle - The title of the issue  
 * @returns {Promise<string>} - Returns one of: 'sanitation', 'electricity', 'water', 'road', or 'unknown'
 */
async function recognizeIssueIntent(issueDescription, issueTitle = '') {
    // If no API key, return a simple keyword-based classification for demo
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
        return classifyWithKeywords(issueDescription, issueTitle);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `
        Analyze the following civic issue and classify it into one of these categories: sanitation, electricity, water, or road.
        
        Issue Title: ${issueTitle}
        Issue Description: ${issueDescription}
        
        Categories:
        - sanitation: waste management, garbage collection, cleaning, public hygiene, sewage
        - electricity: power outages, street lighting, electrical infrastructure, power lines
        - water: water supply, plumbing, drainage, water quality, pipes, leaks
        - road: road maintenance, potholes, traffic infrastructure, pavement, road safety
        
        Return only one word from the categories above that best matches this issue. If none match well, return "unknown".
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const classification = response.text().trim().toLowerCase();
        
        // Validate the response
        const validCategories = ['sanitation', 'electricity', 'water', 'road', 'unknown'];
        if (validCategories.includes(classification)) {
            return classification;
        }
        
        // Fallback to keyword-based classification
        return classifyWithKeywords(issueDescription, issueTitle);
        
    } catch (error) {
        console.error('Gemini AI classification error:', error);
        // Fallback to keyword-based classification
        return classifyWithKeywords(issueDescription, issueTitle);
    }
}

/**
 * Fallback keyword-based classification
 * @param {string} description 
 * @param {string} title 
 * @returns {string}
 */
function classifyWithKeywords(description, title) {
    const text = `${title} ${description}`.toLowerCase();
    
    // Define keyword patterns for each category
    const patterns = {
        sanitation: ['waste', 'garbage', 'trash', 'cleaning', 'sewage', 'toilet', 'hygiene', 'dirty', 'litter', 'dump'],
        electricity: ['power', 'electric', 'light', 'outage', 'blackout', 'voltage', 'wire', 'pole', 'transformer'],
        water: ['water', 'pipe', 'leak', 'drain', 'plumb', 'tap', 'supply', 'pressure', 'overflow', 'flooding'],
        road: ['road', 'street', 'pothole', 'pavement', 'traffic', 'signal', 'crossing', 'path', 'sidewalk', 'asphalt']
    };
    
    let maxScore = 0;
    let bestCategory = 'unknown';
    
    for (const [category, keywords] of Object.entries(patterns)) {
        const score = keywords.reduce((count, keyword) => {
            return count + (text.includes(keyword) ? 1 : 0);
        }, 0);
        
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }
    
    return maxScore > 0 ? bestCategory : 'unknown';
}

/**
 * Process issue type and determine final classification
 * @param {string} issueType - Original issue type from form
 * @param {string} issueDescription - Issue description
 * @param {string} issueTitle - Issue title
 * @param {Object} ticketData - Full ticket data for notification context
 * @returns {Promise<Object>} - Final issue type classification with metadata
 */
async function processIssueType(issueType, issueDescription, issueTitle, ticketData = null) {
    const result = {
        originalType: issueType,
        finalType: issueType,
        classificationMethod: 'direct',
        requiresManualReview: false,
        confidence: 1.0
    };
    
    // If issue type is not 'other', use it directly
    if (issueType && issueType !== 'other') {
        return result;
    }
    
    // If issue type is 'other', use intent recognition
    try {
        const classifiedType = await recognizeIssueIntent(issueDescription, issueTitle);
        
        result.finalType = classifiedType;
        result.classificationMethod = 'ai_classification';
        
        // If classification returns 'unknown', this requires manual review
        if (classifiedType === 'unknown') {
            result.requiresManualReview = true;
            result.confidence = 0.0;
            
            // Create notification for admin if ticket data is provided
            if (ticketData) {
                const { notifyUnclassifiedIssue } = require('./notificationService');
                notifyUnclassifiedIssue(ticketData);
            }
        } else {
            // For AI-classified issues, set confidence based on method used
            result.confidence = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key' ? 0.85 : 0.70;
        }
        
        return result;
        
    } catch (error) {
        console.error('Error in intent recognition:', error);
        result.finalType = 'unknown';
        result.classificationMethod = 'error_fallback';
        result.requiresManualReview = true;
        result.confidence = 0.0;
        
        // Create notification for admin if ticket data is provided
        if (ticketData) {
            const { notifyUnclassifiedIssue } = require('./notificationService');
            notifyUnclassifiedIssue(ticketData);
        }
        
        return result;
    }
}

module.exports = {
    recognizeIssueIntent,
    processIssueType,
    classifyWithKeywords
};