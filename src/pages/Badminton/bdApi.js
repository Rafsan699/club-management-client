import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export const ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const BASE = '/sports/table-tennis'; // menu path (Badminton)
const API = axios.create({ baseURL: `${ROOT}/api/badminton` });
export const img = (p) => (!p ? '' : /^https?:|^data:/.test(p) ? p : `${ROOT}${p}`);
export const initials = (n = '') => n.split(/[\s/]+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
export const fmtDate = (d, withTime = true) => (d ? new Date(d).toLocaleString([], withTime ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA');

// simple GET hook
export function useGet(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    if (!url) { setData(null); setLoading(false); return Promise.resolve(); }
    setLoading(true);
    return API.get(url).then((r) => { setData(r.data); setError(''); }).catch((e) => setError(e?.response?.data?.error || e.message)).finally(() => setLoading(false));
  }, [url]); // eslint-disable-line
  useEffect(() => { load(); }, [load, ...deps]); // eslint-disable-line
  return { data, setData, loading, error, reload: load };
}

// socket: server 'bd:match:update' event pele callback chole
export function useLiveSocket(onUpdate) {
  const ref = useRef(onUpdate);
  ref.current = onUpdate;
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const s = io(ROOT, { transports: ['websocket', 'polling'] });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('bd:match:update', (m) => ref.current && ref.current(m));
    return () => s.disconnect();
  }, []);
  return connected;
}

export default API;