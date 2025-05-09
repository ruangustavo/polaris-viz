import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {LabelFormatter} from '@shopify/polaris-viz-core';
import {
  DEFAULT_CHART_PROPS,
  useChartPositions,
  useUniqueId,
} from '@shopify/polaris-viz-core';
import {scaleLinear} from 'd3-scale';

import {useResizeObserver} from '../../hooks/useResizeObserver';

import {GroupCell} from './components/GroupCell';
import styles from './Grid.scss';
import {Tooltip} from './components/Tooltip';
import {Arrows} from './components/Arrows';
import {XAxisLabels} from './components/XAxisLabels';
import {YAxisLabels} from './components/YAxisLabels';
import {GridBackground} from './components/GridBackground';
import {
  TOOLTIP_WIDTH,
  TOOLTIP_HEIGHT,
  TOOLTIP_HORIZONTAL_OFFSET,
  Y_AXIS_LABEL_WIDTH,
  X_AXIS_HEIGHT,
  DEFAULT_GROUP_COLOR,
  DEFAULT_TEXT_COLOR,
  SMALL_CONTAINER_WIDTH,
  SMALL_CONTAINER_HEIGHT,
  DEFAULT_BOUNDS,
  DISABLED_GROUP_COLOR,
  DISABLED_TEXT_COLOR,
} from './utilities/constants';
import type {
  CellGroup,
  TooltipInfo,
  Placement,
  ChartPositions,
  GridAxisOptions,
} from './types';

export interface GridProps {
  labelFormatter?: LabelFormatter;
  cellGroups: CellGroup[];
  xAxisOptions?: GridAxisOptions;
  yAxisOptions?: GridAxisOptions;
  showGrid?: boolean;
  theme?: string;
}

