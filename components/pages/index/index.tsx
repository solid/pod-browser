import React, { ReactElement, useEffect, useContext, useState } from "react";
import { Container } from "@material-ui/core";
import { fetchLitDataset, getThingOne, getIriAll } from "lit-solid";
import { space } from "rdf-namespaces";
import { ILoggedInSolidSession } from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";

import UserContext from "../../../src/contexts/UserContext";
import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import PodList from "../../podList";
import { DetailsMenuProvider } from "../../../src/contexts/detailsMenuContext";

export async function getPodIrisFromWebId(webId: string): Promise<string[]> {
  const profileDoc = await fetchLitDataset(webId);
  const profile = getThingOne(profileDoc, webId);

  return getIriAll(profile, space.storage);
}

export default function Home(): ReactElement {
  useRedirectIfLoggedOut();

  const defaultPodIris: string[] | null = [];
  const { session, isLoadingSession } = useContext(UserContext);
  const [podIris, setPodIris] = useState(defaultPodIris);

  // If there's a session, use it to load all of the iris exposed by the user profile,
  // and build a list of pods for the user to select.
  useEffect(() => {
    if (isLoadingSession || !session) {
      return;
    }

    const { webId } = session as ILoggedInSolidSession;

    getPodIrisFromWebId(webId)
      .then(setPodIris)
      .catch((e) => {
        throw e;
      });
  }, [session, isLoadingSession, setPodIris]);

  return (
    <Container>
      <DetailsMenuProvider>
        <PodList podIris={podIris} />
      </DetailsMenuProvider>
    </Container>
  );
}
