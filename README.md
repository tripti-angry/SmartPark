# Smart Parking Management System

A comprehensive IoT-enabled parking management system with real-time availability tracking, dynamic pricing, and seamless booking experience.

## 🚀 Features

### Core Features
- **Real-time Parking Availability** - Live updates via WebSocket connections
- **IoT Sensor Simulation** - MQTT-based sensor data simulation
- **Google Maps Integration** - Interactive map with parking lot locations
- **Dynamic Pricing** - Demand-based pricing algorithm
- **Secure Payments** - Stripe integration for seamless transactions
- **User Authentication** - JWT-based secure authentication
- **Admin Dashboard** - Comprehensive management interface
- **Mobile Responsive** - Optimized for all device sizes

### Technical Features
- **Microservices Architecture** - Scalable and maintainable
- **Real-time Communication** - Socket.IO for live updates
- **Database Optimization** - MongoDB with proper indexing
- **Error Handling** - Comprehensive error management
- **Logging System** - Winston-based logging
- **Security** - Helmet, rate limiting, input validation
- **Docker Support** - Containerized deployment

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **MQTT** - IoT messaging protocol
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Winston** - Logging

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Google Maps API** - Maps integration
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client
- **React Router** - Navigation

## 🚀 Deployment on Render

### Prerequisites
1. **Render Account** - Sign up at [render.com](https://render.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Environment Variables** - Prepare your API keys

### Step 1: Database Setup
1. Go to Render Dashboard
2. Click "New" → "PostgreSQL" (or use MongoDB Atlas)
3. Name: `smart-parking-db`
4. Plan: Free
5. Note the connection string

### Step 2: Backend Deployment
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `smart-parking-backend`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=https://your-frontend-url.onrender.com
   STRIPE_SECRET_KEY=your-stripe-secret-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

### Step 3: Frontend Deployment
1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `smart-parking-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

### Step 4: Configure API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API
3. Create API key
4. Restrict to your domains

#### Stripe API
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers section
3. Use test keys for development

### Step 5: Database Initialization
After deployment, you can initialize sample data by calling the admin endpoints or using the admin dashboard.

## 📱 Usage

### For Users
1. **Register/Login** - Create account or sign in
2. **Find Parking** - Use map to locate nearby parking lots
3. **Check Availability** - View real-time spot availability
4. **Book Spot** - Reserve parking spot for specific time
5. **Make Payment** - Secure payment via Stripe
6. **Manage Bookings** - View and manage your reservations

### For Admins
1. **Dashboard** - Overview of system metrics
2. **Manage Lots** - Add/edit parking lots
3. **Monitor Bookings** - View all reservations
4. **Analytics** - Revenue and usage statistics

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Setup
1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd smart-parking-system
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your values
   ```

4. **Start Development**
   ```bash
   # Start both server and client
   npm run dev
   ```

## 🏗 Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │    MongoDB      │
│                 │◄──►│                 │◄──►│                 │
│  - UI/UX        │    │  - REST API     │    │  - Data Storage │
│  - State Mgmt   │    │  - WebSocket    │    │  - Indexing     │
│  - Maps         │    │  - MQTT Client  │    │  - Aggregation  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │              ┌─────────────────┐              
         │              │  External APIs  │              
         └──────────────►│                 │              
                        │  - Google Maps  │              
                        │  - Stripe       │              
                        │  - MQTT Broker  │              
                        └─────────────────┘              
```

### Database Schema
- **Users** - Authentication and profile data
- **ParkingLots** - Location and configuration
- **ParkingSpots** - Individual spot details
- **Bookings** - Reservation records
- **Payments** - Transaction history

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Joi schema validation
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin security
- **Helmet Security** - HTTP headers protection
- **Password Hashing** - bcrypt encryption

## 📊 Monitoring & Analytics

- **Winston Logging** - Comprehensive logging
- **Health Checks** - System status monitoring
- **Error Tracking** - Centralized error handling
- **Performance Metrics** - Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🚀 Deployment Status

- ✅ Backend API deployed on Render
- ✅ Frontend deployed on Render
- ✅ Database configured
- ✅ Environment variables set
- ✅ SSL certificates active
- ✅ Custom domains configured

Your Smart Parking System is now live and ready to use! 🎉