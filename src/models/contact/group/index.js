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
  asUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getSourceUrl,
  getThing,
  saveSolidDatasetAt,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { rdf, vcard } from "rdf-namespaces";
import { v4 as uuid } from "uuid";
import { chain } from "../../../solidClientHelpers/utils";
import { joinPath } from "../../../stringHelpers";
import {
  addContactIndexToAddressBook,
  getContactAll,
  getContactIndexUrl,
} from "../index";
import { vcardExtras } from "../../../addressBook";
import { updateOrCreateDataset } from "../../dataset";

/* Model constants */
export const NAME_GROUP_INDEX_PREDICATE = vcardExtras("groupIndex");
export const GROUPS_INDEX_FILE = "groups.ttl";
export const GROUP_CONTAINER = "Group";
export const INDEX_FILE = "index.ttl";
export const GROUP_CONTACT = {
  indexFile: GROUPS_INDEX_FILE,
  container: GROUP_CONTAINER,
  indexFilePredicate: NAME_GROUP_INDEX_PREDICATE,
  contactTypeUrl: vcard.Group,
};

/* Model internal functions */
function createGroupThing(name, thingOptions) {
  return chain(
    createThing(thingOptions),
    (t) => setUrl(t, rdf.type, vcard.Group),
    (t) => setStringNoLocale(t, vcard.fn, name)
  );
}

function createIndexThing(addressBook, groupThingUrl) {
  return setUrl(addressBook.thing, vcardExtras("includesGroup"), groupThingUrl);
}

/* Model functions */
export function createGroupDatasetUrl(addressBook, id = uuid()) {
  return joinPath(addressBook.containerUrl, GROUP_CONTAINER, id, INDEX_FILE);
}

/**
 * Note that you need to refresh the cache of group index after this, e.g. mutate SWR cache
 * You also need to refresh the cache of the address book
 */
export async function saveGroup(addressBook, name, fetch) {
  // save the group resource itself
  const groupDatasetUrl = createGroupDatasetUrl(addressBook);
  const groupThingUrl = `${groupDatasetUrl}#this`;
  const groupDataset = await saveSolidDatasetAt(
    groupDatasetUrl,
    chain(
      createSolidDataset(),
      (d) => setThing(d, createGroupThing(name, { name: "this" })),
      (d) => setThing(d, createIndexThing(addressBook, groupThingUrl))
    ),
    { fetch }
  );
  // then link the group to the group index
  let updatedAddressBook = addressBook;
  let groupIndexUrl = getContactIndexUrl(addressBook, GROUP_CONTACT);
  if (!groupIndexUrl) {
    // add the index to the Address Book if it doesn't already exist
    updatedAddressBook = await addContactIndexToAddressBook(
      addressBook,
      GROUP_CONTACT,
      fetch
    );
    groupIndexUrl = getContactIndexUrl(updatedAddressBook, GROUP_CONTACT);
  }
  const groupThing = createGroupThing(name, { url: groupThingUrl });
  const indexDataset = await updateOrCreateDataset(
    groupIndexUrl,
    fetch,
    (d) => setThing(d, groupThing),
    (d) => setThing(d, createIndexThing(addressBook, groupThingUrl))
  );
  return {
    addressBook: updatedAddressBook,
    group: {
      dataset: groupDataset,
      thing: groupThing,
    },
    groupIndex: indexDataset,
  };
}

export async function getGroupAll(addressBook, fetch) {
  return getContactAll(addressBook, [GROUP_CONTACT], fetch);
}

/**
 * Note that you might need to refresh the cache of group index after this, e.g. mutate SWR cache
 */
export async function renameGroup(addressBook, group, name, fetch) {
  // update the group itself
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, setStringNoLocale(group.thing, vcard.fn, name)),
    { fetch }
  );
  // update the group index
  const groupIndexUrl = getContactIndexUrl(addressBook, GROUP_CONTACT);
  const groupIndexDataset = await getSolidDataset(groupIndexUrl, { fetch });
  const existingGroup = getThing(groupIndexDataset, asUrl(group.thing));
  const indexDataset = await saveSolidDatasetAt(
    groupIndexUrl,
    setThing(
      groupIndexDataset,
      setStringNoLocale(existingGroup, vcard.fn, name)
    ),
    { fetch }
  );
  return {
    group: {
      dataset: savedDataset,
      thing: getThing(savedDataset, asUrl(group.thing)),
    },
    groupIndex: indexDataset,
  };
}
