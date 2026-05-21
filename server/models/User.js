import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// TODO: define userSchema with fields:
//   email        – String, required, unique, lowercase, trimmed
//   passwordHash – String, required
//   name         – String, required, trimmed
//   createdAt    – Date, default: Date.now

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
