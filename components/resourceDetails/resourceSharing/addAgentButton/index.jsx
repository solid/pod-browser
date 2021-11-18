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

/* eslint-disable react/forbid-prop-types */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "@material-ui/core";
import { Button } from "@inrupt/prism-react-components";
import AgentPickerModal from "../agentPickerModal";
import { POLICIES_TYPE_MAP } from "../../../../constants/policies";
import { isCustomPolicy } from "../../../../src/models/policy";

export const TESTCAFE_ID_ADD_AGENT_BUTTON = "add-agent-button";
export const TESTCAFE_ID_MODAL_OVERLAY = "agent-picker-modal-overlay";

export default function AddAgentButton({ type, setLoading }) {
  const [editing, setEditing] = useState();

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setEditing(true);
    setOpen(true);
  };

  const handleClose = () => {
    setEditing(false);
    setOpen(false);
  };

  const { editText } = POLICIES_TYPE_MAP[type];

  return (
    <>
      <Button
        data-testid={TESTCAFE_ID_ADD_AGENT_BUTTON}
        variant="text"
        onClick={handleOpen}
        iconBefore="edit"
      >
        {editText}
      </Button>

      <Modal
        data-testid={TESTCAFE_ID_MODAL_OVERLAY}
        open={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClose={handleClose}
        aria-labelledby={`${editText} Modal`}
        aria-describedby={`${editText} for this resource`}
      >
        <AgentPickerModal
          type={type}
          onClose={handleClose}
          setLoading={setLoading}
          advancedSharing={isCustomPolicy(type)}
          editing={editing}
        />
      </Modal>
    </>
  );
}

AddAgentButton.propTypes = {
  type: PropTypes.string.isRequired,
  setLoading: PropTypes.func,
};

AddAgentButton.defaultProps = {
  setLoading: () => {},
};
