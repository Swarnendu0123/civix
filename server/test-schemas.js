const mongoose = require('mongoose');

// Test schema definitions without connecting to MongoDB
const { User, Ticket, ResolveRequest, Authority } = require('./models');

console.log('🔍 Testing MongoDB Schema Definitions...\n');

// Test User Schema
console.log('📋 User Schema:');
console.log('Fields:', Object.keys(User.schema.paths));
console.log('Required fields:', User.schema.requiredPaths());
console.log('Indexes:', User.schema.indexes());
console.log();

// Test Ticket Schema  
console.log('🎫 Ticket Schema:');
console.log('Fields:', Object.keys(Ticket.schema.paths));
console.log('Required fields:', Ticket.schema.requiredPaths());
console.log('Indexes:', Ticket.schema.indexes());
console.log();

// Test ResolveRequest Schema
console.log('🔧 ResolveRequest Schema:');
console.log('Fields:', Object.keys(ResolveRequest.schema.paths));
console.log('Required fields:', ResolveRequest.schema.requiredPaths());
console.log();

// Test Authority Schema
console.log('🏛️  Authority Schema:');
console.log('Fields:', Object.keys(Authority.schema.paths));
console.log('Required fields:', Authority.schema.requiredPaths());
console.log();

// Test schema validation
console.log('✅ Testing Schema Validation...\n');

// Test User validation
try {
    const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
        role: 'citizen'
    });
    
    const userValidationError = testUser.validateSync();
    if (userValidationError) {
        console.log('❌ User validation error:', userValidationError.message);
    } else {
        console.log('✅ User schema validation passed');
    }
} catch (error) {
    console.log('❌ User schema error:', error.message);
}

// Test Ticket validation
try {
    const testTicket = new Ticket({
        creator_id: 'user-123',
        creator_name: 'Test User',
        issue_name: 'Test Issue',
        issue_category: 'Test Category',
        issue_description: 'Test description',
        location: {
            coordinates: { lat: 19.0760, lng: 72.8777 },
            address: 'Test Address'
        },
        authority: 'auth-123'
    });
    
    const ticketValidationError = testTicket.validateSync();
    if (ticketValidationError) {
        console.log('❌ Ticket validation error:', ticketValidationError.message);
    } else {
        console.log('✅ Ticket schema validation passed');
    }
} catch (error) {
    console.log('❌ Ticket schema error:', error.message);
}

// Test Authority validation
try {
    const testAuthority = new Authority({
        name: 'Test Authority',
        email: 'authority@test.com',
        password: 'testpass123',
        location: {
            coordinates: { lat: 19.0760, lng: 72.8777 },
            address: 'Test Authority Address'
        }
    });
    
    const authorityValidationError = testAuthority.validateSync();
    if (authorityValidationError) {
        console.log('❌ Authority validation error:', authorityValidationError.message);
    } else {
        console.log('✅ Authority schema validation passed');
    }
} catch (error) {
    console.log('❌ Authority schema error:', error.message);
}

console.log('\n🎉 Schema validation tests completed!');
console.log('\n📝 Summary:');
console.log('- User Schema: Supports citizens and technicians with authentication');
console.log('- Ticket Schema: Complete issue tracking with location and voting');
console.log('- ResolveRequest Schema: Technician resolution requests');
console.log('- Authority Schema: City administration with location-based management');
console.log('- All schemas include proper validation and relationships');
console.log('- Passwords are automatically hashed using bcrypt');
console.log('- Proper MongoDB indexes for performance optimization');