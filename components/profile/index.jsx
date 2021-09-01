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
import { Box, Paper } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Container } from "@inrupt/prism-react-components";
import { CombinedDataProvider } from "@inrupt/solid-ui-react";
import { schema } from "rdf-namespaces";
import { isHTTPError } from "../../src/error";
import PersonProfile from "./personProfile";
import PersonAvatar from "./personAvatar";
import AppProfile from "./appProfile";

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_NAME_FIELD = "profile-name-field";
export const TESTCAFE_ID_ROLE_FIELD = "profile-role-field";
export const TESTCAFE_ID_ORG_FIELD = "profile-org-field";

export default function Profile(props) {
  const { profileIri, editing, type } = props;
  const [error, setError] = useState(null);

  // TODO replace with toast error or something?
  if (error) {
    if (isHTTPError(error, 404)) {
      return (
        <Alert severity="error">
          {`Cannot fetch avatar for this WebID: ${profileIri}`}
        </Alert>
      );
    }
    return error.toString();
  }

  if (type === schema.SoftwareApplication) {
    return <AppProfile />;
  }

  return (
    <CombinedDataProvider
      datasetUrl={profileIri}
      thingUrl={profileIri}
      onError={setError}
    >
      <Container>
        <Paper style={{ marginTop: "1em" }}>
          <Box p={2}>
            <PersonAvatar profileIri={profileIri} />
            <hr />
            <PersonProfile profileIri={profileIri} editing={editing} />
          </Box>
        </Paper>
      </Container>
    </CombinedDataProvider>
  );
}

Profile.propTypes = {
  profileIri: T.string.isRequired,
  editing: T.bool,
  type: T.string.isRequired,
};

Profile.defaultProps = {
  editing: false,
};
