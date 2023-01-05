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
import { Button } from "@inrupt/prism-react-components";
import { createStyles, makeStyles } from "@mui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import T from "prop-types";
import styles from "./styles";
import Breadcrumbs from "../breadcrumbs";
import ContainerDetails from "../containerDetailsButton";
import AddFileButton from "../addFileButton";
import AddFolderFlyout from "../addFolderFlyout";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ContainerSubHeader({ update, resourceList }) {
  const bem = useBem(useStyles());
  const buttonBem = Button.useBem();
  const pageHeaderAction = buttonBem("button", "small");
  return (
    <div className={bem("sub-header")}>
      <Breadcrumbs />
      <div className={bem("actions-container")}>
        <ContainerDetails className={pageHeaderAction} />
        <AddFolderFlyout
          onSave={update}
          resourceList={resourceList}
          className={pageHeaderAction}
        />
        <AddFileButton
          onSave={update}
          resourceList={resourceList}
          className={pageHeaderAction}
        />
      </div>
    </div>
  );
}

ContainerSubHeader.propTypes = {
  update: T.func,
  resourceList: T.arrayOf(
    T.shape({
      iri: T.string.isRequired,
      name: T.string.isRequired,
    })
  ),
};

ContainerSubHeader.defaultProps = {
  update: () => null,
  resourceList: [],
};
