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
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { useRouter } from "next/router";
import useContacts from "../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import GroupViewEmpty from "./groupViewEmpty";
import Spinner from "../spinner";
import styles from "./styles";
import useGroup from "../../src/hooks/useGroup";
import { getGroupUrl } from "../../src/models/group";
import ErrorMessage from "../errorMessage";
import GroupDetails from "../groupDetails";

export const TESTCAFE_ID_GROUP_VIEW = "group-view";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupView() {
  const { data: groups, error: groupsError } = useContacts([GROUP_CONTACT]);
  const bem = useBem(useStyles());
  const router = useRouter();
  const selectedGroupUrl = router.query.iri;
  const firstGroup = groups && groups.length && groups[0];
  const { data: group, error: groupError } = useGroup(
    selectedGroupUrl || (firstGroup && getGroupUrl(firstGroup))
  );
  const isLoading =
    (!groups && !groupsError) ||
    ((selectedGroupUrl || firstGroup) && !group && !groupError);
  const error = groupsError || groupError;
  return (
    <div className={bem("group-view")} data-testid={TESTCAFE_ID_GROUP_VIEW}>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {group && !isLoading && <GroupDetails group={group} />}
      {!group && !isLoading && <GroupViewEmpty />}
    </div>
  );
}
