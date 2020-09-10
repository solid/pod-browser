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

import React from "react";
import { PageHeader as PrismPageHeader } from "@inrupt/prism-react-components";
import T from "prop-types";
import ContainerDetails from "../containerDetailsButton";
import AddFileButton from "../addFileButton";
import AddFolderFlyout from "../addFolderFlyout";

export default function ContainerPageHeader({ mutate, resourceList }) {
  const pageHeaderAction = PrismPageHeader.actionClassName();

  const containerDetails = <ContainerDetails className={pageHeaderAction} />;
  const addFolderFlyout = (
    <AddFolderFlyout
      onSave={mutate}
      className={pageHeaderAction}
      resourceList={resourceList}
    />
  );
  const addFileButton = (
    <AddFileButton
      onSave={mutate}
      className={pageHeaderAction}
      resourceList={resourceList}
    />
  );
  return (
    <PrismPageHeader
      title="Files"
      actions={[containerDetails, addFolderFlyout, addFileButton]}
    />
  );
}

ContainerPageHeader.propTypes = {
  mutate: T.func,
  resourceList: T.arrayOf(
    T.shape({
      iri: T.string.isRequired,
      name: T.string.isRequired,
    })
  ),
};

ContainerPageHeader.defaultProps = {
  mutate: () => null,
  resourceList: [],
};
