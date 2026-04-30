import { useEffect, useState } from "react";
import axios from "axios";

const TIMES = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`);

export default function App() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [name, setName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const API = "http://localhost:5000";

  const fetchBookings = async () => {
    const res = await axios.get(`${API}/bookings?date=${date}`);
    setBookings(res.data);
  };

  useEffect(() => {
    if (date) fetchBookings();
  }, [date]);

  const book = async () => {
    try {
      setError("");

      await axios.post(`${API}/book`, {
        name,
        date,
        startTime: time,
        duration
      });

      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || "Error booking");
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel booking?")) return;
    await axios.delete(`${API}/booking/${id}`);
    fetchBookings();
  };

  const isBooked = (slot) => {
    return bookings.some(b => {
      const start = parseInt(b.startTime);
      const end = start + b.duration;
      const s = parseInt(slot);
      return s >= start && s < end;
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Driving Lessons</h1>

      <input
        className="border p-2 w-full"
        placeholder="Name"
        onChange={e => setName(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 w-full mt-2"
        onChange={e => setDate(e.target.value)}
      />

      <select
        className="border p-2 w-full mt-2"
        onChange={e => setTime(e.target.value)}
      >
        <option>Select Time</option>
        {TIMES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        className="border p-2 w-full mt-2"
        onChange={e => setDuration(e.target.value)}
      >
        <option value={1}>1 hour</option>
        <option value={2}>2 hours</option>
        <option value={3}>3 hours</option>
      </select>

      <button
        onClick={book}
        className="bg-blue-500 text-white p-2 mt-3 w-full"
      >
        Book Lesson
      </button>

      {error && <p className="text-red-500">{error}</p>}

      <h2 className="mt-6 font-bold">Schedule</h2>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {TIMES.map(t => (
          <div
            key={t}
            className={`p-2 text-center rounded 
              ${isBooked(t) ? "bg-red-300" : "bg-green-300"}`}
          >
            {t}
          </div>
        ))}
      </div>

      <h2 className="mt-6 font-bold">My Bookings</h2>

      {bookings.map(b => (
        <div key={b._id} className="border p-2 mt-2">
          {b.name} | {b.date} | {b.startTime} ({b.duration}h)
          <button
            onClick={() => cancel(b._id)}
            className="ml-2 bg-red-500 text-white px-2"
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}
