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

/* eslint react/jsx-props-no-spreading:off */

import React, { useState } from "react";
import { Button } from "@inrupt/prism-react-components";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import useContacts from "../../src/hooks/useContacts";
import { GROUP_CONTACT, saveGroup } from "../../src/models/contact/group";
import useAddressBook from "../../src/hooks/useAddressBook";
import { getGroupUrl } from "../../src/models/group";
import Spinner from "../spinner";

export default function CreateGroupButton({ children, ...props }) {
  const {
    data: addressBook,
    error: addressBookError,
    mutate: mutateAddressBook,
  } = useAddressBook();
  const {
    data: groups,
    error: groupsError,
    mutate: mutateGroups,
  } = useContacts([GROUP_CONTACT]);
  const { fetch } = useSession();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const onClick = async (event) => {
    event.preventDefault();
    if (processing) return;
    setProcessing(true);
    const groupName = `Group ${groups.length + 1}`;
    const { addressBook: updatedAddressBook, group } = await saveGroup(
      addressBook,
      groupName,
      fetch
    );
    await Promise.all([mutateAddressBook(updatedAddressBook), mutateGroups()]);
    const groupUrl = getGroupUrl(group);
    await router.push(`/groups/${encodeURIComponent(groupUrl)}?created`);
    setProcessing(false);
  };

  if ((!groups && !groupsError) || (!addressBook && !addressBookError))
    return null;

  if (processing) return <Spinner />;

  return (
    <Button {...props} onClick={onClick}>
      {children}
    </Button>
  );
}

CreateGroupButton.propTypes = {
  children: T.node.isRequired,
};
