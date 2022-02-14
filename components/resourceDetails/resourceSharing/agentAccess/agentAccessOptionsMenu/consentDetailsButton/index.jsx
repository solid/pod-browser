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

/* eslint-disable react/jsx-one-expression-per-line */

import React, { useState } from "react";
import { Modal } from "@inrupt/prism-react-components";
import T from "prop-types";
import { createStyles, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { permission as permissionPropType } from "../../../../../../constants/propTypes";
import styles from "./styles";
import ConsentDetailsModal from "./consentDetailsModal";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";
const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentDetailsButton({
  resourceIri,
  permission,
  handleCloseModal,
}) {
  const classes = useStyles();
  const [openModal, setOpenModal] = useState(false);

  return (
    <ListItem data-testid={TESTCAFE_ID_VIEW_DETAILS_BUTTON} button>
      <ListItemText
        disableTypography
        classes={{ primary: classes.listItemText }}
        onClick={() => setOpenModal(true)}
      >
        View Details
      </ListItemText>
      <Modal
        // data-testid={TESTCAFE_ID_MODAL_OVERLAY}
        open={openModal}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClose={handleCloseModal}
        aria-labelledby={`${resourceIri} Modal`}
        aria-describedby={`${resourceIri} for this resource`}
      >
        <ConsentDetailsModal
          resourceIri={resourceIri}
          setOpenModal={setOpenModal}
          permission={permission}
          handleCloseModal={handleCloseModal}
        />
      </Modal>
    </ListItem>
  );
}

ConsentDetailsButton.propTypes = {
  resourceIri: T.string,
  permission: permissionPropType.isRequired,
  handleCloseModal: T.func.isRequired,
};

ConsentDetailsButton.defaultProps = {
  resourceIri: null,
};
