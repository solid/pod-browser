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

import React, { useEffect, useMemo, useState } from "react";
import T from "prop-types";

import { isContainer } from "@inrupt/solid-client";
import { renderResourceType } from "../containerTableRow";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import { getResourceName } from "../../src/solidClientHelpers/resource";

import Spinner from "../spinner";
import PageHeader from "../containerPageHeader";
import ContainerDetails from "../containerDetails";
import { BookmarksContextProvider } from "../../src/contexts/bookmarksContext";
import AccessForbidden from "../accessForbidden";
import ResourceNotFound from "../resourceNotFound";
import useContainer from "../../src/hooks/useContainer";
import NotSupported from "../notSupported";
import { getContainerResourceUrlAll } from "../../src/models/container";
import { getContainerUrl } from "../../src/stringHelpers";
import ContainerSubHeader from "../containerSubHeader";
import usePodRootUri from "../../src/hooks/usePodRootUri";
import useAuthenticatedProfile from "../../src/hooks/useAuthenticatedProfile";
import AuthProfileLoadError from "../authProfileLoadError";
import NoControlWarning from "../noControlWarning";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import useAccessControl from "../../src/hooks/useAccessControl";
import PodRootLoadError from "../podRootLoadError";
import ContainerTable from "../containerTable";
import { isHTTPError } from "../../src/error";
import { locationIsConnectedToProfile } from "../../src/solidClientHelpers/profile";

export default function Container({ iri }) {
  useRedirectIfLoggedOut();
  const encodedContainerPathIri = getContainerUrl(iri);
  const [containerPath, setContainerPath] = useState(encodedContainerPathIri);
  const [resourcePath, setResourcePath] = useState(iri);
  const {
    data: authenticatedProfile,
    error: authenticatedProfileError,
  } = useAuthenticatedProfile();
  const podRootIri = usePodRootUri(iri);
  const { data: podRootResourceInfo, error: podRootError } = useResourceInfo(
    podRootIri
  );
  const { error: accessControlError } = useAccessControl(podRootResourceInfo);

  useEffect(() => {
    setResourcePath(iri);
    const path = getContainerUrl(iri);
    setContainerPath(path);
  }, [iri]);

  const { data: container, error: containerError, mutate } = useContainer(
    containerPath,
    {
      refreshInterval: 0,
    }
  );

  const resourceIris = container && getContainerResourceUrlAll(container);

  const data = useMemo(() => {
    if (!resourceIris) {
      return [];
    }

    return resourceIris.map((rIri) => ({
      iri: rIri,
      name: getResourceName(rIri),
      filename: getResourceName(rIri)?.toLowerCase(),
      type: renderResourceType(rIri),
    }));
  }, [resourceIris]);

  if (!iri) return <Spinner />;

  if (containerError && isHTTPError(containerError.message, 401))
    return <AccessForbidden />;
  if (containerError && isHTTPError(containerError.message, 403))
    return <AccessForbidden />;
  if (containerError && isHTTPError(containerError.message, 404))
    return <ResourceNotFound />;
  if (containerError) return <NotSupported />;
  if (authenticatedProfileError) return <AuthProfileLoadError />;
  const locationIsInUsersPod = locationIsConnectedToProfile(
    authenticatedProfile,
    iri
  );
  if (podRootError && locationIsInUsersPod) return <PodRootLoadError />;

  if (!resourceIris || !container || !podRootIri) return <Spinner />;

  const { dataset: containerDataset } = container;

  if (containerDataset && !isContainer(containerDataset))
    return <NotSupported />;

  return (
    <>
      <BookmarksContextProvider>
        <PageHeader />
        <ContainerDetails mutate={mutate}>
          <ContainerSubHeader mutate={mutate} resourceList={data} />
          {locationIsInUsersPod && accessControlError && (
            <NoControlWarning podRootIri={podRootIri} />
          )}
          <ContainerTable
            containerPath={containerPath}
            data={data}
            resourcePath={resourcePath}
          />
        </ContainerDetails>
      </BookmarksContextProvider>
    </>
  );
}

Container.propTypes = {
  iri: T.string,
};

Container.defaultProps = {
  iri: null,
};
