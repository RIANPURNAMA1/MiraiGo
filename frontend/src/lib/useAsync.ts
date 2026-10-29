import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: any;
  loading: boolean;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[]
): { data: T | null; error: any; loading: boolean; reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, error: null, loading: false });
    } catch (e: any) {
      setState({ data: null, error: e, loading: false });
    }
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  const reload = useCallback(() => {
    run();
  }, [run]);

  return { data: state.data, error: state.error, loading: state.loading, reload };
}
