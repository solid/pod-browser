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

/* eslint-disable react/jsx-props-no-spreading */
// Otherwise Autocomplete won't work properly

import React, { useContext } from "react";
import T from "prop-types";
import { Autocomplete } from "@material-ui/lab";
import { createStyles, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getProfileFromPersonDataset } from "../../../src/solidClientHelpers/profile";
import SearchContext from "../../../src/contexts/searchContext";
import styles from "./styles";

const TESTCAFE_ID_CONTACTS_SEARCH = "contacts-search";
const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ContactsListSearch({ people }) {
  const { setSearch } = useContext(SearchContext);
  const classes = useStyles();

  const profiles = people.map(getProfileFromPersonDataset);
  const profileNames = profiles
    .filter((profile) => !!profile.name)
    .map((profile) => profile.name);

  return (
    <Autocomplete
      id="ContactsSearch"
      classes={{
        root: classes.search,
        inputRoot: classes.searchInput,
      }}
      freeSolo
      options={profileNames}
      // TODO: When we introduce profile page, we need to change onChange to redirect
      // But for now we simply update search
      onChange={(event, search) => setSearch(search)}
      renderInput={(params) => (
        <TextField
          {...params}
          margin="dense"
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            "data-testid": TESTCAFE_ID_CONTACTS_SEARCH,
          }}
        />
      )}
    />
  );
}

ContactsListSearch.propTypes = {
  people: T.arrayOf(T.object),
};

ContactsListSearch.defaultProps = {
  people: [],
};
