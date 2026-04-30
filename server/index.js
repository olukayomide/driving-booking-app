import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// Schema
const bookingSchema = new mongoose.Schema({
  name: String,
  date: String,
  startTime: String,
  duration: Number
});

const Booking = mongoose.model("Booking", bookingSchema);

// Helper: Convert time to minutes
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// 🚨 Conflict check
const hasConflict = (existing, newBooking) => {
  return existing.some(b => {
    if (b.date !== newBooking.date) return false;

    const startA = toMinutes(b.startTime);
    const endA = startA + b.duration * 60;

    const startB = toMinutes(newBooking.startTime);
    const endB = startB + newBooking.duration * 60;

    return startB < endA && endB > startA;
  });
};

// 📌 CREATE BOOKING
app.post("/book", async (req, res) => {
  const { name, date, startTime, duration } = req.body;

  if (!name || !date || !startTime || !duration) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (duration > 3) {
    return res.status(400).json({ error: "Max 3 hours allowed" });
  }

  const now = new Date();
  const bookingDate = new Date(`${date}T${startTime}`);

  if (bookingDate < now) {
    return res.status(400).json({ error: "Cannot book past time" });
  }

  const existing = await Booking.find({ date });

  if (hasConflict(existing, { date, startTime, duration })) {
    return res.status(400).json({ error: "This time slot is already booked" });
  }

  const booking = await Booking.create({ name, date, startTime, duration });
  res.json(booking);
});

// 📌 GET BOOKINGS
app.get("/bookings", async (req, res) => {
  const { date } = req.query;
  const bookings = date
    ? await Booking.find({ date })
    : await Booking.find();

  res.json(bookings);
});

// 📌 DELETE BOOKING
app.delete("/booking/:id", async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => console.log("Server running on port 5000"));