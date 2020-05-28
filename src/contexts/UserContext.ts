import { createContext } from 'react';
// Not sure if this is the correct interface:
import { Session } from '../../lib/solid-auth-fetcher/dist';

interface Context {
  session: Session | null | undefined;
  isLoadingSession: boolean | undefined;
}

export default createContext<Context>({
  session: undefined,
  isLoadingSession: true,
});
