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
import { useBem } from "@solid/lit-prism-patterns";
import { Button } from "@inrupt/prism-react-components";
import AgentPickerModal from "./agentPickerModal";
import useNamedPolicyPermissions from "../../../../src/hooks/useNamedPolicyPermissions";
import usePermissionsWithProfiles from "../../../../src/hooks/usePermissionsWithProfiles";

const TESTCAFE_ID_ADD_AGENT_BUTTON = "add-agent-button";
const TESTCAFE_MODAL_OVERLAY = "modal-overlay";

const BUTTON_TEXT_MAP = {
  editors: { text: "Add Editors" },
  viewers: { text: "Add Viewers" },
  blocked: { text: "Block" },
};

export default function AddAgentButton({ type }) {
  const {
    data: namedPermissions,
    mutate: mutatePermissions,
  } = useNamedPolicyPermissions(type);
  const { permissionsWithProfiles: permissions } = usePermissionsWithProfiles(
    namedPermissions
  );

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { text } = BUTTON_TEXT_MAP[type];

  return (
    <>
      <Button
        data-testid={TESTCAFE_ID_ADD_AGENT_BUTTON}
        variant="text"
        onClick={handleOpen}
        iconBefore="add"
      >
        {text}
      </Button>

      <Modal
        data-testid={TESTCAFE_MODAL_OVERLAY}
        open={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClose={handleClose}
        aria-labelledby={`${text} Modal`}
        aria-describedby={`${text} for this resource`}
      >
        <AgentPickerModal
          type={type}
          text={text}
          onClose={handleClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </Modal>
    </>
  );
}

AddAgentButton.propTypes = {
  type: PropTypes.string.isRequired,
};
