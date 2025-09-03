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

import {TableColHeaderProps} from '@instructure/ui-table'

import {IssuesTableColumns} from '../constants'
import {
  defaultStateToFetch,
  NewStateToFetch,
  TableSortState,
} from '../stores/AccessibilityScansStore'

/**
 * Use only with the AccessibilityScansStore!
 * @returns
 */
export const parseFetchParams = () => {
  const parsedFetchParams: NewStateToFetch = {
    page: defaultStateToFetch.page,
    pageSize: defaultStateToFetch.pageSize,
    tableSortState: {
      ...defaultStateToFetch.tableSortState,
    },
    search: defaultStateToFetch.search,
  }
  const queryParams = new URLSearchParams(window.location.search)

  if (queryParams.has('page')) {
    const page = parseInt(queryParams.get('page') || ``)
    parsedFetchParams.page = isNaN(page) ? defaultStateToFetch.page : Math.max(page, 1)
  }

  if (queryParams.has('page-size')) {
    const pageSize = parseInt(queryParams.get('page-size') || ``)
    parsedFetchParams.pageSize = isNaN(pageSize)
      ? defaultStateToFetch.pageSize
      : Math.max(pageSize, 1)
  }

  if (queryParams.has('sort-id')) {
    const sortId = queryParams.get('sort-id')

    if (Object.values(IssuesTableColumns).includes(sortId ?? '')) {
      const sortDirection = queryParams.get('sort-direction')
      if (['ascending', 'descending'].includes(sortDirection ?? '')) {
        parsedFetchParams.tableSortState!.sortId = sortId
        parsedFetchParams.tableSortState!.sortDirection =
          sortDirection as TableColHeaderProps['sortDirection']
      }
    }

    parsedFetchParams.tableSortState!.sortId = queryParams.get('sort-id')
  }

  if (queryParams.has('search')) {
    parsedFetchParams.search = queryParams.get('search') || defaultStateToFetch.search
  }

  return parsedFetchParams
}

/**
 * Strip the query string part (set by the deeplinking feature) from the URL
 * @param href - the full length URL including the query string
 * @returns - the URL without the query string
 */
export const stripQueryString = (href: string): string => {
  return href.replace(/\?.*$/, '')
}

/**
 * Use only with the AccessibilityScansStore!
 * Temporarily used function, until changing this won't need to trigger a refetch.
 */
export const updateQueryParamPage = (newPage?: number) => {
  const queryParams = new URLSearchParams(window.location.search)
  if (newPage !== undefined) {
    queryParams.set('page', newPage.toString())
  } else {
    queryParams.delete('page')
  }

  window.history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`)
}

/**
 * Use only with the AccessibilityScansStore!
 * Temporarily used function, until changing this won't need to trigger a refetch.
 */
export const updateQueryParamPageSize = (newPageSize?: number) => {
  const queryParams = new URLSearchParams(window.location.search)
  if (newPageSize !== undefined && newPageSize !== defaultStateToFetch.pageSize) {
    queryParams.set('page-size', newPageSize.toString())
  } else {
    queryParams.delete('page-size')
  }

  window.history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`)
}

/**
 * Use only with the AccessibilityScansStore!
 * Temporarily used function, until changing this won't need to trigger a refetch.
 */
export const updateQueryParamTableSortState = (newTableSortState?: TableSortState) => {
  const queryParams = new URLSearchParams(window.location.search)

  const newSortDirectionUsed = newTableSortState?.sortDirection || 'none'

  if (newTableSortState?.sortId && newSortDirectionUsed !== 'none') {
    queryParams.set('sort-id', newTableSortState.sortId)
    queryParams.set('sort-direction', newSortDirectionUsed)
  } else {
    queryParams.delete('sort-id')
    queryParams.delete('sort-direction')
  }

  window.history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`)
}

/**
 * To be called on successful fetch: use only with the AccessibilityScansStore!
 */
export const updateQueryParams = (latestFetchedState: NewStateToFetch) => {
  const queryParams = new URLSearchParams(window.location.search)
  const {page, pageSize, tableSortState, search} = latestFetchedState

  if (page !== undefined) {
    queryParams.set('page', page.toString())
  } else {
    queryParams.delete('page')
  }

  if (pageSize !== undefined && pageSize !== defaultStateToFetch.pageSize) {
    queryParams.set('page-size', pageSize.toString())
  } else {
    queryParams.delete('page-size')
  }

  const newSortDirectionUsed = tableSortState?.sortDirection || 'none'

  if (tableSortState?.sortId && newSortDirectionUsed !== 'none') {
    queryParams.set('sort-id', tableSortState.sortId)
    queryParams.set('sort-direction', tableSortState.sortDirection || 'none')
  } else {
    queryParams.delete('sort-id')
    queryParams.delete('sort-direction')
  }

  if (search) {
    queryParams.set('search', search)
  } else {
    queryParams.delete('search')
  }

  window.history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`)
}
