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

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { CircularProgress, List, ListItem } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { Button } from "@inrupt/prism-react-components";
import styles from "./styles";
import AgentAccess from "../agentAccess";
import { getPermissions } from "../../../../src/solidClientHelpers/permissions";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function AgentAccessList({ onLoading }) {
  const classes = useStyles();
  const { fetch } = useSession();
  const [permissions, setPermissions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const { dataset } = useContext(DatasetContext);

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    getPermissions(dataset, fetch).then((normalizedPermissions) => {
      setPermissions(normalizedPermissions.reverse());
      setLoading(false);
    });
  }, [dataset, fetch]);

  if (loading) return <CircularProgress color="primary" />;

  if (permissions.length === 0) {
    return <div>No access granted to individuals yet</div>;
  }

  const permissionsShown = showAll ? permissions : permissions.slice(0, 3);

  return (
    <>
      <List>
        {permissionsShown.map((permission) => (
          <ListItem key={permission.webId} className={classes.listItem}>
            <AgentAccess permission={permission} onLoading={onLoading} />
          </ListItem>
        ))}
      </List>
      {showAll ? null : (
        <Button onClick={() => setShowAll(true)} variant="action">
          Show all
        </Button>
      )}
    </>
  );
}

AgentAccessList.propTypes = {
  onLoading: T.func,
};

AgentAccessList.defaultProps = {
  onLoading: () => {},
};

export default AgentAccessList;
