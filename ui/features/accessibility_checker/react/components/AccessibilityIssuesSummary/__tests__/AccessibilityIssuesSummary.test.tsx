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

import {render, screen, waitFor} from '@testing-library/react'
import {act, renderHook} from '@testing-library/react-hooks'

import {useAccessibilityScansStore} from '../../../stores/AccessibilityScansStore'
import {AccessibilityIssuesSummary} from '../../AccessibilityIssuesSummary/AccessibilityIssuesSummary'
import {mockScanData} from '../../../stores/mockData'

describe('AccessibilityIssuesSummary', () => {
  beforeEach(() => {
    window.ENV.SCAN_DISABLED = false
  })

  it('renders without error', async () => {
    const {result} = renderHook(() => useAccessibilityScansStore())

    await act(() => {
      result.current.setLoading(false)
      result.current.setAccessibilityScans(mockScanData)
    })

    render(<AccessibilityIssuesSummary />)
    await waitFor(() =>
      expect(screen.getByTestId('accessibility-issues-summary')).toBeInTheDocument(),
    )
  })

  it('renders without error with empty dataset', async () => {
    const {result} = renderHook(() => useAccessibilityScansStore())

    await act(() => {
      result.current.setLoading(false)
      result.current.setAccessibilityScans([])
    })

    render(<AccessibilityIssuesSummary />)
    await waitFor(() =>
      expect(screen.getByTestId('accessibility-issues-summary')).toBeInTheDocument(),
    )
  })

  it('does not render when accessibility scan is disabled', () => {
    renderHook(() => useAccessibilityScansStore())
    window.ENV.SCAN_DISABLED = true

    render(<AccessibilityIssuesSummary />)
    expect(screen.queryByTestId('accessibility-issues-summary')).not.toBeInTheDocument()
  })

  it('does not render when loading is not completed', () => {
    const {result} = renderHook(() => useAccessibilityScansStore())

    act(() => {
      result.current.setLoading(true)
      result.current.setAccessibilityScans(null)
    })

    render(<AccessibilityIssuesSummary />)
    expect(screen.queryByTestId('accessibility-issues-summary')).not.toBeInTheDocument()
  })
})
