// server-example.js - Basic Express server with JWT authentication
// This is an example of how your backend should be implemented

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/routeplanner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Route Schema
const routeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  destination: { type: String, required: true },
  type: { type: String, required: true },
  pathEncoded: String,
  pathDaysEncoded: [String],
  savedAt: { type: Date, default: Date.now },
});

const Route = mongoose.model('Route', routeSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Password validation middleware (simplified)
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password || password.length < 1) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  next();
};

// Routes

// Register
app.post('/api/register', validatePassword, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Verify token
app.get('/api/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Token verification failed' });
  }
});

// Logout (optional - for token invalidation)
app.post('/api/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return success - the client will remove the token
  res.json({ message: 'Logout successful' });
});

// Protected routes - Save route
app.post('/api/routes', authenticateToken, async (req, res) => {
  try {
    const { name, description, destination, type, pathEncoded, pathDaysEncoded } = req.body;

    const route = new Route({
      userId: req.user.userId,
      name,
      description,
      destination,
      type,
      pathEncoded,
      pathDaysEncoded,
    });

    await route.save();

    res.status(201).json({
      message: 'Route saved successfully',
      route,
    });
  } catch (error) {
    console.error('Save route error:', error);
    res.status(500).json({ message: 'Failed to save route' });
  }
});

// Protected routes - Get user routes
app.get('/api/routes', authenticateToken, async (req, res) => {
  try {
    const routes = await Route.find({ userId: req.user.userId })
      .sort({ savedAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ message: 'Failed to get routes' });
  }
});

// Protected routes - Delete route
app.delete('/api/routes/:routeId', authenticateToken, async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const route = await Route.findOneAndDelete({
      _id: routeId,
      userId: req.user.userId, // Ensure user owns the route
    });

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ message: 'Failed to delete route' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 