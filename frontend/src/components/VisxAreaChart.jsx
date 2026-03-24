import React, { useMemo, useCallback } from 'react';
import { AreaClosed, Line, Bar } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { max, extent, bisector } from '@visx/vendor/d3-array';
import { timeFormat } from '@visx/vendor/d3-time-format';

// Constants for styling
const background = 'transparent';
const background2 = 'transparent';
const accentColor = '#00f0ff';
const accentColorDark = '#0062ff';
const tooltipStyles = {
  ...defaultStyles,
  background: '#1a1b23',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  padding: '12px',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
};

const formatDate = timeFormat("%b %d, %H:%M");

// Accessors
const getDate = (d) => new Date(d.date || d.hour_timestamp || d.hour);
const getStockValue = (d) => d.close || d.tx || d.value;
const bisectDate = bisector((d) => new Date(d.date || d.hour_timestamp || d.hour)).left;

const VisxAreaChartLogic = ({
  width,
  height,
  data,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0,
}) => {
  if (width < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(data, getDate),
      }),
    [innerWidth, margin.left, data],
  );
  const valueScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, (max(data, getStockValue) || 0) + innerHeight / 10],
        nice: true,
      }),
    [margin.top, innerHeight, data],
  );

  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: valueScale(getStockValue(d)),
      });
    },
    [showTooltip, valueScale, dateScale, data],
  );

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#area-background-gradient)"
          rx={14}
        />
        <LinearGradient id="area-background-gradient" from={background} to={background2} />
        <LinearGradient id="area-gradient" from={accentColor} to={accentColor} toOpacity={0.1} />
        
        <GridRows
          left={margin.left}
          scale={valueScale}
          width={innerWidth}
          strokeDasharray="1,3"
          stroke="rgba(255,255,255,0.1)"
          pointerEvents="none"
        />
        <GridColumns
          top={margin.top}
          scale={dateScale}
          height={innerHeight}
          strokeDasharray="1,3"
          stroke="rgba(255,255,255,0.1)"
          pointerEvents="none"
        />
        
        <AreaClosed
          data={data}
          x={(d) => dateScale(getDate(d)) ?? 0}
          y={(d) => valueScale(getStockValue(d)) ?? 0}
          yScale={valueScale}
          strokeWidth={2}
          stroke={accentColor}
          fill="url(#area-gradient)"
          curve={curveMonotoneX}
        />
        
        <Bar
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />

        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
              stroke={accentColorDark}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={6}
              fill={accentColorDark}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      
      {tooltipData && (
        <div>
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop - 12}
            left={tooltipLeft + 12}
            style={tooltipStyles}
          >
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {`Volume: ${getStockValue(tooltipData)}`}
            </div>
            {tooltipData.fraud !== undefined && (
              <div style={{ color: '#ff3366', fontSize: '12px', marginTop: '4px' }}>
                {`Fraud: ${tooltipData.fraud}`}
              </div>
            )}
          </TooltipWithBounds>
          <Tooltip
            top={innerHeight + margin.top + 10}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
              background: '#0062ff',
              color: 'white',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {formatDate(getDate(tooltipData))}
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default withTooltip(VisxAreaChartLogic);
