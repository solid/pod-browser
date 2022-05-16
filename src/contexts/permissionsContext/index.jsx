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

import React, { createContext, useState } from "react";
import PropTypes from "prop-types";
import useAllPermissions from "../../hooks/useAllPermissions";

export const defaultPermissionsContext = {
  permissions: [],
  newAgentsWebIds: [],
  /* istanbul ignore next */
  setNewAgentsWebIds: () => {},
  webIdsToDelete: [],
  /* istanbul ignore next */
  setWebIdsToDelete: () => {},
  addingWebId: false,
  /* istanbul ignore next */
  setAddingWebId: () => {},
  mutateAccessGrantBasedPermissions: () => {},
};

const PermissionsContext = createContext(defaultPermissionsContext);

function PermissionsContextProvider({ children }) {
  const { permissions, mutateAccessGrantBasedPermissions } =
    useAllPermissions();
  const [newAgentsWebIds, setNewAgentsWebIds] = useState([]);
  const [webIdsToDelete, setWebIdsToDelete] = useState([]);
  const [addingWebId, setAddingWebId] = useState(false);

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        newAgentsWebIds,
        setNewAgentsWebIds,
        webIdsToDelete,
        setWebIdsToDelete,
        addingWebId,
        setAddingWebId,
        mutateAccessGrantBasedPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

PermissionsContextProvider.propTypes = {
  children: PropTypes.node,
};

PermissionsContextProvider.defaultProps = {
  children: null,
};

export { PermissionsContextProvider };
export default PermissionsContext;
