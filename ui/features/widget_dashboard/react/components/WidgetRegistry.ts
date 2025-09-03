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

import type {WidgetRegistry, WidgetRenderer} from '../types'
import {WIDGET_TYPES} from '../constants'
import CourseWorkSummaryWidget from './widgets/CourseWorkSummaryWidget/CourseWorkSummaryWidget'
import CourseWorkWidget from './widgets/CourseWorkWidget/CourseWorkWidget'
import CourseGradesWidget from './widgets/CourseGradesWidget/CourseGradesWidget'
import AnnouncementsWidget from './widgets/AnnouncementsWidget/AnnouncementsWidget'

const widgetRegistry: WidgetRegistry = {
  [WIDGET_TYPES.COURSE_WORK_SUMMARY]: {
    component: CourseWorkSummaryWidget,
    displayName: "Today's course work",
    description: 'Shows summary of upcoming assignments and course work',
  },
  [WIDGET_TYPES.COURSE_WORK]: {
    component: CourseWorkWidget,
    displayName: 'Course Work',
    description: 'View and manage all your course assignments and tasks',
  },
  [WIDGET_TYPES.COURSE_GRADES]: {
    component: CourseGradesWidget,
    displayName: 'Course Grades',
    description: 'Track your grades and academic progress across all courses',
  },
  [WIDGET_TYPES.ANNOUNCEMENTS]: {
    component: AnnouncementsWidget,
    displayName: 'Announcements',
    description: 'Stay updated with the latest announcements from your courses',
  },
}

export const registerWidget = (type: string, renderer: WidgetRenderer): void => {
  widgetRegistry[type] = renderer
}

export const getWidget = (type: string): WidgetRenderer | undefined => {
  return widgetRegistry[type]
}

export const getAllWidgets = (): WidgetRegistry => {
  return {...widgetRegistry}
}

export const isRegisteredWidget = (type: string): boolean => {
  return type in widgetRegistry
}

export default widgetRegistry
