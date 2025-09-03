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

import React, {Ref, useCallback, useEffect, useRef, useState, useContext, useMemo} from 'react'

import {Alert} from '@instructure/ui-alerts'
import {View} from '@instructure/ui-view'
import {Heading} from '@instructure/ui-heading'
import {Text} from '@instructure/ui-text'
import {CloseButton} from '@instructure/ui-buttons'
import {Link} from '@instructure/ui-link'
import {Flex} from '@instructure/ui-flex'
import {Spinner} from '@instructure/ui-spinner'
import {useShallow} from 'zustand/react/shallow'
import {FormFieldMessage} from '@instructure/ui-form-field'

import getLiveRegion from '@canvas/instui-bindings/react/liveRegion'
import doFetchApi from '@canvas/do-fetch-api-effect'
import {useScope as createI18nScope} from '@canvas/i18n'
import {useDebouncedCallback} from 'use-debounce'
import {AccessibilityCheckerContext} from '../../contexts/AccessibilityCheckerContext'
import AccessibilityIssuesDrawerFooter from './Footer'
import Form, {FormHandle} from './Form'
import {AccessibilityIssue, AccessibilityResourceScan, FormType, FormValue} from '../../types'
import {findById, getAsContentItemType, replaceById} from '../../utils/apiData'
import {stripQueryString} from '../../utils/query'
import Preview, {PreviewHandle} from './Preview'
import WhyMattersPopover from './WhyMattersPopover'
import ApplyButton from './ApplyButton'
import {
  useAccessibilityScansStore,
  defaultNextResource,
  NextResource,
} from '../../stores/AccessibilityScansStore'

import SuccessView from './SuccessView'
import {useNextResource} from '../../hooks/useNextResource'

const I18n = createI18nScope('accessibility_checker')

interface AccessibilityIssuesDrawerContentProps {
  item: AccessibilityResourceScan
  onClose: () => void
}

function renderSpinner() {
  return (
    <Flex as="div" height="100%" justifyItems="center" alignItems="center" width="100%">
      <Flex.Item>
        <Spinner renderTitle={I18n.t('Loading...')} size="large" margin="auto" />
      </Flex.Item>
    </Flex>
  )
}

