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

/* eslint react/forbid-prop-types: off, react/jsx-props-no-spreading: off */

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import {
  Button,
  Form,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalButtonsContainer,
  ModalTitle,
  ModalContainer,
} from "@inrupt/prism-react-components";
import { vcard } from "rdf-namespaces/dist/index";
import { getGroupDescription, getGroupName } from "../../../src/models/group";
import Spinner from "../../spinner";
import { renameGroup } from "../../../src/models/contact/group";
import ErrorMessage from "../../errorMessage";
import { getContactAllFromContactsIndex } from "../../../src/models/contact";
import GroupAllContext from "../../../src/contexts/groupAllContext";
import AddressBookContext from "../../../src/contexts/addressBookContext";
import GroupContext from "../../../src/contexts/groupContext";

export const TESTCAFE_ID_GROUP_DETAILS_MODAL = "group-details-modal";
export const TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD =
  "group-details-modal-name-field";
export const TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD =
  "group-details-modal-description-field";
export const TESTCAFE_ID_GROUP_DETAILS_MODAL_SAVE_BUTTON =
  "group-details-modal-save-button";
export const TESTCAFE_ID_GROUP_DETAILS_MODAL_CANCEL_BUTTON =
  "group-details-modal-cancel-button";

const ID_GROUP_DETAILS_TITLE = "GroupDetailsTitle";

export const MESSAGE_GROUP_DETAILS_MODAL_NAME_REQUIRED = "Name is required";

export const LIMITATION_GROUP_DETAILS_MODAL_NAME_MAX_LENGTH = 50;
export const LIMITATION_GROUP_DETAILS_MODAL_DESCRIPTION_MAX_LENGTH = 250;

export default function GroupDetailsModal({ handleClose, open }) {
  const {
    data: group,
    error: groupError,
    mutate: mutateGroup,
    isValidating: groupIsValidating,
  } = useContext(GroupContext);
  const {
    data: addressBook,
    error: addressBookError,
    isValidating: addressBookIsValidating,
  } = useContext(AddressBookContext);
  const {
    error: groupsError,
    mutate: mutateGroups,
    isValidating: groupAllIsValidating,
  } = useContext(GroupAllContext);
  const { fetch } = useSession();
  const [processing, setProcessing] = useState(false);
  const nameFieldId = "GroupName";
  const [groupName, setGroupName] = useState("");
  const descriptionFieldId = "GroupDescription";
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (!group) return;
    setGroupName(getGroupName(group));
    setGroupDescription(getGroupDescription(group));
  }, [group]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!groupName) return;
    setProcessing(true);

    const { group: updatedGroup, groupIndex } = await renameGroup(
      addressBook,
      group,
      groupName,
      fetch,
      {
        [vcard.note]: groupDescription,
      }
    );
    const updatedGroups = getContactAllFromContactsIndex(groupIndex);
    await Promise.all([mutateGroup(updatedGroup), mutateGroups(updatedGroups)]);
    setProcessing(false);
    handleClose();
  };

  const loading =
    processing ||
    groupIsValidating ||
    addressBookIsValidating ||
    groupAllIsValidating;

  if (loading) return <Spinner />;

  const error = addressBookError || groupError || groupsError;

  if (error) return <ErrorMessage error={error} />;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid={TESTCAFE_ID_GROUP_DETAILS_MODAL}
      aria-labelledby={ID_GROUP_DETAILS_TITLE}
    >
      <ModalContainer>
        <ModalTitle id={ID_GROUP_DETAILS_TITLE}>Edit Group Details</ModalTitle>
        <ModalBody>
          <Form onSubmit={onSubmit}>
            <Input
              id={nameFieldId}
              label="Group Name"
              value={groupName}
              invalidMessage={
                groupName ? null : MESSAGE_GROUP_DETAILS_MODAL_NAME_REQUIRED
              }
              onChange={(event) => setGroupName(event.target.value)}
              data-testid={TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD}
              required
              maxLength={LIMITATION_GROUP_DETAILS_MODAL_NAME_MAX_LENGTH}
              autoFocus
            />
            <Textarea
              id={descriptionFieldId}
              label="Group Description (Optional)"
              value={groupDescription}
              onChange={(event) => setGroupDescription(event.target.value)}
              data-testid={TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD}
              maxLength={LIMITATION_GROUP_DETAILS_MODAL_DESCRIPTION_MAX_LENGTH}
            />
          </Form>
        </ModalBody>
        <ModalButtonsContainer>
          <Button
            data-testid={TESTCAFE_ID_GROUP_DETAILS_MODAL_CANCEL_BUTTON}
            variant="secondary"
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
          <Button
            data-testid={TESTCAFE_ID_GROUP_DETAILS_MODAL_SAVE_BUTTON}
            onClick={onSubmit}
          >
            Save
          </Button>
        </ModalButtonsContainer>
      </ModalContainer>
    </Modal>
  );
}

GroupDetailsModal.propTypes = {
  handleClose: T.func.isRequired,
  open: T.bool.isRequired,
};
