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
import { Icons } from "@inrupt/prism-react-components";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./styles";
import Spinner from "../spinner";
import CreateGroupButton from "../createGroupButton";
import { getGroupName, getGroupUrl } from "../../src/models/group";
import ErrorMessage from "../errorMessage";
import GroupListEmpty from "./groupListEmpty";
import GroupAllContext from "../../src/contexts/groupAllContext";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_GROUP_LIST = "group-list";

export default function GroupList() {
  const { data: groups, error } = useContext(GroupAllContext);
  const bem = useBem(useStyles());
  const router = useRouter();
  const selectedGroupUrl = router.query.iri;
  const sortedGroups = groups?.sort((a, b) =>
    getGroupName(a) < getGroupName(b) ? -1 : 1
  );
  console.log(
    "GROUPS",
    groups?.map((g) => getGroupName(g)),
    sortedGroups?.map((g) => getGroupName(g))
  );
  return (
    <div data-testid={TESTCAFE_ID_GROUP_LIST}>
      <div className={bem("group-list-header")}>
        <div className={bem("group-list-header__title")}>Groups</div>
        <CreateGroupButton iconBefore="add" variant="small">
          New Group
        </CreateGroupButton>
      </div>
      {!groups && !error && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {groups && groups.length === 0 && <GroupListEmpty />}
      {groups && groups.length > 0 && (
        <ul className={bem("group-list")}>
          {sortedGroups.map((group, index) => {
            const groupUrl = getGroupUrl(group);
            const groupName = getGroupName(group);
            const selected = selectedGroupUrl
              ? selectedGroupUrl === groupUrl
              : index === 0;
            return (
              <li className={bem("group-list__item")} key={groupUrl}>
                <Link href={`/groups/${encodeURIComponent(groupUrl)}`}>
                  <a className={bem("group-list__link", { selected })}>
                    <Icons
                      name="users"
                      className={bem("group-list__icon", { selected })}
                    />
                    <span className={bem("group-list__text")}>{groupName}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
