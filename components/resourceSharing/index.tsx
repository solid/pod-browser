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

/* eslint-disable camelcase, no-console */
import {
  ReactElement,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter, NextRouter } from "next/router";
import {
  Avatar,
  Button,
  createStyles,
  Divider,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import AccountCircle from "@material-ui/icons/AccountCircle";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { makeStyles } from "@material-ui/styles";
import { PrismTheme } from "@solid/lit-prism-patterns";
import { unstable_Access } from "@inrupt/solid-client";
import UserContext, { ISession } from "../../src/contexts/userContext";
import { resourceContextRedirect } from "../resourceLink";
import {
  displayPermissions,
  fetchProfile,
  getThirdPartyPermissions,
  getUserPermissions,
  IResourceDetails,
  IResponse,
  NormalizedPermission,
  Profile,
  savePermissions,
} from "../../src/solidClientHelpers";
import styles from "../resourceDetails/styles";
import PermissionsForm from "../permissionsForm";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export function displayName({ nickname, name, webId }: Profile): string {
  if (name) return name;
  if (nickname) return nickname;
  return webId;
}

export async function handleAddAgentClick(
  agentId: string,
  addedAgents: Profile[],
  setAddedAgents: Dispatch<SetStateAction<Profile[]>>
): Promise<void> {
  try {
    const profile = await fetchProfile(agentId);
    const exists = addedAgents.some(({ webId }) => webId === profile.webId);
    if (!exists) setAddedAgents([...addedAgents, profile]);
  } catch ({ message }) {
    console.error(message);
  }
}

interface ISaveThirdPartyPermissionHandler {
  addedAgents: Profile[];
  iri: string;
  profile: Profile;
  setAddedAgents: Dispatch<Profile[]>;
  setThirdPartyPermissions: Dispatch<NormalizedPermission[]>;
  thirdPartyPermissions: NormalizedPermission[];
  webId: string;
}

export function saveThirdPartyPermissionHandler({
  addedAgents,
  iri,
  profile,
  setAddedAgents,
  setThirdPartyPermissions,
  thirdPartyPermissions,
  webId,
}: ISaveThirdPartyPermissionHandler): (
  acl: unstable_Access
) => Promise<IResponse> {
  return async (acl) => {
    const alias = displayPermissions(acl);
    const access = acl;

    setAddedAgents(addedAgents.filter((a) => a.webId !== webId));
    setThirdPartyPermissions([
      ...thirdPartyPermissions,
      {
        alias,
        acl,
        webId,
        profile,
      },
    ]);

    const { error, response } = await savePermissions({ iri, webId, access });
    return { error, response };
  };
}

interface IAddedAgents {
  addedAgents: Profile[];
  classes: Record<string, string>;
  iri: string;
  setAddedAgents: Dispatch<Profile[]>;
  setThirdPartyPermissions: Dispatch<NormalizedPermission[]>;
  thirdPartyPermissions: NormalizedPermission[];
}

export function AddedAgents({
  addedAgents,
  classes,
  iri,
  setAddedAgents,
  setThirdPartyPermissions,
  thirdPartyPermissions,
}: IAddedAgents): ReactElement | null {
  if (!addedAgents || addedAgents.length === 0) return null;

  return (
    <List>
      {addedAgents.map((agent) => {
        const { avatar, webId } = agent;
        const name = displayName(agent);

        const onSave = saveThirdPartyPermissionHandler({
          iri,
          setAddedAgents,
          addedAgents,
          thirdPartyPermissions,
          setThirdPartyPermissions,
          webId,
          profile: agent,
        });

        return (
          <ListItem key={webId} className={classes.listItem}>
            <Avatar
              className={classes.avatar}
              alt={name}
              src={avatar as string}
            />
            <Typography className={classes.detailText}>{name}</Typography>
            <PermissionsForm
              key={webId}
              permission={{
                alias: "No Control",
                acl: {
                  read: false,
                  write: false,
                  append: false,
                  control: false,
                },
              }}
              warnOnSubmit={false}
              onSave={onSave}
            />
          </ListItem>
        );
      })}
    </List>
  );
}

interface IHandlePermissionUpdate {
  iri: string;
  setThirdPartyPermissions: Dispatch<NormalizedPermission[]>;
  thirdPartyPermissions: NormalizedPermission[];
  webId: string;
}

export function handlePermissionUpdate({
  iri,
  setThirdPartyPermissions,
  thirdPartyPermissions,
  webId,
}: IHandlePermissionUpdate) {
  return async (access: unstable_Access): Promise<IResponse> => {
    if (displayPermissions(access) === "No Access") {
      setThirdPartyPermissions(
        thirdPartyPermissions.filter((p) => p.webId !== webId)
      );
    }
    return savePermissions({ iri, webId, access });
  };
}

export interface IPermission {
  iri: string;
  permission?: NormalizedPermission;
  classes: Record<string, string>;
  warnOnSubmit: boolean;
  thirdPartyPermissions: NormalizedPermission[];
  setThirdPartyPermissions: Dispatch<NormalizedPermission[]>;
}

export function Permission(props: IPermission): ReactElement | null {
  const {
    permission,
    classes,
    warnOnSubmit,
    iri,
    thirdPartyPermissions,
    setThirdPartyPermissions,
  } = props;

  if (!permission) return null;

  const { webId, profile } = permission;

  if (!profile) return null;

  const { avatar } = profile;
  const avatarSrc = avatar || undefined;
  const onSave = handlePermissionUpdate({
    iri,
    webId,
    thirdPartyPermissions,
    setThirdPartyPermissions,
  });

  return (
    <ListItem key={webId} className={classes.listItem}>
      <Avatar
        className={classes.avatar}
        alt={displayName(profile)}
        src={avatarSrc}
      />
      <Typography className={classes.detailText}>
        {displayName(profile)}
      </Typography>

      <PermissionsForm
        permission={permission}
        warnOnSubmit={warnOnSubmit}
        onSave={onSave}
      />
    </ListItem>
  );
}

interface INoThirdPartyPermissions {
  classes: Record<string, string>;
}

export function NoThirdPartyPermissions({
  classes,
}: INoThirdPartyPermissions): ReactElement {
  return (
    <section className={classes.centeredSection}>
      <List>
        <ListItem key={0} className={classes.listItem}>
          <ListItemIcon>
            <PersonIcon />
            People
          </ListItemIcon>
        </ListItem>

        <ListItem key={1} className={classes.listItem}>
          <Typography className={classes.detailText}>
            No 3rd party access
          </Typography>
        </ListItem>
      </List>
    </section>
  );
}

interface IThirdPartyPermissionsList {
  iri: string;
  classes: Record<string, string>;
  thirdPartyPermissions: NormalizedPermission[];
  setThirdPartyPermissions: Dispatch<NormalizedPermission[]>;
}

export function ThirdPartyPermissionsList({
  iri,
  classes,
  thirdPartyPermissions,
  setThirdPartyPermissions,
}: IThirdPartyPermissionsList): ReactElement {
  return (
    <>
      {thirdPartyPermissions.map((permission) => (
        <Permission
          iri={iri}
          permission={permission}
          classes={classes}
          key={permission.webId}
          warnOnSubmit={false}
          thirdPartyPermissions={thirdPartyPermissions}
          setThirdPartyPermissions={setThirdPartyPermissions}
        />
      ))}
    </>
  );
}

interface IThirdPartyPermissions {
  iri: string;
  setThirdPartyPermissions: Dispatch<NormalizedPermission[]>;
  thirdPartyPermissions: NormalizedPermission[] | null;
  classes: Record<string, string>;
}

export function ThirdPartyPermissions(
  props: IThirdPartyPermissions
): ReactElement | null {
  const {
    iri,
    thirdPartyPermissions,
    classes,
    setThirdPartyPermissions,
  } = props;

  if (!thirdPartyPermissions) return null;
  if (thirdPartyPermissions.length === 0) {
    return <NoThirdPartyPermissions classes={classes} />;
  }

  return (
    <section className={classes.centeredSection}>
      <h5 className={classes["content-h5"]}>Sharing</h5>
      <List>
        <ListItem key={0} className={classes.listItem}>
          <ListItemIcon>
            <PersonIcon />
            People
          </ListItemIcon>
        </ListItem>

        <Divider />

        <ThirdPartyPermissionsList
          iri={iri}
          classes={classes}
          thirdPartyPermissions={thirdPartyPermissions}
          setThirdPartyPermissions={setThirdPartyPermissions}
        />
      </List>
    </section>
  );
}

export function backToDetailsClick(router: NextRouter): () => Promise<void> {
  return async () => {
    const { iri, resourceIri } = router.query;
    await resourceContextRedirect(
      "details",
      resourceIri as string,
      iri as string,
      router
    );
  };
}

export default function ResourceSharing({
  name,
  iri,
  permissions,
}: Partial<IResourceDetails>): ReactElement {
  const { session } = useContext(UserContext);
  const { webId } = session as ISession;
  const [agentId, setAgentId] = useState("");
  const [addedAgents, setAddedAgents] = useState<Profile[]>([]);
  const userPermissions = getUserPermissions(webId, permissions);
  const [thirdPartyPermissions, setThirdPartyPermissions] = useState(
    getThirdPartyPermissions(webId, permissions)
  );
  const classes = useStyles();
  const router = useRouter();
  const iriString = iri as string;

  return (
    <>
      <section className={classes.headerSection}>
        <h3 className={classes["content-h3"]} title={iri}>
          {name}
        </h3>
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={backToDetailsClick(router)}
        >
          Details
        </Button>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>My Access</h5>
        <List>
          <Permission
            iri={iriString}
            key={0}
            permission={userPermissions as NormalizedPermission}
            classes={classes}
            thirdPartyPermissions={thirdPartyPermissions}
            setThirdPartyPermissions={setThirdPartyPermissions}
            warnOnSubmit
          />
        </List>
      </section>

      <ThirdPartyPermissions
        iri={iriString}
        thirdPartyPermissions={thirdPartyPermissions}
        setThirdPartyPermissions={setThirdPartyPermissions}
        classes={classes}
      />

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]} title={iriString}>
          Grant Permission
        </h5>

        <FormControl className={classes.agentInput}>
          <InputLabel htmlFor="agent-web-id">Web ID</InputLabel>
          <Input
            id="agent-web-id"
            onChange={({ target: { value } }) => setAgentId(value)}
            value={agentId}
            // prettier-ignore
            startAdornment={(
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            )}
          />
        </FormControl>

        <Button
          variant="contained"
          onClick={async () => {
            await handleAddAgentClick(agentId, addedAgents, setAddedAgents);
          }}
        >
          Add
        </Button>
      </section>

      <section className={classes.centeredSection}>
        <AddedAgents
          addedAgents={addedAgents}
          classes={classes}
          iri={iriString}
          setAddedAgents={setAddedAgents}
          setThirdPartyPermissions={setThirdPartyPermissions}
          thirdPartyPermissions={thirdPartyPermissions}
        />
      </section>
    </>
  );
}
