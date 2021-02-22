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

import React, { useContext, useState } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import { vcard } from "rdf-namespaces";
import {
  DatasetProvider,
  ThingProvider,
  useSession,
  Value,
} from "@inrupt/solid-ui-react";
import {
  Button,
  Form,
  Input,
  InputGroup,
  SimpleInput,
} from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { mutate } from "swr";
import { getGroupName, getGroupUrl } from "../../../src/models/group";
import styles from "./styles";
import Spinner from "../../spinner";
import { GROUP_CONTACT, renameGroup } from "../../../src/models/contact/group";
import useAddressBook from "../../../src/hooks/useAddressBook";
import useGroup from "../../../src/hooks/useGroup";
import ErrorMessage from "../../errorMessage";
import useContacts from "../../../src/hooks/useContacts";
import ContactsContext from "../../../src/contexts/contactsContext";

const TESTCAFE_ID_GROUP_NAME_FIELD = "group-name-field";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupDetailsName({ group }) {
  const router = useRouter();
  const justCreated = router.query.created === "";
  const [editing, setEditing] = useState(true);
  const [processing, setProcessing] = useState(false);
  const bem = useBem(useStyles());
  const [groupName, setGroupName] = useState(getGroupName(group));
  const fieldId = "GroupName";
  const { data: addressBook, error: addressBookError } = useAddressBook();
  const { fetch } = useSession();
  const { error: groupError, mutate: mutateGroup } = useGroup(
    getGroupUrl(group)
  );
  const {
    contactsSWR: { error: groupsError, mutate: mutateGroups },
  } = useContext(ContactsContext);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (processing) return;
    setProcessing(true);

    const { group: updatedGroup } = await renameGroup(
      addressBook,
      group,
      groupName,
      fetch
    );
    await mutateGroups();
    // await mutateAddressBook();
    // await mutateGroups();
    // await mutateGroup(updatedGroup);

    setProcessing(false);
    // setEditing(false);
  };

  if (processing) return <Spinner />;

  const error = addressBookError || groupError || groupsError;

  if (error) return <ErrorMessage error={error} />;

  return editing ? (
    <Form onSubmit={onSubmit} className={bem("group-details-name")}>
      <InputGroup id={fieldId} label="Group Name" variant="with-button">
        <SimpleInput
          id={fieldId}
          defaultValue={groupName}
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
  group: T.shape({
    dataset: T.object.isRequired,
    thing: T.object.isRequired,
  }).isRequired,
};
