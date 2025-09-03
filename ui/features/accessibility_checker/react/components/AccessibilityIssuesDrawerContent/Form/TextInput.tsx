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
import React, {forwardRef, useImperativeHandle, useRef, useState, useContext} from 'react'
import {Alert} from '@instructure/ui-alerts'
import {Button} from '@instructure/ui-buttons'
import {Flex} from '@instructure/ui-flex'
import {IconAiSolid} from '@instructure/ui-icons'
import {Spinner} from '@instructure/ui-spinner'
import {TextInput} from '@instructure/ui-text-input'
import doFetchApi from '@canvas/do-fetch-api-effect'
import {useScope as createI18nScope} from '@canvas/i18n'

import {AccessibilityCheckerContext} from '../../../contexts/AccessibilityCheckerContext'
import {GenerateResponse} from '../../../types'
import {getAsContentItemType} from '../../../utils/apiData'
import {stripQueryString} from '../../../utils/query'
import {FormComponentProps, FormComponentHandle} from '.'

const I18n = createI18nScope('accessibility_checker')

const TextInputForm: React.FC<FormComponentProps & React.RefAttributes<FormComponentHandle>> =
  forwardRef<FormComponentHandle, FormComponentProps>(
    ({issue, error, value, onChangeValue}: FormComponentProps, ref) => {
      const [generateLoading, setGenerateLoading] = useState(false)
      const {selectedItem} = useContext(AccessibilityCheckerContext)
      const inputRef = useRef<HTMLInputElement | null>(null)
      const [generationError, setGenerationError] = useState<string | null>(null)

      useImperativeHandle(ref, () => ({
        focus: () => {
          inputRef.current?.focus()
        },
      }))

      const handleGenerateClick = () => {
        setGenerateLoading(true)
        setGenerationError(null)
        doFetchApi<GenerateResponse>({
          path: `${stripQueryString(window.location.href)}/generate`,
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            rule: issue.ruleId,
            path: issue.path,
            value: value,
            content_id: selectedItem?.resourceId,
            content_type: getAsContentItemType(selectedItem?.resourceType),
          }),
        })
          .then(result => {
            return result.json
          })
          .then(resultJson => {
            onChangeValue(resultJson?.value)
          })
          .catch(error => {
            console.error('Error generating text input:', error)
            const statusCode = error?.response?.status || 0

            if (statusCode == 429) {
              setGenerationError(
                I18n.t(
                  'You have exceeded your daily limit for table caption generation. (You can generate captions for 300 tables per day.) Please try again after a day, or enter the caption manually.',
                ),
              )
            } else {
              setGenerationError(
                I18n.t(
                  'There was an error generating table caption. Please try again, or enter it manually.',
                ),
              )
            }
          })
          .finally(() => setGenerateLoading(false))
      }

      return (
        <>
          <TextInput
            data-testid="text-input-form"
            renderLabel={issue.form.label}
            value={value || ''}
            onChange={(_, value) => onChangeValue(value)}
            inputRef={el => (inputRef.current = el)}
            messages={error ? [{text: error, type: 'newError'}] : []}
          />
          <Flex as="div" margin="small 0">
            <Flex.Item>
              <Button
                color="ai-primary"
                renderIcon={() => <IconAiSolid />}
                onClick={handleGenerateClick}
                disabled={generateLoading}
              >
                {issue.form.generateButtonLabel}
              </Button>
            </Flex.Item>
            {generateLoading ? (
              <Flex.Item>
                <Spinner
                  size="x-small"
                  renderTitle={I18n.t('Generating...')}
                  margin="0 small 0 0"
                />
              </Flex.Item>
            ) : (
              <></>
            )}
          </Flex>
          {generationError !== null ? (
            <Flex>
              <Flex.Item>
                <Alert variant="error" renderCloseButtonLabel="Close" timeout={5000}>
                  {generationError}
                </Alert>
              </Flex.Item>
            </Flex>
          ) : (
            <></>
          )}
        </>
      )
    },
  )

export default TextInputForm
