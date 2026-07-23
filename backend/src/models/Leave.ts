import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  type: 'casual' | 'sick' | 'annual' | 'unpaid';
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: Date;
}

const LeaveSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['casual', 'sick', 'annual', 'unpaid'] 
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  appliedDate: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<ILeave>('Leave', LeaveSchema);
