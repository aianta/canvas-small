/*
 * Copyright (C) 2014 - present Instructure, Inc.
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

/* eslint-disable no-undef */

if (!window.ENV) {
  window.ENV = {}
}

if (!window.ENV.FEATURES) {
  window.ENV.FEATURES = {}
}

if (!window.ENV.current_user_roles) {
  window.ENV.current_user_roles = []
}

jest.mock('@canvas/util/globalUtils', () => ({
  ...jest.requireActual('@canvas/util/globalUtils'),
  windowPathname: () => '/files',
  assignLocation: jest.fn(),
}))

jest.mock('@canvas/files/react/modules/filesEnv', () => ({
  ...jest.requireActual('@canvas/files/react/modules/filesEnv'),
  get userFileAccessRestricted() {
    return (
      window.ENV?.FEATURES?.restrict_student_access &&
      (window.ENV?.current_user_roles || []).includes('student')
    )
  },
}))

jest.mock('@canvas/files_v2/react/modules/filesEnvFactory', () => ({
  ...jest.requireActual('@canvas/files_v2/react/modules/filesEnvFactory'),
  createFilesEnv: customFilesContexts => ({
    ...jest
      .requireActual('@canvas/files_v2/react/modules/filesEnvFactory')
      .createFilesEnv(customFilesContexts),
    get userFileAccessRestricted() {
      return (
        window.ENV?.FEATURES?.restrict_student_access &&
        (window.ENV?.current_user_roles || []).includes('student')
      )
    },
  }),
}))

export default (window.ENV.FILES_CONTEXTS = [
  {
    asset_string: 'course_1',
    name: 'ryans test course',
    root_folder_id: '2',
    permissions: {
      manage_files: true,
      read_contents: true,
    },
  },
])
