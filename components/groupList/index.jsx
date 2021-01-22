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
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { Message } from "@inrupt/prism-react-components";
import useContacts from "../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import styles from "./styles";
import Spinner from "../spinner";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTID_GROUP_LIST = "group-list";
export const TESTID_GROUP_LIST_EMPTY = "group-list-empty";
export const TESTID_GROUP_ERROR = "group-list-error";

export default function GroupList() {
  const { data: contacts, error } = useContacts([GROUP_CONTACT]);
  const bem = useBem(useStyles());
  return (
    <div data-testid={TESTID_GROUP_LIST}>
      <div className={bem("group-list-header")}>
        <div className={bem("group-list-header__title")}>Groups</div>
      </div>
      {!contacts && !error && <Spinner />}
      {error && (
        <Message variant="error" data-testid={TESTID_GROUP_ERROR}>
          {error.message}
        </Message>
      )}
      {contacts && !contacts.length && (
        <div
          className={bem("group-list-empty")}
          data-testid={TESTID_GROUP_LIST_EMPTY}
        >
          No groups
        </div>
      )}
    </div>
  );
}
