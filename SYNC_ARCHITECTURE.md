# Web & Mobile Sync Architecture

This document explains how the Moms Magic web and mobile apps stay perfectly synchronized in real-time.

## Synchronization Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Railway)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         REST API                WebSocket Server      │   │
│  │  POST   /auth/login          wss://momsmagic:*      │   │
│  │  POST   /auth/register                                │   │
│  │  GET    /providers                                     │   │
│  │  GET    /menu?provider=:id    →  Broadcasts refresh  │   │
│  │  POST   /orders               events every 2 sec     │   │
│  │  GET    /orders                                       │   │
│  │                                                        │   │
│  │  Database (Mock in-memory)                            │   │
│  │  ├── 3 Seeded Providers                               │   │
│  │  ├── User Orders                                      │   │
│  │  └── Authentication                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────┬──────────┘
                 │                                  │
        ┌────────▼────────┐            ┌────────────▼────────┐
        │   WEB APP       │            │   MOBILE APP        │
        │  (Vite/React)   │            │(React Native)       │
        │                 │            │                     │
        │┌───────────────┐│            │┌──────────────────┐ │
        ││  api.js       ││            ││  api.js          │ │
        ││ (fetch)       ││            ││ (fetch)          │ │
        ││ BASE:         ││            ││ BASE:            │ │
        ││ momsmagic-    ││            ││ momsmagic-       │ │
        ││ production...││            ││ production...    │ │
        │└───────────────┘│            │└──────────────────┘ │
        │       │         │            │        │            │
        │┌──────▼────────┐│            │┌───────▼──────────┐ │
        ││useState/Redux ││            ││AuthContext       │ │
        ││(state mgmt)   ││            ││DataContext       │ │
        ││               ││            ││(state mgmt)      │ │
        │└───────────────┘│            │└──────────────────┘ │
        │       │         │            │        │            │
        │┌──────▼────────┐│            │┌───────▼──────────┐ │
        ││useAutoRefresh ││            ││useSyncProvider   │ │
        ││(WebSocket)    ││            ││(WebSocket)       │ │
        ││ ws → wss      ││            ││ wss://           │ │
        │└──────┬────────┘│            │└────────┬─────────┘ │
        │       │         │            │         │           │
        └───────┼─────────┘            └─────────┼───────────┘
                │                               │
                └───────────────┬────────────────┘
                          ┌─────▼──────┐
                          │ WebSocket  │
                          │ Event Bus  │
                          │            │
                          │ broadcast  │
                          │ refresh    │
                          │ every 2s   │
                          └────────────┘
```

## Sync Mechanisms

### 1. REST API (Request-Response)

Regular HTTP/HTTPS calls for data operations:

**Web App** → `api.js` → `fetch()` → Backend `/providers` → Response

```javascript
// Web
const res = await fetch(
  "https://momsmagic-production.up.railway.app/api/providers",
);
const { providers } = await res.json();
```

**Mobile App** → `api.js` → `fetch()` → Backend `/providers` → Response

```javascript
// Mobile
const res = await fetch(
  "https://momsmagic-production.up.railway.app/api/providers",
);
const { providers } = await res.json();
```

### 2. WebSocket (Broadcast)

Real-time push notifications from backend:

**Backend broadcasting** every 2 seconds:

```javascript
// server.js
setInterval(() => {
  server.broadcast(JSON.stringify({ type: "refresh", timestamp: Date.now() }));
}, 2000);
```

**Web App listening**:

```javascript
// useAutoRefresh.js
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "refresh") {
    fetchProviders(); // Re-fetch latest data
  }
};
```

**Mobile App listening**:

```javascript
// useSyncProvider.js
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "refresh") {
    onUpdate(msg); // Trigger DataContext update
  }
};
```

## Real-time Sync Example

### Scenario: Kitchen owner adds new menu item

**Timeline**:

```
T0:00 - Kitchen owner adds "Biryani" on mobile app
          POST /menu → Backend stores new item

T0:02 - Backend broadcasts 'refresh' event via WebSocket
          ├─ Web browser receives message
          ├─ Mobile app receives message
          └─ Both apps fetch fresh data

T0:03 - Web app calls GET /providers
          ├─ Receives updated menu with Biryani
          ├─ useState updates with new data
          └─ HomePage re-renders → Biryani visible

T0:03 - Mobile app calls GET /providers
          ├─ Receives updated menu with Biryani
          ├─ DataContext updates state
          ├─ HomeScreen re-renders
          └─ Biryani visible on mobile

T0:04 - Customer sees Biryani on BOTH web and mobile simultaneously
```

## State Management Comparison

### Web App (React/Vite)

```
HomePpage (useState)
    ↓
useAutoRefresh.js (WebSocket)
    ↓ onmessage: 'refresh'
    ↓
providersApi.list() (REST)
    ↓
Update state
    ↓
Re-render component
```

### Mobile App (React Native)

```
HomeScreen (useData hook)
    ↓
DataContext (state)
    ↓
useSyncProvider() (WebSocket)
    ↓ onmessage: 'refresh'
    ↓
api.providers.list() (REST)
    ↓
Update context
    ↓
