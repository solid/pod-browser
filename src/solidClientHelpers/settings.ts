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
  fetchResourceInfoWithAcl,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Thing } from "@inrupt/solid-client/src/interfaces";
import { title } from "rdf-namespaces/dist/dct";
import { type } from "rdf-namespaces/dist/rdf";
import { namespace } from "./index";
import { Resource } from "./resource";

async function getUserSettingsUrl(
  webId: string,
  { fetch }: Session
): Promise<string> {
  const profileResource = await getSolidDataset(webId, { fetch });
  const profile = getThing(profileResource, webId);
  const settingsUrl = getUrl(profile, namespace.preferencesFile);
  if (!settingsUrl) {
    throw new Error("Missing pointer to preferences file");
    // TODO: How do we handle that users don't have a pointer to a preferences file?
    // - we could request that we create it on behalf of the user
    // - this is probably very edge case, so not important to fix now I think
  }
  return settingsUrl;
}

async function getOrCreatePodBrowserSettingsResource(
  podBrowserSettingsUrl: string,
  { fetch }: Session
): Promise<string> {
  try {
    await fetchResourceInfoWithAcl(podBrowserSettingsUrl, { fetch });
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
  userSettings: Thing,
  userSettingsResource: Resource,
  userSettingsUrl: string,
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

async function getPodBrowserSettings(
  userSettingsUrl: string,
  session: Session
): Promise<string> {
  const userSettingsResource = await getSolidDataset(userSettingsUrl, {
    fetch: session.fetch,
  });
  // TODO: How do we handle that prefs.ttl does not exist?
  // - we could request that we create it on behalf of the user
  // - this is probably very edge case, so not important to fix now I think

  const userSettings = getThing(userSettingsResource, userSettingsUrl);
  const podBrowserSettingsUrl = await getOrCreatePodBrowserSettingsPointer(
    userSettings,
    userSettingsResource,
    userSettingsUrl,
    session
  );
  return getOrCreatePodBrowserSettingsResource(podBrowserSettingsUrl, session);
}

// eslint-disable-next-line import/prefer-default-export
export async function getOrCreateSettings(
  webId: string,
  session: Session
): Promise<string> {
  const userSettingsUrl = await getUserSettingsUrl(webId, session);
  return getPodBrowserSettings(userSettingsUrl, session);
}
