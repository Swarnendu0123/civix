# Web Client Component

The Civix Web Client is a React-based administrative dashboard designed for city officials, administrators, and supervisors to manage civic tickets efficiently. Built with modern technologies, it provides a comprehensive interface for ticket tracking, team management, and analytics.

## Overview

### Technology Stack
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.12
- **Routing**: React Router DOM 7.8.2
- **Maps**: Mapbox GL 3.14.0
- **Authentication**: Firebase 12.2.1
- **Icons**: React Icons 5.5.0

### Key Features
- **Interactive Dashboard**: Real-time metrics and analytics
- **ticket Management**: Comprehensive ticket tracking and assignment
- **Geographic Visualization**: Interactive maps with ticket clustering
- **Team Management**: Technician oversight and performance tracking
- **Advanced Analytics**: Reporting and trend analysis
- **User Management**: Role-based access control

## Project Structure

```
clients/web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI elements
│   │   ├── forms/          # Form components
│   │   ├── charts/         # Data visualization
│   │   └── maps/           # Map-related components
│   ├── pages/              # Route components
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── tickets/         # ticket management
│   │   ├── Analytics/      # Reports and analytics
│   │   ├── Team/           # Team management
│   │   └── Settings/       # Configuration
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   ├── context/            # React context providers
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── public/                 # Public static files
├── package.json
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Access to the Civix API server
- Firebase project (for authentication)
- Mapbox account (for maps)

### Installation
```bash
cd clients/web
npm install
```

### Environment Setup
Create `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Core Components

### Dashboard Component
**Location**: `src/pages/Dashboard/Dashboard.tsx`

The main dashboard provides an overview of all civic tickets and system metrics.

```typescript
interface DashboardProps {
  // Dashboard component props
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>();
  const [tickets, settickets] = useState<ticket[]>([]);
  
  // Dashboard logic
  
  return (
    <div className="dashboard-container">
      <MetricsOverview metrics={metrics} />
      <ticketMap tickets={tickets} />
      <RecentActivity />
      <PerformanceCharts />
    </div>
  );
};
```

**Features**:
- Real-time metrics display
- Interactive ticket map
- Recent activity feed
- Performance analytics charts
- Quick action buttons

### ticket Management
**Location**: `src/pages/tickets/`

Comprehensive ticket tracking and management interface.

#### ticketList Component
```typescript
interface ticketListProps {
  filters: ticketFilters;
  onticketselect: (ticket: ticket) => void;
}

const ticketList: React.FC<ticketListProps> = ({ filters, onticketselect }) => {
  const { tickets, loading, error } = usetickets(filters);
  
  return (
    <div className="ticket-list">
      <ticketFilters filters={filters} />
      <ticketTable 
        tickets={tickets}
        loading={loading}
        onSelect={onticketselect}
      />
      <Pagination />
    </div>
  );
};
```

#### ticketDetail Component
```typescript
interface ticketDetailProps {
  ticketId: string;
  onUpdate: (ticket: ticket) => void;
}

const ticketDetail: React.FC<ticketDetailProps> = ({ ticketId, onUpdate }) => {
  const { ticket, loading } = useticket(ticketId);
  
  return (
    <div className="ticket-detail">
      <ticketHeader ticket={ticket} />
      <ticketPhotos photos={ticket.photos} />
      <ticketMap location={ticket.location} />
      <AssignmentPanel ticket={ticket} onUpdate={onUpdate} />
      <ActivityTimeline activities={ticket.activities} />
    </div>
  );
};
```

### Map Integration
**Location**: `src/components/maps/`

Interactive maps powered by Mapbox GL for geographic ticket visualization.

```typescript
interface ticketMapProps {
  tickets: ticket[];
  onticketClick: (ticket: ticket) => void;
  center?: [number, number];
  zoom?: number;
}

const ticketMap: React.FC<ticketMapProps> = ({ 
  tickets, 
  onticketClick, 
  center, 
  zoom 
}) => {
  const [map, setMap] = useState<mapboxgl.Map>();
  
  useEffect(() => {
    // Initialize Mapbox map
    const mapInstance = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center || [-74.006, 40.7128],
      zoom: zoom || 10
    });
    
    setMap(mapInstance);
    
    return () => mapInstance.remove();
  }, []);
  
  useEffect(() => {
    if (map && tickets.length > 0) {
      // Add ticket markers to map
      addticketMarkers(map, tickets, onticketClick);
    }
  }, [map, tickets]);
  
  return <div id="map-container" className="map-container" />;
};
```

