const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

// User registration
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate password
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    });
  }

  try {
    // Check if user exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await UserModel.create({ name, email, password: hashedPassword, role: role || 'employee' });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'SECRET123',
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
