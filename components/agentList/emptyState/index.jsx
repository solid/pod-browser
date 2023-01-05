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
import { createStyles, makeStyles } from "@mui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Content, Container, Icons } from "@inrupt/prism-react-components";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
export const NO_AGENTS_MESSAGE = "No one else has access to your Pod";
export const NO_AGENTS_PARAGRAPH =
  "When access has been granted to a person or app, they will show up here.";

export default function AgentsEmptyState() {
  const bem = useBem(useStyles());

  return (
    <Content>
      <Container variant="empty">
        <Icons name="user-shield" className={bem("icon-large")} />
        <h1>{NO_AGENTS_MESSAGE}</h1>
        <p>{NO_AGENTS_PARAGRAPH}</p>
      </Container>
    </Content>
  );
}
