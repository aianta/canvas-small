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

import React from 'react'
import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import {FileNotFound} from '../FileNotFound'

describe('FileNotFound', () => {
  it('renders the file not found message', () => {
    render(<FileNotFound />)

    expect(screen.getByText('File Not Found')).toBeInTheDocument()
    expect(screen.getByTestId('file-not-found-message')).toBeInTheDocument()
    expect(screen.getByTestId('file-not-found-message')).toHaveTextContent(
      'The file you are looking for could not be found or you do not have permission to view it.',
    )
  })
})
