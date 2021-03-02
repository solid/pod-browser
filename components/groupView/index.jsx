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

import React, { useContext } from "react";
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { useRouter } from "next/router";
import GroupViewEmpty from "./groupViewEmpty";
import Spinner from "../spinner";
import styles from "./styles";
import ErrorMessage from "../errorMessage";
import GroupDetails from "../groupDetails";
import GroupAllContext from "../../src/contexts/groupAllContext";
import GroupContext from "../../src/contexts/groupContext";

export const TESTCAFE_ID_GROUP_VIEW = "group-view";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupView() {
  const bem = useBem(useStyles());
  const { data: groups, error: groupsError } = useContext(GroupAllContext);
  const router = useRouter();
  const selectedGroupUrl = router.query.iri;
  const { data: group, error: groupError } = useContext(GroupContext);
  const isLoading =
    (!groups && !groupsError) || (selectedGroupUrl && !group && !groupError);
  const error = groupsError || groupError;
  return (
    <div className={bem("group-view")} data-testid={TESTCAFE_ID_GROUP_VIEW}>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {!isLoading && !error && group && <GroupDetails />}
      {!isLoading && !error && !group && <GroupViewEmpty />}
    </div>
  );
}
