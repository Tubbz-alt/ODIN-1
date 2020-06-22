/* eslint-disable */
import * as R from 'ramda'
import * as geom from 'ol/geom'
import LatLon from 'geodesy/latlon-spherical.js'
import defaultStyle from './default-style'
import { K } from '../../../shared/combinators'
import { parameterized } from '../../components/SIDC'
import * as G from './geodesy'

const multiLineString = lines =>
  new geom.MultiLineString(lines.map(line => line.map(G.fromLatLon)))

const lineStyle = (feature, lines) => {
  const styles = defaultStyle(feature)

  // It is quite possible that feature's extent is too small
  // to construct a valid geometry. Use default style in this case.

  try {
    const geometry = multiLineString(lines)
    return K(styles)(xs => xs.forEach(s => s.setGeometry(geometry)))
  } catch (err) {
    return styles
  }
}

const closedArrowEnd = (line, resolution, widthFactor = 10, bearing = 145) => {
  const [finalBearing] = G.bearings(line).reverse()
  const arrowWidth = resolution * widthFactor
  const PA = line[1].destinationPoint(arrowWidth, finalBearing - bearing)
  const PB = line[1].destinationPoint(arrowWidth, finalBearing + bearing)
  const I = LatLon.intersection(line[0], finalBearing, PA, finalBearing + 90)
  return [PA, line[1], PB, I, PA]
}

const simpleArrowEnd = (line, resolution, widthFactor = 10, bearing = 145) => {
  const [finalBearing] = G.bearings(line).reverse()
  const arrowWidth = resolution * widthFactor
  const PA = line[1].destinationPoint(arrowWidth, finalBearing - bearing)
  const PB = line[1].destinationPoint(arrowWidth, finalBearing + bearing)
  return [PA, line[1], PB]
}

const slashEnd = (line, angle, resolution, widthFactor = 10) => {
  const finalBearing = G.finalBearing(line)
  const arrowWidth = resolution * widthFactor
  const PA0 = line[1].destinationPoint(arrowWidth, finalBearing - angle)
  const PA1 = line[1].destinationPoint(-arrowWidth, finalBearing - angle)
  return [PA0, PA1]
}

const arc = (C, radius, angle, circumference, quads = 48) =>
  R.range(0, quads + 1)
    .map(i => angle + i * (circumference / quads))
    .map(offset => C.destinationPoint(radius, offset))


const geometries = {}

geometries['G*T*B-----'] = (feature, resolution) => {
  const [line, point] = feature.getGeometry().getGeometries()
  const linePoints = G.coordinates(line).map(G.toLatLon)
  const bearing = G.finalBearing(linePoints)
  const halfWidth = G.distance([linePoints[0], G.toLatLon(G.coordinates(point))])
  const A = linePoints[1].destinationPoint(halfWidth, bearing + 90)
  const B = linePoints[1].destinationPoint(halfWidth, bearing - 90)
  return lineStyle(feature, [linePoints, [A, B]])
}

geometries['G*T*C-----'] = (feature, resolution) => {
  const [line, point] = feature.getGeometry().getGeometries()
  const linePoints = G.coordinates(line).map(G.toLatLon)
  const halfWidth = G.distance([linePoints[0], G.toLatLon(G.coordinates(point))])
  const [A1, A2] = G.translateLine(halfWidth, 90)(linePoints)
  const [B1, B2] = G.translateLine(halfWidth, -90)(linePoints)
  const slashA = slashEnd([A1, A2], -45, resolution)
  const slashB = slashEnd([B1, B2], 45, resolution)
  return lineStyle(feature, [[A1, B1], [A1, A2], [B1, B2], slashA, slashB])
}

geometries['G*T*H-----'] = (feature, resolution) => {
  const [line, point] = feature.getGeometry().getGeometries()
  const linePoints = G.coordinates(line).map(G.toLatLon)
  const halfWidth = G.distance([linePoints[0], G.toLatLon(G.coordinates(point))])
  const [A1, A2] = G.translateLine(halfWidth, 90)(linePoints)
  const [B1, B2] = G.translateLine(halfWidth, -90)(linePoints)
  const slashA = slashEnd([A1, A2], 45, resolution)
  const slashB = slashEnd([B1, B2], -45, resolution)
  return lineStyle(feature, [[A1, B1], [A1, A2], [B1, B2], slashA, slashB])
}

geometries['G*T*J-----'] = (feature, resolution) => {
  const [line, point] = feature.getGeometry().getGeometries()
  const linePoints = G.coordinates(line).map(G.toLatLon)
  const bearing = G.finalBearing(linePoints)
  const halfWidth = G.distance([linePoints[0], G.toLatLon(G.coordinates(point))])
  const arrow = simpleArrowEnd(linePoints, resolution)
  const outerArc = arc(linePoints[1], halfWidth, bearing - 90, 180, 24)
  const innerArc = arc(linePoints[1], halfWidth * 0.8, bearing - 90, 180, 24)
  const spikes = R.range(0, outerArc.length)
    .filter(i => i % 2 === 0)
    .map(i => [outerArc[i], innerArc[i]])

  return lineStyle(feature, [linePoints, arrow, outerArc, ...spikes])
}

geometries['G*T*X-----'] = (feature, resolution) => {
  const [line, point] = feature.getGeometry().getGeometries()
  const linePoints = G.coordinates(line).map(G.toLatLon)
  const halfWidth = G.distance([linePoints[0], G.toLatLon(G.coordinates(point))])
  const bearing = G.finalBearing(linePoints)
  const A = linePoints[1].destinationPoint(halfWidth, bearing + 90)
  const B = linePoints[1].destinationPoint(halfWidth, bearing - 90)
  const [A1, A2] = G.translateLine(halfWidth * 0.75, 90)(linePoints)
  const [B1, B2] = G.translateLine(halfWidth * 0.75, -90)(linePoints)
  const arrowA = simpleArrowEnd([A1, A2], resolution)
  const arrowB = simpleArrowEnd([B1, B2], resolution)
  const arrowC = simpleArrowEnd(linePoints, resolution)
  return lineStyle(feature, [[A, B], linePoints, [A1, A2], [B1, B2], arrowA, arrowB, arrowC])
}

geometries['G*T*Y-----'] = (feature, resolution) => {
  const [line, point] = feature.getGeometry().getGeometries()
  const linePoints = G.coordinates(line).map(G.toLatLon)
  const halfWidth = G.distance([linePoints[0], G.toLatLon(G.coordinates(point))])
  const [A1, A2] = G.translateLine(halfWidth, 90)(linePoints)
  const [B1, B2] = G.translateLine(halfWidth, -90)(linePoints)
  const arrowA = simpleArrowEnd([A1, A2], resolution)
  const arrowB = simpleArrowEnd([B1, B2], resolution)
  return lineStyle(feature, [[A1, B1], [A1, A2], [B1, B2], arrowA, arrowB])
}

const labels = {}

export const collectionStyle = (feature, resolution) => {
  const sidc = parameterized(feature.getProperties().sidc)
  const labelFns = labels[sidc] || []
  const geometryFns = geometries[sidc] || defaultStyle
  return [geometryFns, ...labelFns].flatMap(fn => fn(feature, resolution))
}
