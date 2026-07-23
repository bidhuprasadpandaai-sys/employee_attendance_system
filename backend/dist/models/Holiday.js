import mongoose, { Schema } from 'mongoose';
const HolidaySchema = new Schema({
    name: { type: String, required: true },
    date: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['national', 'restricted'], default: 'national' }
}, {
    timestamps: true
});
export default mongoose.model('Holiday', HolidaySchema);
