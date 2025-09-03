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
import {TextBlock} from '../Blocks/TextBlock'
import {ReactElement} from 'react'
import {ImageBlock} from '../Blocks/ImageBlock'
import {SeparatorLineBlock} from '../Blocks/SeparatorLineBlock'
import {ButtonBlock} from '../Blocks/ButtonBlock'
import {HighlightBlock} from '../Blocks/HighlightBlock'
import {colors} from '@instructure/canvas-theme'
import {ImageTextBlock} from '../Blocks/ImageTextBlock'

const I18n = createI18nScope('block_content_editor')

type BlockFactory = {[key: string]: () => ReactElement}

const defaultBackgroundColor = colors.primitives.white

export const blockFactory = {
  [TextBlock.name]: () => (
    <TextBlock
      title=""
      content=""
      settings={{includeBlockTitle: true, backgroundColor: defaultBackgroundColor}}
    />
  ),
  [ImageBlock.name]: () => <ImageBlock url="" altText="" />,
  [SeparatorLineBlock.name]: () => (
    <SeparatorLineBlock
      thickness="small"
      settings={{separatorColor: colors.ui.lineDivider, backgroundColor: defaultBackgroundColor}}
    />
  ),
  [ButtonBlock.name]: () => (
    <ButtonBlock
      settings={{
        includeBlockTitle: true,
        alignment: 'left',
        layout: 'horizontal',
        isFullWidth: false,
        buttons: [{id: 1, text: ''}],
        backgroundColor: defaultBackgroundColor,
      }}
      title=""
    />
  ),
  [HighlightBlock.name]: () => (
    <HighlightBlock
      content=""
      settings={{
        displayIcon: 'warning',
        highlightColor: colors.additionalPrimitives.ocean12,
        textColor: colors.ui.textDescription,
        backgroundColor: defaultBackgroundColor,
      }}
    />
  ),
  [ImageTextBlock.name]: () => (
    <ImageTextBlock
      url=""
      altText=""
      title=""
      content=""
      settings={{
        includeBlockTitle: true,
        backgroundColor: defaultBackgroundColor,
        textColor: colors.ui.textDescription,
        arrangement: 'left',
        textToImageRatio: '1:1',
      }}
    />
  ),
  video: () => <p>video</p>,
} as const satisfies BlockFactory

export type BlockTypes = keyof typeof blockFactory

export type BlockData = {
  groupName: string
  items: {
    itemName: string
    id: BlockTypes
  }[]
}

export const blockData: BlockData[] = [
  {
    groupName: I18n.t('Text'),
    items: [
      {itemName: TextBlock.craft.displayName, id: TextBlock.name},
      {itemName: HighlightBlock.craft.displayName, id: HighlightBlock.name},
      {itemName: ImageTextBlock.craft.displayName, id: ImageTextBlock.name},
    ],
  },
  {
    groupName: I18n.t('Image'),
    items: [
      {itemName: ImageBlock.craft.displayName, id: ImageBlock.name},
      {itemName: ImageTextBlock.craft.displayName, id: ImageTextBlock.name},
    ],
  },
  {
    groupName: I18n.t('Highlight'),
    items: [{itemName: HighlightBlock.craft.displayName, id: HighlightBlock.name}],
  },
  {
    groupName: I18n.t('Multimedia'),
    items: [{itemName: I18n.t('Video'), id: 'video'}],
  },
  {
    groupName: I18n.t('Interactive element'),
    items: [{itemName: ButtonBlock.craft.displayName, id: ButtonBlock.name}],
  },
  {
    groupName: I18n.t('Divider'),
    items: [{itemName: SeparatorLineBlock.craft.displayName, id: SeparatorLineBlock.name}],
  },
]
