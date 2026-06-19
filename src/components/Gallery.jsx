import "./Gallery.css";


function Gallery() {
  const images = [
    "https://picsum.photos/400/300?1",
    "https://picsum.photos/400/300?2",
    "https://picsum.photos/400/300?3",
    "https://picsum.photos/400/300?4",
    "https://picsum.photos/400/300?5",
    "https://picsum.photos/400/300?6"
  ];

  return (
    <section className="gallery-section">
      <h2>Gallery</h2>

      <div className="gallery-grid">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Gallery"
          />
        ))}
      </div>
    </section>
  );
}

export default Gallery;