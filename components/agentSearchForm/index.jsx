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

export function setupSubmitHandler(
  value,
  session,
  setIsPodOwner,
  permissions,
  setExistingWebId,
  onSubmit
) {
  return async (event) => {
    event.preventDefault();
    if (value === session.info.webId) {
      setIsPodOwner(true);
      return;
    }
    if ((permissions || []).filter((p) => p.webId === value).length) {
      setExistingWebId(value);
      return;
    }
    await onSubmit(value);
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
  buttonText,
  children,
  dirtyForm,
  onChange,
  onSubmit,
  permissions,
  value,
}) {
  const inputId = useId();
  const { session } = useSession();
  const [dirtyWebIdField, setDirtyWebIdField] = useState(dirtyForm);
  const invalidWebIdField = !value && (dirtyForm || dirtyWebIdField);
  const [existingWebId, setExistingWebId] = useState(null);
  const [isPodOwner, setIsPodOwner] = useState(false);

  const handleSubmit = setupSubmitHandler(
    value,
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

  return (
    <Form onSubmit={handleSubmit}>
      <Label>WebID</Label>
      {invalidWebIdField && (
        <Message variant="invalid">Please provide a valid WebID</Message>
      )}
      {isPodOwner && (
        <Message variant="invalid">
          You cannot overwrite your own permissions.
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
        value={value}
        type="url"
        pattern="https://.+"
        title="Must start with https://"
        onBlur={onBlur}
        required={invalidWebIdField}
        variant={existingWebId || isPodOwner ? "invalid" : null}
      />

      {children}

      <Button type="submit">{buttonText}</Button>
    </Form>
  );
}

AgentSearchForm.propTypes = {
  buttonText: T.string,
  children: T.node,
  dirtyForm: T.bool,
  onChange: T.func,
  onSubmit: T.func,
  permissions: T.arrayOf(T.object),
  value: T.string,
};

AgentSearchForm.defaultProps = {
  buttonText: "Add",
  children: null,
  dirtyForm: false,
  onChange: () => {},
  onSubmit: () => {},
  permissions: [],
  value: "",
};
