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
import userEvent from '@testing-library/user-event'
import AllocationRuleCard, {
  type AllocationRuleType,
  type PeerReviewStudentType,
} from '../AllocationRuleCard'

describe('AllocationRuleCard', () => {
  const reviewer: PeerReviewStudentType = {
    id: '1',
    name: 'Pikachu',
  }

  const reviewee: PeerReviewStudentType = {
    id: '2',
    name: 'Piplup',
  }

  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('Rule descriptions for reviewer-focused rules', () => {
    it('displays "Must review" when mustReview is true and reviewPermitted is true', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: true,
        reviewPermitted: true,
        appliesToReviewer: true,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Pikachu')).toBeInTheDocument()
      expect(screen.getByText('Must review Piplup')).toBeInTheDocument()
    })

    it('displays "Must not review" when mustReview is true and reviewPermitted is false', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: true,
        reviewPermitted: false,
        appliesToReviewer: true,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Pikachu')).toBeInTheDocument()
      expect(screen.getByText('Must not review Piplup')).toBeInTheDocument()
    })

    it('displays "Should review" when mustReview is false and reviewPermitted is true', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: false,
        reviewPermitted: true,
        appliesToReviewer: true,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Pikachu')).toBeInTheDocument()
      expect(screen.getByText('Should review Piplup')).toBeInTheDocument()
    })

    it('displays "Should not review" when mustReview is false and reviewPermitted is false', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: false,
        reviewPermitted: false,
        appliesToReviewer: true,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Pikachu')).toBeInTheDocument()
      expect(screen.getByText('Should not review Piplup')).toBeInTheDocument()
    })
  })

  describe('Rule descriptions for reviewee-focused rules', () => {
    it('displays "Must be reviewed by" when mustReview is true and reviewPermitted is true', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: true,
        reviewPermitted: true,
        appliesToReviewer: false,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Piplup')).toBeInTheDocument()
      expect(screen.getByText('Must be reviewed by Pikachu')).toBeInTheDocument()
    })

    it('displays "Must not be reviewed by" when mustReview is true and reviewPermitted is false', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: true,
        reviewPermitted: false,
        appliesToReviewer: false,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Piplup')).toBeInTheDocument()
      expect(screen.getByText('Must not be reviewed by Pikachu')).toBeInTheDocument()
    })

    it('displays "Should be reviewed by" when mustReview is false and reviewPermitted is true', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: false,
        reviewPermitted: true,
        appliesToReviewer: false,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Piplup')).toBeInTheDocument()
      expect(screen.getByText('Should be reviewed by Pikachu')).toBeInTheDocument()
    })

    it('displays "Should not be reviewed by" when mustReview is false and reviewPermitted is false', () => {
      const rule: AllocationRuleType = {
        id: '1',
        reviewer,
        reviewee,
        mustReview: false,
        reviewPermitted: false,
        appliesToReviewer: false,
      }

      render(<AllocationRuleCard rule={rule} />)

      expect(screen.getByText('Piplup')).toBeInTheDocument()
      expect(screen.getByText('Should not be reviewed by Pikachu')).toBeInTheDocument()
    })
  })

  describe('Action buttons', () => {
    const defaultRule: AllocationRuleType = {
      id: '1',
      reviewer,
      reviewee,
      mustReview: true,
      reviewPermitted: true,
      appliesToReviewer: true,
    }

    beforeEach(() => {
      render(<AllocationRuleCard rule={defaultRule} />)
    })

    it('renders the edit button with correct accessibility label', () => {
      const editButton = screen.getByTestId('edit-allocation-rule-button')

      expect(editButton).toBeInTheDocument()
      expect(screen.getByText('Edit Allocation Rule: Must review Piplup')).toBeInTheDocument()
    })

    it('renders the delete button with correct accessibility label', () => {
      const deleteButton = screen.getByTestId('delete-allocation-rule-button')

      expect(deleteButton).toBeInTheDocument()
      expect(screen.getByText('Delete Allocation Rule: Must review Piplup')).toBeInTheDocument()
    })
  })
})
