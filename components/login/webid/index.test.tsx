import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { login } from '../../../lib/solid-auth-fetcher/dist';

import WebIdLogin, { loginWithWebId } from './index';

jest.mock('../../../lib/solid-auth-fetcher/dist');


describe('WebIdLogin form', () => {
  test('Renders a webid login form, with button bound to login', () => {
    const tree = shallow(<WebIdLogin />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe('loginWithWebId', () => {
  test('Does nothing if webid is only whitespace', async () => {
    await loginWithWebId('   ');
    expect(login).not.toHaveBeenCalled();
  });

  test('Calls login if webid is provided', async () => {
    const webId = ('https://myid.myprovider.com/abcd/profile#me');

    await loginWithWebId(webId);

    expect(login).toHaveBeenCalledWith({
      webId,
      redirect: '/loginSuccess',
    });
  });
});
