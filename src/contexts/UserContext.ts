import { createContext } from 'react';
// Not sure if this is the correct interface:
import { Session } from '@inrupt/solid-auth-fetcher';
import { IriString } from 'lit-solid';

interface Context  {
    session: Session | undefined;
    isLoading: boolean | undefined;
    resources: IriString[] | undefined;
}

export const UserContext = createContext<Context>({});
