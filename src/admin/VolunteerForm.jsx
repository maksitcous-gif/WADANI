import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import "./VolunteerForm.css";

function VolunteerForm() {
  const [volunteers, setVolunteers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    city: "",
    role: "",
    phone: ""
  });

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az");
  const [cityFilter, setCityFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 5;

  async function loadVolunteers() {
    const snap = await getDocs(collection(db, "volunteers"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setVolunteers(list);
  }

  useEffect(() => {
    loadVolunteers();
  }, []);

  async function handleDelete(id) {
    await deleteDoc(doc(db, "volunteers", id));
    setMessage("Volunteer deleted successfully");
    loadVolunteers();
  }

  function startEdit(v) {
    setEditing(v.id);
    setEditForm({
      name: v.name,
      email: v.email,
      city: v.city,
      role: v.role || "",
      phone: v.phone || ""
    });
  }

  async function saveEdit(id) {
    await updateDoc(doc(db, "volunteers", id), {
      name: editForm.name,
      email: editForm.email,
      city: editForm.city,
      role: editForm.role,
      phone: editForm.phone
    });

    setMessage("Volunteer updated successfully");
    setEditing(null);
    loadVolunteers();
  }

  function handleKeyPress(e, action) {
    if (e.key === "Enter") action();
  }

  function highlight(text) {
    if (!search) return text;

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");

    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  }

  const filtered = volunteers
    .filter(v => {
      const text = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(text) ||
        v.email.toLowerCase().includes(text) ||
        v.city.toLowerCase().includes(text) ||
        (v.role || "").toLowerCase().includes(text) ||
        (v.phone || "").toLowerCase().includes(text)
      );
    })
    .filter(v => (cityFilter ? v.city === cityFilter : true))
    .filter(v => (roleFilter ? v.role === roleFilter : true))
    .sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      if (sort === "newest") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (sort === "oldest") return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      return 0;
    });

  useEffect(() => {
    setPage(1);
  }, [search, sort, cityFilter, roleFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const cities = [...new Set(volunteers.map(v => v.city))];
  const roles = [...new Set(volunteers.map(v => v.role).filter(Boolean))];

  function exportFilteredCSV() {
    const rows = filtered.map(v => ({
      name: v.name,
      email: v.email,
      city: v.city,
      role: v.role,
      phone: v.phone,
      createdAt: v.createdAt?.toDate().toLocaleString() || ""
    }));

    const header = "Name,Email,City,Role,Phone,Created At\n";
    const csv = header + rows.map(r =>
      `${r.name},${r.email},${r.city},${r.role},${r.phone},${r.createdAt}`
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_volunteers.csv";
    a.click();
  }

  return (
    <div className="volunteer-admin">
      <h2>Volunteer Manager</h2>

      {message && <div className="success-box">{message}</div>}

      <div className="top-bar">
        <input
          type="text"
          placeholder="Search name, email, city, role, phone..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, () => setSearch(search))}
        />

        <button className="search-btn" onClick={() => setSearch(search)}>
          Search
        </button>

        <select
          className="city-filter"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          <option value="">All Cities</option>
          {cities.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="city-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((r, i) => (
            <option key={i} value={r}>{r}</option>
          ))}
        </select>

        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

        <button className="export-btn" onClick={exportFilteredCSV}>
          Export Filtered
        </button>
      </div>

      <h3 className="results-title">Results ({filtered.length})</h3>

      {filtered.length === 0 && (
        <p className="no-results">No volunteers found</p>
      )}

      {filtered.length > 0 && (
        <table className="volunteer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((v) => (
              <tr key={v.id}>
                <td dangerouslySetInnerHTML={{ __html: highlight(v.name) }} />
                <td dangerouslySetInnerHTML={{ __html: highlight(v.email) }} />
                <td dangerouslySetInnerHTML={{ __html: highlight(v.city) }} />
                <td dangerouslySetInnerHTML={{ __html: highlight(v.role || "") }} />
                <td dangerouslySetInnerHTML={{ __html: highlight(v.phone || "") }} />

                <td>
                  {editing === v.id ? (
                    <>
                      <input
                        type="text"
                        value={editForm.role}
                        placeholder="Role"
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        onKeyDown={(e) => handleKeyPress(e, () => saveEdit(v.id))}
                      />

                      <input
                        type="text"
                        value={editForm.phone}
                        placeholder="Phone"
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        onKeyDown={(e) => handleKeyPress(e, () => saveEdit(v.id))}
                      />

                      <button onClick={() => saveEdit(v.id)}>Save</button>
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(v)}>Edit</button>
                      <button onClick={() => handleDelete(v.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filtered.length > 0 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>{page} / {totalPages}</span>

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default VolunteerForm;
