import axios from 'axios';
import { useEffect, useRef } from 'react';

// Football public API -> {VITE_API_URL}/api/football
const FAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/football`,
  withCredentials: true
});

// kichu sec por por data refresh (live score / auction er jonno)
export function usePolling(fn, ms = 5000) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    ref.current();
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default FAPI;
