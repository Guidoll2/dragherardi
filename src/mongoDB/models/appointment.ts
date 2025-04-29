// src/mongodb/models/appointment.ts
import mongoose, { Document, Model } from "mongoose";

interface IAppointment extends Document {
  date: Date;
  timeSlot: string;
  // ahora guardamos el Clerk user ID como string
  userId?: string;
  isBlocked: boolean;
  professionalId: string;
}

const appointmentSchema = new mongoose.Schema<IAppointment>({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  userId: { type: String }, // ← cambió de ObjectId a String
  isBlocked: { type: Boolean, default: false },
  professionalId: { type: String, required: true },
});

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
