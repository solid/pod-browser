import { ReactElement, useEffect, useState, useContext } from "react";
import { ldp } from "rdf-namespaces";

import {
  fetchLitDataset,
  getThingOne,
  getIriAll,
} from "lit-solid";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import UserContext from "../../src/contexts/UserContext";
import { ILoggedInSolidSession } from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";
import { fetch } from "@inrupt/solid-auth-fetcher";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import Spinner from "../spinner";

// TODO move this to a shims file
if (!global.setImmediate) {
  global.setImmediate = (fn, ...args): any => global.setTimeout(fn, 0, ...args);
}

type IContainerResourceIris = {
  containerIri: string;
  resources: Array<string>;
};

export async function getContainerResourceIrisFromSession(
  session: ILoggedInSolidSession | undefined
): Promise<IContainerResourceIris> {
  // TODO learn how to typescript. Don't use `any`. Needs to check if it's an ILoggedinSession.
  if (!session || !session.webId) {
    return { containerIri: "", resources: [] };
  }

  const { webId } = session;

  // TODO the typescript error for `fetch` is a known issue: SDK-995
  const profileDoc = await fetchLitDataset(webId, { fetch });
  const profile = getThingOne(profileDoc, webId);
  const containerIris = getIriAll(
    profile,
    "http://www.w3.org/ns/pim/space#storage"
  );

  // TODO work with multiple top-level containers (to be implemented in a later user story.)
  const containerIri = containerIris[0];

  // Assign `fetch` from our SAF with session.
  // TODO this will be unnecessary once SAF is loaded through an npm module instead of
  // a submodule.
  const litDataset = await fetchLitDataset(containerIri, { fetch });

  const container = getThingOne(litDataset, containerIri);

  const resourceIris = getIriAll(container, ldp.contains);

  return {
    containerIri,
    resources: resourceIris,
  };
}

export default function Home(): ReactElement {
  useRedirectIfLoggedOut();

  const defaultResources: string[] | null = [];
  const { session, isLoadingSession } = useContext(UserContext);

  const [resources, setResources] = useState(defaultResources);
  const [containerIri, setContainerIri] = useState("");
  const [isLoading, setIsLoading] = useState(isLoadingSession);

  useEffect(() => {
    if (isLoadingSession || !session) {
      return;
    }

    async function fetchContainerData() {
      const {
        containerIri: loadedContainerIri,
        resources: loadedResources,
      } = await getContainerResourceIrisFromSession(
        session as ILoggedInSolidSession
      );

      setContainerIri(loadedContainerIri);
      setResources(loadedResources);
      setIsLoading(false);
    }

    fetchContainerData();
  }, [session, isLoadingSession]);

  if (isLoading || !resources) {
    return <Spinner />;
  }

  return (
    <>
      {resources.length ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>My Access</TableCell>
              <TableCell>Modified</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {resources.map((iri: string) => (
              <TableRow key={iri}>
                <TableCell>
                  <a href={`/resource/${iri}`}>
                    {iri.replace(containerIri, "")}
                  </a>
                </TableCell>
                <TableCell>Folder</TableCell>
                <TableCell>Full</TableCell>
                <TableCell>Today :)</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </>
  );
}
