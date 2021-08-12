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

import React, { useState } from "react";
import T from "prop-types";
import PermissionsContext, {
  defaultPermissionsContext,
} from "../src/contexts/permissionsContext";

const permissions = [
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example1.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 1",
      types: ["https://schema.org/Person"],
    },
    alias: "editors",
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example2.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 2",
      types: ["https://schema.org/Person"],
    },
    alias: "editors",
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example3.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 3",
      types: ["https://schema.org/Person"],
    },
    alias: "editors",
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    alias: "editors",
    webId: "https://example.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 0",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    alias: "editors",
    webId: "https://example4.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 4",
      types: ["https://schema.org/Person"],
    },
    inherited: true,
  },
];

export default function mockBookmarksContextProvider(value) {
  function PermissionsContextProvider({ children }) {
    const [newAgentsWebIds, setNewAgentsWebIds] = useState(
      value?.newAgentsWebIds || []
    );
    const [webIdsToDelete, setWebIdsToDelete] = useState(
      value?.webIdsToDelete || []
    );
    const [addingWebId, setAddingWebId] = useState(value?.addingWebId || false);

    return (
      <PermissionsContext.Provider
        value={{
          ...defaultPermissionsContext,
          permissions: value?.permissions || permissions,
          webIdsToDelete,
          setWebIdsToDelete: value?.setWebIdsToDelete || setWebIdsToDelete,
          addingWebId,
          setAddingWebId: value?.setAddingWebId || setAddingWebId,
          newAgentsWebIds,
          setNewAgentsWebIds: value?.setNewAgentsWebIds || setNewAgentsWebIds,
          ...value,
        }}
      >
        {children}
      </PermissionsContext.Provider>
    );
  }

  PermissionsContextProvider.propTypes = {
    children: T.node,
  };

  PermissionsContextProvider.defaultProps = {
    children: null,
  };

  return PermissionsContextProvider;
}
