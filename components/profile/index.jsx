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
import { Alert, Box, Paper } from "@mui/core";
import { Container } from "@inrupt/prism-react-components";
import { schema } from "rdf-namespaces";
import PersonProfile from "./personProfile";
import PersonAvatar from "./personAvatar";
import AppProfile from "./appProfile";
import { profilePropTypes } from "../../constants/propTypes";

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_NAME_FIELD = "profile-name-field";
export const TESTCAFE_ID_ROLE_FIELD = "profile-role-field";
export const TESTCAFE_ID_ORG_FIELD = "profile-org-field";

export default function Profile({ profile, webId }) {
  // TODO replace with toast error or something?
  if (!profile) {
    return (
      <Alert severity="error">
        {`Cannot fetch avatar for this WebID: ${webId}`}
      </Alert>
    );
  }

  if (profile.types.includes(schema.SoftwareApplication)) {
    return <AppProfile />;
  }

  return (
    <Container>
      <Paper style={{ marginTop: "1em" }}>
        <Box p={2}>
          <PersonAvatar webId={profile.webId} profile={profile} />
          <hr />
          <PersonProfile profile={profile} />
        </Box>
      </Paper>
    </Container>
  );
}

Profile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  profile: profilePropTypes,
  webId: T.string.isRequired,
};

Profile.defaultProps = {
  profile: null,
};
