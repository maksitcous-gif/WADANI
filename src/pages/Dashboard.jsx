import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

// Admin components
import UserManager from "../components/UserManager";
import Gallery from "../components/Gallery";
import NewsManager from "../components/NewsManager";
import EventsManager from "../components/EventsManager";
import VolunteerForm from "../admin/VolunteerForm";
import AdminPolls from "../admin/AdminPolls";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("manageNews");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔥 CHECK ADMIN ACCESS
  useEffect(() => {
    let isMounted = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isMounted) {
          setLoading(false);
          navigate("/login");
        }
        return;
      }

      try {
        const token = await user.getIdTokenResult(true);
        const storedRole = localStorage.getItem("role");
        const hasAdminClaim = token.claims?.admin === true;
        const isAdminAccess = hasAdminClaim || storedRole === "admin";

        if (!isAdminAccess) {
          if (isMounted) {
            setIsAdmin(false);
            navigate("/login");
          }
          return;
        }

        if (isMounted) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Dashboard auth check failed:", error);
        if (isMounted) {
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");

    signOut(auth).then(() => {
      navigate("/login");
    });
  }

  if (loading) {
    return <h2 className="dashboard-loading">Checking admin access...</h2>;
  }

  if (!isAdmin) {
    return <h2 className="dashboard-denied">Access denied</h2>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="dashboard-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-menu">
        <button
          className={section === "manageNews" ? "active" : ""}
          onClick={() => setSection("manageNews")}
        >
          Manage News
        </button>

        <button
          className={section === "manageEvents" ? "active" : ""}
          onClick={() => setSection("manageEvents")}
        >
          Manage Events
        </button>

        <button
          className={section === "users" ? "active" : ""}
          onClick={() => setSection("users")}
        >
          Users
        </button>

        <button
          className={section === "gallery" ? "active" : ""}
          onClick={() => setSection("gallery")}
        >
          Gallery
        </button>

        <button
          className={section === "polls" ? "active" : ""}
          onClick={() => setSection("polls")}
        >
          Polls
        </button>

        <button
          className={section === "volunteers" ? "active" : ""}
          onClick={() => setSection("volunteers")}
        >
          Volunteers
        </button>
      </div>

      <div className="dashboard-content">
        {section === "manageNews" && <NewsManager />}
        {section === "manageEvents" && <EventsManager />}
        {section === "users" && <UserManager />}
        {section === "gallery" && <Gallery />}
        {section === "polls" && <AdminPolls />}
        {section === "volunteers" && <VolunteerForm />}
      </div>
    </div>
  );
}

export default Dashboard;
