import React from 'react';
import { Typography } from '@pairflix/components';
import * as styles from './PageHeader.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.headerTitle}>
        {icon && (
          <span className={styles.iconWrapper}>
            <i className={icon}></i>
          </span>
        )}
        {title}
      </h1>
      {description && <Typography variant="body1">{description}</Typography>}
    </div>
  );
};

export default PageHeader;
