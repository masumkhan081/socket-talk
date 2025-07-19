import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
   username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be less than 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters']
   },
   profileImage: {
      type: String,
      default: null
   },
   bio: {
      type: String,
      maxlength: [500, 'Bio must be less than 500 characters'],
      default: ''
   },
   isEmailVerified: {
      type: Boolean,
      default: false
   },
   emailVerificationToken: {
      type: String,
      default: null
   },
   emailVerificationExpires: {
      type: Date,
      default: null
   },
   passwordResetToken: {
      type: String,
      default: null
   },
   passwordResetExpires: {
      type: Date,
      default: null
   },
   isOnline: {
      type: Boolean,
      default: false
   },
   lastSeen: {
      type: Date,
      default: Date.now
   }
}, {
   timestamps: true,
   toJSON: {
      transform: function (doc, ret) {
         delete (ret as any).password;
         delete (ret as any).emailVerificationToken;
         delete (ret as any).emailVerificationExpires;
         delete (ret as any).passwordResetToken;
         delete (ret as any).passwordResetExpires;
         return ret;
      }
   }
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isOnline: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      next();
   } catch (error) {
      next(error as Error);
   }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
   return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
   const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
   this.emailVerificationToken = token;
   this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
   return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
   const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
   this.passwordResetToken = token;
   this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
   return token;
};

export const User = mongoose.model<IUser>('User', userSchema);
