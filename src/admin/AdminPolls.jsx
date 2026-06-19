import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import "./AdminPolls.css";

function AdminPolls() {
  const [polls, setPolls] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showResults, setShowResults] = useState(true);

  async function loadPolls() {
    const snap = await getDocs(collection(db, "polls"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPolls(list);
  }

  async function loadPollStatus() {
    const ref = doc(db, "settings", "pollStatus");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, { showResults: true });
      setShowResults(true);
    } else {
      setShowResults(snap.data().showResults);
    }
  }

  useEffect(() => {
    loadPolls();
    loadPollStatus();
  }, []);

  async function handleDelete(id) {
    await deleteDoc(doc(db, "polls", id));
    loadPolls();
  }

  function startEdit(p) {
    setEditing(p.id);
    setEditValue(p.vote);
  }

  async function saveEdit(id) {
    await updateDoc(doc(db, "polls", id), { vote: editValue });
    setEditing(null);
    loadPolls();
  }

  async function toggleResults(value) {
    await updateDoc(doc(db, "settings", "pollStatus"), {
      showResults: value,
    });

    setShowResults(value);

    alert(
      value
        ? "Results are now visible to the public. Tell users to refresh."
        : "Results are now hidden. Tell users to refresh."
    );
  }

  return (
    <div className="poll-admin">
      <h2>Poll Manager</h2>

      <div className="admin-controls">
        <button onClick={() => toggleResults(true)}>Show Results</button>
        <button onClick={() => toggleResults(false)}>Hide Results</button>

        <p className="status-info">
          Current status:{" "}
          <strong>{showResults ? "Visible to public" : "Hidden from public"}</strong>
        </p>
      </div>

      <table className="poll-table">
        <thead>
          <tr>
            <th>Vote</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {polls.map((p) => (
            <tr key={p.id}>
              <td>
                {editing === p.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                ) : (
                  p.vote
                )}
              </td>

              <td>{p.createdAt?.toDate().toLocaleString() || ""}</td>

              <td>
                {editing === p.id ? (
                  <>
                    <button onClick={() => saveEdit(p.id)}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPolls;
