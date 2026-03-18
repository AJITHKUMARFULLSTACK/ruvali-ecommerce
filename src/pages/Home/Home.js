import React from 'react';
import { motion } from 'framer-motion';
import LuxuryHero from '../../components/LuxuryHero/LuxuryHero';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import FeaturedPicks from '../../components/FeaturedPicks/FeaturedPicks';
import landingpageBg from '../../Assets/Images/landingpageBg.png';
import { useStore } from '../../context/StoreContext';
import { useCategories } from '../../hooks/useCategories';
import { resolveImageUrl } from '../../lib/imageUtils';
import { getCategorySlug } from '../../lib/slugUtils';
import './Home.css';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const Home = () => {
  const { store } = useStore();
  const { tree } = useCategories();

  const heroImage = store?.backgroundImage
    ? resolveImageUrl(store.backgroundImage)
    : landingpageBg;

  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LuxuryHero image={heroImage} title="RUVALI" isHome />

      <div className="luxury-content-spacer" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <motion.section
          className="curated-section"
          {...fadeInUp}
          transition={{ delay: 0.2, ...fadeInUp.transition }}
        >
          <h2 className="section-title">CURATED FOR THE CONNOISSEUR OF STYLE</h2>
          <p className="section-description">
            Discover our handpicked collections that blend timeless elegance with
            contemporary artistry. Each piece is crafted to perfection, designed
            for those who appreciate the finer things in life.
          </p>
        </motion.section>

        {tree.length > 0 ? (
          tree.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <FeaturedPicks
                title={`${cat.name.toUpperCase()} PICKS`}
                categoryId={cat.id}
                categorySlug={getCategorySlug(cat)}
              />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <FeaturedPicks title="FEATURED PICKS" categorySlug="c" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Home;

