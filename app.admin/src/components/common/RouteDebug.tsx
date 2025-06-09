import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteDebugProps {
  componentName: string;
}

const RouteDebug: React.FC<RouteDebugProps> = ({ componentName }) => {
  const location = useLocation();

  useEffect(() => {
    console.log(
      `RouteDebug: ${componentName} mounted at path ${location.pathname}`
    );

    return () => {
      console.log(
        `RouteDebug: ${componentName} unmounted from path ${location.pathname}`
      );
    };
  }, [componentName, location.pathname]);

  return null;
};

export default RouteDebug;
