import React from 'react';
import { useLoadUserQuery } from '@/features/api/authApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const AppBootstrap = ({ children }) => {
  const { isLoading } = useLoadUserQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return children;
};

export default AppBootstrap;
