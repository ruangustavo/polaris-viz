import type {BoundingRect, Dimensions} from '@shopify/polaris-viz-core';
import {HORIZONTAL_GROUP_LABEL_HEIGHT} from '@shopify/polaris-viz-core';

import {TOOLTIP_MARGIN} from '../constants';
import type {AlteredPositionProps, AlteredPositionReturn} from '../types';

export function getAlteredHorizontalBarPosition(
  props: AlteredPositionProps,
): AlteredPositionReturn {
  if (props.currentX < 0) {
    return getNegativeOffset(props);
  }
  return getPositiveOffset(props);
}

function getNegativeOffset(props: AlteredPositionProps): AlteredPositionReturn {
  const {bandwidth, currentX, currentY, tooltipDimensions} = props;

  const flippedX = currentX * -1;
  const yOffset = (bandwidth - tooltipDimensions.height) / 2;

  const y = currentY - tooltipDimensions.height;
  if (flippedX - tooltipDimensions.width < 0) {
    return {x: flippedX, y: y < 0 ? 0 : y};
  }

  return {
    x: flippedX - tooltipDimensions.width - TOOLTIP_MARGIN,
    y: currentY + HORIZONTAL_GROUP_LABEL_HEIGHT + yOffset,
  };
}

function getPositiveOffset(props: AlteredPositionProps): AlteredPositionReturn {
  const {bandwidth, currentX, currentY, tooltipDimensions, chartBounds} = props;

  const isOutside = isOutsideBounds({
    x: currentX,
    y: currentY,
    tooltipDimensions,
    chartBounds,
  });

  if (isOutside.top && isOutside.right) {
    return {
      x: chartBounds.width - tooltipDimensions.width,
      y: 0,
    };
  }

  if (isOutside.top && !isOutside.right) {
    return {
      x: currentX + TOOLTIP_MARGIN,
      y: 0,
    };
  }

  if (!isOutside.right && !isOutside.bottom) {
    const yOffset = (bandwidth - tooltipDimensions.height) / 2;
    return {
      x: currentX + TOOLTIP_MARGIN,
      y: currentY + HORIZONTAL_GROUP_LABEL_HEIGHT + yOffset,
    };
  }

  if (isOutside.right) {
    const x = currentX - tooltipDimensions.width;
    const y =
      currentY -
      tooltipDimensions.height +
      HORIZONTAL_GROUP_LABEL_HEIGHT -
      TOOLTIP_MARGIN;

    if (y < 0) {
      return {
        x,
        y: bandwidth + HORIZONTAL_GROUP_LABEL_HEIGHT + TOOLTIP_MARGIN,
      };
    }

    return {
      x,
      y,
    };
  }

  if (isOutside.bottom) {
    return {
      x: currentX + TOOLTIP_MARGIN,
      y:
        chartBounds.height -
        tooltipDimensions.height -
        HORIZONTAL_GROUP_LABEL_HEIGHT,
    };
  }

  return {x: currentX, y: currentY};
}

function isOutsideBounds({
  x,
  y,
  tooltipDimensions,
  chartBounds,
}: {
  x: number;
  y: number;
  tooltipDimensions: Dimensions;
  chartBounds: BoundingRect;
}) {
  const right = x + TOOLTIP_MARGIN + tooltipDimensions.width;
  const bottom = y + tooltipDimensions.height;

  return {
    left: x <= 0,
    right: right > chartBounds.width,
    bottom: bottom > chartBounds.height,
    top: y <= 0,
  };
}
