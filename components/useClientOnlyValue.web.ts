import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// Match server HTML during hydration, then use the client value.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore<S | C>(subscribe, () => client, () => server);
}
