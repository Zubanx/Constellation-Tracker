// Load test environment variables FIRST
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const app = require('../app');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Mock the email utility
jest.mock('../utils/email');

describe('Authentication Controller', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_TEST_URI);
  });

  afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
      };

      const response = await request(app)
        .post('/api/user/signup')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('check your email');
      expect(sendEmail.confirmationEmail).toHaveBeenCalledWith(
        userData.email,
        userData.username,
        expect.any(String)
      );

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.emailConfirmed).toBe(false);
      expect(user.emailConfirmToken).toBeTruthy();
    });

    it('should reject signup with mismatched passwords', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'DifferentPassword123!',
      };

      const response = await request(app)
        .post('/api/user/signup')
        .send(userData)
        .expect(401);

      expect(response.body.status).toBe('failed');
    });

    it('should reject signup with duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
      };

      // Create first user
      await User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm,
        emailConfirmed: true,
      });

      // Try to create duplicate with same email
      const response = await request(app)
        .post('/api/user/signup')
        .send({
          username: 'differentuser',
          email: userData.email, // Same email
          password: userData.password,
          passwordConfirm: userData.passwordConfirm,
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
    });

    it('should reject signup with invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
      };

      const response = await request(app)
        .post('/api/user/signup')
        .send(userData)
        .expect(401);

      expect(response.body.status).toBe('failed');
    });
  });

  describe('GET /confirmEmail/:token', () => {
    it('should confirm email with valid token', async () => {
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(confirmationToken)
        .digest('hex');

      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: false,
        emailConfirmToken: hashedToken,
        emailConfirmExpires: Date.now() + 24 * 60 * 60 * 1000,
      });

      const response = await request(app)
        .get(`/api/user/confirmEmail/${confirmationToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy();
      expect(response.body.data.user.emailConfirmed).toBe(true);

      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.emailConfirmed).toBe(true);
      expect(updatedUser.emailConfirmToken).toBeUndefined();
    });

    it('should reject expired confirmation token', async () => {
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(confirmationToken)
        .digest('hex');

      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: false,
        emailConfirmToken: hashedToken,
        emailConfirmExpires: Date.now() - 1000, // Expired
      });

      const response = await request(app)
        .get(`/api/user/confirmEmail/${confirmationToken}`)
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('invalid or has expired');
    });

    it('should reject invalid confirmation token', async () => {
      const response = await request(app)
        .get('/api/user/confirmEmail/invalidtoken123')
        .expect(400);

      expect(response.body.status).toBe('failed');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a confirmed user for login tests
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: true,
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: 'testuser',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy();
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: 'testuser',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('Incorrect username or password');
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: 'nonexistent',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
    });

    it('should reject login without username', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('provide a valid username');
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.status).toBe('failed');
    });

    it('should reject login for unconfirmed email', async () => {
      await User.create({
        username: 'unconfirmed',
        email: 'unconfirmed@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: false,
      });

      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: 'unconfirmed',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('confirm your email');
    });
  });

  describe('Protect Middleware', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: true,
      });

      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .send({
          currentPassword: 'Password123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('not logged in');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', 'Bearer invalidtoken123')
        .send({
          currentPassword: 'Password123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
    });

    it('should reject token for deleted user', async () => {
      await User.findByIdAndDelete(user._id);

      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('no longer exist');
    });
  });


  describe('PATCH /resetPassword/:token', () => {
    let resetToken;
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: true,
      });

      resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });
    });


    it('should reject expired reset token', async () => {
      user.passwordResetExpires = Date.now() - 1000;
      await user.save({ validateBeforeSave: false });

      const response = await request(app)
        .patch(`/api/user/resetPassword/${resetToken}`)
        .send({
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(404);

      expect(response.body.status).toBe('failed');
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .patch('/api/user/resetPassword/invalidtoken')
        .send({
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(404);

      expect(response.body.status).toBe('failed');
    });
  });

  describe('PATCH /updatePassword', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        emailConfirmed: true,
      });

      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
    });

    it('should update password successfully', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeTruthy();

      // Verify password was changed
      const updatedUser = await User.findById(user._id).select('+password');
      const isMatch = await updatedUser.correctPassword(
        'NewPassword123!',
        updatedUser.password
      );
      expect(isMatch).toBe(true);
    });

    it('should reject update with incorrect current password', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
      expect(response.body.message).toContain('current password is wrong');
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .patch('/api/user/updatePassword')
        .send({
          currentPassword: 'Password123!',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('failed');
    });
  });
});
