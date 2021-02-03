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
import PropTypes from "prop-types";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Button,
  Content,
  Container,
  Icons,
} from "@inrupt/prism-react-components";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_EMPTY_STATE_ADD_WEBID_BUTTON = "empty-state-add-webid-button";

export default function AgentPickerEmptyState({ onClick }) {
  const bem = useBem(useStyles());
  const buttonBem = Button.useBem();

  return (
    <Content>
      <Container variant="empty">
        <Icons name="user" className={bem("icon-large")} />
        <h2 className="text">Add a new person with their WebId</h2>
        <Button
          data-testid={TESTCAFE_ID_EMPTY_STATE_ADD_WEBID_BUTTON}
          className={clsx(buttonBem("button"), bem("add-webId-button"))}
          onClick={onClick}
        >
          <i className={clsx(bem("icon-add"), bem("icon"))} />
          Add WebId
        </Button>
      </Container>
    </Content>
  );
}

AgentPickerEmptyState.propTypes = {
  onClick: PropTypes.func.isRequired,
};
