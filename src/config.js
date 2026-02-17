/**
 * API environment config
 *
 * isTesting: true  → use local backend (http://localhost:5005 via proxy)
 * isTesting: false → use production backend (https://ruvali-ecommerce-1.onrender.com)
 *
 * Defaults: development → true, production build → false
 * Override with REACT_APP_IS_TESTING=true|false
 */
const fromEnv = process.env.REACT_APP_IS_TESTING;
const isProduction = process.env.NODE_ENV === 'production';

export const isTesting =
  fromEnv !== undefined ? fromEnv === 'false' : !isProduction;
