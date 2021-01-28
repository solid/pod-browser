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
  asUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getSourceUrl,
  getThing,
  getUrlAll,
  removeUrl,
  saveSolidDatasetAt,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { rdf, vcard } from "rdf-namespaces";
import { v4 as uuid } from "uuid";
import { chain } from "../../solidClientHelpers/utils";
import { joinPath } from "../../stringHelpers";
import { getAddressBookIndexUrl, TYPE_MAP, vcardExtras } from "../addressBook";
import {
  getBaseUrl,
  updateOrCreateDataset,
} from "../../solidClientHelpers/resource";

/**
 * Contacts represent the dataset in a user's AddressBook, e.g. /contacts/Person/<unique-id>/index.ttl#this
 *
 * @typedef Group
 * @type {object}
 * @property {object} thing - The group itself
 * @property {object} dataset - The dataset that the group reside in (can be the groupIndex or the groupResource)
 */

/* Model functions */
function createGroupThing(name, thingOptions) {
  return chain(
    createThing(thingOptions),
    (t) => setUrl(t, rdf.type, vcard.Group),
    (t) => setStringNoLocale(t, vcard.fn, name)
  );
}

function createIndexThing(addressBook, groupThingUri) {
  return setUrl(addressBook.thing, vcardExtras("includesGroup"), groupThingUri);
}

export function createGroupDatasetUrl(addressBook, id = uuid()) {
  const { container } = TYPE_MAP[vcard.Group];
  return joinPath(addressBook.containerIri, container, id, "index.ttl");
}

/**
 * Note that you might need to refresh the cache of group index after this, e.g. mutate SWR cache
 */
export async function createGroup(addressBook, name, fetch) {
  const groupDatasetUri = createGroupDatasetUrl(addressBook);
  const groupThingUri = `${groupDatasetUri}#this`;
  // create the group resource itself
  const groupDataset = await saveSolidDatasetAt(
    groupDatasetUri,
    chain(
      createSolidDataset(),
      (d) => setThing(d, createGroupThing(name, { name: "this" })),
      (d) => setThing(d, createIndexThing(addressBook, groupThingUri))
    ),
    { fetch }
  );
  // link the group to the group index
  const groupIndexUri = getAddressBookIndexUrl(addressBook, vcard.Group);
  const groupThing = createGroupThing(name, { url: groupThingUri });
  await updateOrCreateDataset(
    groupIndexUri,
    fetch,
    (d) => setThing(d, groupThing),
    (d) => setThing(d, createIndexThing(addressBook, groupThingUri))
  );
  return {
    dataset: groupDataset,
    thing: groupThing,
  };
}

export async function getGroup(groupUri, fetch) {
  const dataset = await getSolidDataset(getBaseUrl(groupUri), { fetch });
  return {
    dataset,
    thing: getThing(dataset, groupUri),
  };
}

/**
 * Note that you might need to refresh the cache of group index after this, e.g. mutate SWR cache
 */
export async function renameGroup(group, name, addressBook, fetch) {
  // update the group itself
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, setStringNoLocale(group.thing, vcard.fn, name)),
    { fetch }
  );
  // update the group index
  const groupIndexUri = getAddressBookIndexUrl(addressBook, vcard.Group);
  const groupIndexDataset = await getSolidDataset(groupIndexUri, { fetch });
  const existingGroup = getThing(groupIndexDataset, asUrl(group.thing));
  await saveSolidDatasetAt(
    groupIndexUri,
    setThing(
      groupIndexDataset,
      setStringNoLocale(existingGroup, vcard.fn, name)
    ),
    { fetch }
  );
  return {
    dataset: savedDataset,
    thing: getThing(savedDataset, asUrl(group.thing)),
  };
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function addGroupMember(group, agentUri, fetch) {
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, addUrl(group.thing, vcard.hasMember, agentUri)),
    { fetch }
  );
  return {
    dataset: savedDataset,
    thing: getThing(savedDataset, asUrl(group.thing)),
  };
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function removeGroupMember(group, agentUri, fetch) {
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, removeUrl(group.thing, vcard.hasMember, agentUri)),
    { fetch }
  );
  return {
    dataset: savedDataset,
    thing: getThing(savedDataset, asUrl(group.thing)),
  };
}

/**
 * Do not return the dataset of each group member, must be loaded separately
 */
export function getGroupMembers(group) {
  return getUrlAll(group.thing, vcard.hasMember);
}
