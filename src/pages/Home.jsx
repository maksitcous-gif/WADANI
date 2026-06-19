
import Hero from "../components/Hero";
import News from "../components/News";
import Events from "../components/Events";
import Leaders from "../components/Leaders";
import Gallery from "../components/Gallery";
import VolunteerForm from "../components/VolunteerForm";
import Polls from "../components/Polls";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";





function Home() {
  return (
    <>
    

      
      <Hero />
      
      
      <News />

      <Events />

      <Leaders />

      <Gallery />

      <VolunteerForm />

      <Polls />

      <Contact />

      <Footer />
      <Link to="/dashboard" style={{ margin: "20px", display: "inline-block" }}>
  Admin Dashboard
</Link>

    </>
    
  );
}

export default Home;