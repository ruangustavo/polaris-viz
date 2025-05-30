import {mount} from '@shopify/react-testing';

import {SeriesIcon} from '../SeriesIcon';
import {DefaultPreview} from '../../DefaultPreview';
import {LinePreview} from '../../LinePreview';

describe('<SeriesIcon />', () => {
  it('renders a <DefaultPreview />', () => {
    const component = mount(<SeriesIcon color="red" />);

    expect(component).toContainReactComponent(DefaultPreview, {
      color: 'red',
    });
  });

  it('renders a <LinePreview /> when shape is Line', () => {
    const component = mount(<SeriesIcon shape="Line" color="red" />);

    expect(component).toContainReactComponent(LinePreview, {
      color: 'red',
    });
  });
});

describe('color', () => {
  it('passes color as color prop to <DefaultPreview />', () => {
    const component = mount(<SeriesIcon color="red" />);

    expect(component.find(DefaultPreview)).toHaveReactProps({color: 'red'});
  });

  it('passes color as color prop to <LinePreview />', () => {
    const component = mount(<SeriesIcon shape="Line" color="red" />);

    expect(component.find(LinePreview)).toHaveReactProps({color: 'red'});
  });
});

describe('lineStyle', () => {
  it('renders a dotted line when lineStyle prop is set to dotted', () => {
    const component = mount(
      <SeriesIcon shape="Line" color="red" lineStyle="dotted" />,
    );

    expect(component.find(LinePreview)).toHaveReactProps({lineStyle: 'dotted'});
  });

  it('renders a dashed line when lineStyle prop is set to dashed', () => {
    const component = mount(
      <SeriesIcon shape="Line" color="red" lineStyle="dashed" />,
    );

    expect(component.find(LinePreview)).toHaveReactProps({lineStyle: 'dashed'});
  });
});
