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
  getSolidDataset,
  getStringNoLocale,
  getProfileAll,
  getThing,
  getUrl,
  getUrlAll,
  getSourceUrl,
  getEffectiveAccess,
} from "@inrupt/solid-client";
import { foaf, rdf, schema, space, vcard, ldp, rdfs } from "rdf-namespaces";
import { getProfileIriFromContactThing, vcardExtras } from "../addressBook";

export function displayProfileName(profile) {
  if (!profile) return null;
  if (profile.names?.length) return profile.names[0];
  return profile.webId;
}

export function getProfileFromPersonThing(profileThing) {
  return {
    avatar: getUrl(profileThing, vcard.hasPhoto),
    name:
      getStringNoLocale(profileThing, foaf.name) ||
      getStringNoLocale(profileThing, vcard.fn),
    nickname:
      getStringNoLocale(profileThing, vcard.nickname) ||
      getStringNoLocale(profileThing, foaf.nick),
    webId: getProfileIriFromContactThing(profileThing),
    types: getUrlAll(profileThing, rdf.type),
  };
}

export const TYPE_MAP = {
  [foaf.Person]: getProfileFromPersonThing,
  [schema.Person]: getProfileFromPersonThing,
};

export function getProfileFromThingError(contactThing) {
  const contact = getProfileIriFromContactThing(contactThing);
  return new Error(`Cannot handle profile for contact: ${contact}`);
}

export function getProfileFromThing(contactThing) {
  const types = getUrlAll(contactThing, rdf.type);
  const profileFn = TYPE_MAP[types.find((type) => TYPE_MAP[type])];

  if (!profileFn) {
    throw getProfileFromThingError(contactThing);
  }

  return profileFn(contactThing);
}

export function getPodConnectedToProfile(profile, location) {
  const pods = profile ? profile.pods || [] : [];
  return pods.find((pod) => location.startsWith(pod));
}

export function locationIsConnectedToProfile(profile, location) {
  return !!getPodConnectedToProfile(profile, location);
}

export function packageProfile(webId, dataset, pods, inbox) {
  const profile = getThing(dataset, webId);
  return {
    ...getProfileFromPersonThing(profile),
    webId,
    dataset,
    pods: pods || getUrlAll(profile, space.storage) || [],
    inbox: inbox || getUrl(profile, ldp.inbox),
  };
}

export async function fetchProfile(webId, fetch) {
  const profiles = await getProfileAll(webId, { fetch });
  const {
    webIdProfile,
    altProfileAll: [altProfile],
  } = profiles;

  let profileDataset = webIdProfile;
  let webIdUrl = webId;

  if (altProfile) {
    webIdUrl = getSourceUrl(altProfile);
    profileDataset = altProfile;
  }

  const pods = getUrlAll(getThing(webIdProfile, webId), space.storage);
  const inbox = getUrl(getThing(webIdProfile, webId), ldp.inbox);

  return packageProfile(webIdUrl, profileDataset, pods, inbox);
}