export function Grid(props: GridProps) {
  const [xAxisHeight, setXAxisHeight] = useState(X_AXIS_HEIGHT);
  const [hoveredGroups, setHoveredGroups] = useState<Set<string>>(new Set());
  const [hoveredGroup, setHoveredGroup] = useState<CellGroup | null>(null);
  const {setRef, entry} = useResizeObserver();
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null);
  const [isSmallContainer, setIsSmallContainer] = useState(false);
  const [groupSelected, setGroupSelected] = useState<CellGroup | null>(null);

  const {
    cellGroups = [],
    xAxisOptions = {},
    yAxisOptions = {},
    isAnimated = DEFAULT_CHART_PROPS.isAnimated,
  } = {
    ...DEFAULT_CHART_PROPS,
    ...props,
  };

  const dimensions = useMemo(
    () => ({
      width: entry?.contentRect.width ?? 0,
      height: entry?.contentRect.height ?? 0,
    }),
    [entry],
  );

  const gridId = useUniqueId('grid');

  const uniqueGroups = useMemo(() => {
    return cellGroups.map((group) => ({
      ...group,
      id: `${group.id}-${gridId}`,
      connectedGroups: group.connectedGroups?.map(
        (connectedId) => `${connectedId}-${gridId}`,
      ),
    }));
  }, [cellGroups, gridId]);

  const gridDimensions = useMemo(() => {
    const maxRow = Math.max(...uniqueGroups.map((group) => group.end.row)) + 1;
    const maxCol = Math.max(...uniqueGroups.map((group) => group.end.col)) + 1;
    return {rows: maxRow, cols: maxCol};
  }, [uniqueGroups]);

  const fullChartWidth = dimensions.width - Y_AXIS_LABEL_WIDTH;
  const fullChartHeight = dimensions.height - X_AXIS_HEIGHT;

  const cellWidth = fullChartWidth / gridDimensions.cols;
  const cellHeight = fullChartHeight / gridDimensions.rows;

  const getActiveGroups = (group: CellGroup | null) => {
    if (!group) return new Set<string>();
    return new Set([group.id, ...(group.connectedGroups ?? [])]);
  };

  const getTooltipInfo = useCallback(
    (group: CellGroup): TooltipInfo | null => {
      const rect =
        document.getElementById(group.id)?.getBoundingClientRect() ||
        DEFAULT_BOUNDS;
      const containerRect = entry?.target?.getBoundingClientRect();

      if (!containerRect) return null;

      const leftSpace = rect.left - containerRect.left;
      const bottomSpace = containerRect.bottom - rect.bottom;

      let x: number;
      let y: number;
      let placement: Placement;

      if (leftSpace >= TOOLTIP_WIDTH) {
        x = rect.left - TOOLTIP_WIDTH - TOOLTIP_HORIZONTAL_OFFSET;
        y = rect.top;
        placement = 'left';
      } else if (bottomSpace >= TOOLTIP_HEIGHT) {
        x = rect.left;
        y = rect.bottom + TOOLTIP_HORIZONTAL_OFFSET;
        placement = 'bottom';
      } else {
        x = rect.left;
        y = rect.top - TOOLTIP_HEIGHT;
        placement = 'top';
      }

      return {
        x,
        y,
        placement,
        group,
      };
    },
    [entry],
  );

  const handleGroupHover = useCallback(
    (group: CellGroup | null) => {
      if (!isSmallContainer && group?.value !== null) {
        if (group) {
          const activeGroups = getActiveGroups(group);
          setHoveredGroups(activeGroups);
          setHoveredGroup(group);
          const tooltipInfo = getTooltipInfo(group);
          if (tooltipInfo) {
            setTooltipInfo(tooltipInfo);
          }
        } else {
          setHoveredGroups(new Set());
          setHoveredGroup(null);
          setTooltipInfo(null);
        }
      }
    },
    [getTooltipInfo, isSmallContainer],
  );

  const handleSelectGroup = useCallback(
    (group: CellGroup | null) => {
      if (!isSmallContainer) {
        const actualGroupSelected =
          groupSelected?.id === group?.id ? null : group;
        setGroupSelected(actualGroupSelected);
        handleGroupHover(actualGroupSelected);
      }
    },
    [handleGroupHover, groupSelected?.id, isSmallContainer],
  );

  const rawChartPositions = useChartPositions({
    height: Math.max(fullChartHeight, 1),
    width: Math.max(fullChartWidth, 1),
    xAxisHeight: Math.max(xAxisHeight, 0),
    yAxisWidth: Y_AXIS_LABEL_WIDTH,
    annotationsHeight: 0,
  });

  const chartPositions: ChartPositions = useMemo(() => {
    const yAxisTotalWidth = Y_AXIS_LABEL_WIDTH;
    return {
      chartXPosition: rawChartPositions.chartXPosition ?? yAxisTotalWidth,
      chartYPosition: 0,
      drawableHeight: fullChartHeight,
      drawableWidth: fullChartWidth,
      xAxisBounds: {
        x: rawChartPositions.xAxisBounds?.x ?? yAxisTotalWidth,
        y: dimensions.height - xAxisHeight,
        width: fullChartWidth,
        height: xAxisHeight,
      },
      yAxisBounds: {
        x: 0,
        y: 0,
        width: Y_AXIS_LABEL_WIDTH,
        height: fullChartHeight,
      },
    };
  }, [
    rawChartPositions,
    dimensions,
    xAxisHeight,
    fullChartWidth,
    fullChartHeight,
  ]);

  const getColors = (group: CellGroup | null) => {
    if (group?.value === null) {
      return {
        bgColor: DISABLED_GROUP_COLOR,
        textColor: DISABLED_TEXT_COLOR,
      };
    }
    if (group) {
      return {
        bgColor: group.bgColor || DEFAULT_GROUP_COLOR,
        textColor: group.color || DEFAULT_TEXT_COLOR,
      };
    }
    return {
      bgColor: DEFAULT_GROUP_COLOR,
      textColor: DEFAULT_TEXT_COLOR,
    };
  };

  const handleBodyClick = useCallback(() => {
    setGroupSelected(null);
    handleGroupHover(null);
  }, [handleGroupHover]);

  useEffect(() => {
    if (groupSelected) {
      setTimeout(() => {
        document.body.addEventListener('click', handleBodyClick);
      }, 0);

      return () => {
        document.body.removeEventListener('click', handleBodyClick);
      };
    }
  }, [groupSelected, handleBodyClick]);

  const yTicks = useMemo(() => {
    return Array.from({length: gridDimensions.rows}, (_, index) => ({
      value: gridDimensions.rows - 1 - index,
      label: `${gridDimensions.rows - index}`,
      formattedValue: `${gridDimensions.rows - index}`,
      yOffset: index * cellHeight + cellHeight / 2,
    }));
  }, [cellHeight, gridDimensions.rows]);

  const xLabels = useMemo(
    () =>
      Array.from({length: gridDimensions.cols}, (_, index) => `${index + 1}`),
    [gridDimensions.cols],
  );

  const xAxisLabelWidth = fullChartWidth / xLabels.length;

  const xScale = useMemo(
    () =>
      scaleLinear().domain([0, gridDimensions.cols]).range([0, fullChartWidth]),
    [gridDimensions.cols, fullChartWidth],
  );

  useEffect(() => {
    if (entry?.contentRect) {
      // we want to make sure the container is not too small to allow hover interactions
      setIsSmallContainer(
        entry.contentRect.width <= SMALL_CONTAINER_WIDTH ||
          entry.contentRect.height <= SMALL_CONTAINER_HEIGHT,
      );
    }
  }, [entry]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const currentIndex = uniqueGroups.findIndex(
          (group) => group.id === groupSelected?.id,
        );
        const nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % uniqueGroups.length;
        const nextGroup = uniqueGroups[nextIndex];
        setGroupSelected(nextGroup);
        handleGroupHover(nextGroup);
      } else if (event.key === 'Escape') {
        setGroupSelected(null);
        handleGroupHover(null);
      }
    },
    [uniqueGroups, groupSelected, handleGroupHover],
  );

  return (
    <div ref={setRef} className={styles.Container} onKeyDown={handleKeyDown}>
      <svg width="100%" height="100%">
        <YAxisLabels
          yTicks={yTicks}
          chartPositions={chartPositions}
          yAxisOptions={yAxisOptions}
        />

        <g id="grid-content" transform={`translate(${Y_AXIS_LABEL_WIDTH}, 0)`}>
          <GridBackground
            rows={gridDimensions.rows}
            cols={gridDimensions.cols}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            xScale={xScale}
          />
          {uniqueGroups.map((group, index) => (
            <GroupCell
              index={index}
              key={group.id}
              group={group}
              xScale={xScale}
              cellHeight={cellHeight}
              cellWidth={cellWidth}
              isSmallContainer={isSmallContainer}
              hoveredGroups={hoveredGroups}
              handleGroupHover={handleGroupHover}
              getColors={getColors}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
              isAnimated={isAnimated}
              groupSelected={groupSelected}
              dimensions={dimensions}
              handleSelectGroup={handleSelectGroup}
            />
          ))}
          <Arrows
            hoveredGroup={hoveredGroup}
            cellGroups={uniqueGroups}
            xScale={xScale}
            cellHeight={cellHeight}
          />
        </g>

        <XAxisLabels
          xLabels={xLabels}
          xAxisLabelWidth={xAxisLabelWidth}
          chartPositions={chartPositions}
          dimensions={dimensions}
          xScale={xScale}
          xAxisOptions={xAxisOptions}
          setXAxisHeight={setXAxisHeight}
        />
      </svg>

      {tooltipInfo && (
        <Tooltip
          x={tooltipInfo.x}
          y={tooltipInfo.y}
          group={groupSelected || hoveredGroup}
        />
      )}
    </div>
  );
}

Grid.displayName = 'Grid';
