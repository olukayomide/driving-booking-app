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
