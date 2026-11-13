import { useEffect, useState, type ReactNode } from 'react';
import { Redirect } from 'react-router-dom';

import { getToken } from './token';

/** Renders its children only for a signed-in member; otherwise goes to /login. */
const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'in' | 'out'>('checking');

  useEffect(() => {
    let live = true;
    void getToken().then((token) => live && setStatus(token ? 'in' : 'out'));
    return () => {
      live = false;
    };
  }, []);

  if (status === 'checking') return null;
  if (status === 'out') return <Redirect to="/login" />;
  return <>{children}</>;
};

export default RequireAuth;
