import React, { useEffect, useState, useContext } from 'react';
import { fetchLitDataset, getOneThing, getAllIris } from '@inrupt/lit-solid-core';
import { ldp } from 'rdf-namespaces';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container
} from '@material-ui/core';

import { getSession, fetch } from '../../lib/solid-auth-fetcher/dist';
import { useRedirectIfLoggedOut } from '../../src/effects/auth';
import { UserContext } from '../../src/contexts/UserContext';

import Spinner from '../../components/spinner';
import Header from '../../components/header';
import ResourceContainer from '../../components/resourceContainer';


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
  const [session, setSession] = useState(null);


  useEffect(() => {
    // TODO example code; to be moved to src/effects once we start actually displaying data.
    async function fetchContainerData() {
      // TODO learn how to typescript. Don't use `any`. Needs to check if it's an ILoggedinSession.
      const session: any = await getSession();


      if (session && session.webId) {
        const { webId } = session;
        setSession(session);

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
        console.log(JSON.stringify(containedResources));
        setResources(containedResources);
        setIsLoading(false);
      }
    }

    fetchContainerData();
  }, []);


  // TODO move Loading indicator into separate component
  // TODO above todo was done but thinking we should
  // move header and isloading.. spinner into one as well so that it's a different
  // header if logged in etc...
  return (

     <UserContext.Provider value={{session, isLoading, resources}}>
       <Container>
       <Header />
       { isLoading ? (
           <Spinner />
       ) : null}
       <ResourceContainer containerIri={ containerIri }/>
       </Container>
  </UserContext.Provider>
  );
}
