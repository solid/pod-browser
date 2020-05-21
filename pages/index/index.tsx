import { useEffect, useState } from 'react';
import { fetchLitDataset, getOneThing, getAllIris } from '@inrupt/lit-solid-core';
import { ldp } from 'rdf-namespaces';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';

import { getSession, fetch } from '../../lib/solid-auth-fetcher/dist';
import { useRedirectIfLoggedOut } from '../../src/effects/auth';
import LogOutButton from '../../components/logout';


// TODO move this to a shims file
if (!global.setImmediate) {
  global.setImmediate = (fn, ...args): any => global.setTimeout(fn, 0, ...args);
}


export default function Home() {
  useRedirectIfLoggedOut();

  const defaultResources: string[] | null = [];

  const [resources, setResources] = useState(defaultResources);
  const [containerIri, setContainerIri] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO example code; to be moved to src/effects once we start actually displaying data.
    async function fetchContainerData() {
      // TODO learn how to typescript. Don't use `any`. Needs to check if it's an ILoggedinSession.
      const session: any = await getSession();

      if (session && session.webId) {
        const { webId } = session;

        // TODO figure out why LSC doesn't like SAF's fetch.
        const profile = await fetchLitDataset(webId, { fetch });
        const containerIris = getAllIris(profile, 'http://www.w3.org/ns/pim/space#storage');

        // TODO work with multiple top-level containers
        const containerIriFromProfile = containerIris[0];
        setContainerIri(containerIriFromProfile);

        // Assign `fetch` from our SAF with session.
        // TODO this will be unnecessary once SAF is loaded through an npm module instead of
        // a submodule.
        // TODO type litDataset.
        const litDataset = await fetchLitDataset(containerIriFromProfile, { fetch });

        const container = getOneThing(litDataset, containerIriFromProfile);

        const containedResources = getAllIris(container, ldp.contains);
        setResources(containedResources);
        setIsLoading(false);
      }
    }

    fetchContainerData();
  }, []);


  // TODO move Loading indicator into separate component

  return (
    <>
      <LogOutButton />
      { resources && resources.length ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            { resources.map((iri: string) => (
              <TableRow key={iri}>
                <TableCell>
                  <a href={`/resource/${iri}`}>
                    {iri.replace(containerIri, '')}
                  </a>
                </TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      ) : null}

      { isLoading ? (
        <h2>Loading...</h2>
      ) : null }
    </>
  );
}
