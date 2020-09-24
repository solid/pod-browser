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
import { DatasetProvider } from "@inrupt/solid-ui-react";
// import { useFetchResourceDetails } from "../../../src/hooks/solidClient";
// import { getResourceName } from "../../../src/solidClientHelpers/resource";
import AlertContext from "../../../src/contexts/alertContext";
// import DetailsLoading from "../../resourceDetails/detailsLoading";
// import DetailsError from "../../resourceDetails/detailsError";
import ResourceDetails from "../../resourceDetails";

export default function DetailsContextMenuContents({ iri, onUpdate }) {
  // const { data, error } = useFetchResourceDetails(iri);
  // const displayName = getResourceName(iri);

  const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
  // const errorMessage = "There was an error fetching the details.";

  function onDeleteError(e) {
    setSeverity("error");
    setMessage(e.toString());
    setAlertOpen(true);
  }

  // const loadingComponent = (
  //   <DetailsLoading
  //     name={displayName}
  //     iri={iri}
  //     onDelete={onUpdate}
  //     onDeleteError={onDeleteError}
  //   />
  // );

  // useEffect(() => {
  //   if (error) {
  //     setSeverity("error");
  //     setMessage(errorMessage);
  //     setAlertOpen(true);
  //   }
  // });

  // if (error) {
  //   return <DetailsError message={errorMessage} name={displayName} iri={iri} />;
  // }
  //
  // if (!data) return loadingComponent;

  return (
    <DatasetProvider datasetUrl={iri}>
      <ResourceDetails onDelete={onUpdate} onDeleteError={onDeleteError} />
    </DatasetProvider>
  );
}

DetailsContextMenuContents.propTypes = {
  iri: T.string.isRequired,
  onUpdate: T.func,
};

DetailsContextMenuContents.defaultProps = {
  onUpdate: () => {},
};
