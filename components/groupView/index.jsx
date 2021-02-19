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
import { Message } from "@inrupt/prism-react-components";
import useContacts from "../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import GroupViewEmpty from "../groupViewEmpty";
import Spinner from "../spinner";

export const TESTCAFE_ID_GROUP_VIEW = "group-view";
export const TESTCAFE_ID_GROUP_VIEW_ERROR = "group-view-error";

export default function GroupView() {
  const { data: contacts, error } = useContacts([GROUP_CONTACT]);
  return (
    <div data-testid={TESTCAFE_ID_GROUP_VIEW}>
      {!contacts && !error && <Spinner />}
      {error && (
        <Message variant="error" data-testid={TESTCAFE_ID_GROUP_VIEW_ERROR}>
          {error.message}
        </Message>
      )}
      {contacts && !contacts.length && <GroupViewEmpty />}
    </div>
  );
}
