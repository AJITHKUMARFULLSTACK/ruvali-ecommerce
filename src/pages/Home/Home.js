import React from 'react';
import Hero from '../../components/Hero/Hero';
import FeaturedPicks from '../../components/FeaturedPicks/FeaturedPicks';
import landingpageBg from '../../Assets/Images/landingpageBg.png';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Hero 
        image={landingpageBg}
        isHome
      />
      
      <section className="curated-section">
        <h2 className="section-title">CURATED FOR THE CONNOISSEUR OF STYLE</h2>
        <p className="section-description">
          Discover our handpicked collections that blend timeless elegance with contemporary artistry. 
          Each piece is crafted to perfection, designed for those who appreciate the finer things in life.
        </p>
      </section>

      <FeaturedPicks 
        title="DRUNKEN MONK PICKS"
        category="men"
      />
      
      <FeaturedPicks 
        title="TRIPPERS PICKS"
        category="men"
      />
      
      <FeaturedPicks 
        title="NIGHT LIGHT PICKS"
        category="men"
      />
      
      <FeaturedPicks 
        title="RADE RAVE PICKS"
        category="men"
      />
    </div>
  );
};

export default Home;

