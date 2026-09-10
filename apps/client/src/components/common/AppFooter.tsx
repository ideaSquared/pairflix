import { Typography } from '@pairflix/components';
import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './AppFooter.css';

// TMDb requires this exact attribution wherever posters/metadata sourced from their API are
// shown (see https://www.themoviedb.org/documentation/api/terms-of-use) -- shown app-wide here
// rather than next to every poster.
const AppFooter: React.FC = () => (
  <div className={styles.footer}>
    <Typography variant="caption">
      This product uses the TMDb API but is not endorsed or certified by TMDb.
    </Typography>
    <div className={styles.links}>
      <Link to="/privacy">Privacy Policy</Link>
      <Link to="/terms">Terms of Service</Link>
    </div>
  </div>
);

export default AppFooter;
