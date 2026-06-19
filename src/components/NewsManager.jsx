import { useCallback, useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

import "./NewsManager.css";

function NewsManager() {
  const [news, setNews] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    imageFile: null,
    preview: null
  });

  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const role = localStorage.getItem("role");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "{}");
  const canManage = role === "admin" || permissions.manageNews === true;

  // Toast helper
  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  const loadNews = useCallback(async () => {
    try {
      setLoadingList(true);
      const snapshot = await getDocs(collection(db, "news"));
      const items = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
      setNews(items);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load news");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        const snapshot = await getDocs(collection(db, "news"));
        if (!isMounted) return;

        const items = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

        setNews(items);
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
        showToast("error", "Failed to load news");
      } finally {
        if (isMounted) {
          setLoadingList(false);
        }
      }
    };

    void fetchNews();

    return () => {
      isMounted = false;
    };
  }, [loadNews]);

  // Compress image before upload (simple max width)
  async function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            const compressedFile = new File([blob], file.name, {
              type: blob.type
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function uploadImage(file) {
    const cleanName = `${Date.now()}_${file.name.replace(/[() ]/g, "_")}`;
    const imageRef = ref(storage, `news/${cleanName}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  }

  async function addNews() {
    try {
      setSubmitting(true);
      let imageUrl = null;

      if (form.imageFile) {
        const compressed = await compressImage(form.imageFile);
        imageUrl = await uploadImage(compressed);
      }

      await addDoc(collection(db, "news"), {
        title: form.title.trim(),
        content: form.content.trim(),
        image: imageUrl,
        date: new Date()
      });

      resetForm();
      await loadNews();
      showToast("success", "News added");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to add news");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      content: item.content || "",
      imageFile: null,
      preview: item.image || null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateNews() {
    try {
      setSubmitting(true);
      const docRef = doc(db, "news", editingId);

      const updateData = {
        title: form.title.trim(),
        content: form.content.trim()
      };

      if (form.imageFile) {
        const compressed = await compressImage(form.imageFile);
        const newImageUrl = await uploadImage(compressed);
        updateData.image = newImageUrl;
      }

      await updateDoc(docRef, updateData);

      resetForm();
      await loadNews();
      showToast("success", "News updated");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update news");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteNews(id, imageUrl) {
    try {
      setSubmitting(true);
      await deleteDoc(doc(db, "news", id));

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch(() => {});
      }

      await loadNews();
      showToast("success", "News deleted");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete news");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      content: "",
      imageFile: null,
      preview: null
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  }

  async function handleImageSelect(file) {
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      preview: URL.createObjectURL(file)
    }));
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(news.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleNews = news.slice(startIndex, startIndex + pageSize);

  return (
    <div className="news-manager">
      <h2>Manage News</h2>

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {canManage && (
        <div className="news-form">
          <input
            type="text"
            placeholder="Title (max 80 chars)"
            maxLength={80}
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            placeholder="Content (max 500 chars)"
            maxLength={500}
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
          />

          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p>Drag & drop image here or click below</p>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageSelect(e.target.files?.[0])
            }
          />

          {form.preview && (
            <img
              src={form.preview}
              alt="Preview"
              className="preview-image"
            />
          )}

          <button
            onClick={editingId ? updateNews : addNews}
            disabled={submitting || !form.title.trim() || !form.content.trim()}
          >
            {submitting
              ? "Saving..."
              : editingId
              ? "Update News"
              : "Add News"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <h3 className="existing-news-title">Existing News</h3>

      {loadingList ? (
        <p className="news-loading">Loading news...</p>
      ) : visibleNews.length === 0 ? (
        <p className="news-empty">No news yet.</p>
      ) : (
        <>
          <div className="news-list">
            {visibleNews.map((item) => (
              <div key={item.id} className="news-item">
                <h4>{item.title}</h4>
                <p>{item.content}</p>

                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="news-manager-image"
                  />
                )}

                {canManage && (
                  <div className="news-actions">
                    <button
                      onClick={() => startEdit(item)}
                      disabled={submitting}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNews(item.id, item.image)}
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="news-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default NewsManager;
