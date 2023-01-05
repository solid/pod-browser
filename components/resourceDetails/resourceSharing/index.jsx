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

/* eslint-disable camelcase, no-console */

import React, { useState } from "react";
import T from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
} from "@mui/core";
import { ActionMenu, ActionMenuItem } from "@inrupt/prism-react-components";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { createStyles, makeStyles } from "@mui/styles";
import styles from "./styles";
import AgentAccessList from "./agentAccessList";
import AddPermissionUsingWebIdButton from "../../addPermissionUsingWebIdButton";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ResourceSharing({ startLoading }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(startLoading);

  if (loading) return <CircularProgress color="primary" />;

  return (
    <>
      <ActionMenu>
        <ActionMenuItem>
          <AddPermissionUsingWebIdButton onLoading={setLoading} />
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

ResourceSharing.propTypes = {
  startLoading: T.bool,
};

ResourceSharing.defaultProps = {
  startLoading: false,
};
