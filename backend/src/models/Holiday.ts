import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: string; // "YYYY-MM-DD"
  type: 'national' | 'restricted';
}

const HolidaySchema: Schema = new Schema({
  name: { type: String, required: true },
  date: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true, enum: ['national', 'restricted'], default: 'national' }
}, {
  timestamps: true
});

export default mongoose.model<IHoliday>('Holiday', HolidaySchema);
