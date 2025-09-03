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

import {createElement} from 'react'
import doFetchApi from '@canvas/do-fetch-api-effect'
import {InstUISettingsProvider} from '@instructure/emotion'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  AccessibilityCheckerContext,
  type AccessibilityCheckerContextType,
} from '../../../../contexts/AccessibilityCheckerContext'
import {FormType} from '../../../../types'
import {getAsAccessibilityResourceScan} from '../../../../utils/apiData'
import TextInputForm from '../TextInput'

// Mock the Button component to handle ai-primary color
jest.mock('@instructure/ui-buttons', () => {
  const originalModule = jest.requireActual('@instructure/ui-buttons')
  return {
    ...originalModule,
    Button: (props: any) => {
      // Convert ai-primary to primary for testing
      const testProps = {
        ...props,
        color: props.color === 'ai-primary' ? 'primary' : props.color,
      }
      return createElement(originalModule.Button, testProps)
    },
  }
})

jest.mock('@canvas/do-fetch-api-effect')

describe('TextInputForm', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  const defaultProps = {
    issue: {
      id: 'test-id',
      ruleId: 'test-rule',
      displayName: 'Test rule',
      message: 'Test message',
      why: 'Test why',
      element: 'test-element',
      path: 'test-path',
      form: {
        type: FormType.TextInput,
        label: 'Test Label',
      },
    },
    value: '',
    onChangeValue: jest.fn(),
  }

  // Create a fully typed mock context
  const mockContextValue: AccessibilityCheckerContextType = {
    selectedItem: getAsAccessibilityResourceScan({
      id: 123,
      type: 'Page' as any, // Using string literal that matches ContentItemType.WikiPage
      title: 'Mock Page',
      published: true,
      updatedAt: '2023-01-01',
      count: 0,
      url: 'http://example.com',
      editUrl: 'http://example.com/edit',
    }),
    setSelectedItem: jest.fn(),
    isTrayOpen: false,
    setIsTrayOpen: jest.fn(),
  }

  const propsWithGenerateOption = {
    ...defaultProps,
    issue: {
      ...defaultProps.issue,
      form: {
        ...defaultProps.issue.form,
        canGenerateFix: true,
        generateButtonLabel: 'Generate Alt Text',
      },
    },
  }

  it('renders without crashing', () => {
    render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithGenerateOption} />
      </AccessibilityCheckerContext.Provider>,
    )
    expect(screen.getByTestId('text-input-form')).toBeInTheDocument()
  })

  it('displays the correct label', () => {
    render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithGenerateOption} />
      </AccessibilityCheckerContext.Provider>,
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('displays the provided value', () => {
    const propsWithValue = {
      ...defaultProps,
      value: 'test value',
    }
    render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithValue} />
      </AccessibilityCheckerContext.Provider>,
    )
    const input = screen.getByTestId('text-input-form')
    expect(input).toHaveValue('test value')
  })

  it('calls onChangeValue when the input value changes', async () => {
    render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithGenerateOption} />
      </AccessibilityCheckerContext.Provider>,
    )
    const input = screen.getByTestId('text-input-form')
    await userEvent.type(input, 'a')
    expect(defaultProps.onChangeValue).toHaveBeenCalledWith('a')
  })

  it('displays the error message when an error is provided', () => {
    const propsWithError = {
      ...defaultProps,
      error: 'Error message',
    }
    render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithError} />
      </AccessibilityCheckerContext.Provider>,
    )
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('handles errors when generate API call fails', async () => {
    // Mock API failure
    ;(doFetchApi as jest.Mock).mockImplementation(options => {
      // Test that the path contains "/generate"
      expect(options.path).toContain('/generate')
      // Return a rejected promise
      return Promise.reject(new Error('API Error'))
    })

    render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithGenerateOption} />
      </AccessibilityCheckerContext.Provider>,
    )

    // Click the generate button
    const generateButton = screen.getByText('Generate Alt Text')
    fireEvent.click(generateButton)

    // Verify loading indicator appears
    expect(screen.getByText('Generating...')).toBeInTheDocument()

    // Wait for the loading state to be cleared after the error
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument()
    })

    // Verify that onChangeValue was not called (since the API failed)
    expect(defaultProps.onChangeValue).not.toHaveBeenCalled()
  })

  it('focuses the input when the form is refocused', () => {
    const {container} = render(
      <AccessibilityCheckerContext.Provider value={mockContextValue}>
        <TextInputForm {...propsWithGenerateOption} />
      </AccessibilityCheckerContext.Provider>,
    )
    const input = container.querySelector('input')
    expect(input).not.toHaveFocus()
    input?.focus()
    expect(input).toHaveFocus()
  })
})
