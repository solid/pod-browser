import { useRedirectIfLoggedIn } from '../../src/effects/auth';
import LoginForm from '../../components/login';

export default function Login() {
  useRedirectIfLoggedIn();

  return (
    <LoginForm />
  );
}
