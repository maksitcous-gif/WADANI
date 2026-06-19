import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <h3>JUSTICE PARTY</h3>

        <p>
          Democracy • Development • Justice
        </p>

        <p>
          © {new Date().getFullYear()} JUSTICE Party.
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;