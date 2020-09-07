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
  getThing,
  getUrl,
  setUrl,
  setThing,
  saveSolidDatasetAt,
  addStringNoLocale,
  createThing,
  addUrl,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Thing } from "@inrupt/solid-client/src/interfaces";
import { title } from "rdf-namespaces/dist/dct";
import { type } from "rdf-namespaces/dist/rdf";
import { namespace } from "./index";
import { Resource } from "./resource";

async function getUserSettings(
  webId: string,
  { fetch }: Session
): Promise<Resource> {
  const profileResource = await getSolidDataset(webId, { fetch });
  const profile = getThing(profileResource, webId);
  const settingsUrl = getUrl(profile, namespace.preferencesFile);
  if (!settingsUrl) {
    throw new Error("Missing pointer to preferences file");
    // How do we want to handle that users don't have a pointer to a preferences file?
    // we could request that we create it on behalf of the user
    // this is probably very edge case, so not important to fix now I think
    // TODO: WRITE LOGIC?
  }
  try {
    return await getSolidDataset(settingsUrl, { fetch });
  } catch (error) {
    throw new Error("Cannot access preferences file");
    // Do we want to handle this in any special manner?
    // TODO: WRITE LOGIC?
  }
}

async function getOrCreatePodBrowserSettingsResource(
  podBrowserSettingsUrl: string,
  { fetch }: Session
): Promise<Resource> {
  try {
    return await getSolidDataset(podBrowserSettingsUrl, { fetch });
  } catch (error) {
    if (!error.toString().match(/404/)) {
      throw error;
    }
  }
  // if error is 404, then create resource
  const newSettings = createThing({ url: podBrowserSettingsUrl });
  const settingsWithTitle = addStringNoLocale(
    newSettings,
    title,
    "Pod Browser Preferences File"
  );
  const settingsWithType = addUrl(
    settingsWithTitle,
    type,
    namespace.ConfigurationFile
  );
  await saveSolidDatasetAt(podBrowserSettingsUrl, settingsWithType, {
    fetch,
  });
  return getSolidDataset(podBrowserSettingsUrl, { fetch });
}

async function getOrCreatePodBrowserSettingsPointer(
  userSettings: Thing,
  userSettingsResource: Resource,
  { fetch }: Session
): Promise<string> {
  const podBrowserSettingsUrl = getUrl(
    userSettings,
    namespace.podBrowserPreferencesFile
  );
  if (podBrowserSettingsUrl) {
    return Promise.resolve(podBrowserSettingsUrl);
  }
  // pointer does not already exist, so we create it
  const newPodBrowserSettingsUrl = userSettingsResource.internal_resourceInfo.sourceIri.replace(
    /\/(\w+(.\w+)?)?$/g, // find the container that prefs.ttl resides in
    "/podBrowserPrefs.ttl"
  );
  const updatedUserSettings = setUrl(
    userSettings,
    namespace.podBrowserPreferencesFile,
    newPodBrowserSettingsUrl
  );
  const updatedUserSettingsResource = setThing(
    userSettingsResource,
    updatedUserSettings
  );
  await saveSolidDatasetAt(
    userSettingsResource.internal_resourceInfo.sourceIri,
    updatedUserSettingsResource,
    {
      fetch,
    }
  );
  return Promise.resolve(newPodBrowserSettingsUrl);
}

async function getPodBrowserSettings(
  userSettingsResource: Resource,
  session: Session
): Promise<Resource> {
  const userSettings = getThing(
    userSettingsResource,
    userSettingsResource.internal_resourceInfo.sourceIri
  );
  const podBrowserSettingsUrl = await getOrCreatePodBrowserSettingsPointer(
    userSettings,
    userSettingsResource,
    session
  );
  return getOrCreatePodBrowserSettingsResource(podBrowserSettingsUrl, session);
}

// eslint-disable-next-line import/prefer-default-export
export async function getOrCreateSettings(
  webId: string,
  session: Session
): Promise<Resource> {
  const userSettingsResource = await getUserSettings(webId, session);
  return getPodBrowserSettings(userSettingsResource, session);
}
