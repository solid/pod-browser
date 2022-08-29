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
import { useRouter } from "next/router";
import T from "prop-types";
import {
  getEffectiveAccess,
  getResourceInfo,
  getSourceUrl,
  isContainer,
} from "@inrupt/solid-client";
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
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
import {
  getContainerUrl,
  getParentContainerUrl,
} from "../../src/stringHelpers";
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
import { isContainerIri } from "../../src/solidClientHelpers/utils";
import DownloadLink, { downloadResource } from "../downloadLink";
import styles from "../resourceDetails/styles";

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

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function Container({ iri }) {
  const [download, setDownload] = useState(false);
  const classes = useStyles();
  const router = useRouter();
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

  useEffect(() => {
    if (sessionRequestInProgress || isContainerIri(iri)) return;
    (async () => {
      const parentContainerUrl = getParentContainerUrl(iri);
      let accessToParentContainer;
      let accessToResource;
      try {
        const resourceInfoParentContainer = await getResourceInfo(
          parentContainerUrl,
          {
            fetch: session.fetch,
          }
        );
        const { user } = getEffectiveAccess(resourceInfoParentContainer);
        accessToParentContainer = user;
      } catch (e) {
        // no access to parent container
      }

      try {
        const resourceInfo = await getResourceInfo(iri, {
          fetch: session.fetch,
        });

        const { user } = getEffectiveAccess(resourceInfo);
        accessToResource = user;
      } catch (e) {
        // no access to resource
      }

      if (accessToResource?.read && !accessToParentContainer?.read) {
        setDownload(true);
        await downloadResource(iri, session.fetch);
      } else {
        setDownload(false);
      }
    })();
  }, [iri, session, router, authenticatedProfile, sessionRequestInProgress]);

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

  if (!iri || isValidating || validatingPodRootAccessControl)
    return <Spinner />;

  if (iri && download) {
    return (
      <span>
        Downloading resource.{" "}
        <p>
          If you download down not start, click here:{" "}
          <DownloadLink className={classes.downloadLink} iri={iri}>
            {iri}
          </DownloadLink>
        </p>
      </span>
    );
  }

  if (containerError && isHTTPError(containerError.message, 401))
    return <AccessForbidden />;
  if (containerError && isHTTPError(containerError.message, 403))
    return <AccessForbidden />;
  if (containerError && isHTTPError(containerError.message, 404))
    return <ResourceNotFound />;
  if (containerError && !sessionRequestInProgress) return <NotSupported />;
  if (!authenticatedProfile) return <AuthProfileLoadError />;

  const locationIsInUsersPod = locationIsConnectedToProfile(
    authenticatedProfile,
    iri
  );

  if (podRootError && locationIsInUsersPod) return <PodRootLoadError />;

  if (!resourceUrls || !container || !podRootIri) return <Spinner />;

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
