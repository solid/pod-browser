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

/* eslint react/forbid-prop-types: off */

import React, { useEffect, useState } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";
import {
  Button,
  Form,
  InputGroup,
  SimpleInput,
} from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { getGroupName } from "../../../src/models/group";
import styles from "./styles";
import Spinner from "../../spinner";
import { GROUP_CONTACT, renameGroup } from "../../../src/models/contact/group";
import useAddressBook from "../../../src/hooks/useAddressBook";
import useGroup from "../../../src/hooks/useGroup";
import ErrorMessage from "../../errorMessage";
import useContacts from "../../../src/hooks/useContacts";
import { getContactAllFromContactsIndex } from "../../../src/models/contact";

const TESTCAFE_ID_GROUP_NAME_FIELD = "group-name-field";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupDetailsName({ groupUrl }) {
  const router = useRouter();
  const { data: group, error: groupError, mutate: mutateGroup } = useGroup(
    groupUrl
  );
  const justCreated = router.query.created === "";
  const [editing, setEditing] = useState(true);
  const [processing, setProcessing] = useState(false);
  const bem = useBem(useStyles());
  const [groupName, setGroupName] = useState("");
  const fieldId = "GroupName";
  const { data: addressBook, error: addressBookError } = useAddressBook();
  const { fetch } = useSession();
  const { error: groupsError, mutate: mutateGroups } = useContacts([
    GROUP_CONTACT,
  ]);

  useEffect(() => {
    if (!group) return;
    setGroupName(getGroupName(group));
  }, [group]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (processing) return;
    setProcessing(true);

    const { group: updatedGroup, groupIndex } = await renameGroup(
      addressBook,
      group,
      groupName,
      fetch
    );
    const updatedGroups = getContactAllFromContactsIndex(groupIndex);
    console.log(
      "UPDATED GROUPS",
      updatedGroups?.map((g) => getGroupName(g))
    );
    await Promise.all([mutateGroup(updatedGroup), mutateGroups(updatedGroups)]);
    setProcessing(false);
  };

  const loading = processing || !group;

  if (loading) return <Spinner />;

  const error = addressBookError || groupError || groupsError;

  if (error) return <ErrorMessage error={error} />;

  return editing ? (
    <Form onSubmit={onSubmit} className={bem("group-details-name")}>
      <InputGroup id={fieldId} label="Group Name" variant="with-button">
        <SimpleInput
          id={fieldId}
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          variant="with-button"
          data-testid={TESTCAFE_ID_GROUP_NAME_FIELD}
        />
        <Button variant="with-input" type="submit">
          Save
        </Button>
      </InputGroup>
    </Form>
  ) : (
    <div>{groupName}</div>
  );
}

GroupDetailsName.propTypes = {
  groupUrl: T.string.isRequired,
};
