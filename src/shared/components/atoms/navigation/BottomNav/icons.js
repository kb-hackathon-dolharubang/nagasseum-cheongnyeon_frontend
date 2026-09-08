import { h } from 'vue'

export const HomeIcon = {
  render: () =>
    h('svg', { viewBox: '0 0 17 17', fill: 'none' }, [
      h('path', {
        d: 'M2 8L8.5 2.5L15 8V15H10.5V10.5H6.5V15H2V8Z',
        stroke: 'currentColor',
        'stroke-width': '1.4',
        'stroke-linejoin': 'round',
      }),
    ]),
}

export const GoalIcon = {
  render: () =>
    h('svg', { viewBox: '0 0 17 17', fill: 'none' }, [
      h('circle', { cx: '8.5', cy: '8.5', r: '6', stroke: 'currentColor', 'stroke-width': '1.4' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '3', stroke: 'currentColor', 'stroke-width': '1.4' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '0.8', fill: 'currentColor' }),
    ]),
}

export const PolicyIcon = {
  render: () =>
    h('svg', { viewBox: '0 0 17 17', fill: 'none' }, [
      h('rect', {
        x: '3',
        y: '2',
        width: '11',
        height: '13',
        rx: '1.5',
        stroke: 'currentColor',
        'stroke-width': '1.4',
      }),
      h('path', {
        d: 'M6 6H11M6 9H11M6 12H9',
        stroke: 'currentColor',
        'stroke-width': '1.4',
        'stroke-linecap': 'round',
      }),
    ]),
}

export const MyIcon = {
  render: () =>
    h('svg', { viewBox: '0 0 17 17', fill: 'none' }, [
      h('circle', { cx: '8.5', cy: '6', r: '3', stroke: 'currentColor', 'stroke-width': '1.4' }),
      h('path', {
        d: 'M2.5 15C2.5 11.5 5.2 10 8.5 10C11.8 10 14.5 11.5 14.5 15',
        stroke: 'currentColor',
        'stroke-width': '1.4',
        'stroke-linecap': 'round',
      }),
    ]),
}
