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

import React from "react";
import PropTypes from "prop-types";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_ADD_AGENT_BUTTON = "add-agent-button";

// TODO: this component will trigger the opening of a modal, for now it is just a placeholder

export default function AddAgentButton({ type, onClick }) {
  const classes = useStyles();
  const bem = useBem(useStyles());

  const BUTTON_TEXT_MAP = {
    editors: { text: "Add Editors" },
    viewers: { text: "Add Viewers" },
    blocked: { text: "Block" },
  };
  const { text } = BUTTON_TEXT_MAP[type];
  return (
    <Button
      data-testid={TESTCAFE_ID_ADD_AGENT_BUTTON}
      variant="action"
      className={classes.button}
      onClick={onClick}
    >
      <i
        className={clsx(bem("icon-add"), bem("icon"))}
        alt={`${text} Button`}
      />
      {text}
    </Button>
  );
}

AddAgentButton.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.string.isRequired,
};
