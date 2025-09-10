# Civix Server
This is the backend server for the Civix application. It is built using Node.js and Express.js, and it connects to a MongoDB database to store and retrieve data.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and set your MongoDB connection string
```

3. **Start the server:**
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Development

- `npm start` - Start the server
- `npm run dev` - Start the server (same as start, can be extended with nodemon later)

## API Documentation

See [API_TESTING.md](./API_TESTING.md) for comprehensive API testing examples.

## Quick API Overview

### User Management
- `POST /api/user/register` - Register new user
- `PUT /api/user/update/details/:email` - Update user details
- `PUT /api/user/update/role/:email` - Update user role

### Ticket Management  
- `GET /api/ticket/all` - Get all tickets
- `POST /api/ticket/create` - Create new ticket
- `PUT /api/ticket/update/:id` - Update ticket

### Health Check
- `GET /health` - Server health status

## Database Schema

### User Schema
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String,
  phone: String,
  address: String,
  location: { latitude: Number, longitude: Number },
  role: ['user', 'technician', 'authority', 'admin'],
  isTechnician: Boolean,
  issues: [ObjectId], // References to tickets
  points: Number
}
```

### Ticket Schema
```javascript
{
  creator_id: ObjectId (ref: User),
  creator_name: String,
  status: ['open', 'resolved', 'in process'],
  issue_name: String,
  issue_category: String,
  issue_description: String,
  image_url: String,
  tags: [String],
  votes: { upvotes: Number, downvotes: Number },
  urgency: ['critical', 'moderate', 'low'],
  location: { latitude: Number, longitude: Number },
  opening_time: Date,
  closing_time: Date,
  authority: ObjectId (ref: User)
}
```

## Rules:
1. Always access the Users by their email.
2. Ref means Reference to another ObjectId in MongoDB.
3. Location is an object with latitude and longitude.

## APIs

### User APIs

1. POST `/api/user/register`: User will Sign in through firebase in the App, after that a request should be sent to this API to save the user details in the database.

    User Schema for MongoDB database:
    ```ts
    {
        email: string,
        password: Hash<string>,

        // Will be editable at the User end
        name: string/null,
        phone: string/null,
        address: string/null,
        location: Location/null,

        // Will be updated the the Admin Panel
        role: [user / technician / authority / admin],
        isTechnician: boolean,

        // Automatically updated
        issues: Array<Ref(Ticket)>,        
        points: integer/float
    }
    ```
2. PUT `/api/user/update/details/:email`: Update user details like name, isTechnician, etc.
    ```ts
    {
        email: string,
        password: Hash<string>,

        // Will be editable at the User end
        name: string/null,
        phone: string/null,
        address: string/null,
        location: Location/null,

        // Will be updated the the Admin Panel
        role: [user / technician / authority / admin],
        isTechnician: boolean,

        // Automatically updated
        issues: Array<Ref(Ticket)>,        
        points: integer/float
    }
    ```

3. PUT `api/user/update/role/:email`: Update user role like technician, authority, admin, etc.
    ```ts
    {
        email: string,
        password: Hash<string>,

        // Will be editable at the User end
        name: string/null,
        phone: string/null,
        address: string/null,
        location: Location/null,

        // Will be updated the the Admin Panel
        role: [user / technician / authority / admin],
        isTechnician: boolean,

        // Automatically updated
        issues: Array<Ref(Ticket)>,        
        points: integer/float
    }
    ```



### Ticket APIs

1. GET `/api/ticket/all`: Get all tickets from the database.


2. POST `/api/ticket/create`: Create a new ticket. The User Should be able to create a new ticket by providing the necessary details, from the App.

    ```ts
    {
	    _id: uuid,
	    creator_id: uuid,
	    creator_name: string,
	    status: [open / resolved / in process],
	    issue_name: string,
	    issue_category: string		//water, electric issue
	    issue_description: string,
	    image_url: string,
	    tags: [string],
	        votes: {
		    upvotes: integer,
		    downvotes: integer
	    },
	    urgency: [critical/moderate/low],
	    location: Location,
	    opening_time: Time,
	    closing_time: Time/null,
	    authority: Ref(Authority),
    }
    ```

3. PUT `/api/ticket/update/:id`: Update ticket details like status, authority, etc.
    ```ts
    {
        _id: uuid,
        creator_id: uuid,
        creator_name: string,
        status: [open / resolved / in process],
        issue_name: string,
        issue_category: string		//water, electric issue
        issue_description: string,
        image_url: string,
        tags: [string],
            votes: {
            upvotes: integer,
            downvotes: integer
        },
        urgency: [critical/moderate/low],
        location: Location,
        opening_time: Time,
        closing_time: Time/null,
        authority: Ref(Authority),
    }
    ``` 

