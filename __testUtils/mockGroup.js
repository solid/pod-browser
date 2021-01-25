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

import {
  addUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { rdf, vcard } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { vcardExtras } from "../src/addressBook";
import { createGroupDatasetUrl } from "../src/models/group";

function mockGroupThing(name, groupThingUrl) {
  return chain(
    mockThingFrom(groupThingUrl),
    (t) => setUrl(t, rdf.type, vcard.Group),
    (t) => setStringNoLocale(t, vcard.fn, name)
  );
}

function mockIndexThing(addressBook, groupThingUrl) {
  return chain(mockThingFrom(addressBook.index.iri), (t) =>
    setUrl(t, vcardExtras("includesGroup"), groupThingUrl)
  );
}

export function addGroupsToAddressBook(addressBook, groupsToAdd) {
  const { groups, ...rest } = addressBook;
  return {
    ...rest,
    groups: {
      iri: addressBook.groups.iri,
      dataset: chain(
        addressBook.groups.dataset,
        ...groupsToAdd.map((group) => (d) =>
          setThing(d, mockGroupThing(group.props.name, group.iri))
        ),
        ...groupsToAdd.map((group) => (d) =>
          setThing(d, mockIndexThing(addressBook, group.iri))
        )
      ),
    },
  };
}

export default function mockGroup(
  addressBook,
  name,
  { url, id, members } = {}
) {
  const groupDatasetUrl = url || createGroupDatasetUrl(addressBook, id);
  const groupThingUrl = `${groupDatasetUrl}#this`;
  return {
    iri: groupThingUrl,
    dataset: chain(
      mockSolidDatasetFrom(groupThingUrl),
      (d) =>
        setThing(
          d,
          chain(
            mockGroupThing(name, groupThingUrl),
            ...(members || []).map((agentUrl) => (t) =>
              addUrl(t, vcard.hasMember, agentUrl)
            )
          )
        ),
      (d) => setThing(d, mockIndexThing(addressBook, groupThingUrl))
    ),
    props: {
      name,
    },
  };
}
