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
import { createStyles, Hidden } from "@material-ui/core";
import { LinkButton } from "@inrupt/prism-react-components";
import Link from "next/link";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import GroupDetailsName from "./groupDetailsName";
import styles from "./styles";

export const TESTCAFE_ID_GROUP_DETAILS = "group-details";
export const TESTCAFE_ID_GROUP_DETAILS_BACK_LINK = "group-details-back-link";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupDetails() {
  const bem = useBem(useStyles());
  return (
    <div data-testid={TESTCAFE_ID_GROUP_DETAILS}>
      <Link href="/groups">
        <LinkButton
          variant="text"
          iconBefore="caret-left"
          className={bem("group-details-back-link")}
          data-testid={TESTCAFE_ID_GROUP_DETAILS_BACK_LINK}
        >
          All Groups
        </LinkButton>
      </Link>
      <GroupDetailsName />
    </div>
  );
}
