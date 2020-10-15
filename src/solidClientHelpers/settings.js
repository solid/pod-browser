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
  addStringNoLocale,
  addUrl,
  createThing,
  getResourceInfoWithAcl,
  getSolidDataset,
  getThing,
  getUrl,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { title } from "rdf-namespaces/dist/dct";
import { type } from "rdf-namespaces/dist/rdf";
import { namespace } from "./utils";

async function getUserSettingsUrl(webId, { fetch }) {
  const profileResource = await getSolidDataset(webId, { fetch });
  const profile = getThing(profileResource, webId);
  const settingsUrl = getUrl(profile, namespace.preferencesFile);
  if (!settingsUrl) {
    throw new Error(`Missing pointer to preferences file: ${settingsUrl}`);
  }
  return settingsUrl;
}

async function getOrCreatePodBrowserSettingsResourceUrl(
  podBrowserSettingsUrl,
  { fetch }
) {
  try {
    await getResourceInfoWithAcl(podBrowserSettingsUrl, { fetch });
    return podBrowserSettingsUrl;
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
  return podBrowserSettingsUrl;
}

async function getOrCreatePodBrowserSettingsPointer(
  userSettings,
  userSettingsResource,
  userSettingsUrl,
  { fetch }
) {
  const podBrowserSettingsUrl = getUrl(
    userSettings,
    namespace.podBrowserPreferencesFile
  );
  if (podBrowserSettingsUrl) {
    return Promise.resolve(podBrowserSettingsUrl);
  }
  // pointer does not already exist, so we create it
  const newPodBrowserSettingsUrl = userSettingsUrl.replace(
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
  await saveSolidDatasetAt(userSettingsUrl, updatedUserSettingsResource, {
    fetch,
  });
  return Promise.resolve(newPodBrowserSettingsUrl);
}

async function getPodBrowserSettingsUrl(userSettingsUrl, session) {
  const userSettingsResource = await getSolidDataset(userSettingsUrl, {
    fetch: session.fetch,
  });

  const userSettings = getThing(userSettingsResource, userSettingsUrl);
  const podBrowserSettingsUrl = await getOrCreatePodBrowserSettingsPointer(
    userSettings,
    userSettingsResource,
    userSettingsUrl,
    session
  );
  return getOrCreatePodBrowserSettingsResourceUrl(
    podBrowserSettingsUrl,
    session
  );
}

// eslint-disable-next-line import/prefer-default-export
export async function getOrCreateSettings(webId, session) {
  const userSettingsUrl = await getUserSettingsUrl(webId, session);
  const podBrowserSettingsUrl = await getPodBrowserSettingsUrl(
    userSettingsUrl,
    session
  );
  return getSolidDataset(podBrowserSettingsUrl, { fetch: session.fetch });
}
