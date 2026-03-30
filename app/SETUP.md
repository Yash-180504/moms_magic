# Moms Magic Mobile App

A React Native mobile application for Moms Magic - connecting customers with home cooks for fresh, home-cooked meals.

## Features

✅ **Real-time Sync** - WebSocket integration for live updates across web and mobile  
✅ **Authentication** - OAuth with JWT tokens, persistent login  
✅ **Provider Browsing** - Search and filter home cooks by location, specialty  
✅ **Menu Management** - View menus and place orders  
✅ **Order Tracking** - Real-time order status updates  
✅ **User Profile** - Account management and order history  
✅ **Offline Support** - AsyncStorage for persistent data  
✅ **Cross-platform** - iOS, Android, and Web support

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (bottom tabs + stack)
- **State Management**: React Context API
- **API Client**: Custom fetch wrapper with JWT auth
- **Real-time**: WebSocket (ws/wss)
- **Storage**: AsyncStorage (persistent local storage)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Lucide React Native

## Project Structure

```
app/
├── src/
│   ├── context/
│   │   ├── AuthContext.js        # Authentication state & methods
│   │   └── DataContext.js        # Shared data sync (providers, orders)
│   ├── lib/
│   │   └── api.js               # API client for backend communication
│   ├── hooks/
│   │   └── useSyncProvider.js   # WebSocket connection hook
│   ├── navigation/
│   │   └── AppNavigator.js      # Navigation structure (tabs + stack)
│   ├── screens/
│   │   ├── HomeScreen.js        # Home/kitchen browsing
│   │   ├── LoginScreen.js       # Authentication
│   │   ├── RegisterScreen.js    # Account creation
│   │   ├── OrdersScreen.js      # Order history & tracking
│   │   ├── ProfileScreen.js     # User profile & settings
│   │   └── ProviderDetailScreen.js # Kitchen menu & ordering
│   ├── components/              # Reusable UI components
│   ├── data/                    # Mock data (if needed)
│   └── hooks/                   # Custom React hooks
├── App.js                       # Entry point with providers
├── app.json                     # Expo configuration
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
├── tailwind.config.js           # Tailwind CSS config
├── global.css                   # Global styles
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only) or Expo Go app
- Android: Android Studio or Expo Go app

### Installation

1. **Install dependencies**:

```bash
cd app
npm install
```

2. **Configure backend URL** (optional):
   - Edit `src/lib/api.js` if backend URL changes
   - Default: `https://momsmagic-production.up.railway.app/api`

3. **Configure WebSocket URL** (optional):
   - Edit `src/hooks/useSyncProvider.js` if backend WebSocket changes
   - Default: `wss://momsmagic-production.up.railway.app`

### Running the App

**Development mode**:

```bash
npm start
```

Then choose:

- `i` - iOS Simulator
- `a` - Android Emulator
- `w` - Web browser
- `e` - Expo Go app (scan QR code on phone)

**iOS**:

```bash
npm run ios
```

**Android**:

```bash
npm run android
```

**Web** (testing):

```bash
npm run web
```

## Architecture

### Authentication Flow

```
User Input
    ↓
LoginScreen / RegisterScreen
    ↓
AuthContext (login/register)
    ↓
api.auth.login/register
    ↓
Backend validates, returns JWT
    ↓
Token stored in AsyncStorage
    ↓
AuthContext.user updated
    ↓
Navigation switches to authenticated tabs
```

### Data Sync Flow

```
WebSocket connects (useSyncProvider)
    ↓
Backend broadcasts refresh events
    ↓
DataContext onUpdate callback
    ↓
fetchProviders() triggered
    ↓
api.providers.list() fetches from backend
    ↓
State updated, UI re-renders
    ↓
Changes visible on web & mobile simultaneously
```

### Navigation Flow

```
App.js (Entry point)
    ↓
AuthProvider (wraps entire app)
    ↓
DataProvider (wraps authenticated content)
    ↓
AppNavigator decides:
    - If authenticated → AuthenticatedTabs (Home/Orders/Profile)
    - If not → UnauthenticatedStack (Login/Register)
```

## Key Components

### 1. AuthContext

Manages user authentication state and provides methods:

- `login(email, password)` - Sign in existing user
- `register(email, password, name, role)` - Create new account
- `logout()` - Sign out and clear token
- `isAuthenticated` - Boolean flag for rendering

