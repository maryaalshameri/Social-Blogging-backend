const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
      });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // إنشاء رمز التحقق
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 ساعة

    // إنشاء المستخدم
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'reader',
      emailVerificationToken,
      emailVerificationExpires
    });

    // إرسال بريد التحقق
    await sendVerificationEmail(user, emailVerificationToken);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// إعادة إرسال بريد التحقق
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // إنشاء رمز جديد
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    await sendVerificationEmail(user, emailVerificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
      try {
            const { email, password } = req.body;

            // Check if user exists and get password field
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                  return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                  });
            }

            // Check if password matches
            const isPasswordMatch = await user.comparePassword(password);

            if (!isPasswordMatch) {
                  return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                  });
            }

            // Generate token
            const token = generateToken(user._id);

            res.status(200).json({
                  success: true,
                  message: 'Login successful',
                  data: {
                        user: {
                              id: user._id,
                              username: user.username,
                              email: user.email,
                              role: user.role
                        },
                        token
                  }
            });
      } catch (error) {
            next(error);
      }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
      try {
            const user = await User.findById(req.user.id);

            res.status(200).json({
                  success: true,
                  data: user
            });
      } catch (error) {
            next(error);
      }
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ email });

    if (!user) {
      // لأغراض الأمان، لا نخبر المستخدم بأن البريد الإلكتروني غير موجود
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // إنشاء رمز إعادة تعيين كلمة المرور
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 ساعة

    // حفظ الرمز وتاريخ الانتهاء في قاعدة البيانات
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // إرسال بريد إعادة التعيين
    try {
      await sendPasswordResetEmail(user, resetToken); // ← هنا التغيير: استخدم resetToken بدلاً من passwordResetToken
      
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      // في حالة فشل إرسال البريد، نقوم بحذف الرمز
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      throw emailError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // تشفير الرمز المرسل للمقارنة مع المخزن
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // البحث عن المستخدم بالرمز الصالح
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // التحقق من قوة كلمة المرور الجديدة
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // التحقق من عدم استخدام كلمة المرور القديمة
    const isSameAsOld = await user.comparePassword(newPassword);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as the old password'
      });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

