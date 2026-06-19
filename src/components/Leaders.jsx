
import "./Leaders.css";



function Leaders() {
  const leaders = [
    {
      name: "",
      role: "",
      image: ""
    },
    {
      name: "",
      role: "",
      image: ""
    }
  ];

  return (
    <section className="leaders-section">
      <h2>Party Leadership</h2>

      <div className="leaders-grid">
        {leaders.map((leader, index) => (
          <div
            className="leader-card"
            key={index}
          >
            <img
              src={leader.image}
              alt={leader.name}
            />

            <h3>{leader.name}</h3>

            <p>{leader.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Leaders;