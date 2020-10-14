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
import { Form, Button, Input } from "@inrupt/prism-react-components";

function AgentSearchForm({ children, onSubmit, buttonText }) {
  const [agentId, setAgentId] = useState("");
  const inputId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (agentId === "") {
      return;
    }
    onSubmit(agentId);
  };

  const handleChange = (event) => {
    setAgentId(event.target.value);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        id={inputId}
        label="WebID"
        onChange={handleChange}
        value={agentId}
        type="url"
        pattern="https://.+"
        title="Must start with https://"
      />

      {children}

      <Button type="submit">{buttonText}</Button>
    </Form>
  );
}

AgentSearchForm.propTypes = {
  buttonText: T.string,
  children: T.node,
  onSubmit: T.func,
};

AgentSearchForm.defaultProps = {
  buttonText: "Add",
  children: null,
  onSubmit: () => {},
};

export default AgentSearchForm;