### 2. DataContext

Manages shared application data:

- `providers` - Array of home cooks
- `orders` - User's order history
- `fetchProviders()` - Refresh provider list
- `fetchOrders()` - Refresh order history
- `createOrder(items, deliveryAddress)` - Place new order
- `isConnected` - WebSocket connection status

### 3. API Client

RESTful API wrapper with automatic JWT auth:

- `api.auth.login(email, password)`
- `api.auth.register(email, password, name, role)`
- `api.auth.logout()`
- `api.providers.list()`
- `api.providers.get(id)`
- `api.menu.list(providerId)`
- `api.orders.create(items, deliveryAddress)`
- `api.orders.list()`

### 4. WebSocket Hook

Real-time synchronization:

- Connects to backend WebSocket
- Auto-reconnect with exponential backoff
- Triggers data refresh on server broadcasts
- Connection status available to consumers

## Demo Credentials

```
Email: customer@test.com
Password: password123
```

## Features Implementation

### Real-time Updates

- WebSocket connection in DataContext
- Auto-refresh every 5 seconds when connected
- Triggered on server broadcasts
- Syncs across web and mobile simultaneously

### Search & Filter

- HomeScreen filters providers by name, location, specialty
- Real-time as user types
- Works with live data from backend

### Authentication

- JWT tokens stored in AsyncStorage
- Automatic token inclusion in all API requests
- Persistent login across app restarts
- Session validation on app start

### Order Management

- Browse provider menus
- Add/remove items from cart
- Calculate totals with tax/delivery
- Place orders to backend
- Track order status with real-time updates

## Troubleshooting

### App Won't Start

1. Clear metro bundler cache: `expo start --clear`
2. Delete node_modules: `rm -rf node_modules && npm install`
3. Check if port 19000 is available

### WebSocket Connection Fails

1. Verify backend is running (check Railway deployment)
2. Ensure wss:// protocol for HTTPS (automatic in useSyncProvider)
3. Check browser/app console for connection errors

### Authentication Fails

1. Verify backend `/auth/login` endpoint is working
2. Check email/password credentials
3. Ensure JWT is being returned by backend

### Data Not Syncing

1. Check DataContext initialization in App.js
2. Verify WebSocket connection status
3. Test API endpoint directly with curl

## Backend Integration

The mobile app expects the following backend structure:

**Endpoints**:

- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user
- `GET /providers` - List all providers
- `GET /providers/:id` - Get provider details
- `GET /menu?provider=:id` - Get provider's menu
- `POST /orders` - Create new order
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details

**WebSocket**:

- Message format: `{ type: 'refresh' | 'update', data?: any }`
- Auto-refresh triggered on type: 'refresh'

## Performance Tips

1. **Optimize images** - Resize provider/menu images before upload
2. **Pagination** - Implement pagination for large provider lists
3. **Caching** - Store images locally with react-native-fs
4. **Debouncing** - Debounce search input to reduce API calls
5. **Lazy loading** - Load screens only when tab becomes active

## Deployment

### Expo Go (Testing)

```bash
npm start
# Scan QR code with Expo Go app
```

### EAS Build (Production)

```bash
eas build --platform ios
eas build --platform android
```

### EAS Submit (App Stores)

```bash
eas submit --platform ios
eas submit --platform android
```

See [Expo EAS documentation](https://docs.expo.dev/eas/) for details.

## Security

- JWT tokens stored in AsyncStorage (consider better options for sensitive data)
- HTTPS/WSS enforced for all remote connections
- No hardcoded credentials in code
- CORS headers respected from backend

## Future Enhancements

- [ ] Push notifications for order updates
- [ ] Offline order placement (sync when online)
- [ ] Image caching for better performance
- [ ] Map integration for provider locations
- [ ] Payment gateway integration
- [ ] Review/rating system
- [ ] Favorite providers/meals
- [ ] Promo codes and discounts
- [ ] Multiple delivery addresses
- [ ] Schedule orders in advance

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test on iOS/Android
3. Commit with clear messages
4. Push and create pull request

## Support

For issues or questions:

1. Check troubleshooting section
2. Review console logs
3. Test on multiple devices
4. Check backend connectivity

## License

Proprietary - Moms Magic 2026
