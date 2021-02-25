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

import React, { useContext, useEffect, useState } from "react";
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
import { useRouter } from "next/router";
import { getGroupName } from "../../../src/models/group";
import styles from "./styles";
import Spinner from "../../spinner";
import { renameGroup } from "../../../src/models/contact/group";
import ErrorMessage from "../../errorMessage";
import { getContactAllFromContactsIndex } from "../../../src/models/contact";
import GroupAllContext from "../../../src/contexts/groupAllContext";
import AddressBookContext from "../../../src/contexts/addressBookContext";
import GroupContext from "../../../src/contexts/groupContext";

export const TESTCAFE_ID_GROUP_DETAILS_NAME = "group-details-name";
export const TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD = "group-details-name-field";
export const TESTCAFE_ID_GROUP_DETAILS_NAME_BUTTON =
  "group-details-name-button";

export const MESSAGE_GROUP_DETAILS_NAME_REQUIRED = "Name is required";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupDetailsName() {
  const router = useRouter();
  const { data: group, error: groupError, mutate: mutateGroup } = useContext(
    GroupContext
  );
  const [processing, setProcessing] = useState(false);
  const bem = useBem(useStyles());
  const [groupName, setGroupName] = useState("");
  const fieldId = "GroupName";
  const { data: addressBook, error: addressBookError } = useContext(
    AddressBookContext
  );
  const { fetch } = useSession();
  const { error: groupsError, mutate: mutateGroups } = useContext(
    GroupAllContext
  );

  useEffect(() => {
    if (!group) return;
    setGroupName(getGroupName(group));
  }, [group]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!groupName) return;
    setProcessing(true);

    const { group: updatedGroup, groupIndex } = await renameGroup(
      addressBook,
      group,
      groupName,
      fetch
    );
    const updatedGroups = getContactAllFromContactsIndex(groupIndex);
    await Promise.all([mutateGroup(updatedGroup), mutateGroups(updatedGroups)]);
    setProcessing(false);
  };

  const loading = processing || !group;

  if (loading) return <Spinner />;

  const error = addressBookError || groupError || groupsError;

  if (error) return <ErrorMessage error={error} />;

  return (
    <Form
      onSubmit={onSubmit}
      className={bem("group-details-name")}
      data-testid={TESTCAFE_ID_GROUP_DETAILS_NAME}
    >
      <InputGroup
        id={fieldId}
        label="Group Name"
        variant="with-button"
        invalidMessage={groupName ? null : MESSAGE_GROUP_DETAILS_NAME_REQUIRED}
      >
        <SimpleInput
          id={fieldId}
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          variant="with-button"
          data-testid={TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD}
          required
          autoFocus={router.query.created !== undefined}
        />
        <Button
          variant="with-input"
          type="submit"
          data-testid={TESTCAFE_ID_GROUP_DETAILS_NAME_BUTTON}
        >
          Save
        </Button>
      </InputGroup>
    </Form>
  );
}
