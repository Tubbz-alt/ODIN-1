import ProjectManagement from '../../../src/renderer/components/ProjectManagement'
import React from 'react'
import sinon from 'sinon'
import { expect } from 'chai'


/* eslint-disable no-undef */
describe('Project management', () => {
  const clickCallback = sinon.spy()
  const wrapper = shallow(<ProjectManagement currentProjectPath={''} onCloseClicked={clickCallback} />)

  it('verify project management components', () => {
    expect(wrapper.find('#projects')).to.have.lengthOf(1)
    expect(wrapper.find('#importProject')).to.have.lengthOf(1)
    expect(wrapper.find('#projectList')).to.have.lengthOf(1)
    expect(wrapper.find('#projectActions')).to.have.lengthOf(1)
    expect(wrapper.find('Details'), 'details').to.have.lengthOf(1)
  })

  it('verify back to map button is clicked', () => {
    wrapper.find('#backToMap').simulate('click')
    sinon.assert.called(clickCallback)

  })
})

