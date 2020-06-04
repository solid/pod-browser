import getNextConfig from "next/config";

type ConfigEntity = {
  idpClientId: string;
  loginRedirect: string;
  host: string;
};

const { APP_HOST, IDP_CLIENT_ID } = getNextConfig().publicRuntimeConfig;

export default function getConfig(): ConfigEntity {
  return {
    idpClientId: IDP_CLIENT_ID || "",
    host: APP_HOST || "",
    loginRedirect: "/",
  };
}
