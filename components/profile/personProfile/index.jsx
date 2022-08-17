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

import React from "react";
import T from "prop-types";
import { getSourceUrl } from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import { Box, InputLabel, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Text } from "@inrupt/solid-ui-react";
import { vcardExtras } from "../../../src/addressBook";
import ContactInfoTable, {
  CONTACT_INFO_TYPE_EMAIL,
  CONTACT_INFO_TYPE_PHONE,
} from "../contactInfoTable";

import styles from "./styles";
import { profilePropTypes } from "../../../constants/propTypes";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_FIELD = "profile-name-field";
export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_ROLE_FIELD = "profile-role-field";
export const TESTCAFE_ID_ORG_FIELD = "profile-org-field";

export default function PersonProfile({ profile, profileDataset, editing }) {
  const classes = useStyles();
  const bem = useBem(classes);
  if (!profile) {
    return <span>No profile found for this WebID.</span>;
  }
  if (editing)
    return (
      <>
        <Box mt={2}>
          <Box>
            <InputLabel data-testid={TESTCAFE_ID_NAME_TITLE}>Name</InputLabel>
            <Text
              data-testid={TESTCAFE_ID_NAME_FIELD}
              property={foaf.name}
              edit={editing}
              autosave
              inputProps={{
                className: bem("input"),
                "data-testid": TESTCAFE_ID_NAME_FIELD,
              }}
              errorComponent={() => <span>{profile.webId}</span>}
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
            webId={profile.webId}
            datasetIri={getSourceUrl(profileDataset)}
            property={vcard.hasEmail}
            editing={editing}
            contactInfoType={CONTACT_INFO_TYPE_EMAIL}
          />
        </Box>

        <Box mt={4}>
          <InputLabel>Phone Numbers</InputLabel>
          <ContactInfoTable
            webId={profile.webId}
            datasetIri={getSourceUrl(profileDataset)}
            property={vcard.hasTelephone}
            editing={editing}
            contactInfoType={CONTACT_INFO_TYPE_PHONE}
          />
        </Box>
      </>
    );
  return (
    <>
      <Box mt={2}>
        <Box>
          <InputLabel data-testid={TESTCAFE_ID_NAME_TITLE}>Name</InputLabel>
          <span data-testid={TESTCAFE_ID_NAME_FIELD}>{profile.names[0]}</span>
        </Box>

        <Box mt={1}>
          <InputLabel>Role</InputLabel>
          <span>{profile.roles[0]}</span>
        </Box>

        <Box mt={1}>
          <InputLabel>Organization</InputLabel>
          <span>{profile.organizations[0]}</span>
        </Box>
      </Box>

      <Box mt={4}>
        <InputLabel>Email Addresses</InputLabel>
        <ContactInfoTable
          values={profile.contactInfo.emails}
          contactInfoType={CONTACT_INFO_TYPE_EMAIL}
        />
      </Box>

      <Box mt={4}>
        <InputLabel>Phone Numbers</InputLabel>
        <ContactInfoTable
          values={profile.contactInfo.phones}
          contactInfoType={CONTACT_INFO_TYPE_PHONE}
        />
      </Box>
    </>
  );
}

PersonProfile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  profileDataset: T.object,
  profile: profilePropTypes,
  editing: T.bool,
};

PersonProfile.defaultProps = {
  profileDataset: null,
  profile: null,
  editing: false,
};
