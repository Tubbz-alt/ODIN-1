import * as R from 'ramda'
import React from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { withStyles } from '@material-ui/core/styles'
import { propTypes, styles } from './Map'

const lnglat = ({ lng, lat }) => [lng, lat]
const zoom = map => map.getZoom()
const center = map => lnglat(map.getCenter())
const viewport = map => ({ zoom: zoom(map), center: center(map) })

class Map extends React.Component {
  componentDidMount () {
    const { id, viewportChanged } = this.props

    const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map(id, {
      zoom: this.props.viewport.zoom,
      center: L.latLng(this.props.viewport.center.reverse()),
      layers: [new L.TileLayer(url, { maxZoom: 19 })]
    })

    const moveend = R.compose(viewportChanged, viewport)
    this.map.on('moveend', ({ target }) => moveend(target))
  }

  render () {
    const props = { id: this.props.id, className: this.props.classes.root }
    return <div {...props} />
  }
}

Map.propTypes = propTypes
export default withStyles(styles)(Map)