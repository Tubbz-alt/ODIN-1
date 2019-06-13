import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import { noop } from '../../../shared/combinators'

class ResultList extends React.Component {

  constructor (props) {
    super(props)

    if (props.options.searchItems) {
      this.state = { rows: props.options.searchItems.snapshot() }
    }
  }

  handleListKeyDown (event) {
    const { onChange } = this.props

    switch (event.key) {
      case 'Escape': {
        event.stopPropagation()
        onChange('')
        break
      }
    }
  }

  handleClick (key) {
    this.state.rows
      .filter(row => row.key === key)
      .filter(row => row.action)
      .forEach(row => row.action())
  }

  handleDoubleClick (key) {
    this.handleClick(key)
    ;(this.props.options.close || noop)()
  }

  handleItemKeyDown (key) {
    switch (event.key) {
      // NOTE: click is triggered implicitly
      case 'Enter': return (this.props.options.close || noop)()
      case 'Delete': return this.props.onDelete(key)
      case 'Backspace': if (event.metaKey) return this.props.onDelete(key)
    }
  }

  componentDidMount () {
    this.updateListener = rows => this.setState({ ...this.state, rows })
    if (this.props.options.searchItems) this.props.options.searchItems.on('updated', this.updateListener)
  }

  componentWillUnmount () {
    if (this.props.options.searchItems) this.props.options.searchItems.off('updated', this.updateListener)
  }

  render () {
    const { rows } = this.state
    const { classes } = this.props
    const display = rows.length ? 'block' : 'none'

    const listItems = () => (rows || []).map(row => (
      <ListItem
        button
        divider={ true }
        key={ row.key }
        onClick={ () => this.handleClick(row.key) }
        onDoubleClick={ () => this.handleDoubleClick(row.key) }
        onKeyDown={ () => this.handleItemKeyDown(row.key) }
      >
        { row.text }
      </ListItem>
    ))

    return (
      <List
        className={ classes.list }
        style={ { display } }
        onKeyDown={ event => this.handleListKeyDown(event) }
      >
        { listItems() }
      </List>
    )
  }
}

ResultList.propTypes = {
  classes: PropTypes.any.isRequired,
  options: PropTypes.any.isRequired,
  rows: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

const styles = theme => ({
  list: {
    maxHeight: 'fill-available',
    gridArea: 'content',
    overflow: 'auto'
  }
})

export default withStyles(styles)(ResultList)
