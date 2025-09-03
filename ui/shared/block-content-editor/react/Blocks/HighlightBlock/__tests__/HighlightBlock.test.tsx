/*
 * Copyright (C) 2025 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {screen} from '@testing-library/react'
import {HighlightBlock} from '../HighlightBlock'
import {renderBlock} from '../../__tests__/render-helper'

jest.mock('../../../BlockContentEditorContext', () => ({
  __esModule: true,
  useBlockContentEditorContext: jest.fn(() => ({})),
}))

jest.mock('@instructure/canvas-theme', () => ({
  colors: {
    additionalPrimitives: {
      ocean30: '#0374B5',
      ocean12: '#E8F4FD',
    },
    ui: {
      textDescription: '#2D3B45',
    },
  },
}))

describe('HighlightBlock', () => {
  const defaultSettings = {
    displayIcon: 'warning',
    highlightColor: '#E8F4FD',
    textColor: '#2D3B45',
    backgroundColor: '#E8F4FD',
  }

  it('should render with Highlight title', () => {
    renderBlock(HighlightBlock, {content: 'Test content', settings: defaultSettings})
    const title = screen.getByText('Highlight')

    expect(title).toBeInTheDocument()
  })

  it('should render the content', () => {
    renderBlock(HighlightBlock, {content: 'Test highlight content', settings: defaultSettings})
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toBeInTheDocument()
    expect(highlightBlock).toHaveTextContent('Test highlight content')
  })

  it('should display the icon by default', () => {
    renderBlock(HighlightBlock, {content: 'Test content', settings: defaultSettings})
    const icon = screen.getByTestId('highlight-icon')

    expect(icon).toBeInTheDocument()
  })

  it('should not display the icon when displayIcon is null', () => {
    renderBlock(HighlightBlock, {
      content: 'Test content',
      settings: {...defaultSettings, displayIcon: null},
    })
    const icon = screen.queryByTestId('highlight-icon')

    expect(icon).not.toBeInTheDocument()
  })

  it('should apply the correct highlight color', () => {
    const highlightColor = '#ffeb3b'
    renderBlock(HighlightBlock, {
      content: 'Test content',
      settings: {...defaultSettings, highlightColor},
    })
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveStyle(`background-color: ${highlightColor}`)
  })

  it('should apply default highlight color if none is provided', () => {
    renderBlock(HighlightBlock, {content: 'Test content', settings: defaultSettings})
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveStyle('background-color: #E8F4FD')
  })

  it('should apply the default text color', () => {
    renderBlock(HighlightBlock, {content: 'Test content', settings: defaultSettings})
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveStyle('color: #2D3B45')
  })

  it('should show placeholder text in edit preview mode when content is empty', () => {
    renderBlock(HighlightBlock, {content: '', settings: defaultSettings})
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveTextContent('Click to edit')
  })

  it('should apply the correct text color', () => {
    const textColor = '#FF0000'
    renderBlock(HighlightBlock, {
      content: 'Test content',
      settings: {...defaultSettings, textColor},
    })
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveStyle(`color: ${textColor}`)
  })

  it('should use different highlight colors', () => {
    const customHighlightColor = '#FFE4E1'
    renderBlock(HighlightBlock, {
      content: 'Different background test',
      settings: {...defaultSettings, highlightColor: customHighlightColor},
    })
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveStyle(`background-color: ${customHighlightColor}`)
  })

  it('should apply both custom highlight and text colors', () => {
    const customHighlightColor = '#FFFACD'
    const customTextColor = '#4B0082'
    renderBlock(HighlightBlock, {
      content: 'Both custom colors test',
      settings: {
        ...defaultSettings,
        highlightColor: customHighlightColor,
        textColor: customTextColor,
      },
    })
    const highlightBlock = screen.getByTestId('highlight-block')

    expect(highlightBlock).toHaveStyle(`background-color: ${customHighlightColor}`)
    expect(highlightBlock).toHaveStyle(`color: ${customTextColor}`)
  })
})
