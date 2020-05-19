type ProviderEntity = {
  label: string,
  value: string,
};

export default function getIdentityProviders(): Array<ProviderEntity> {
  return [
    {
      label: 'ESS Demo',
      value: 'https://broker.demo-ess.inrupt.com/',
    },
  ];
}
