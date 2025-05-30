import type {Meta} from '@storybook/react';

import type {BarChartProps} from '../../../components';
import {BarChart} from '../../../components';
import {
  ANNOTATIONS_ARGS,
  CHART_STATE_CONTROL_ARGS,
  CONTROLS_ARGS,
  DATA_SERIES_ARGS,
  DIRECTION_CONTROL_ARGS,
  EMPTY_STATE_TEXT_ARGS,
  IS_ANIMATED_ARGS,
  LEGEND_CONTROL_ARGS,
  MAX_SERIES_ARGS,
  RENDER_BUCKET_LEGEND_LABEL_ARGS,
  RENDER_LEGEND_CONTENT_ARGS,
  SKIP_LINK_ARGS,
  THEME_CONTROL_ARGS,
  TYPE_CONTROL_ARGS,
  X_AXIS_OPTIONS_ARGS,
  Y_AXIS_OPTIONS_ARGS,
} from '../../../storybook/constants';
import {PageWithSizingInfo} from '../../Docs/stories';

export const META: Meta<BarChartProps> = {
  title: 'polaris-viz/Charts/BarChart',
  component: BarChart,
  parameters: {
    docs: {
      page: PageWithSizingInfo,
      description: {
        component:
          'Used to show comparison of different types, across categories or time. Bars can be stacked or side by side.',
      },
    },
    controls: CONTROLS_ARGS,
  },
  decorators: [(Story) => <div style={{height: '500px'}}>{Story()}</div>],
  argTypes: {
    annotations: ANNOTATIONS_ARGS,
    data: DATA_SERIES_ARGS,
    emptyStateText: EMPTY_STATE_TEXT_ARGS,
    isAnimated: IS_ANIMATED_ARGS,
    renderLegendContent: RENDER_LEGEND_CONTENT_ARGS,
    renderBucketLegendLabel: RENDER_BUCKET_LEGEND_LABEL_ARGS,
    skipLinkText: SKIP_LINK_ARGS,
    xAxisOptions: X_AXIS_OPTIONS_ARGS,
    yAxisOptions: Y_AXIS_OPTIONS_ARGS,
    direction: DIRECTION_CONTROL_ARGS,
    theme: THEME_CONTROL_ARGS,
    state: CHART_STATE_CONTROL_ARGS,
    type: TYPE_CONTROL_ARGS,
    showLegend: LEGEND_CONTROL_ARGS,
    maxSeries: MAX_SERIES_ARGS,
  },
};
