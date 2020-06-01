export type ProviderEntity = {
  label: string;
  value: string;
  useClientId: boolean;
};

export default function getIdentityProviders(): Array<ProviderEntity> {
  return [
    {
      label: "ESS Demo",
      value: "https://broker.demo-ess.inrupt.com/",

      // temporary until ESS supports dynamic registration
      useClientId: true,
    },
    {
      label: "dev.inrupt.net",
      value: "https://dev.inrupt.net/",

      // temporary until ESS supports dynamic registration
      useClientId: false,
    },
  ];
}
