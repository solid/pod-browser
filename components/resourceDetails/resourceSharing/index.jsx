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

/* eslint-disable camelcase, no-console, react/forbid-prop-types */

import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
} from "@material-ui/core";
import { ActionMenu, ActionMenuItem } from "@inrupt/prism-react-components";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import styles from "./styles";
import AgentAccessList from "./agentAccessList";
import AddPermissionUsingWebIdButton from "../../addPermissionUsingWebIdButton";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function ResourceSharing() {
  const actionMenuBem = ActionMenu.useBem();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  if (loading) return <CircularProgress color="primary" />;

  return (
    <>
      <ActionMenu>
        <ActionMenuItem>
          <AddPermissionUsingWebIdButton
            className={actionMenuBem("action-menu__trigger", "prompt")}
            onLoading={setLoading}
          />
        </ActionMenuItem>
      </ActionMenu>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Individual permissions
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <AgentAccessList onLoading={setLoading} />
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default ResourceSharing;