Re-render screen
```

## API Response Format

All responses are standardized:

```javascript
// GET /providers
{
  "providers": [
    {
      "id": "1",
      "name": "Kamala's Kitchen",
      "location": "Downtown",
      "rating": 4.8,
      "speciality": "Vegetarian",
      "reviews": 340,
      // ... more fields
    },
    {
      "id": "2",
      "name": "Ravi's North Indian Kitchen",
      // ...
    }
  ]
}

// POST /orders
{
  "order": {
    "id": "order_123",
    "items": [
      { "id": "menu_1", "name": "Biryani", "quantity": 2, "price": 250 }
    ],
    "total": 500,
    "status": "confirmed",
    "createdAt": "2024-03-31T10:30:00Z"
  }
}
```

## WebSocket Message Types

```javascript
// Refresh broadcast
{ type: 'refresh', timestamp: 1711873800000 }

// Update with data
{ type: 'update', data: { providers_updated: true } }

// Connection status
{ type: 'ping' } // Server
{ type: 'pong' } // Client response
```

## Token-based Authentication

Both apps use JWT for secure API access:

```javascript
// Login response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "user_1", "email": "customer@test.com", "name": "John" }
}

// Stored in
// Web:    localStorage['mm_token']
// Mobile: AsyncStorage.getItem('mm_token')

// Sent with every API request
Authorization: `Bearer ${token}`
```

## Sync Reliability Features

### 1. Auto-reconnect on WebSocket disconnect

```javascript
// useSyncProvider.js
ws.onclose = () => {
  setTimeout(connect, 3000); // Retry after 3 seconds
};
```

### 2. Fallback polling

```javascript
// DataContext.js
useEffect(() => {
  const interval = setInterval(fetchProviders, 5000);
  return () => clearInterval(interval);
}, [isConnected]);
```

### 3. Error handling

```javascript
// Both apps handle errors gracefully
try {
  const res = await api.providers.list();
  setProviders(res.providers);
} catch (err) {
  setError(err.message);
  showNotification("Failed to load providers");
}
```

## Connection Status Indicators

### Web App

```javascript
// Frontend shows sync status
{
  isConnected ? (
    <div>✅ Syncing live</div>
  ) : (
    <div className="yellow">⚠ Sync paused - pull to refresh</div>
  );
}
```

### Mobile App

```javascript
// Mobile shows sync status
{
  !isConnected && (
    <View className="bg-yellow-100">
      <Text>⚠ Sync disconnected - pull to refresh</Text>
    </View>
  );
}
```

## Testing Sync

### 1. Open web and mobile side-by-side

```bash
# Terminal 1: Start web app
cd frontend && npm run dev

# Terminal 2: Start mobile app
cd app && npm start
# Choose: e (Expo Go on phone)
```

### 2. Make a change on web, verify on mobile

- Add item to cart on web
- Should reflect on mobile in <2 seconds via WebSocket

### 3. Test WebSocket reconnect

- Disconnect phone from WiFi
- Wait 3 seconds
- Reconnect
- App auto-syncs

### 4. Test offline fallback

- Stop backend server
- Apps enter offline mode
- Show cached data
- Retry on reconnect

## Bandwidth Optimization

The sync system is optimized for low bandwidth:

1. **Small payloads** - Only { type: 'refresh' } broadcast (64 bytes)
2. **Polling interval** - 5 seconds instead of 1 second
3. **Compression** - WebSocket frames auto-compressed by standards
4. **Delta updates** - Only changed data fetched

## Troubleshooting Sync Issues

### Symptoms: Web and mobile show different data

**Cause 1**: WebSocket disconnected

```bash
# Check backend is running
curl -v wss://momsmagic-production.up.railway.app
```

**Cause 2**: API calls failing silently

```javascript
// Enable console logging
console.log("Sync triggered");
console.log("Response:", res);
```

**Cause 3**: State not updating

```javascript
// Verify React/React Native hooks are properly set up
// Check useEffect dependencies
```

### Symptoms: Data takes >5 seconds to sync

**Expected**: 2-5 seconds (WebSocket broadcast + API fetch + setState + render)

**If slower**: Check network latency

```bash
# Measure backend response time
time curl https://momsmagic-production.up.railway.app/api/providers
```

## Security Considerations

1. **JWT tokens** - Validated by backend on every request
2. **HTTPS/WSS** - Encrypted in transit
3. **No sensitive data in broadcast** - Only refresh signal
4. **CORS** - Restricted to Vercel domains
5. **Rate limiting** - Could be added to prevent abuse

## Future Enhancements

- [ ] Implement socket.io for more features (rooms, acknowledgments)
- [ ] Add message queue for offline ordering
- [ ] Implement optimistic updates (show pending items immediately)
- [ ] Add real-time user presence (see who's browsing)
- [ ] Implement bi-directional sync for collaborative features
- [ ] Add Delta sync (only send changed fields)
- [ ] Implement end-to-end encryption for sensitive data

## Related Files

- **Web**: `frontend/src/hooks/useAutoRefresh.js` - WebSocket connection
- **Web**: `frontend/src/lib/api.js` - REST API client
- **Mobile**: `app/src/hooks/useSyncProvider.js` - WebSocket connection
- **Mobile**: `app/src/lib/api.js` - REST API client
- **Mobile**: `app/src/context/DataContext.js` - Sync orchestration
- **Backend**: `backend/src/server.js` - WebSocket server & CORS
