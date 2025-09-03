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

import {TextData} from '../BlockItems/Text/types'
import {TitleData} from '../BlockItems/Title/types'

export type TextSettings = {
  settings: {
    includeBlockTitle: boolean
    backgroundColor: string
  }
}
export type TextBlockEditHandlers = {
  onTitleChange: (newTitle: string) => void
  onContentChange: (newContent: string) => void
}

export type TextBlockBase = TextData & TitleData & TextSettings
export type TextBlockEditProps = TextBlockBase & TextBlockEditHandlers
export type TextBlockPreviewProps = TextBlockBase
export type TextBlockProps = TextBlockBase
