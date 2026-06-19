import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import "./Events.css";
import { db } from "../firebase/firebase";

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function loadEvents() {
      const snapshot = await getDocs(
        collection(db, "events")
      );

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEvents(data);
    }

    loadEvents();
  }, []);

  return (
    <section className="events-section">
      <h2>Upcoming Events</h2>

      <div className="events-grid">
        {events.map(event => (
          <div
            className="event-card"
            key={event.id}
          >
            <img
              src={event.image}
              alt={event.title}
            />

            <div className="event-content">
              <h3>{event.title}</h3>

              <p>{event.location}</p>

              <p>{event.date}</p>

              <p>
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Events;