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

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import { Drawer } from "@inrupt/prism-react-components";
import { DatasetProvider, useSession } from "@inrupt/solid-ui-react";
import { getResourceInfo } from "@inrupt/solid-client";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import { stripQueryParams } from "../../src/stringHelpers";
import ResourceDetails from "../resourceDetails";
import DetailsLoading from "../resourceDetails/detailsLoading";
import useAccessControl from "../../src/hooks/useAccessControl";
import { AccessControlProvider } from "../../src/contexts/accessControlContext";

export function handleCloseDrawer({ setMenuOpen, router }) {
  return async () => {
    setMenuOpen(false);
    const { asPath } = router;
    const pathname = stripQueryParams(asPath) || "/";
    await router.replace("/resource/[iri]", pathname);
  };
}

export default function ResourceDrawer({ onUpdate }) {
  const { menuOpen, setMenuOpen } = useContext(DetailsMenuContext);
  const { fetch } = useSession();
  const [datasetWithInfo, setDatasetWithInfo] = useState(null);
  const router = useRouter();
  const {
    query: { action, resourceIri },
  } = router;
  const accessControl = useAccessControl(resourceIri, fetch);

  useEffect(() => {
    setMenuOpen(!!(action && resourceIri));
  }, [action, resourceIri, setMenuOpen]);

  useEffect(() => {
    if (!resourceIri) {
      setDatasetWithInfo(null);
      return;
    }
    const encodedResourceIri = encodeURI(resourceIri);
    getResourceInfo(encodedResourceIri, { fetch }).then((dataset) => {
      setDatasetWithInfo(dataset);
    });
  }, [fetch, resourceIri]);

  const closeDrawer = handleCloseDrawer({ setMenuOpen, router });
  const loading = !accessControl || !datasetWithInfo;

  return (
    <Drawer open={menuOpen} close={closeDrawer}>
      {loading ? (
        <DetailsLoading iri={resourceIri} />
      ) : (
        <AccessControlProvider accessControl={accessControl}>
          <DatasetProvider dataset={datasetWithInfo}>
            <ResourceDetails onDelete={onUpdate} />
          </DatasetProvider>
        </AccessControlProvider>
      )}
    </Drawer>
  );
}

ResourceDrawer.propTypes = {
  onUpdate: T.func,
};

ResourceDrawer.defaultProps = {
  onUpdate: () => {},
};
