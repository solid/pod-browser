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

import React, { useContext, useEffect } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import { Drawer, Message } from "@inrupt/prism-react-components";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import {
  getParentContainerUrl,
  stripQueryParams,
} from "../../src/stringHelpers";
import ResourceDetails from "../resourceDetails";
import DetailsLoading from "../resourceDetails/detailsLoading";
import useAccessControl from "../../src/hooks/useAccessControl";
import { AccessControlProvider } from "../../src/contexts/accessControlContext";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import { isHTTPError } from "../../src/error";
import { ResourceInfoProvider } from "../../src/contexts/resourceInfoContext";

export function handleCloseDrawer({ setMenuOpen, router }) {
  return async () => {
    setMenuOpen(false);
    const { asPath } = router;
    const pathname = stripQueryParams(asPath) || "/";
    await router.replace("/resource/[iri]", pathname);
  };
}

export function handleRedirectToParentContainer({ setMenuOpen, iri, router }) {
  return async () => {
    setMenuOpen(false);
    const parentContainerUrl = getParentContainerUrl(iri);
    await router.replace(
      "/resource/[iri]",
      `/resource/${encodeURIComponent(parentContainerUrl)}`
    );
  };
}

export default function ResourceDrawer({ onUpdate, onDeleteCurrentContainer }) {
  const { menuOpen, setMenuOpen } = useContext(DetailsMenuContext);
  const router = useRouter();
  const {
    query: { action, resourceIri },
  } = router;
  const resourceInfoSwrResponse = useResourceInfo(resourceIri, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const { data: resourceInfo, error: resourceError } = resourceInfoSwrResponse;

  const accessControlResponse = useAccessControl(resourceInfo);
  const {
    data: accessControlData,
    error: accessControlError,
    isValidating,
  } = accessControlResponse;

  useEffect(() => {
    setMenuOpen(!!(action && resourceIri));
  }, [action, resourceIri, setMenuOpen]);

  const closeDrawer = handleCloseDrawer({ setMenuOpen, router });

  if (resourceError) {
    // if we fail to load the resource, there's not much more we can do
    // but if access control fails, we can load the rest of the functionality
    return (
      <Drawer open={menuOpen} close={closeDrawer}>
        <Message variant="error">
          {isHTTPError(resourceError, 403) ? (
            <p>You do not have access to this resource.</p>
          ) : (
            <p>We had a problem loading the resource.</p>
          )}
        </Message>
      </Drawer>
    );
  }

  const loading = !resourceInfo || isValidating;

  return (
    <Drawer open={menuOpen} close={closeDrawer}>
      {loading ? (
        <DetailsLoading iri={resourceIri} />
      ) : (
        <ResourceInfoProvider swr={resourceInfoSwrResponse}>
          <AccessControlProvider
            accessControl={accessControlData?.accessControl}
            accessControlType={accessControlData?.accessControlType}
          >
            <DatasetProvider solidDataset={resourceInfo}>
              <ResourceDetails
                onDelete={onUpdate}
                onDeleteCurrentContainer={onDeleteCurrentContainer}
              />
            </DatasetProvider>
          </AccessControlProvider>
        </ResourceInfoProvider>
      )}
    </Drawer>
  );
}

ResourceDrawer.propTypes = {
  onUpdate: T.func,
  onDeleteCurrentContainer: T.func,
};

ResourceDrawer.defaultProps = {
  onUpdate: () => {},
  onDeleteCurrentContainer: () => {},
};
