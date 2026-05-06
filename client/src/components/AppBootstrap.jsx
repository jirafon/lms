import React from 'react';
import { useSelector } from 'react-redux';
import { useLoadUserQuery } from '@/features/api/authApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const AppBootstrap = ({ children }) => {
  const { authChecked } = useSelector((store) => store.auth);
  const { isLoading } = useLoadUserQuery();

  if (isLoading || !authChecked) {
    return <LoadingSpinner />;
  }

  return children;
};

export default AppBootstrap;
