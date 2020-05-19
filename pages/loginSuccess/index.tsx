import {
  useRedirectIfLoggedOut,
  useRedirectIfLoggedIn,
} from '../../src/effects/auth';


export default function LoginSuccess() {
  // No-op page that sends you to login if you're not logged in, or index if you are.
  useRedirectIfLoggedOut();
  useRedirectIfLoggedIn();

  return (
    <>
      <a>Login successful. Redirecting...</a>
    </>
  );
}
