import { useEffect } from 'react';
import { fetchLitDataset, getOneThing, getAllIris } from '@inrupt/lit-solid-core';
import { ldp } from 'rdf-namespaces';

import { getSession, fetch } from '../../lib/solid-auth-fetcher/dist';
import { useRedirectIfLoggedOut } from '../../src/effects/auth';
import LogOutButton from '../../components/logout';


// TODO move this to a shims file
if (!global.setImmediate) {
  global.setImmediate = (fn, ...args): any => global.setTimeout(fn, 0, ...args);
}


export default function Home() {
  useRedirectIfLoggedOut();

  useEffect(() => {
    // TODO example code; to be moved to src/effects once we start actually displaying data.
    async function fetchContainerData() {
      // TODO learn how to typescript. Dont' use `any`. Needs to check if it's an ILoggedinSession.
      const session: any = await getSession();

      if (session && session.webId) {
        const { webId: containerIri } = session;

        // Assign `fetch` from our SAF with session.
        // TODO this will be unnecessary once SAF is loaded through an npm module instead of
        // a submodule.
        // TODO type litDataset.
        // TODO figure out why LSC doesn't like SAF's fetch.
        fetchLitDataset(containerIri, { fetch }).then((litDataset: any) => {
          const container = getOneThing(litDataset, containerIri);
          const containedResources = getAllIris(container, ldp.contains);
          console.log(containedResources);
        });
      }
    }

    fetchContainerData();
  }, []);

  return (
    <LogOutButton />
  );
}
