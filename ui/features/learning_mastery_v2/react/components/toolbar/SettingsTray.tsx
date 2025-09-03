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

import React, {useState} from 'react'
import {Button, CloseButton} from '@instructure/ui-buttons'
import {Flex} from '@instructure/ui-flex'
import {Text} from '@instructure/ui-text'
import {Tray} from '@instructure/ui-tray'
import {useScope as createI18nScope} from '@canvas/i18n'
import {GradebookSettings} from '../../utils/constants'
import {SecondaryInfoSelector} from './SecondaryInfoSelector'
import {DisplayFilterSelector} from './DisplayFilterSelector'

const I18n = createI18nScope('LearningMasteryGradebook')

export interface SettingsTrayProps {
  open: boolean
  onDismiss: () => void
  gradebookSettings: GradebookSettings
  setGradebookSettings: (settings: GradebookSettings) => void
}

export const SettingsTray: React.FC<SettingsTrayProps> = ({
  open,
  onDismiss,
  gradebookSettings,
  setGradebookSettings,
}) => {
  const [secondaryInfoDisplay, setSecondaryInfoDisplay] = useState(
    gradebookSettings.secondaryInfoDisplay,
  )
  const [displayFilters, setDisplayFilters] = useState(gradebookSettings.displayFilters)

  const resetForm = () => {
    setSecondaryInfoDisplay(gradebookSettings.secondaryInfoDisplay)
    setDisplayFilters(gradebookSettings.displayFilters)
  }

  const saveSettings = () => {
    setGradebookSettings({
      ...gradebookSettings,
      secondaryInfoDisplay,
      displayFilters,
    })
  }

  return (
    <Tray
      label={I18n.t('Settings Tray')}
      placement="end"
      size="small"
      open={open}
      onDismiss={onDismiss}
      data-testid="lmgb-settings-tray"
    >
      <Flex direction="column" padding="medium">
        <Flex alignItems="center" justifyItems="space-between" data-testid="lmgb-settings-header">
          <Text size="x-large" weight="bold">
            {I18n.t('Settings')}
          </Text>
          <CloseButton
            size="medium"
            screenReaderLabel={I18n.t('Close Settings Tray')}
            onClick={onDismiss}
            data-testid="lmgb-close-settings-button"
          />
        </Flex>
        <hr style={{marginBottom: '0', marginTop: '16px'}} />
      </Flex>
      <Flex direction="column" padding="small medium" alignItems="stretch" gap="medium">
        <SecondaryInfoSelector
          value={secondaryInfoDisplay}
          onChange={info => setSecondaryInfoDisplay(info)}
        />
        <DisplayFilterSelector
          values={displayFilters}
          onChange={filters => setDisplayFilters(filters)}
        />
        <Flex gap="small" alignItems="stretch" direction="column">
          <Button
            color="primary"
            onClick={() => {
              saveSettings()
              onDismiss()
            }}
          >
            {I18n.t('Apply')}
          </Button>
          <Button
            withBackground={false}
            onClick={() => {
              resetForm()
              onDismiss()
            }}
            themeOverride={{borderWidth: '0px'}}
          >
            {I18n.t('Cancel')}
          </Button>
        </Flex>
      </Flex>
    </Tray>
  )
}
