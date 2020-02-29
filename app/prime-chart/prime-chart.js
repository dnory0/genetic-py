"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let liveRendering = { isLive: true, stepForward: false, replay: false };
const ipcRenderer = window['ipcRenderer'];
delete window['ipcRenderer'];
const enableChartHover = window['enableChartHover'];
const clearChart = window['clearChart'];
let treatResponse;
(() => {
    var min;
    var max;
    treatResponse = (response) => {
        if (response['generation'] !== undefined) {
            min = Math.min(min, response['fitness']);
            max = Math.max(max, response['fitness'] + 0.001);
            if (liveRendering.isLive || liveRendering.stepForward)
                primeChart.yAxis[0].setExtremes(min, max, false);
            primeChart.series[0].addPoint(parseInt(response['fitness']), liveRendering.isLive || liveRendering.stepForward, false, false);
            if (response['generation'])
                primeChart.series[2].addPoint([
                    response['generation'] - 0.5,
                    Math.min(response['prv-fitness'], response['fitness']),
                    Math.max(response['prv-fitness'], response['fitness'])
                ], liveRendering.isLive || liveRendering.stepForward, false, false);
            if (liveRendering.stepForward)
                liveRendering.stepForward = false;
        }
        else if (response['started']) {
            min = Number.POSITIVE_INFINITY;
            max = Number.NEGATIVE_INFINITY;
            clearChart(primeChart);
            enableChartHover(response['first-step'], primeChart);
        }
        else if (response['paused'] ||
            response['stopped'] ||
            response['finished']) {
            if (liveRendering.replay)
                liveRendering.replay = false;
            else {
                primeChart.yAxis[0].setExtremes(min, max);
                enableChartHover(true, primeChart);
            }
        }
        else if (response['resumed'])
            enableChartHover(false, primeChart);
    };
})();
let primeChart = window['createChart']('prime-chart', {
    title: {
        text: 'Fittest Fitness per Generation'
    },
    xAxis: {
        title: {
            text: 'Generation'
        },
        min: 0
    },
    yAxis: {
        title: {
            text: 'Fitness/Deviation'
        },
        tickInterval: 1
    },
    tooltip: {
        formatter() {
            return `
          <div style="text-align: right">
            Generation: <b>${!`${this.x}`.match(/\.5$/)
                ? this.x
                : `${this.x - 0.5} - ${this.x + 0.5}`}</b><br>
            <span style="float: left;">
            ${!`${this.x}`.match(/\.5$/) ? 'Fitness' : 'Deviation'}:&nbsp;
            </span>
            <b>${!`${this.x}`.match(/\.5$/)
                ? this.y
                : Math.abs(this.point.high - this.point.low)}</b>
          </div>`;
        }
    },
    legend: {
        floating: true,
        itemMarginBottom: -5,
        itemDistance: 10,
        symbolPadding: 2
    },
    series: [
        {
            type: 'line',
            name: 'CGA',
            data: []
        },
        {
            type: 'line',
            name: 'QGA',
            data: []
        },
        {
            type: 'columnrange',
            name: 'Deviation',
            data: []
        }
    ]
});
delete window['createChart'];
ipcRenderer.on('data', (_event, data) => treatResponse(data));
ipcRenderer.on('live-rendering', (_ev, newLR) => (liveRendering.isLive = newLR));
ipcRenderer.on('step-forward', () => (liveRendering.stepForward = true));
ipcRenderer.on('replay', () => (liveRendering.replay = true));
//# sourceMappingURL=prime-chart.js.map