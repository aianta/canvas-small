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

import React, {useRef} from 'react'
import {View} from '@instructure/ui-view'
import {Flex} from '@instructure/ui-flex'
import {Heading} from '@instructure/ui-heading'
import {Text} from '@instructure/ui-text'
import {CloseButton} from '@instructure/ui-buttons'
import {Alert} from '@instructure/ui-alerts'
import {Img} from '@instructure/ui-img'

import AccessibilityIssuesDrawerFooter from './Footer'
import {useScope as createI18nScope} from '@canvas/i18n'

import SuccessBallons from '../../../images/success-ballons.svg'
import {NextResource} from '../../stores/AccessibilityScansStore'

const I18n = createI18nScope('accessibility_checker')

interface SuccessViewProps {
  title: string
  nextResource: NextResource
  onClose: () => void
  handleNext: () => void
  handlePrevious: () => void
  handleNextResource: () => void
  assertiveAlertMessage: string
  getLiveRegion: () => HTMLElement
}

const SuccessView: React.FC<SuccessViewProps> = ({
  title,
  nextResource,
  onClose,
  handleNext,
  handlePrevious,
  handleNextResource,
  assertiveAlertMessage,
  getLiveRegion,
}) => {
  const regionRef = useRef<HTMLDivElement | null>(null)
  return (
    <>
      <Flex as="div" direction="column" height="100vh" width="100%">
        <Flex.Item shouldGrow={true} as="main">
          <View
            as="header"
            padding="medium"
            elementRef={(el: Element | null) => {
              regionRef.current = el as HTMLDivElement | null
            }}
            aria-label={I18n.t('Accessibility Issues for %{title}', {
              title: title,
            })}
          >
            <View>
              <Heading level="h2" variant="titleCardRegular">
                {title}
              </Heading>
              <CloseButton
                placement="end"
                data-testid="close-button"
                margin="small"
                screenReaderLabel={I18n.t('Close')}
                onClick={onClose}
              />
            </View>
            <View margin="large 0">
              <Text size="large" variant="descriptionPage" as="h3">
                {I18n.t('You have fixed all accessibility issues on this page.')}
              </Text>
            </View>
            <View as="div" padding="xx-large x-large">
              <Img
                src={SuccessBallons}
                data-testid="success-ballons"
                height="378px"
                width="308px"
              />
            </View>
          </View>
        </Flex.Item>
        <Flex.Item as="footer">
          <AccessibilityIssuesDrawerFooter
            nextButtonName={nextResource?.index >= 0 ? I18n.t('Next resource') : I18n.t('Close')}
            onNext={handleNext}
            onBack={handlePrevious}
            onSaveAndNext={nextResource?.index >= 0 ? handleNextResource : onClose}
            isBackDisabled={true}
            isNextDisabled={true}
            isSaveAndNextDisabled={false}
          />
        </Flex.Item>
      </Flex>
      <Alert screenReaderOnly={true} liveRegionPoliteness="assertive" liveRegion={getLiveRegion}>
        {assertiveAlertMessage}
      </Alert>
    </>
  )
}
export default SuccessView
