import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "./News.css";

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const snapshot = await getDocs(collection(db, "news"));

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setNews(data);
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return (
    <section id="news">
      <h2 style={{ marginBottom: "20px" }}>Latest News</h2>

      {loading && <p>Loading news...</p>}

      {!loading && news.length === 0 && (
        <p>WAXAN HALKAN KU SOO BANDHIGI DOONA WARARKA LA XIDHIDHA XISBIGA WADANI.</p>
      )}

      <div className="news-grid">
        {news.map(item => (
          <div key={item.id} className="news-card">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="news-image"
              />
            )}

            <div className="news-content">
              <h3>{item.title}</h3>
              <p>{item.content}</p>

              {item.date && (
                <small className="news-date">
                  {new Date(item.date.seconds * 1000).toLocaleDateString()}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default News;
