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
import { Drawer } from "@inrupt/prism-react-components";
import DetailsMenuContext, {
  DETAILS_CONTEXT_ACTIONS,
} from "../../src/contexts/detailsMenuContext";
import AlertContext from "../../src/contexts/alertContext";
import DetailsLoading from "../resourceDetails/detailsLoading";
import ResourceSharingLoading from "../resourceDetails/resourceSharing/resourceSharingLoading";
import DetailsError from "../resourceDetails/detailsError";
import ResourceDetails from "../resourceDetails";
import ResourceSharing from "../resourceDetails/resourceSharing";
import { useFetchResourceDetails } from "../../src/hooks/solidClient";
import { parseUrl, stripQueryParams } from "../../src/stringHelpers";

function Contents({ action, iri, onUpdate }) {
  const { pathname } = parseUrl(iri);
  const { data, error } = useFetchResourceDetails(iri);

  const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
  const errorMessage = "There was an error fetching the details.";

  function onDeleteError(e) {
    setSeverity("error");
    setMessage(e.toString());
    setAlertOpen(true);
  }

  const loadingComponent =
    action === "details" ? (
      <DetailsLoading
        name={pathname}
        iri={iri}
        onDelete={onUpdate}
        onDeleteError={onDeleteError}
      />
    ) : (
      <ResourceSharingLoading name={pathname} iri={iri} />
    );

  useEffect(() => {
    if (error) {
      setSeverity("error");
      setMessage(errorMessage);
      setAlertOpen(true);
    }
  });

  if (error) {
    return <DetailsError message={errorMessage} name={pathname} iri={iri} />;
  }

  if (!data) return loadingComponent;

  const { permissions, defaultPermissions, dataset } = data;

  switch (action) {
    case DETAILS_CONTEXT_ACTIONS.SHARING:
      return (
        <ResourceSharing
          iri={iri}
          name={pathname}
          permissions={permissions}
          defaultPermissions={defaultPermissions}
          dataset={dataset}
        />
      );

    default:
      return (
        <ResourceDetails
          resource={{ ...data, name: pathname }}
          onDelete={onUpdate}
          onDeleteError={onDeleteError}
        />
      );
  }
}

Contents.propTypes = {
  action: T.string.isRequired,
  iri: T.string.isRequired,
  onUpdate: T.func,
};

Contents.defaultProps = {
  onUpdate: () => {},
};

export { Contents };

export function handleCloseDrawer({ setMenuOpen, router }) {
  return async () => {
    setMenuOpen(false);
    const { asPath } = router;
    const pathname = stripQueryParams(asPath) || "/";
    await router.replace("/resource/[iri]", pathname);
  };
}

/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
export default function DetailsContextMenu({ onUpdate }) {
  const { menuOpen, setMenuOpen } = useContext(DetailsMenuContext);

  const { query } = useRouter();
  const { action, resourceIri } = query;

  const router = useRouter();

  useEffect(() => {
    setMenuOpen(!!(action && resourceIri));
  }, [action, resourceIri, setMenuOpen]);

  const closeDrawer = handleCloseDrawer({ setMenuOpen, router });

  if (!resourceIri) return null;

  return (
    <Drawer open={menuOpen} close={closeDrawer}>
      <Contents action={action} iri={resourceIri} onUpdate={onUpdate} />
    </Drawer>
  );
}

DetailsContextMenu.propTypes = {
  onUpdate: T.func.isRequired,
};
