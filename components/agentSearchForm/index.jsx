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

function AgentSearchForm({
  children,
  onSubmit,
  buttonText,
  value,
  onChange,
  dirtyForm,
}) {
  const inputId = useId();
  const [dirtyWebIdField, setDirtyWebIdField] = useState(dirtyForm);
  const invalidWebIdField = !value && (dirtyForm || dirtyWebIdField);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(value);
  };

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Label>WebID</Label>
      {invalidWebIdField ? (
        <Message variant="invalid">Please provide a valid WebID</Message>
      ) : null}
      <SimpleInput
        id={inputId}
        onChange={handleChange}
        value={value}
        type="url"
        pattern="https://.+"
        title="Must start with https://"
        onBlur={() => setDirtyWebIdField(true)}
        required={invalidWebIdField}
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
  value: T.string,
};

AgentSearchForm.defaultProps = {
  buttonText: "Add",
  children: null,
  dirtyForm: false,
  onChange: () => {},
  onSubmit: () => {},
  value: "",
};

export default AgentSearchForm;
