import React from 'react';
import { Link } from 'react-router-dom';
import { H1 } from '@pairflix/components';
import * as styles from './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className={styles.notFoundContainer}>
      <H1>404 - Page Not Found</H1>
      <p className={styles.notFoundText}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link className={styles.backLink} to="/">
        <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
