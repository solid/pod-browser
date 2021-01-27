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
  getStringNoLocale,
  getThing,
  getThingAll,
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
import { TYPE_MAP, vcardExtras } from "../../addressBook";
import { getAddressBookGroupIndexUrl } from "../addressBook";
import { getBaseUrl } from "../../solidClientHelpers/resource";

/**
 * Contacts represent the dataset in a user's AddressBook, e.g. /contacts/Person/<unique-id>/index.ttl#this
 *
 * @typedef Group
 * @type {object}
 * @property {string} iri
 * @property {object | null} dataset
 * @property {object} props
 * @property {string} props.name
 * @property {string | null} props.description
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
  return chain(createThing({ url: addressBook.index.iri }), (t) =>
    setUrl(t, vcardExtras("includesGroup"), groupThingUri)
  );
}

export function createGroupDatasetUrl(addressBook, id = uuid()) {
  const { container } = TYPE_MAP[vcard.Group];
  return joinPath(addressBook.containerIri, container, id, "index.ttl");
}

/**
 * Note that you might need to refresh the cache of group index after this, e.g. mutate SWR cache
 */
export async function createGroup(name, addressBook, fetch) {
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
  const groupIndexUri = getAddressBookGroupIndexUrl(addressBook);
  const groupIndexDataset = await getSolidDataset(groupIndexUri, { fetch });
  await saveSolidDatasetAt(
    groupIndexUri,
    chain(
      groupIndexDataset,
      (d) => setThing(d, createGroupThing(name, { url: groupThingUri })),
      (d) => setThing(d, createIndexThing(addressBook, groupThingUri))
    ),
    { fetch }
  );
  return {
    dataset: groupDataset,
    iri: groupThingUri,
  };
}

/**
 * Do not return the dataset of each group, must be loaded separately (e.g. using getGroup)
 */
export function getGroups(addressBook) {
  return getThingAll(addressBook.groups.dataset)
    .filter((t) => getUrlAll(t, rdf.type).includes(vcard.Group))
    .map((t) => ({
      dataset: null,
      iri: asUrl(t),
    }));
}

export async function getGroup(groupUri, fetch) {
  const groupDataset = await getSolidDataset(getBaseUrl(groupUri), { fetch });
  const groupThing = getThing(groupDataset, groupUri);
  return {
    dataset: groupDataset,
    iri: groupUri,
  };
}

/**
 * Note that you might need to refresh the cache of group index after this, e.g. mutate SWR cache
 */
export async function updateGroup(group, name, addressBook, fetch) {
  const savedDataset = await saveSolidDatasetAt(
    getBaseUrl(group.iri),
    setThing(
      group.dataset,
      setStringNoLocale(getThing(group.dataset, group.iri), vcard.fn, name)
    ),
    { fetch }
  );
  const groupIndexUri = getAddressBookGroupIndexUrl(addressBook);
  const groupIndexDataset = await getSolidDataset(groupIndexUri, { fetch });
  const existingGroup = getThing(groupIndexDataset, group.iri);
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
    iri: group.iri,
  };
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function addMember(group, agentUri, fetch) {
  const groupThing = getThing(group.dataset, group.iri);
  const savedDataset = await saveSolidDatasetAt(
    getBaseUrl(group.iri),
    setThing(group.dataset, addUrl(groupThing, vcard.hasMember, agentUri)),
    { fetch }
  );
  return {
    dataset: savedDataset,
    iri: group.iri,
  };
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function removeMember(group, agentUri, fetch) {
  const groupThing = getThing(group.dataset, group.iri);
  const savedDataset = await saveSolidDatasetAt(
    getBaseUrl(group.iri),
    setThing(group.dataset, removeUrl(groupThing, vcard.hasMember, agentUri)),
    { fetch }
  );
  return {
    dataset: savedDataset,
    iri: group.iri,
  };
}

/**
 * Do not return the dataset of each group member, must be loaded separately
 */
export function getMembers(group) {
  const groupThing = getThing(group.dataset, group.iri);
  return getUrlAll(groupThing, vcard.hasMember).map((agentUrl) => ({
    iri: agentUrl,
    dataset: null,
  }));
}
