import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import "./Polls.css";

function Polls() {
  const [vote, setVote] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(true);

  // Submit vote
  const submitVote = async () => {
    if (!vote) {
      setStatus("Please select an option");
      return;
    }

    try {
      await addDoc(collection(db, "polls"), {
        vote,
        createdAt: serverTimestamp(),
      });

      setStatus("Vote submitted successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Error submitting vote");
    }
  };

  // LIVE RESULTS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "polls"), (snap) => {
      const list = snap.docs.map((d) => d.data());
      setResults(list);
    });

    return () => unsub();
  }, []);

  // READ showResults FLAG
  useEffect(() => {
    async function loadStatus() {
      const ref = doc(db, "settings", "pollStatus");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // Auto-create if missing
        await setDoc(ref, { showResults: true });
        setShowResults(true);
      } else {
        setShowResults(snap.data().showResults);
      }
    }

    loadStatus();
  }, []);

  // Count votes
  const counts = results.reduce((acc, r) => {
    acc[r.vote] = (acc[r.vote] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="poll-section">
      <div className="poll-card">
        <h2>Which issue should WE prioritize?</h2>

        <div className="poll-options">
          <label>
            <input
              type="radio"
              name="poll"
              value="Education"
              onChange={(e) => setVote(e.target.value)}
            />
            <span>Education</span>
          </label>

          <label>
            <input
              type="radio"
              name="poll"
              value="Healthcare"
              onChange={(e) => setVote(e.target.value)}
            />
            <span>Healthcare</span>
          </label>

          <label>
            <input
              type="radio"
              name="poll"
              value="Jobs"
              onChange={(e) => setVote(e.target.value)}
            />
            <span>Jobs</span>
          </label>
        </div>

        <p className="selected-vote">
          Selected: <strong>{vote || "None"}</strong>
        </p>

        <button className="poll-btn" onClick={submitVote}>
          Submit Vote
        </button>

        {status && <p className="poll-status">{status}</p>}
      </div>

      {/* PUBLIC RESULTS */}
      {showResults ? (
        <div className="poll-results">
          <h3>Live Results</h3>
          <p className="refresh-note">If results don’t update, refresh the page.</p>

          <ul>
            <li>Education: {counts["Education"] || 0} votes</li>
            <li>Healthcare: {counts["Healthcare"] || 0} votes</li>
            <li>Jobs: {counts["Jobs"] || 0} votes</li>
          </ul>
        </div>
      ) : (
        <p className="poll-hidden">
          Results are hidden by the admin. Refresh the page to check again.
        </p>
      )}
    </section>
  );
}

export default Polls;
