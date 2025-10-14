import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String,
    trim: true,
    default: ""
  },
  email: { 
    type: String, 
    unique: true,
    trim: true, 
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8 
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);