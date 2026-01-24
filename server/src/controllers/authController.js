const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const securityLogger = require('../utils/securityLogger');
const { recordFailure } = require('../utils/authMonitor');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  res.json({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  const user = await User.findOne({ email });
  if (!user) {
    securityLogger.warn({
      eventType: 'AUTH_FAILURE',
      reason: 'User not found',
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const alertTriggered = recordFailure(ip);

    securityLogger.warn({
      eventType: 'AUTH_FAILURE',
      reason: 'Invalid password',
      userId: user._id,
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    
    if (alertTriggered) {
      securityLogger.error({
        eventType: 'AUTH_BRUTE_FORCE_ALERT',
        ip,
        email,
        message: 'Multiple failed login attempts detected',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  securityLogger.info({
    eventType: 'AUTH_SUCCESS',
    userId: user._id,
    email,
    ip,
    timestamp: new Date().toISOString()
  });

  res.json({ token });
};

exports.getCurrentUser = async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password');
  res.json(user);
}