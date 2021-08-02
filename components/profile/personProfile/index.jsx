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
import { foaf, vcard } from "rdf-namespaces";
import {
  Avatar,
  Box,
  Paper,
  InputLabel,
  createStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Container } from "@inrupt/prism-react-components";
import { CombinedDataProvider, Text, Image } from "@inrupt/solid-ui-react";
import { isHTTPError } from "../../../src/error";
import { vcardExtras } from "../../../src/addressBook";
import ContactInfoTable, {
  CONTACT_INFO_TYPE_EMAIL,
  CONTACT_INFO_TYPE_PHONE,
} from "../contactInfoTable";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_NAME_FIELD = "profile-name-field";
export const TESTCAFE_ID_ROLE_FIELD = "profile-role-field";
export const TESTCAFE_ID_ORG_FIELD = "profile-org-field";

export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
  );
}

export default function PersonProfile({ profileIri, editing }) {
  const [error, setError] = useState(null);

  const classes = useStyles();
  const bem = useBem(classes);
  // TODO replace with toast error or something?
  if (error) {
    if (isHTTPError(error, 404)) {
      return (
        <Container>
          <Alert severity="error">
            {`Cannot fetch profile for this WebID: ${profileIri}`}
          </Alert>
        </Container>
      );
    }
    return error.toString();
  }
  const errorComponent = setupErrorComponent(bem);

  return (
    <Container>
      <Paper style={{ marginTop: "1em" }}>
        <Box p={2}>
          <CombinedDataProvider
            datasetUrl={profileIri}
            thingUrl={profileIri}
            onError={setError}
          >
            <Box alignItems="center" display="flex">
              <Box>
                <Avatar className={classes.avatar}>
                  <Image
                    property={vcard.hasPhoto}
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
                <InputLabel>Name</InputLabel>
                <Text
                  property={foaf.name}
                  edit={editing}
                  autosave
                  inputProps={{
                    className: bem("input"),
                    "data-testid": TESTCAFE_ID_NAME_FIELD,
                  }}
                />
              </Box>

              <Box mt={1}>
                <InputLabel>Role</InputLabel>
                <Text
                  property={vcard.role}
                  edit={editing}
                  inputProps={{
                    className: bem("input"),
                    "data-testid": TESTCAFE_ID_ROLE_FIELD,
                  }}
                  autosave
                />
              </Box>

              <Box mt={1}>
                <InputLabel>Organization</InputLabel>
                <Text
                  property={vcardExtras("organization-name")}
                  edit={editing}
                  inputProps={{
                    className: bem("input"),
                    "data-testid": TESTCAFE_ID_ORG_FIELD,
                  }}
                  autosave
                />
              </Box>
            </Box>

            <Box mt={4}>
              <InputLabel>Email Addresses</InputLabel>
              <ContactInfoTable
                datasetIri={profileIri}
                property={vcard.hasEmail}
                editing={editing}
                contactInfoType={CONTACT_INFO_TYPE_EMAIL}
              />
            </Box>

            <Box mt={4}>
              <InputLabel>Phone Numbers</InputLabel>
              <ContactInfoTable
                datasetIri={profileIri}
                property={vcard.hasTelephone}
                editing={editing}
                contactInfoType={CONTACT_INFO_TYPE_PHONE}
              />
            </Box>
          </CombinedDataProvider>
        </Box>
      </Paper>
    </Container>
  );
}

PersonProfile.propTypes = {
  profileIri: T.string.isRequired,
  editing: T.bool,
};

PersonProfile.defaultProps = {
  editing: false,
};
