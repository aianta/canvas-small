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

import {useScope as createI18nScope} from '@canvas/i18n'

const I18n = createI18nScope('widget_dashboard')

export const TAB_IDS = {
  DASHBOARD: 'dashboard',
  COURSES: 'courses',
} as const

export type TabId = (typeof TAB_IDS)[keyof typeof TAB_IDS]

export const WIDGET_TYPES = {
  COURSE_WORK_SUMMARY: 'course_work_summary',
  COURSE_WORK: 'course_work',
  COURSE_GRADES: 'course_grades',
  ANNOUNCEMENTS: 'announcements',
} as const

export type WidgetType = (typeof WIDGET_TYPES)[keyof typeof WIDGET_TYPES]

export const DEFAULT_WIDGET_CONFIG = {
  columns: 3,
  widgets: [
    {
      id: 'course-work-summary-widget',
      type: WIDGET_TYPES.COURSE_WORK_SUMMARY,
      position: {col: 1, row: 1},
      size: {width: 2, height: 1},
      title: I18n.t("Today's course work"),
    },
    {
      id: 'announcements-widget',
      type: WIDGET_TYPES.ANNOUNCEMENTS,
      position: {col: 3, row: 1},
      size: {width: 1, height: 2},
      title: I18n.t('Announcements'),
    },
    {
      id: 'course-grades-widget',
      type: WIDGET_TYPES.COURSE_GRADES,
      position: {col: 1, row: 2},
      size: {width: 2, height: 2},
      title: I18n.t('Course Grades'),
    },
    {
      id: 'course-work-widget',
      type: WIDGET_TYPES.COURSE_WORK,
      position: {col: 1, row: 4},
      size: {width: 2, height: 2},
      title: I18n.t('Course Work'),
    },
  ],
}
