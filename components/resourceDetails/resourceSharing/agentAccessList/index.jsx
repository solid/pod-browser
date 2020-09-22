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

/* eslint-disable camelcase */

import React from "react";
import {
  Avatar,
  createStyles,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import { displayProfileName } from "../../../../src/solidClientHelpers/profile";
import styles from "../../styles";
import PermissionsForm from "../../../permissionsForm";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-web-id";

export function handleSave({
  onSubmit,
  saveFn,
  onSave,
  profile,
  iri,
  webId,
  fetch,
}) {
  return async (access) => {
    onSubmit(profile, access);

    const response = await saveFn({
      iri,
      webId,
      access,
      fetch,
    });

    onSave(profile, response);

    return response;
  };
}

function AgentAccessList({ iri, onSave, onSubmit, permissions, saveFn, warn }) {
  const classes = useStyles();
  const {
    session: { fetch },
  } = useSession();
  if (permissions.length === 0) return null;

  return (
    <List>
      {permissions.map((permission) => {
        const { profile, webId } = permission;
        const { avatar } = profile;
        const name = displayProfileName(profile);
        const saveHandler = handleSave({
          fetch,
          iri,
          onSave,
          onSubmit,
          profile,
          saveFn,
          webId,
        });
        return (
          <ListItem key={webId} className={classes.listItem}>
            <Avatar className={classes.avatar} alt={name} src={avatar} />
            <Typography
              data-testid={TESTCAFE_ID_AGENT_WEB_ID}
              className={classes.detailText}
            >
              {name}
            </Typography>
            <PermissionsForm
              key={webId}
              permission={permission}
              warnOnSubmit={warn}
              onSave={saveHandler}
            />
          </ListItem>
        );
      })}
    </List>
  );
}

AgentAccessList.defaultProps = {
  warn: false,
  onSave: () => {},
  onSubmit: () => {},
};

AgentAccessList.propTypes = {
  iri: T.string.isRequired,
  onSave: T.func,
  onSubmit: T.func,
  permissions: T.arrayOf(T.object).isRequired,
  saveFn: T.func.isRequired,
  warn: T.bool,
};

export default AgentAccessList;
