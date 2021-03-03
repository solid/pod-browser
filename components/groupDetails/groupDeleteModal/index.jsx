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

import React, { useContext, useState } from "react";
import T from "prop-types";
import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalButtonsContainer,
  ModalContainer,
  ModalTitle,
} from "@inrupt/prism-react-components";
import { useSession } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import GroupContext from "../../../src/contexts/groupContext";
import { getGroupName } from "../../../src/models/group";
import GroupAllContext from "../../../src/contexts/groupAllContext";
import AddressBookContext from "../../../src/contexts/addressBookContext";
import Spinner from "../../spinner";
import { deleteGroup } from "../../../src/models/contact/group";
import { getContactAllFromContactsIndex } from "../../../src/models/contact";

export const TESTCAFE_ID_GROUP_DELETE_MODAL = "group-delete-modal";
export const TESTCAFE_ID_GROUP_DELETE_MODAL_TITLE = "group-delete-modal-title";
export const TESTCAFE_ID_GROUP_DELETE_MODAL_BODY = "group-delete-modal-body";
export const TESTCAFE_ID_GROUP_DELETE_MODAL_SAVE_BUTTON =
  "group-delete-modal-save-button";
export const TESTCAFE_ID_GROUP_DELETE_MODAL_CANCEL_BUTTON =
  "group-delete-modal-cancel-button";

const ID_GROUP_DELETE_MODAL_TITLE = "GroupDeleteModalTitle";

export const MESSAGE_GROUP_DELETE_MODAL_BODY =
  "Everyone in the group will lose access to anything shared with this group.";

export default function GroupDeleteModal({ handleClose, open }) {
  const { data: addressBook } = useContext(AddressBookContext);
  const { mutate: mutateGroupAll } = useContext(GroupAllContext);
  const { data: group } = useContext(GroupContext);
  const { fetch } = useSession();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const groupName = getGroupName(group);

  const onDelete = async () => {
    setProcessing(true);
    await deleteGroup(addressBook, group, fetch);
    await mutateGroupAll();
    await router.push("/groups");
    setProcessing(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid={TESTCAFE_ID_GROUP_DELETE_MODAL}
      aria-labelledby={ID_GROUP_DELETE_MODAL_TITLE}
    >
      <ModalContainer>
        {processing && <Spinner />}
        {!processing && (
          <>
            <ModalTitle
              id={ID_GROUP_DELETE_MODAL_TITLE}
              data-testid={TESTCAFE_ID_GROUP_DELETE_MODAL_TITLE}
            >
              Delete&nbsp;
              {groupName}
            </ModalTitle>
            <ModalBody data-testid={TESTCAFE_ID_GROUP_DELETE_MODAL_BODY}>
              <Content>
                <p>{MESSAGE_GROUP_DELETE_MODAL_BODY}</p>
              </Content>
            </ModalBody>
            <ModalButtonsContainer>
              <Button
                variant="secondary"
                onClick={handleClose}
                data-testid={TESTCAFE_ID_GROUP_DELETE_MODAL_CANCEL_BUTTON}
              >
                Cancel
              </Button>
              <Button
                onClick={onDelete}
                data-testid={TESTCAFE_ID_GROUP_DELETE_MODAL_SAVE_BUTTON}
              >
                Delete Group
              </Button>
            </ModalButtonsContainer>
          </>
        )}
      </ModalContainer>
    </Modal>
  );
}

GroupDeleteModal.propTypes = {
  handleClose: T.func.isRequired,
  open: T.bool.isRequired,
};