### Analytics Dashboard
**Location**: `src/pages/Analytics/`

Comprehensive reporting and analytics interface.

```typescript
const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>();
  
  return (
    <div className="analytics-dashboard">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
      
      <div className="metrics-grid">
        <MetricCard 
          title="Total tickets"
          value={metrics?.totaltickets}
          trend={metrics?.ticketsTrend}
        />
        <MetricCard 
          title="Resolution Time"
          value={metrics?.avgResolutionTime}
          trend={metrics?.resolutionTrend}
        />
        <MetricCard 
          title="Satisfaction Score"
          value={metrics?.satisfactionScore}
          trend={metrics?.satisfactionTrend}
        />
      </div>
      
      <ChartsGrid>
        <ticketVolumeChart data={metrics?.volumeData} />
        <CategoryBreakdownChart data={metrics?.categoryData} />
        <TechnicianPerformanceChart data={metrics?.performanceData} />
        <GeographicHeatmap data={metrics?.geoData} />
      </ChartsGrid>
    </div>
  );
};
```

## Custom Hooks

### useApi Hook
**Location**: `src/hooks/useApi.ts`

Generic hook for API interactions with loading states and error handling.

```typescript
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(endpoint: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<T>(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [endpoint]);
  
  return { data, loading, error, refetch: fetchData };
}
```

### useAuth Hook
**Location**: `src/hooks/useAuth.ts`

Authentication state management with Firebase integration.

```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'technician';
}

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Authentication logic
  
  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}
```

## State Management

### Context Providers
**Location**: `src/context/`

#### AppContext
```typescript
interface AppContextValue {
  currentUser: User | null;
  settings: AppSettings;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Context logic
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
```

## API Integration

### API Service
**Location**: `src/services/api.ts`

Centralized API client with authentication and error handling.

```typescript
class ApiService {
  private baseURL: string;
  private token: string | null = null;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  setAuthToken(token: string) {
    this.token = token;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };
    
    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Additional HTTP methods...
}

export const api = new ApiService(import.meta.env.VITE_API_URL);
```

## Styling and UI

### Tailwind CSS Configuration
**Location**: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        civic: {
          blue: '#2563eb',
          green: '#16a34a',
          yellow: '#ca8a04',
          red: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### Component Library
Reusable UI components following design system principles:

- **Button**: Various styles and sizes
- **Card**: Container component with consistent styling
- **Modal**: Overlay components for dialogs
- **Form**: Input fields, selects, checkboxes
- **Table**: Data display with sorting and filtering
- **Badge**: Status indicators and labels

## Performance Optimization

### Code Splitting
```typescript
// Lazy load components for better performance
const ticketDetail = lazy(() => import('./pages/tickets/ticketDetail'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/tickets/:id" element={<ticketDetail />} />
    <Route path="/analytics" element={<Analytics />} />
  </Routes>
</Suspense>
```

### Memoization
```typescript
// Memoize expensive calculations
const sortedtickets = useMemo(() => {
  return tickets.sort((a, b) => b.priority - a.priority);
}, [tickets]);

// Memoize callback functions
const handleticketselect = useCallback((ticket: ticket) => {
  setSelectedticket(ticket);
}, []);
```

## Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ticketList } from './ticketList';

describe('ticketList', () => {
  it('renders tickets correctly', () => {
    const mocktickets = [
      { id: '1', title: 'Test ticket', status: 'open' }
    ];
    
    render(<ticketList tickets={mocktickets} />);
    
    expect(screen.getByText('Test ticket')).toBeInTheDocument();
  });
  
  it('handles ticket selection', () => {
    const handleSelect = jest.fn();
    const mocktickets = [
      { id: '1', title: 'Test ticket', status: 'open' }
    ];
    
    render(<ticketList tickets={mocktickets} onSelect={handleSelect} />);
    
    fireEvent.click(screen.getByText('Test ticket'));
    expect(handleSelect).toHaveBeenCalledWith(mocktickets[0]);
  });
});
```

## Deployment

### Build Configuration
**Location**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mapbox: ['mapbox-gl', 'react-map-gl'],
          charts: ['recharts', 'd3'],
        },
      },
    },
  },
});
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

The Web Client provides a comprehensive administrative interface that enables efficient management of civic tickets while maintaining excellent user experience and performance.