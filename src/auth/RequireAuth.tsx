import { useEffect, useState, type ReactNode } from 'react';
import { Redirect } from 'react-router-dom';

import { getToken, onAuthChange } from './token';

/**
 * Renders its children only for a signed-in member; otherwise goes to /login.
 * It keeps listening, so signing out (or a rejected session) locks the tabs
 * straight away, even though Ionic keeps them mounted.
 */
const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'in' | 'out'>('checking');

  useEffect(() => {
    let live = true;
    void getToken().then((token) => live && setStatus(token ? 'in' : 'out'));
    const off = onAuthChange((signedIn) => live && setStatus(signedIn ? 'in' : 'out'));
    return () => {
      live = false;
      off();
    };
  }, []);

  if (status === 'checking') return null;
  if (status === 'out') return <Redirect to="/login" />;
  return <>{children}</>;
};

export default RequireAuth;
