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
import { foaf } from "rdf-namespaces";
import { Avatar, Box, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Icons } from "@inrupt/prism-react-components";
import {
  Text,
  ThingProvider,
  DatasetProvider,
  Image,
} from "@inrupt/solid-ui-react";

import styles from "./styles";
import {
  mockApp,
  mockAppDataset,
  LOGO_PREDICATE,
} from "../../../__testUtils/mockApp";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_TITLE = "app-name-title";
export const TESTCAFE_ID_NAME_FIELD = "app-name-field";
export const TESTCAFE_ID_WEBID_FIELD = "app-webid-field";
export const TESTCAFE_ID_TOS_FIELD = "app-tos-field";
export const TESTCAFE_ID_POLICY_FIELD = "app-policy-field";

export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("appAvatar")} alt="Contact avatar">
      <Icons className={bem("appAvatar")} name="project-diagram" />
    </Avatar>
  );
}

// temporarily using mock data for apps for dev purposes until we have audit list
const app = mockApp();
const dataset = mockAppDataset();

export default function AppAvatar() {
  const [error, setError] = useState(null);

  const classes = useStyles();
  const bem = useBem(classes);
  // TODO replace with toast error or something?
  if (error) {
    return error.toString();
  }

  const errorComponent = setupErrorComponent(bem);

  return (
    <DatasetProvider solidDataset={dataset}>
      <ThingProvider thing={app} onError={setError}>
        <Box alignItems="center" display="flex">
          <Box>
            <Avatar className={classes.appAvatar} alt="Contact avatar">
              <Image
                property={LOGO_PREDICATE}
                width={120}
                errorComponent={errorComponent}
              />
            </Avatar>
          </Box>

          <Box p={2}>
            <h3 data-testid={TESTCAFE_ID_NAME_TITLE}>
              <Text property={foaf.name} />
            </h3>
          </Box>
        </Box>
      </ThingProvider>
    </DatasetProvider>
  );
}
