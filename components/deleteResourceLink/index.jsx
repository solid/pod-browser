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

import React, { useContext } from "react";
import T from "prop-types";
import { useDataset, useSession } from "@inrupt/solid-ui-react";
import DeleteLink from "../deleteLink";
import usePoliciesContainer from "../../src/hooks/usePoliciesContainer";
import AlertContext from "../../src/contexts/alertContext";
import { deleteResource } from "../../src/solidClientHelpers/resource";

export function createDeleteHandler(
  resource,
  policiesContainer,
  onDelete,
  fetch
) {
  return async () => {
    await deleteResource(resource, policiesContainer, fetch);
    onDelete();
  };
}

/* eslint react/jsx-props-no-spreading: 0 */
export default function DeleteResourceLink({
  name,
  resourceIri,
  onDelete,
  ...linkProps
}) {
  const { fetch } = useSession();

  const { alertError } = useContext(AlertContext);
  const { policiesContainer } = usePoliciesContainer();
  const { dataset: resourceDataset, error: datasetError } = useDataset(
    resourceIri
  );
  if (datasetError) {
    alertError(datasetError);
  }
  const resource = {
    dataset: resourceDataset,
    iri: resourceIri,
  };

  const handleDelete = createDeleteHandler(
    resource,
    policiesContainer,
    onDelete,
    fetch
  );

  return (
    <DeleteLink
      confirmationTitle="Confirm Delete"
      confirmationContent={`Are you sure you wish to delete ${name}?`}
      dialogId={`delete-resource-${resourceIri}`}
      onDelete={handleDelete}
      successMessage={`${name} was successfully deleted.`}
      {...linkProps}
    >
      Delete
    </DeleteLink>
  );
}

DeleteResourceLink.propTypes = {
  name: T.string.isRequired,
  resourceIri: T.string.isRequired,
  onDelete: T.func.isRequired,
};
