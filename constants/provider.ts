export type ProviderEntity = {
  label: string;
  value: string;
};

export default function getIdentityProviders(): Array<ProviderEntity> {
  return [
    {
      label: "inrupt.net",
      value: "https://inrupt.net/",
    },
    {
      label: "dev.inrupt.net",
      value: "https://dev.inrupt.net/",
    },
  ];
}
