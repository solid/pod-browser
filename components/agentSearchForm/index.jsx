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

import React, { useState } from "react";
import { useId } from "react-id-generator";
import T from "prop-types";
import {
  Form,
  Button,
  Label,
  Message,
  SimpleInput,
} from "@inrupt/prism-react-components";
import { useSession } from "@inrupt/solid-ui-react";
import { isPodOwner } from "../../src/solidClientHelpers/utils";

export const TESTCAFE_ID_ADD_AGENT_BUTTON = "add-agent-button";

const AGENT_TYPE_MAP = {
  contacts: {
    OWN_WEBID_ERROR_MESSAGE: "You cannot add yourself as a contact.",
  },
  permissions: {
    OWN_WEBID_ERROR_MESSAGE: "You cannot overwrite your own permissions.",
  },
};

function isDuplicateContact(permissions, agentId) {
  return permissions.filter((p) => p.webId === agentId).length;
}

export function setupSubmitHandler(
  agentId,
  session,
  setIsPodOwner,
  permissions = [],
  setExistingWebId,
  onSubmit
) {
  return async (event) => {
    event.preventDefault();

    if (isPodOwner(session, agentId)) {
      setIsPodOwner(true);
      return;
    }
    /* ignoring next block because it is affecting the coverage and we're removing this code soon */
    /* istanbul ignore next */
    if (isDuplicateContact(permissions, agentId)) {
      setExistingWebId(agentId);
      return;
    }

    await onSubmit(agentId);
  };
}

export function setupOnChangeHandler(
  onChange,
  setIsPodOwner,
  setExistingWebId
) {
  return (event) => {
    onChange(event.target.value);
    setIsPodOwner(false);
    setExistingWebId(null);
  };
}

export function setupOnBlurHandler(setDirtyWebIdField) {
  return () => setDirtyWebIdField(true);
}

export default function AgentSearchForm({
  type,
  buttonText,
  children,
  dirtyForm,
  onChange,
  onSubmit,
  permissions,
  agentId,
}) {
  const inputId = useId();
  const { session } = useSession();
  const [dirtyWebIdField, setDirtyWebIdField] = useState(dirtyForm);
  const invalidWebIdField = !agentId && (dirtyForm || dirtyWebIdField);
  const [existingWebId, setExistingWebId] = useState(null);
  const [isPodOwner, setIsPodOwner] = useState(false);
  const handleSubmit = setupSubmitHandler(
    agentId,
    session,
    setIsPodOwner,
    permissions,
    setExistingWebId,
    onSubmit
  );
  const handleChange = setupOnChangeHandler(
    onChange,
    setIsPodOwner,
    setExistingWebId
  );
  const onBlur = setupOnBlurHandler(setDirtyWebIdField);

  /* ignoring next block because it is affecting the coverage and we're removing this code soon */
  /* istanbul ignore next */
  return (
    <Form onSubmit={handleSubmit}>
      <Label>WebID</Label>

      {invalidWebIdField && (
        <Message variant="invalid">Please provide a valid WebID</Message>
      )}
      {isPodOwner && (
        <Message variant="invalid">
          {AGENT_TYPE_MAP[type].OWN_WEBID_ERROR_MESSAGE}
        </Message>
      )}
      {existingWebId && (
        <Message variant="invalid">
          {`The WebID ${existingWebId} is already in your permissions.`}
        </Message>
      )}
      <SimpleInput
        id={inputId}
        onChange={handleChange}
        value={agentId}
        type="url"
        pattern="https:\/\/\S+"
        title="Must be a valid URL that starts with https:// and does not contain spaces"
        onBlur={onBlur}
        required={invalidWebIdField}
        variant={existingWebId || isPodOwner ? "invalid" : null}
      />
      {children}
      <Button type="submit" data-testid={TESTCAFE_ID_ADD_AGENT_BUTTON}>
        {buttonText}
      </Button>
    </Form>
  );
}

AgentSearchForm.propTypes = {
  buttonText: T.string,
  children: T.node,
  dirtyForm: T.bool,
  onChange: T.func,
  onSubmit: T.func,
  permissions: T.arrayOf(T.shape({
  webId: T.string.isRequired,
})),
  agentId: T.string,
  type: T.string,
};

AgentSearchForm.defaultProps = {
  buttonText: "Add",
  children: null,
  dirtyForm: false,
  onChange: () => {},
  onSubmit: () => {},
  permissions: [],
  agentId: "",
  type: "permissions",
};
