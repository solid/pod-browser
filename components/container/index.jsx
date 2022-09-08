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
import { getSourceUrl, isContainer } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { renderResourceType } from "../containerTableRow";
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
import useAuthenticatedProfile from "../../src/hooks/useAuthenticatedProfile";
import AuthProfileLoadError from "../authProfileLoadError";
import NoControlWarning from "../noControlWarning";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import useAccessControl from "../../src/hooks/useAccessControl";
import PodRootLoadError from "../podRootLoadError";
import ContainerTable from "../containerTable";
import { isHTTPError } from "../../src/error";
import { locationIsConnectedToProfile } from "../../src/solidClientHelpers/profile";
import { isContainerIri } from "../../src/solidClientHelpers/utils";
import { downloadResource } from "../downloadLink";
import useAccessToResourceAndParentContainer from "../../src/hooks/useAccessToResourceAndParentContainer";
import DownloadResourceMessage from "../downloadResourceMessage";
import usePodRootUri from "../../src/hooks/usePodRootUri";
import NoPodFoundError from "../noPodFoundError";

function isNotAContainerResource(iri, container) {
  if (!iri) return true;
  return (
    container && isContainerIri(iri) && getSourceUrl(container.dataset) !== iri
  );
}

function renderContainerContent(isValidating, iri, data) {
  return isValidating ? (
    <Spinner />
  ) : (
    <ContainerTable
      containerPath={getContainerUrl(iri)}
      data={data}
      resourcePath={iri}
    />
  );
}

function maybeRenderWarning(locationIsInUsersPod, noControlError, podRootIri) {
  return (
    locationIsInUsersPod &&
    noControlError && <NoControlWarning podRootIri={podRootIri} />
  );
}

export default function Container({ iri }) {
  const [download, setDownload] = useState(false);
  const { sessionRequestInProgress, session } = useSession();
  const [resourceUrls, setResourceUrls] = useState(null);
  const authenticatedProfile = useAuthenticatedProfile();
  const podRootIri = usePodRootUri(iri);
  const [noControlError, setNoControlError] = useState(null);
  const { data: podRootResourceInfo, error: podRootError } =
    useResourceInfo(podRootIri);
  const {
    error: accessControlError,
    isValidating: validatingPodRootAccessControl,
  } = useAccessControl(podRootResourceInfo);

  const {
    data: container,
    error: containerError,
    mutate: update,
    isValidating,
  } = useContainer(iri);

  const { accessToParentContainer, accessToResource } =
    useAccessToResourceAndParentContainer(iri);

  useEffect(() => {
    if (accessToResource?.read && !accessToParentContainer?.read) {
      setDownload(true);
      downloadResource(iri, session.fetch);
    } else {
      setDownload(false);
    }
  }, [accessToParentContainer, accessToResource, iri, session]);

  useEffect(() => {
    if (isNotAContainerResource(iri, container)) return;
    const urls = container && getContainerResourceUrlAll(container);
    setResourceUrls(urls);
  }, [container, iri]);

  useEffect(() => {
    setNoControlError(accessControlError);
  }, [accessControlError]);

  const data = useMemo(() => {
    if (!resourceUrls) {
      return [];
    }

    return resourceUrls.map((rIri) => ({
      iri: rIri,
      name: getResourceName(rIri),
      filename: getResourceName(rIri)?.toLowerCase(),
      type: renderResourceType(rIri),
    }));
  }, [resourceUrls]);

  if (authenticatedProfile && podRootIri === null) return <NoPodFoundError />;

  const locationIsInUsersPod = locationIsConnectedToProfile(
    authenticatedProfile,
    iri
  );

  if (podRootError && locationIsInUsersPod) return <PodRootLoadError />;

  if ((!iri || isValidating || validatingPodRootAccessControl) && !podRootError)
    return <Spinner />;

  if (iri && download) {
    return <DownloadResourceMessage iri={iri} />;
  }

  if (containerError && isHTTPError(containerError.message, 401))
    return <AccessForbidden />;
  if (containerError && isHTTPError(containerError.message, 403))
    return <AccessForbidden />;
  if (containerError && isHTTPError(containerError.message, 404))
    return <ResourceNotFound />;
  if (containerError && !sessionRequestInProgress) return <NotSupported />;

  if (!authenticatedProfile) return <AuthProfileLoadError />;

  if (!resourceUrls || !container) return <Spinner />;

  const { dataset: containerDataset } = container;

  if (containerDataset && !isContainer(containerDataset))
    return <NotSupported />;

  return (
    <>
      <BookmarksContextProvider>
        <PageHeader />
        <ContainerDetails update={update}>
          <ContainerSubHeader update={update} resourceList={data} />
          {maybeRenderWarning(locationIsInUsersPod, noControlError, podRootIri)}
          {renderContainerContent(isValidating, iri, data)}
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
