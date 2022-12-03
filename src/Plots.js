import { useMemo } from 'react';

// https://nivo.rocks/bar/
import { ResponsiveBar } from '@nivo/bar'
import { Box } from '@mui/material';


export const Bar = ({ data, unit, layout='horizontal', margin=0, xLegend }) => {
    data = useMemo(() => {
        const x = Object.entries(data).map(([k,v])=>({k,v}))
        return layout == 'horizontal' ? x.reverse() : x;
    }, [data, layout]);

    const hz = layout == 'horizontal';

    const labelFunc = d => `${d.value} ${unit||''}`;
    console.log(data)
    return data && <ResponsiveBar
        data={data}
        keys={['v']}
        indexBy={'k'}
        layout={layout}
        colors={{ scheme: 'set2' }}
        label={false}
        tooltip={(d) => <Tooltip {...d} keyName='indexValue' unit={unit} />}
        margin={hz ? { 'left': margin } : { 'bottom': margin }}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: xLegend,
            format: (d) => d,
            legendPosition: 'middle',
            legendOffset: 32
        }}
        theme={{ fontSize: '0.8em' }}
        layers={[
            // 'grid',
            'axes',
            'bars',
            'markers',
            'legends',
            'annotations',
            ({ bars, labelSkipWidth }) => (
                // console.log(bars)||
                <g key={bars[0].key}>
                    {bars.map(({ width, height, x, y, data, ...d }) => (
                        // console.log(width, height, x, y, data, d)||
                        (
                            <g key={data.label} transform={(hz ? 
                                `translate(${5}, ${y + height / 2})` : 
                                `translate(${x + width / 2}, ${y+height-5})`)
                                // + ``
                            }>
                            <text
                                style={{ fontSize: '0.8em', transform: hz ? null : 'rotate(-90deg)' }}
                                textAnchor="left"
                                dominantBaseline="central">
                                    {labelFunc(data)}
                                </text>
                            </g>
                        )
                    ))}
                </g>
            ),
        ]}
    />
}

export const SingleBar = ({ data, unit }) => {
    return data && <ResponsiveBar
        data={[data]}
        keys={Object.keys(data)}
        layout='horizontal'
        colors={{ scheme: 'set2' }}
        label={d => `${d.id}: ${d.value} ${unit||''}`}
        tooltip={(d) => <Tooltip {...d} unit={unit} />}
        theme={{ fontSize: '0.8em' }}
    />
}

const Tooltip = ({ value, color, unit, keyName='id', ...d }) => {
    return (
        <Box sx={{ fontSize: '0.7em', color: color, backgroundColor: '#222', px: 1, borderRadius: '4px' }}>
            <div><small><b>{d[keyName]}</b></small></div>
            <div><b>{value}</b> {unit}</div>
        </Box>
    )
}