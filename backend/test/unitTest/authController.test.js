const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const app = require('../../app'); // Your Express app
const User = require('../../models/User');
const {
  sendConfirmationEmail,
  sendPasswordResetEmail,
} = require('../../utils/email');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env.test file
dotenv.config({ path: path.resolve(__dirname, '../../', '.env.test') });

// Mock email functions
jest.mock('../../utils/email', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

describe('Auth Controller Tests', () => {
  // Setup and teardown
  beforeAll(async () => {
    // Connect to test database
    const mongoUri =
      process.env.MONGO_TEST_URI ||
      'mongodb://localhost:27017/constellation-tracker-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Cleanup and disconnect
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  // ==================== SIGNUP TESTS ====================
  describe('POST /api/user/signup', () => {
    const validUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
      passwordConfirm: 'Password123',
    };

    test('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/user/signup')
        .send(validUserData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Registration successful');

      // Verify user was created in database
      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
      expect(user.emailConfirmed).toBe(false);
      expect(user.emailConfirmToken).toBeTruthy();
      expect(user.emailConfirmExpires).toBeTruthy();

      // Verify confirmation email was sent
      expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(sendConfirmationEmail).toHaveBeenCalledWith(
        validUserData.email,
        validUserData.firstName,
        expect.any(String)
      );
    });

    test('should hash the password before saving', async () => {
      await request(app)
        .post('/api/user/signup')
        .send(validUserData)
        .expect(201);

      const user = await User.findOne({ email: validUserData.email }).select(
        '+password'
      );
      expect(user.password).not.toBe(validUserData.password);
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/user/signup')
        .send({
          firstName: 'John',
          email: 'john@example.com',
          // Missing lastName, password, passwordConfirm
        })
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('provide');
    });

    test('should fail with password too short', async () => {
      const response = await request(app)
        .post('/api/user/signup')
        .send({
          ...validUserData,
          password: 'Pass1',
          passwordConfirm: 'Pass1',
        })
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('8 characters');
    });

    test('should fail with passwords that do not match', async () => {
      const response = await request(app)
        .post('/api/user/signup')
        .send({
          ...validUserData,
          password: 'Password123',
          passwordConfirm: 'DifferentPassword123',
        })
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('match');
    });

    test('should fail with duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/user/signup')
        .send(validUserData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/user/signup')
        .send(validUserData)
        .expect(400);

      expect(response.body.status).toBe('failed');
    });

    test('should delete user if email sending fails', async () => {
      // Mock email to fail
      sendConfirmationEmail.mockRejectedValueOnce(
        new Error('Email service down')
      );

      const response = await request(app)
        .post('/api/user/signup')
        .send(validUserData)
        .expect(500);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('error sending');

      // Verify user was deleted
      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeNull();
    });

    test('should convert email to lowercase', async () => {
      await request(app)
        .post('/api/user/signup')
        .send({
          ...validUserData,
          email: 'JOHN.DOE@EXAMPLE.COM',
        })
        .expect(201);

      const user = await User.findOne({ email: 'john.doe@example.com' });
      expect(user).toBeTruthy();
    });
  });

  // ==================== CONFIRM EMAIL TESTS ====================
  describe('GET /api/user/confirm-email/:token', () => {
    let user;
    let plainToken;
    let hashedToken;

    beforeEach(async () => {
      // Create a user with confirmation token
      plainToken = crypto.randomBytes(32).toString('hex');
      hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');

      user = await User.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
        emailConfirmed: false,
        emailConfirmToken: hashedToken,
        emailConfirmExpires: Date.now() + 24 * 60 * 60 * 1000,
      });
    });

    test('should confirm email with valid token', async () => {
      const response = await request(app)
        .get(`/api/user/confirm-email/${plainToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy(); // JWT token for auto-login
      expect(response.body.data.user.email).toBe(user.email);

      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.emailConfirmed).toBe(true);
      expect(updatedUser.emailConfirmToken).toBeUndefined();
      expect(updatedUser.emailConfirmExpires).toBeUndefined();
    });

    test('should fail with invalid token', async () => {
      const invalidToken = crypto.randomBytes(32).toString('hex');

      const response = await request(app)
        .get(`/api/user/confirm-email/${invalidToken}`)
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('invalid or has expired');

      // Verify user was NOT updated
      const unchangedUser = await User.findById(user._id);
      expect(unchangedUser.emailConfirmed).toBe(false);
    });

    test('should return JWT token for auto-login after confirmation', async () => {
      const response = await request(app)
        .get(`/api/user/confirm-email/${plainToken}`)
        .expect(200);

      expect(response.body.token).toBeTruthy();

      // Verify JWT token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(user._id.toString());
    });
  });

  // ==================== LOGIN TESTS ====================
  describe('POST /api/user/login', () => {
    let confirmedUser;
    const userPassword = 'Password123';

    beforeEach(async () => {
      confirmedUser = await User.create({
        firstName: 'Confirmed',
        lastName: 'User',
        email: 'confirmed@example.com',
        password: userPassword,
        passwordConfirm: userPassword,
        emailConfirmed: true,
      });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: confirmedUser.email,
          password: userPassword,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy();
      expect(response.body.data.user.email).toBe(confirmedUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: confirmedUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('Incorrect');
    });

    test('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: userPassword,
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('Incorrect');
    });

    test('should fail with unconfirmed email', async () => {
      const unconfirmedUser = await User.create({
        firstName: 'Unconfirmed',
        lastName: 'Login',
        email: 'unconfirmed.login@example.com',
        password: userPassword,
        passwordConfirm: userPassword,
        emailConfirmed: false,
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: unconfirmedUser.email,
          password: userPassword,
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('confirm your email');
      expect(response.body.requiresConfirmation).toBe(true);
    });

    test('should fail without email or password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('provide email and password');
    });

    test('should return JWT cookie', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: confirmedUser.email,
          password: userPassword,
        })
        .expect(200);

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('jwt=');
    });

    test('should handle case-insensitive email', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: confirmedUser.email.toUpperCase(),
          password: userPassword,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  // ==================== PROTECT MIDDLEWARE TESTS ====================
  describe('Protect Middleware', () => {
    let user;
    let token;

    beforeEach(async () => {
      user = await User.create({
        firstName: 'Protected',
        lastName: 'User',
        email: 'protected@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
        emailConfirmed: true,
      });

      // Generate valid token
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
    });

    test('should allow access with valid token in Authorization header', async () => {
      const response = await request(app)
        .get('/api/observations') // Protected route
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Response will depend on your protected route
    });

    test('should deny access without token', async () => {
      const response = await request(app).get('/api/observations').expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('not logged in');
    });

    test('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/observations')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('Invalid or expired token');
    });

    test('should deny access with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' } // Expired immediately
      );

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const response = await request(app)
        .get('/api/observations')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.status).toBe('failed');
    });

    test('should deny access if user no longer exists', async () => {
      await User.findByIdAndDelete(user._id);

      const response = await request(app)
        .get('/api/observations')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('no longer exists');
    });
  });


});
