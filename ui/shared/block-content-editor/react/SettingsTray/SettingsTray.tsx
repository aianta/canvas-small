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

import {PropsWithChildren} from 'react'
import CanvasTray from '@canvas/trays/react/Tray'

export const SettingsTray = (
  props: PropsWithChildren<{
    title: string
    open: boolean
    onDismiss: () => void
  }>,
) => {
  return (
    <CanvasTray
      label={props.title}
      title={props.title}
      open={props.open}
      onDismiss={props.onDismiss}
      headerPadding="small"
      contentPadding="small"
      placement="end"
      size="regular"
      data-testid="settings-tray"
      shouldCloseOnDocumentClick={true}
    >
      {props.children}
    </CanvasTray>
  )
}
