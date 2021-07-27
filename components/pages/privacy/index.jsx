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

import { schema } from "rdf-namespaces";
import React, { useState } from "react";
import { DetailsMenuProvider } from "../../../src/contexts/detailsMenuContext";
import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import AgentList from "../../agentList";
import Tabs from "../../tabs";
import ContactsListSearch from "../../contactsList/contactsListSearch";
import { SearchProvider } from "../../../src/contexts/searchContext";

export const TESTCAFE_ID_TAB_ALL = "tab-all";
export const TESTCAFE_ID_TAB_PEOPLE = "tab-people";
export const TESTCAFE_ID_TAB_APPS = "tab-apps";
const PERSON_CONTACT_TYPE = schema.Person;
// FIXME: replace with app contact type iri
const APP_CONTACT_TYPE = schema.SoftwareApplication; // this string for now until we define what type the app contact will be

export default function PrivacyPage() {
  useRedirectIfLoggedOut();
  const [search, setSearch] = useState("");
  const [searchValues, setSearchValues] = useState(null);
  const [selectedTabValue, setSelectedTabValue] = useState("all");

  const tabs = [
    {
      label: "All",
      testid: TESTCAFE_ID_TAB_ALL,
      value: "all",
    },
    {
      label: "People",
      testid: TESTCAFE_ID_TAB_PEOPLE,
      value: PERSON_CONTACT_TYPE,
    },
    {
      label: "Apps",
      testid: TESTCAFE_ID_TAB_APPS,
      value: APP_CONTACT_TYPE,
    },
  ];

  const handleTabChange = (event, value) => {
    setSelectedTabValue(value);
    // FIXME: for now until we do display a contact list with apps
    if (value === APP_CONTACT_TYPE) {
      setSearchValues(null);
    }
  };

  return (
    <DetailsMenuProvider>
      <SearchProvider search={search} setSearch={setSearch}>
        <>
          <Tabs
            tabs={tabs}
            handleTabChange={handleTabChange}
            selectedTabValue={selectedTabValue}
          >
            {searchValues && <ContactsListSearch contacts={searchValues} />}
          </Tabs>
          <AgentList
            contactType={selectedTabValue}
            setSearchValues={setSearchValues}
          />
        </>
      </SearchProvider>
    </DetailsMenuProvider>
  );
}