export async function getFullProfile(webId, session) {
  const profiles = await getProfileAll(webId);
  const profile = {
    names: [],
    avatars: [],
    types: [],
    webId,
    roles: [],
    pods: [],
    organizations: [],
    editableProfileDatasets: [],
    contactInfo: {
      phones: [],
      emails: [],
    },
  };

  const profileDataItems = [
    {
      label: "names",
      getDataItem: getStringNoLocale,
      properties: [foaf.name, vcard.fn],
    },
    {
      label: "avatars",
      getDataItem: getUrl,
      properties: [vcard.hasPhoto],
    },
    {
      label: "types",
      getDataItem: getUrl,
      properties: [rdf.type],
    },
    {
      label: "roles",
      getDataItem: getStringNoLocale,
      properties: [vcard.role],
    },
    {
      label: "organizations",
      getDataItem: getStringNoLocale,
      properties: [vcardExtras("organization-name")],
    },
    {
      label: "pods",
      getDataItem: getUrl,
      properties: [space.storage],
    },
  ];

  const contactInfoDataItems = [
    {
      label: "phones",
      properties: [vcard.hasTelephone],
    },
    {
      label: "emails",
      properties: [vcard.hasEmail],
    },
  ];

  // Note: the WebID doc is handled separately from rest of documents because of the issues with authenticated fetches and checking effective access to the resource

  // step 1: find preferences file in webId doc
  const readableProfileDocuments = [...profiles.altProfileAll];
  const webIdProfileThing = getThing(profiles.webIdProfile, webId);
  const preferencesFileUrl = getUrl(webIdProfileThing, space.preferencesFile);

  // step 2: seeAlso(s) within preferences file
  if (preferencesFileUrl && webId === session.info.webId) {
    try {
      const preferencesFile = await getSolidDataset(preferencesFileUrl, {
        fetch,
      });
      const preferencesFileThing = getThing(preferencesFile, webId);
      const seeAlsoUrls = getUrlAll(preferencesFileThing, rdfs.seeAlso);
      seeAlsoUrls.forEach(async (url) => {
        const seeAlsoDocument = await getSolidDataset(url, {
          fetch: session.fetch,
        });
        if (seeAlsoDocument) readableProfileDocuments.push(seeAlsoDocument);
      });
    } catch (e) {
      // ignore, if we cannot get this we move on
    }
  }
  // step 3: seeAlso(s) within webID doc (and isPrimaryTopicOf)
  const extendedProfilesUrls = getUrlAll(webIdProfileThing, rdfs.seeAlso);

  extendedProfilesUrls.push(getUrl(webIdProfileThing, foaf.isPrimaryTopicOf));
  const extendedProfileDocuments = await Promise.all(
    extendedProfilesUrls.map((url) => {
      return (
        url &&
        getSolidDataset(url, {
          fetch: session.fetch,
        })
      );
    })
  );
  readableProfileDocuments.push(...extendedProfileDocuments);
  // try to find profile data in WebId document first:
  profileDataItems.forEach((dataItem) => {
    dataItem.properties.forEach((property) => {
      const value = dataItem.getDataItem(webIdProfileThing, property);
      if (value) profile[dataItem.label].push(value);
    });
  });
  // try the rest of the readable documents
  readableProfileDocuments.forEach((doc) => {
    if (!doc) return;
    const webIdSubjectThing = getThing(doc, webId);
    const storageThing = getThing(doc, getSourceUrl(doc));
    const thing = webIdSubjectThing ?? storageThing;
    profileDataItems.forEach((dataItem) => {
      dataItem.properties.forEach((property) => {
        const value = dataItem.getDataItem(thing, property);
        if (value) profile[dataItem.label].push(value);
      });
    });
  });

  // find the editable profile datasets
  // check if webid is editable
  const { user: profileEditingAccess } = getEffectiveAccess(
    profiles.webIdProfile
  );
  const isProfileEditable =
    profileEditingAccess.write || profileEditingAccess.append;
  if (isProfileEditable) {
    profile.editableProfileDatasets.push(profiles.webIdProfile);
  }
  // rest of documents
  readableProfileDocuments.forEach((doc) => {
    if (!doc) return;
    const { user: profileEditingAccess } = getEffectiveAccess(doc);
    const isProfileEditable =
      profileEditingAccess.write || profileEditingAccess.append;
    if (isProfileEditable) {
      profile.editableProfileDatasets.push(doc);
    }
  });

  // find contact info
  // in webid profile
  const webIdSubjectThing = getThing(profiles.webIdProfile, webId);
  contactInfoDataItems.forEach((item) => {
    item.properties.forEach((property) => {
      const contactDetailUrls =
        webIdSubjectThing && getUrlAll(webIdSubjectThing, property);
      const contactDetailThings = contactDetailUrls?.map(
        (url) => profiles.webIdProfile && getThing(profiles.webIdProfile, url)
      );
      contactDetailThings.forEach((contactDetailItem) => {
        const contactItem = {
          type: getUrl(contactDetailItem, rdf.type),
          value: getUrl(contactDetailItem, vcard.value),
        };
        profile.contactInfo[item.label].push(contactItem);
      });
    });
  });

  // in rest of readable docs
  readableProfileDocuments.forEach((doc) => {
    if (!doc) return;
    const webIdSubjectThing = getThing(doc, webId);
    const storageThing = getThing(doc, getSourceUrl(doc));
    const thing = webIdSubjectThing ?? storageThing;
    contactInfoDataItems.forEach((item) => {
      item.properties.forEach((property) => {
        const contactDetailUrls = thing && getUrlAll(thing, property);
        const contactDetailThings = contactDetailUrls?.map(
          (url) => doc && getThing(doc, url)
        );
        contactDetailThings.forEach((contactDetailItem) => {
          const contactItem = {
            type: getUrl(contactDetailItem, rdf.type),
            value: getUrl(contactDetailItem, vcard.value),
          };
          profile.contactInfo[item.label].push(contactItem);
        });
      });
    });
  });

  return profile;
}
