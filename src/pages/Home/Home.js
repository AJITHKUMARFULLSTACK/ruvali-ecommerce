import React from 'react';
import LuxuryHero from '../../components/LuxuryHero/LuxuryHero';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import FeaturedPicks from '../../components/FeaturedPicks/FeaturedPicks';
import landingpageBg from '../../Assets/Images/landingpageBg.png';
import { useStore } from '../../context/StoreContext';
import { useCategories } from '../../hooks/useCategories';
import { resolveImageUrl } from '../../lib/imageUtils';
import { getCategorySlug } from '../../lib/slugUtils';
import './Home.css';

const Home = () => {
  const { store } = useStore();
  const { tree } = useCategories();

  const heroImage = store?.backgroundImage
    ? resolveImageUrl(store.backgroundImage)
    : landingpageBg;

  return (
    <div className="home">
      <LuxuryHero image={heroImage} title="RUVALI" isHome />

      <div className="luxury-content-spacer" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <section className="curated-section">
        <h2 className="section-title">CURATED FOR THE CONNOISSEUR OF STYLE</h2>
        <p className="section-description">
          Discover our handpicked collections that blend timeless elegance with
          contemporary artistry. Each piece is crafted to perfection, designed
          for those who appreciate the finer things in life.
        </p>
      </section>

      {tree.length > 0 ? (
        tree.map((cat) => (
          <FeaturedPicks
            key={cat.id}
            title={`${cat.name.toUpperCase()} PICKS`}
            categoryId={cat.id}
            categorySlug={getCategorySlug(cat)}
          />
        ))
      ) : (
        <FeaturedPicks
          title="FEATURED PICKS"
          categorySlug="c"
        />
      )}
      </div>
    </div>
  );
};

export default Home;

