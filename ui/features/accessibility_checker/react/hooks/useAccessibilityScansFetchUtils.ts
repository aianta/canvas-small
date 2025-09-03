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

import {useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import doFetchApi, {DoFetchApiResults} from '@canvas/do-fetch-api-effect'

import {
  defaultStateToFetch,
  NewStateToFetch,
  useAccessibilityScansStore,
} from '../stores/AccessibilityScansStore'
import {API_FETCH_ERROR_MESSAGE_PREFIX, IssuesTableHeaderApiNames} from '../constants'
import {AccessibilityResourceScan, Filters} from '../types'
import {convertKeysToCamelCase, getParsedFilters} from '../utils/apiData'
import {updateQueryParams} from '../utils/query'

const getApiRequestParams = (requestedFetch: NewStateToFetch): Record<string, any> => {
  const params: Record<string, any> = {}

  if (requestedFetch.page !== undefined) {
    params['page'] = requestedFetch.page
  }

  if (requestedFetch.pageSize !== undefined) {
    params['per_page'] = requestedFetch.pageSize
  }

  if (requestedFetch.tableSortState?.sortId && requestedFetch.tableSortState.sortDirection) {
    params['sort'] = IssuesTableHeaderApiNames[requestedFetch.tableSortState.sortId]
    params['direction'] =
      requestedFetch.tableSortState.sortDirection === 'ascending' ? 'asc' : 'desc'
  }

  if (requestedFetch.filters !== undefined) {
    params['filters'] = requestedFetch.filters
  }

  if (requestedFetch.search) {
    // TODO Check API support for search
    // params['search'] = requestedFetch.search
  }

  return params
}

const getPageCountFromResponse = (data: DoFetchApiResults<AccessibilityResourceScan[]>): number => {
  const links =
    data?.response?.headers
      ?.get('link')
      ?.split(',')
      .map(link => link.trim()) || []

  const lastLink = links.find(link => link.includes('rel="last"'))
  const lastLinkQuery = lastLink ? new URLSearchParams(lastLink.split('?')[1]) : null
  const pageCount = Number.parseInt(lastLinkQuery?.get('page') || '1', 10) ?? 1

  return pageCount
}

export const useAccessibilityScansFetchUtils = () => {
  const [page, pageSize, tableSortState, search] = useAccessibilityScansStore(
    useShallow(state => [state.page, state.pageSize, state.tableSortState, state.search]),
  )
  const [
    setAccessibilityScans,
    setError,
    setLoading,
    setPage,
    setPageCount,
    setPageSize,
    setSearch,
    setTableSortState,
  ] = useAccessibilityScansStore(
    useShallow(state => [
      state.setAccessibilityScans,
      state.setError,
      state.setLoading,
      state.setPage,
      state.setPageCount,
      state.setPageSize,
      state.setSearch,
      state.setTableSortState,
    ]),
  )

  const doFetchAccessibilityScanData = useCallback(
    async (
      requestedStateChange: Partial<NewStateToFetch>,
      filters: Filters | null = null,
    ): Promise<void> => {
      try {
        // Picking up existing state (or default, if not yet set)
        const newStateToFetch: NewStateToFetch = {
          ...defaultStateToFetch,
          page,
          pageSize,
          tableSortState: tableSortState || defaultStateToFetch.tableSortState,
          search: search || defaultStateToFetch.search,
          filters: filters ? getParsedFilters(filters) : undefined,
        }

        Object.assign(newStateToFetch, requestedStateChange)

        const params = getApiRequestParams(newStateToFetch)

        setLoading(true)
        setError(null)

        const path = window.location.pathname.replace(
          '/accessibility',
          '/accessibility_resource_scans',
        )

        const data: DoFetchApiResults<AccessibilityResourceScan[]> = await doFetchApi({
          path,
          params,
          method: 'GET',
        })

        const pageCount = getPageCountFromResponse(data)

        const accessibilityScans = convertKeysToCamelCase(data.json) as AccessibilityResourceScan[]
        setAccessibilityScans(accessibilityScans)
        setPage(newStateToFetch.page!)
        setPageCount(pageCount)
        setPageSize(newStateToFetch.pageSize!)
        setSearch(newStateToFetch.search!)
        setTableSortState(newStateToFetch.tableSortState!)

        updateQueryParams(newStateToFetch)
      } catch (err: any) {
        setError(API_FETCH_ERROR_MESSAGE_PREFIX + err.message)
      } finally {
        setLoading(false)
      }
    },
    [
      page,
      pageSize,
      search,
      tableSortState,
      setAccessibilityScans,
      setError,
      setLoading,
      setPage,
      setPageCount,
      setPageSize,
      setSearch,
      setTableSortState,
    ],
  )

  return {
    doFetchAccessibilityScanData,
  }
}
