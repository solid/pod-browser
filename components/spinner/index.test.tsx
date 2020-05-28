import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import Spinner from './index';

describe('Spinner', () => {
  test('Renders a spinner', () => {
    const tree = shallow(<Spinner />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
