import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncResource<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    return load().then((result) => {
      if (id === requestId.current) {
        setData(result);
        setError(false);
      }
    }).catch(() => {
      if (id === requestId.current) setError(true);
    }).finally(() => {
      if (id === requestId.current) setLoading(false);
    });
  }, [load]);

  useEffect(() => {
    void run();
    return () => { requestId.current += 1; };
  }, [run]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    return run();
  }, [run]);

  return { data, loading, error, reload, setData };
}
