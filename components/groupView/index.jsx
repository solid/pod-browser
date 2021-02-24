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
import { useRouter } from "next/router";
import useContacts from "../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import GroupViewEmpty from "./groupViewEmpty";
import Spinner from "../spinner";
import styles from "./styles";
import useGroup from "../../src/hooks/useGroup";
import ErrorMessage from "../errorMessage";
import GroupDetails from "../groupDetails";
import { getSelectedGroupOrFallbackGroupUrl } from "../../src/models/groupPage";
import { getGroupName } from "../../src/models/group";

export const TESTCAFE_ID_GROUP_VIEW = "group-view";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupView() {
  const bem = useBem(useStyles());
  const { data: groups, error: groupsError } = useContacts([GROUP_CONTACT]);
  const sortedGroups = groups?.sort((a, b) =>
    getGroupName(a) < getGroupName(b) ? -1 : 1
  );
  const router = useRouter();
  const selectedGroupUrl = getSelectedGroupOrFallbackGroupUrl(
    router.query.iri,
    sortedGroups
  );
  const { data: group, error: groupError } = useGroup(selectedGroupUrl);
  const isLoading =
    (!groups && !groupsError) || (selectedGroupUrl && !group && !groupError);
  const error = groupsError || groupError;
  return (
    <div className={bem("group-view")} data-testid={TESTCAFE_ID_GROUP_VIEW}>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {group && !isLoading && <GroupDetails groupUrl={selectedGroupUrl} />}
      {!group && !isLoading && <GroupViewEmpty />}
    </div>
  );
}
