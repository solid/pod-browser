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
import { getUrl } from "@inrupt/solid-client";
import { rdf, foaf } from "rdf-namespaces";
import Router, { useRouter } from "next/router";
import { Autocomplete } from "@material-ui/lab";
import { createStyles, InputAdornment, TextField } from "@material-ui/core";
import { Icons } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import { getProfileFromThing } from "../../../src/solidClientHelpers/profile";
import SearchContext from "../../../src/contexts/searchContext";
import { buildProfileLink } from "../../profileLink";
import styles from "./styles";

export const TESTCAFE_ID_CONTACTS_SEARCH = "contacts-search";
const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function setupOnChange(setSearch, route) {
  return (event, search) => {
    // If a row was selected, use the object with webid
    if (search && search.webId) {
      Router.push(buildProfileLink(search.webId, route));
    }

    // Otherwise, use the string value
    return setSearch(search);
  };
}

export function setupFilterOptions() {
  return (options, state) => {
    return options.filter((o) =>
      o.name.toLowerCase().includes(state.inputValue.toLowerCase())
    );
  };
}

export function setupGetOptionLabel() {
  return (o) => (!o ? "" : o.name || o);
}

export default function ContactsListSearch({ people }) {
  const { route } = useRouter();
  const { search, setSearch } = useContext(SearchContext);
  const classes = useStyles();

  const profiles = people
    .filter((profile) => !!getUrl(profile, rdf.type) === foaf.Person)
    .map(getProfileFromThing);
  const onChange = setupOnChange(setSearch, route);
  const filterOptions = setupFilterOptions();
  const getOptionLabel = setupGetOptionLabel();

  return (
    <Autocomplete
      id="ContactsSearch"
      classes={{
        root: classes.search,
        inputRoot: classes.searchInput,
      }}
      value={search}
      freeSolo
      options={profiles}
      getOptionLabel={getOptionLabel}
      filterOptions={filterOptions}
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          margin="dense"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icons name="search" />
              </InputAdornment>
            ),
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
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
