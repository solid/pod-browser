import { useEffect, useState } from "react";
import { fetchProfile, Profile } from "../../lit-solid-helpers";
import { ISession } from "../../contexts/userContext";

export default function useAuthenticatedProfile(
  session: ISession | undefined
): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    if (!session) return;
    const { webId } = session;
    fetchProfile(webId)
      .then((loadedProfile) => setProfile(loadedProfile))
      .catch((err) => {
        throw err;
      });
  }, [session]);
  return profile;
}
