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

import { useState } from "react";
import { useId } from "react-id-generator";
import {
  Button,
  createStyles,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
} from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import T from "prop-types";
import { makeStyles } from "@material-ui/styles";
import styles from "../resourceDetails/styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function handleClick({ setAgentId, onSubmit }) {
  return (agentId) => {
    setAgentId("");
    onSubmit(agentId);
  };
}

export function handleChange(setAgentId) {
  return ({ target: { value } }) => {
    setAgentId(value);
  };
}

function AgentSearchForm({ heading, onSubmit, buttonText }) {
  const [agentId, setAgentId] = useState("");
  const classes = useStyles();
  const onClick = handleClick({ setAgentId, onSubmit });
  const onChange = handleChange(setAgentId);
  const inputId = useId();

  return (
    <>
      <h5 className={classes["content-h5"]}>{heading}</h5>

      <FormControl className={classes.agentInput}>
        <InputLabel htmlFor={inputId}>Web ID</InputLabel>
        <Input
          id={inputId}
          onChange={onChange}
          value={agentId}
          // prettier-ignore
          startAdornment={(
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          )}
        />
      </FormControl>

      <Button
        variant="contained"
        onClick={() => onClick(agentId)}
        className={classes.agentAddButton}
      >
        {buttonText}
      </Button>
    </>
  );
}

AgentSearchForm.propTypes = {
  buttonText: T.string,
  heading: T.string,
  onSubmit: T.func,
};

AgentSearchForm.defaultProps = {
  buttonText: "Add",
  heading: "Grant Permission",
  onSubmit: () => {},
};

export default AgentSearchForm;
