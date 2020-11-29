/* eslint-disable camelcase */
import * as ol_style from 'ol/style'
import * as geom from 'ol/geom'
import * as SIDC from './sidc'
import { primaryColor, accentColor } from './color-schemes'
import * as G from './geodesy'

const style = options => new ol_style.Style(options)
const stroke = options => new ol_style.Stroke(options)
const circle = options => new ol_style.Circle(options)
const fill = options => new ol_style.Fill(options)
const text = options => new ol_style.Text(options)
const regularShape = options => new ol_style.RegularShape(options)

const scheme = 'medium'
const styleOptions = feature => {
  const sidc = feature.get('sidc')

  return {
    primaryColor: primaryColor(scheme)(SIDC.identity(sidc)),
    accentColor: accentColor(SIDC.identity(sidc)),
    dashPattern: SIDC.status(sidc) === 'A' ? [20, 10] : null,
    thin: 2,
    thick: 3.5
  }
}

const styles = (mode, options) => write => ({
  solidLine: (inGeometry, opts = {}) => {
    const primaryColor = opts.color || options.primaryColor
    const geometry = write(inGeometry)
    return [
      { width: options.thick, color: options.accentColor, lineDash: options.dashPattern },
      { width: options.thin, color: primaryColor, lineDash: options.dashPattern }
    ].map(options => style({ stroke: stroke(options), geometry }))
  },

  dashedLine: inGeometry => {
    const geometry = write(inGeometry)
    return [
      { width: options.thick, color: options.accentColor, lineDash: [20, 10] },
      { width: options.thin, color: options.primaryColor, lineDash: [20, 10] }
    ].map(options => style({ stroke: stroke(options), geometry }))
  },

  waspLine: inGeometry => {
    const geometry = write(inGeometry)
    return [
      { width: options.thick, color: 'black' },
      { width: options.thin, color: 'yellow', lineDash: [10, 10] }
    ].map(options => style({ stroke: stroke(options), geometry }))
  },

  wireFrame: inGeometry => {
    if (mode !== 'selected') return []
    const options = { color: 'red', lineDash: [20, 8, 2, 8], width: 1.5 }
    return style({ geometry: write(inGeometry), stroke: stroke(options) })
  },

  handles: (inGeometry, options = {}) => {
    if (mode === 'selected') {
      return style({
        geometry: write(inGeometry),
        image: circle({
          fill: fill({ color: options.color || 'rgba(255,0,0,0.6)' }),
          stroke: stroke({ color: 'white', width: 3 }),
          radius: 7
        })
      })
    } else if (mode === 'multi') {
      return style({
        geometry: write(inGeometry),
        image: regularShape({
          fill: fill({ color: 'white' }),
          stroke: stroke({ color: 'black', width: 1 }),
          radius: 6,
          points: 4,
          angle: Math.PI / 4
        })
      })
    } else return []
  },

  text: (inGeometry, options) => {
    const flipped = α => α > Math.PI / 2 && α < 3 * Math.PI / 2
    const textAlign = options.flip
      ? options.textAlign && options.textAlign(flipped(options.rotation))
      : options.textAlign

    const rotation = options.flip
      ? flipped(options.rotation) ? options.rotation - Math.PI : options.rotation
      : options.rotation

    const offsetX = options.flip
      ? options.offsetX && options.offsetX(flipped(options.rotation))
      : options.offsetX

    return style({
      geometry: write(inGeometry),
      text: text({
        font: '16px sans-serif',
        stroke: stroke({ color: 'white', width: 3 }),
        fill: options.color ? fill({ color: options.color }) : null,
        ...options,
        rotation,
        textAlign,
        offsetX
      })
    })
  },

  fill: (inGeometry, options) => style({
    geometry: write(inGeometry),
    fill: fill(options)
  }),

  // =>> deprecated

  multiLineString: lines => {
    const geometry = new geom.MultiLineString(lines.map(line => line.map(G.fromLatLon)))
    return [
      { width: options.thick, color: options.accentColor, lineDash: options.dashPattern },
      { width: options.thin, color: options.primaryColor, lineDash: options.dashPattern }
    ].map(options => style({ stroke: stroke(options), geometry }))
  }

  // <<= deprecated
})

export default (mode, feature) => styles(mode, styleOptions(feature))
