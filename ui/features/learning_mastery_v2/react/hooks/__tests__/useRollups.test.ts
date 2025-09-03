/*
 * Copyright (C) 2021 - present Instructure, Inc.
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

import {renderHook, act} from '@testing-library/react-hooks/dom'
import axios from '@canvas/axios'
import useRollups from '../useRollups'
import {DEFAULT_STUDENTS_PER_PAGE, SortOrder} from '../../utils/constants'
import {Outcome, Rating, Student} from '../../types/rollup'
import {MOCK_OUTCOMES, MOCK_RATINGS, MOCK_STUDENTS} from '../../__fixtures__/rollups'

jest.useFakeTimers()

jest.mock('@canvas/axios')

describe('useRollups', () => {
  const mockedStudents: Student[] = MOCK_STUDENTS
  const mockedRatings: Rating[] = MOCK_RATINGS
  const mockedOutcomes: Outcome[] = MOCK_OUTCOMES

  const mockedRollups = [
    {
      links: {
        user: '1',
        status: 'active',
      },
      scores: [
        {
          score: 4,
          links: {
            outcome: '1',
          },
        },
      ],
    },
    {
      links: {
        user: '2',
        status: 'inactive',
      },
      scores: [
        {
          score: 4,
          links: {
            outcome: '1',
          },
        },
      ],
    },
    {
      links: {
        user: '3',
        status: 'completed',
      },
      scores: [
        {
          score: 0,
          links: {
            outcome: '1',
          },
        },
      ],
    },
  ]

  beforeEach(() => {
    const promise = Promise.resolve({
      status: 200,
      data: {
        linked: {
          users: mockedStudents,
          outcomes: mockedOutcomes,
        },
        rollups: mockedRollups,
        meta: {
          pagination: {
            page: 1,
            per_page: 20,
            page_count: 1,
          },
        },
      },
    })
    ;(axios.get as jest.Mock).mockResolvedValue(promise)
  })

  describe('useRollups hook', () => {
    it('returns defaults until the request finishes loading', async () => {
      const {result} = renderHook(() =>
        useRollups({courseId: '1', accountMasteryScalesEnabled: false}),
      )
      const {isLoading, students, outcomes, rollups, gradebookFilters} = result.current
      expect(isLoading).toEqual(true)
      expect(students).toEqual([])
      expect(outcomes).toEqual([])
      expect(rollups).toEqual([])
      expect(gradebookFilters).toEqual([])
      await act(async () => jest.runAllTimers())
      expect(result.current.isLoading).toEqual(false)
    })

    it('returns the response after the request finishes', async () => {
      const {result} = renderHook(() =>
        useRollups({courseId: '1', accountMasteryScalesEnabled: false}),
      )
      await act(async () => jest.runAllTimers())
      const {isLoading, error, students, outcomes, rollups, gradebookFilters} = result.current
      expect(isLoading).toEqual(false)
      expect(error).toEqual(null)
      expect(axios.get).toHaveBeenCalled()
      expect(students).toEqual(mockedStudents)
      expect(outcomes).toEqual(mockedOutcomes)
      expect(gradebookFilters).toEqual([])

      const expectedRollups = [
        {
          studentId: '1',
          outcomeRollups: [
            {
              outcomeId: '1',
              rating: {...mockedRatings[0], color: `#${mockedRatings[0].color}`},
            },
          ],
        },
        {
          studentId: '2',
          outcomeRollups: [
            {
              outcomeId: '1',
              rating: {...mockedRatings[0], color: `#${mockedRatings[0].color}`},
            },
          ],
        },
        {
          studentId: '3',
          outcomeRollups: [
            {
              outcomeId: '1',
              rating: {...mockedRatings[1], color: `#${mockedRatings[1].color}`},
            },
          ],
        },
      ]
      expect(rollups).toStrictEqual(expectedRollups)
    })

    it("correctly translates student status from 'completed' to 'concluded' when loading rollups", async () => {
      const {result} = renderHook(() =>
        useRollups({courseId: '1', accountMasteryScalesEnabled: false}),
      )
      await act(async () => jest.runAllTimers())
      const {students} = result.current
      expect(axios.get).toHaveBeenCalled()
      expect(students[2].status).toEqual('concluded')
    })

    it('calls the /rollups URL with the right parameters', async () => {
      renderHook(() => useRollups({courseId: '1', accountMasteryScalesEnabled: false}))
      await act(async () => jest.runAllTimers())
      const params = {
        params: {
          rating_percents: true,
          per_page: DEFAULT_STUDENTS_PER_PAGE,
          exclude: [],
          include: ['outcomes', 'users', 'outcome_paths', 'alignments'],
          sort_by: 'student',
          add_defaults: true,
          sort_order: SortOrder.ASC,
          page: 1,
        },
      }
      expect(axios.get).toHaveBeenCalledWith('/api/v1/courses/1/outcome_rollups', params)
    })

    const ERROR_MESSAGE_TEST_CASES = [
      {
        description: 'empty error response',
        errorResponse: {},
        expectedErrorMessage: 'Error loading rollups',
      },
      {
        description: 'Axios error response',
        errorResponse: (() => {
          const error = new axios.AxiosError()
          error.message = 'Error loading rollups Axios'
          return error
        })(),
        expectedErrorMessage: 'Error loading rollups Axios',
      },
    ]

    ERROR_MESSAGE_TEST_CASES.forEach(testCase => {
      it(`returns error message on failed request of ${testCase.description}`, async () => {
        const axiosError = new axios.AxiosError()
        axiosError.message = 'Network Error'
        ;(axios.get as jest.Mock).mockRejectedValue(testCase.errorResponse)
        const {result} = renderHook(() =>
          useRollups({courseId: '1', accountMasteryScalesEnabled: false}),
        )
        await act(async () => jest.runAllTimers())
        const {isLoading, error} = result.current
        expect(axios.get).toHaveBeenCalled()
        expect(error).toEqual(testCase.expectedErrorMessage)
        expect(isLoading).toEqual(false)
      })
    })
  })
})
