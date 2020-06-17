/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { ReactElement, useEffect, useContext, useState } from "react";
import { Container } from "@material-ui/core";
import { fetchLitDataset, getThingOne, getIriAll } from "@solid/lit-pod";
import { space } from "rdf-namespaces";

import UserContext from "../../../src/contexts/userContext";
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

    const { webId } = session;

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
