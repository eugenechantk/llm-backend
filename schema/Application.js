import mongoose from 'mongoose';

const ApplicationSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  question1: { type: String, required: true },
  question2: { type: String, required: true },
});

export default mongoose.model('Application', ApplicationSchema);