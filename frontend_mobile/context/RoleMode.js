import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readRoleMode, writeRoleMode } from '../utils/roleModeStore';

const RoleModeContext = createContext(null);

export function RoleModeProvider({ children }) {
  const [mode, setModeState] = useState('requester');

  useEffect(() => {
    let active = true;
    readRoleMode().then((value) => {
      if (active) setModeState(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((next) => {
    const value = next === 'holder' ? 'holder' : 'requester';
    setModeState(value);
    writeRoleMode(value);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <RoleModeContext.Provider value={value}>{children}</RoleModeContext.Provider>;
}

export function useRoleMode() {
  const value = useContext(RoleModeContext);
  if (!value) {
    throw new Error('useRoleMode must be used within RoleModeProvider');
  }
  return value;
}