const AccessibilityIssuesDrawerContent: React.FC<AccessibilityIssuesDrawerContentProps> = ({
  item,
  onClose,
}: AccessibilityIssuesDrawerContentProps) => {
  const [isRequestInFlight, setIsRequestInFlight] = useState(false)
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0)
  const context = useContext(AccessibilityCheckerContext)
  const {setSelectedItem} = context
  const [issues, setIssues] = useState<AccessibilityIssue[]>(item.issues || [])
  const [isRemediated, setIsRemediated] = useState<boolean>(false)
  const [isFormLocked, setIsFormLocked] = useState<boolean>(false)
  const [assertiveAlertMessage, setAssertiveAlertMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>()

  const [accessibilityScans, nextResource] = useAccessibilityScansStore(
    useShallow(state => [state.accessibilityScans, state.nextResource]),
  )
  const [setAccessibilityScans, setNextResource] = useAccessibilityScansStore(
    useShallow(state => [state.setAccessibilityScans, state.setNextResource]),
  )

  const {getNextResource, updateCountPropertyForItem, getAccessibilityIssuesByItem} =
    useNextResource()

  const previewRef: Ref<PreviewHandle> = useRef<PreviewHandle>(null)
  const formRef: Ref<FormHandle> = useRef<FormHandle>(null)
  const regionRef = useRef<HTMLDivElement | null>(null)

  // This debounces the preview update to prevent excessive API calls when the user is typing.
  const updatePreview = useDebouncedCallback((formValue: FormValue) => {
    previewRef.current?.update(
      formValue,
      () => {
        setFormError(null)
        setAssertiveAlertMessage(null)
        setIsRemediated(true)
      },
      error => {
        if (error) {
          setFormError(error)
          setAssertiveAlertMessage(error)
        }
        setIsRemediated(false)
      },
    )
  }, 1000)
  const current = {resource: item, issues: issues, issue: issues[currentIssueIndex]}

  const isApplyButtonHidden = useMemo(
    () => [FormType.CheckboxTextInput].includes(current.issue?.form?.type),
    [current.issue],
  )

  const handleNext = useCallback(() => {
    setCurrentIssueIndex(prev => Math.min(prev + 1, issues.length - 1))
  }, [issues.length])

  const handlePrevious = useCallback(() => {
    setCurrentIssueIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const handleNextResource = useCallback(() => {
    if (!nextResource) return
    const nextItem = nextResource.item
    if (!nextItem) return

    setSelectedItem(nextItem)

    if (accessibilityScans) {
      const newNextResource = getNextResource(accessibilityScans, nextItem)
      if (newNextResource) {
        setNextResource(newNextResource)
      }
    }
  }, [accessibilityScans, nextResource, setSelectedItem, setNextResource, getNextResource])

  const handleApply = useCallback(() => {
    setIsFormLocked(true)
    const formValue = formRef.current?.getValue()
    previewRef.current?.update(
      formValue,
      () => {
        setFormError(null)
        setAssertiveAlertMessage(current.issue.form.undoText || I18n.t('Issue fixed'))
        setIsRemediated(true)
        setIsFormLocked(false)
      },
      error => {
        if (error) {
          formRef.current?.focus()
          setFormError(error)
          setAssertiveAlertMessage(error)
        }
        setIsRemediated(false)
        setIsFormLocked(false)
      },
    )
  }, [formRef, previewRef, current.issue])

  const handleUndo = useCallback(() => {
    setIsFormLocked(true)
    previewRef.current?.reload(
      () => {
        setFormError(null)
        setAssertiveAlertMessage(I18n.t('Issue undone'))
        setIsRemediated(false)
        setIsFormLocked(false)
      },
      error => {
        if (error) {
          formRef.current?.focus()
          setFormError(error)
          setAssertiveAlertMessage(error)
        }
        setIsRemediated(true)
        setIsFormLocked(false)
      },
    )
  }, [formRef, previewRef])

  const updateAccessibilityIssues = useCallback(
    (updatedIssues: AccessibilityIssue[]) => {
      if (!accessibilityScans) return

      const target = findById(accessibilityScans, item.id)

      if (!target) return

      const updated: AccessibilityResourceScan[] = replaceById(accessibilityScans, {
        ...target,
        issues: updatedIssues,
        issueCount: updatedIssues.length,
      })

      setAccessibilityScans(updated)
    },
    [accessibilityScans, item.id, setAccessibilityScans],
  )

  const handleSaveAndNext = useCallback(() => {
    if (!current.issue) return

    const issueId = current.issue.id
    const formValue = formRef.current?.getValue()

    setIsRequestInFlight(true)
    doFetchApi({
      path: stripQueryString(window.location.href) + '/issues',
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        content_type: getAsContentItemType(current.resource.resourceType)!,
        content_id: current.resource.resourceId,
        rule: current.issue.ruleId,
        path: current.issue.path,
        value: formValue,
      }),
    })
      .then(() => {
        const updatedIssues = issues.filter(issue => issue.id !== issueId)
        setIssues(updatedIssues)
        if (accessibilityScans) {
          const updatedOrderedTableData = updateCountPropertyForItem(
            accessibilityScans,
            current.resource,
          )
          setAccessibilityScans(updatedOrderedTableData)
          if (nextResource) {
            const nextItem: AccessibilityResourceScan = accessibilityScans[nextResource.index]
            if (nextItem) {
              nextItem.issues = getAccessibilityIssuesByItem(accessibilityScans, nextItem)

              const updatedNextResource: NextResource = {index: nextResource.index, item: nextItem}
              setNextResource(updatedNextResource)
            }
          }
        }
        updateAccessibilityIssues(updatedIssues)
        setCurrentIssueIndex(prev => Math.max(0, Math.min(prev, updatedIssues.length - 1)))
      })
      .catch(err => console.error('Error saving accessibility issue. Error is: ' + err.message))
      .finally(() => setIsRequestInFlight(false))
  }, [
    formRef,
    current.issue,
    current.resource,
    issues,
    updateAccessibilityIssues,
    accessibilityScans,
    nextResource,
    getAccessibilityIssuesByItem,
    setAccessibilityScans,
    setNextResource,
    updateCountPropertyForItem,
  ])

  const handleApplyAndSaveAndNext = useCallback(() => {
    setIsFormLocked(true)
    const formValue = formRef.current?.getValue()
    previewRef.current?.update(
      formValue,
      () => {
        setFormError(null)
        setAssertiveAlertMessage(null)
        setIsRemediated(true)
        setIsFormLocked(false)
        handleSaveAndNext()
      },
      error => {
        if (error) {
          setFormError(error)
          setAssertiveAlertMessage(error)
        }
        setIsRemediated(false)
        setIsFormLocked(false)
      },
    )
  }, [handleSaveAndNext, formRef, previewRef])

  const applyButtonText = useMemo(() => {
    if (!current.issue) return null
    if (
      current.issue.form.type === FormType.Button ||
      current.issue.form.type === FormType.ColorPicker
    )
      return current.issue.form.label
    return current.issue.form.action || I18n.t('Apply')
  }, [current.issue])

  const handleClearError = useCallback(() => {
    setFormError(null)
  }, [])

  useEffect(() => {
    setIsRemediated(false)
    setIsFormLocked(false)
    setAssertiveAlertMessage(null)
    setFormError(null)
  }, [current.issue])

  if (!current.issue)
    return (
      <SuccessView
        title={current.resource.resourceName}
        nextResource={nextResource || defaultNextResource}
        onClose={onClose}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleNextResource={handleNextResource}
        assertiveAlertMessage={assertiveAlertMessage || ''}
        getLiveRegion={getLiveRegion}
      />
    )

  if (isRequestInFlight) return renderSpinner()

  return (
    <View position="fixed" overflowY="auto">
      <Flex as="div" direction="column" height="100vh" width="100%">
        <Flex.Item
          as="header"
          padding="medium"
          elementRef={(el: Element | null) => {
            regionRef.current = el as HTMLDivElement | null
          }}
        >
          <View>
            <Heading level="h2" variant="titleCardRegular">
              {current.resource.resourceName}
            </Heading>
            <CloseButton
              placement="end"
              data-testid="close-button"
              margin="small"
              screenReaderLabel={I18n.t('Close')}
              onClick={onClose}
            />
          </View>
          <View>
            <Text size="large" variant="descriptionPage" as="h3">
              {I18n.t('Issue %{current}/%{total}: %{message}', {
                current: currentIssueIndex + 1,
                total: issues.length,
                message: current.issue.displayName,
              })}{' '}
              <WhyMattersPopover issue={current.issue} />
            </Text>
          </View>
        </Flex.Item>
        <Flex.Item as="main" padding="x-small medium" shouldGrow={true}>
          <Flex justifyItems="space-between">
            <Text weight="weightImportant">{I18n.t('Problem area')}</Text>
            <Flex gap="small">
              <Link href={current.resource.resourceUrl} variant="standalone">
                {I18n.t('Open Page')}
              </Link>
              <Link href={`${current.resource.resourceUrl}/edit`} variant="standalone">
                {I18n.t('Edit Page')}
              </Link>
            </Flex>
          </Flex>
          <View as="div" margin="medium 0">
            <Preview
              ref={previewRef}
              issue={current.issue}
              resourceId={current.resource.resourceId}
              itemType={current.resource.resourceType}
            />
          </View>
          {current.issue.form.type !== FormType.ColorPicker && (
            <View as="section" margin="medium 0">
              <Text weight="weightImportant">{I18n.t('Issue description')}</Text>
              <br aria-hidden={true} />
              <Text weight="weightRegular">{current.issue.message}</Text>
            </View>
          )}
          <View as="section" margin="medium 0">
            <Form
              ref={formRef}
              issue={current.issue}
              error={formError}
              onReload={updatePreview}
              onClearError={handleClearError}
            />
          </View>
          {!isApplyButtonHidden && (
            <View as="section" margin="medium 0">
              <ApplyButton
                onApply={handleApply}
                onUndo={handleUndo}
                undoMessage={current.issue.form.undoText}
                isApplied={isRemediated}
                isLoading={isFormLocked}
              >
                {applyButtonText}
              </ApplyButton>
              {formError && current.issue.form.type === FormType.Button && (
                <View as="div" margin="x-small 0">
                  <FormFieldMessage variant="newError">{formError}</FormFieldMessage>
                </View>
              )}
            </View>
          )}
        </Flex.Item>
        <Flex.Item as="footer">
          <AccessibilityIssuesDrawerFooter
            nextButtonName={I18n.t('Save & Next')}
            onNext={handleNext}
            onBack={handlePrevious}
            onSaveAndNext={isApplyButtonHidden ? handleApplyAndSaveAndNext : handleSaveAndNext}
            isBackDisabled={currentIssueIndex === 0 || isFormLocked}
            isNextDisabled={currentIssueIndex === issues.length - 1 || isFormLocked}
            isSaveAndNextDisabled={
              (!isRemediated && !isApplyButtonHidden) || isFormLocked || !!formError
            }
          />
        </Flex.Item>
      </Flex>
      <Alert screenReaderOnly={true} liveRegionPoliteness="assertive" liveRegion={getLiveRegion}>
        {assertiveAlertMessage || ''}
      </Alert>
    </View>
  )
}

export default AccessibilityIssuesDrawerContent
