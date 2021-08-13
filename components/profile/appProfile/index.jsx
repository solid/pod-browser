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
import { foaf, vcard } from "rdf-namespaces";
import clsx from "clsx";
import { getThing, getUrl } from "@inrupt/solid-client";
import {
  Avatar,
  Box,
  Paper,
  InputLabel,
  createStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Container,
  Icons,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import {
  Text,
  ThingProvider,
  DatasetProvider,
  Value,
  Image,
  Table,
  TableColumn,
} from "@inrupt/solid-ui-react";

import { vcardExtras } from "../../../src/addressBook";

import styles from "./styles";
import {
  mockApp,
  mockAppDataset,
  TOS_PREDICATE,
  POLICY_PREDICATE,
  CONTACTS_PREDICATE,
  LOGO_PREDICATE,
} from "../../../__testUtils/mockApp";
import ValueBody from "./valueCellBody";
import TypeBody from "./titleCellBody";

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

export default function AppProfile() {
  const [error, setError] = useState(null);
  const tableClass = PrismTable.useTableClass("table", "inherits");

  const classes = useStyles();
  const bem = useBem(classes);
  // TODO replace with toast error or something?
  if (error) {
    return error.toString();
  }

  const errorComponent = setupErrorComponent(bem);
  // FIXME: not sure what the contacts would look like in a real app, but possibly a dataset with things? Maybe a profile? For now it is an array of strings:
  const contactsUrl = getUrl(app, CONTACTS_PREDICATE);
  const contacts = getThing(dataset, contactsUrl);

  return (
    <Container>
      <Paper style={{ marginTop: "1em" }}>
        <Box p={2}>
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

              <hr />

              <Box mt={2}>
                <Box>
                  <InputLabel>App WebID</InputLabel>
                  <Value
                    property={vcardExtras("WebId")}
                    dataType="url"
                    autosave
                    data-testid={TESTCAFE_ID_WEBID_FIELD}
                  />
                </Box>
              </Box>
              <Box mt={2}>
                <Box>
                  <InputLabel>Terms of Service</InputLabel>
                  <Value
                    property={TOS_PREDICATE}
                    dataType="url"
                    autosave
                    data-testid={TESTCAFE_ID_TOS_FIELD}
                  />
                </Box>
              </Box>
              <Box mt={2}>
                <Box>
                  <InputLabel>Privacy Policy</InputLabel>
                  <Value
                    property={POLICY_PREDICATE}
                    dataType="url"
                    autosave
                    data-testid={TESTCAFE_ID_POLICY_FIELD}
                  />
                </Box>
              </Box>
            </ThingProvider>
            <ThingProvider thing={contacts} onError={setError}>
              <Box mt={2}>
                <InputLabel>Contact Support</InputLabel>
                <Table
                  className={clsx(tableClass, bem("table"))}
                  things={[
                    { dataset, thing: contacts },
                    { dataset, thing: contacts },
                    { dataset, thing: contacts },
                  ]}
                >
                  <TableColumn
                    property={vcard.url}
                    body={({ row }) => <TypeBody id={row.id} />}
                    header=""
                  />
                  <TableColumn
                    dataType="url"
                    property={vcard.url}
                    header=""
                    body={({ row }) => <ValueBody id={row.id} />}
                  />
                </Table>
              </Box>
            </ThingProvider>
          </DatasetProvider>
        </Box>
      </Paper>
    </Container>
  );
}
