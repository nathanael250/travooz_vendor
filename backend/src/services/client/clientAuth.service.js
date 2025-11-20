const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../../config/database');

const CLIENT_JWT_SECRET = process.env.CLIENT_JWT_SECRET || process.env.JWT_SECRET || 'stays-secret-key-change-in-production';
const CLIENT_JWT_EXPIRES_IN = process.env.CLIENT_JWT_EXPIRES_IN || '30d';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const toCamelCaseClient = (client) => ({
  id: client.id,
  firstName: client.first_name,
  lastName: client.last_name,
  email: client.email,
  phoneCountryCode: client.phone_country_code,
  phoneNumber: client.phone_number,
  status: client.status,
  emailVerified: Boolean(client.email_verified),
  lastLogin: client.last_login,
  createdAt: client.created_at,
  updatedAt: client.updated_at
});

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (client) => jwt.sign(
  {
    id: client.id,
    clientId: client.id,
    email: client.email,
    role: 'client',
    scope: 'client_portal'
  },
  CLIENT_JWT_SECRET,
  { expiresIn: CLIENT_JWT_EXPIRES_IN }
);

const ensureClientExistsByEmail = async (email) => {
  const [existing] = await pool.execute(
    'SELECT id FROM clients WHERE email = ? LIMIT 1',
    [email]
  );
  if (existing.length > 0) {
    throw createError('An account with this email already exists', 409);
  }
};

const fetchClientByEmail = async (email) => {
  const [clients] = await pool.execute(
    'SELECT * FROM clients WHERE email = ? LIMIT 1',
    [email]
  );
  return clients[0] || null;
};

const registerClient = async (payload = {}) => {
  const firstName = (payload.firstName || payload.first_name || '').trim();
  const lastName = (payload.lastName || payload.last_name || '').trim();
  const email = normalizeEmail(payload.email);
  const phoneCountryCode = (payload.phoneCountryCode || payload.phone_country_code || '').trim() || null;
  const phoneNumber = (payload.phoneNumber || payload.phone_number || '').trim() || null;
  const password = payload.password || '';

  if (!firstName) throw createError('First name is required');
  if (!lastName) throw createError('Last name is required');
  if (!email) throw createError('Email is required');
  if (!/\S+@\S+\.\S+/.test(email)) throw createError('Please provide a valid email address');
  if (!password || password.length < 6) throw createError('Password must be at least 6 characters long');

  await ensureClientExistsByEmail(email);

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.execute(
    `INSERT INTO clients 
      (first_name, last_name, email, phone_country_code, phone_number, password_hash, status, email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, 'active', 0)`,
    [firstName, lastName, email, phoneCountryCode, phoneNumber, passwordHash]
  );

  const [createdRows] = await pool.execute(
    'SELECT * FROM clients WHERE id = ? LIMIT 1',
    [result.insertId]
  );

  const createdClient = createdRows[0];

  return {
    token: generateToken(createdClient),
    client: toCamelCaseClient(createdClient)
  };
};

const loginClient = async (payload = {}) => {
  const email = normalizeEmail(payload.email);
  const password = payload.password || '';

  if (!email || !password) {
    throw createError('Email and password are required');
  }

  const client = await fetchClientByEmail(email);

  if (!client) {
    throw createError('Invalid email or password', 401);
  }

  if (client.status !== 'active') {
    throw createError('Your account is not active. Please contact support.', 403);
  }

  const isValidPassword = await bcrypt.compare(password, client.password_hash);

  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
  }

  await pool.execute(
    'UPDATE clients SET last_login = NOW() WHERE id = ?',
    [client.id]
  );

  return {
    token: generateToken(client),
    client: toCamelCaseClient({
      ...client,
      last_login: new Date()
    })
  };
};

const getClientProfile = async (clientId) => {
  if (!clientId) {
    throw createError('Client identifier missing', 400);
  }

  const [clients] = await pool.execute(
    'SELECT * FROM clients WHERE id = ? LIMIT 1',
    [clientId]
  );

  if (clients.length === 0) {
    throw createError('Client not found', 404);
  }

  return toCamelCaseClient(clients[0]);
};

module.exports = {
  registerClient,
  loginClient,
  getClientProfile
};

