import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";

import { db, storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./EventsManager.css";

function EventsManager() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    description: "",
    image: ""
  });

  async function loadEvents() {
    const snapshot = await getDocs(collection(db, "events"));
    setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  async function uploadImage(file) {
    const imageRef = ref(storage, `events/${file.name}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let imageUrl = form.image;

    if (form.imageFile) {
      imageUrl = await uploadImage(form.imageFile);
    }

    if (editingId) {
      await updateDoc(doc(db, "events", editingId), {
        ...form,
        image: imageUrl
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "events"), {
        ...form,
        image: imageUrl
      });
    }

    setForm({
      title: "",
      location: "",
      date: "",
      description: "",
      image: "",
      imageFile: null
    });

    loadEvents();
  }

  async function deleteEvent(id) {
    await deleteDoc(doc(db, "events", id));
    loadEvents();
  }

  function startEdit(event) {
    setEditingId(event.id);
    setForm(event);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="events-manager">

      <h2>{editingId ? "Edit Event" : "Add Event"}</h2>

      <form onSubmit={handleSubmit} className="event-form">

        <input
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Location"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
        />

        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />

        <input
          type="file"
          onChange={e => setForm({ ...form, imageFile: e.target.files[0] })}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <button type="submit">
          {editingId ? "Save Changes" : "Add Event"}
        </button>
      </form>

      <h2>Existing Events</h2>

      {events.map(event => (
        <div key={event.id} className="event-admin-card">
          <img src={event.image} alt="" width="120" />

          <h3>{event.title}</h3>
          <p>{event.location}</p>
          <p>{event.date}</p>

          <button onClick={() => startEdit(event)}>Edit</button>
          <button onClick={() => deleteEvent(event.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default EventsManager;
