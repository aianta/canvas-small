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

export interface HasId {
  id: number
}

export enum ContentItemType {
  WikiPage = 'Page',
  Assignment = 'Assignment',
  Attachment = 'attachment',
}

/* export const ContentTypeToKey = {
  [ContentItemType.WikiPage]: 'pages',
  [ContentItemType.Assignment]: 'assignments',
  [ContentItemType.Attachment]: 'attachments',
} as const */

export enum FormType {
  TextInput = 'textinput',
  RadioInputGroup = 'radio_input_group',
  Button = 'button',
  ColorPicker = 'colorpicker',
  CheckboxTextInput = 'checkbox_text_input',
}

export interface IssueForm {
  type: FormType
  label?: string
  undoText?: string
  canGenerateFix?: boolean
  generateButtonLabel?: string
  value?: string
  options?: string[]
  action?: string
  inputLabel?: string
  titleLabel?: string
  backgroundColor?: string
  contrastRatio?: number
  checkboxLabel?: string
  checkboxSubtext?: string
  inputDescription?: string
  inputMaxLength?: number
}

export enum ScanWorkflowState {
  Queued = 'queued',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
}

export enum ResourceWorkflowState {
  Unpublished = 'unpublished',
  Published = 'published',
}

export enum ResourceType {
  WikiPage = 'WikiPage',
  Assignment = 'Assignment',
  Attachment = 'Attachment',
}

export interface AccessibilityResourceScan extends HasId {
  id: number
  resourceId: number
  resourceType: ResourceType
  resourceName: string
  resourceWorkflowState: ResourceWorkflowState
  resourceUpdatedAt: string
  resourceUrl: string
  workflowState: ScanWorkflowState
  errorMessage?: string
  issueCount: number
  issues?: AccessibilityIssue[]
}

export interface AccessibilityIssue {
  id: string
  ruleId: string
  displayName: string
  message: string
  why: string
  element: string
  path: string
  issueUrl?: string
  form: IssueForm
}

export interface AccessibilityData {
  pages?: Record<string, ContentItem>
  assignments?: Record<string, ContentItem>
  attachments?: Record<string, ContentItem>
  lastChecked?: string
  accessibilityScanDisabled?: boolean
}

export interface ContentItem extends HasId {
  id: number
  type: ResourceType // Was ContentItemType
  title: string
  published: boolean
  updatedAt: string
  count: number
  url: string
  editUrl?: string
  issues?: AccessibilityIssue[]
  severity?: Severity
}

export interface PreviewResponse {
  content: string
  path?: string
}

export type FormValue = any

export type Severity = 'High' | 'Medium' | 'Low'

export type IssueDataPoint = {
  id: string
  issue: string
  count: number
  severity: Severity
}

export type RawData = Record<string, any>

export type ContrastData = {
  contrast: number
  isValidNormalText: boolean
  isValidLargeText: boolean
  isValidGraphicsText: boolean
  firstColor: string
  secondColor: string
}

export type GenerateResponse = {
  value?: string
}

export type Filters = {
  ruleTypes?: string[]
  artifactTypes?: string[]
  workflowStates?: string[]
  fromDate?: Date | null
  toDate?: Date | null
}

export type FilterDateKeys = 'fromDate' | 'toDate'

export type ParsedFilters = Omit<Partial<Filters>, FilterDateKeys> & {
  fromDate?: string
  toDate?: string
}
