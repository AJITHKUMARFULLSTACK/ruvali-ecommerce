/**
 * API Config
 *
 * isTesting = true  → localhost (http://localhost:5005)
 * isTesting = false → production (https://ruvali-ecommerce-1.onrender.com)
 *
 * Override: REACT_APP_IS_TESTING=true or false in .env
 * (If not set: dev = true, production build = false)
 */
const envOverride = process.env.REACT_APP_IS_TESTING;

export const isTesting =
  typeof envOverride === 'string'
    ? envOverride.toLowerCase() === 'true'
    : process.env.NODE_ENV !== 'production';
