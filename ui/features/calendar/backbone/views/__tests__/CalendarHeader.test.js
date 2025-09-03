/*
 * Copyright (C) 2016 - present Instructure, Inc.
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

import $ from 'jquery'
import CalendarHeader from '../CalendarHeader'
import {isAccessible} from '@canvas/test-utils/jestAssertions'

let header
let originalENV

describe('CalendarHeader', function () {
  beforeEach(function () {
    // set up fixtures
    $('<div id="fixtures"></div>').appendTo('body')

    originalENV = global.ENV

    global.ENV = {
      current_user_roles: [],
      FEATURES: {},
    }

    header = new CalendarHeader()
    header.$el.appendTo($('#fixtures'))
  })

  afterEach(function () {
    header.$el.remove()
    $('#fixtures').empty()

    global.ENV = originalENV
  })

  // fails in Jest, passes in QUnit
  test.skip('it should be accessible', function (done) {
    isAccessible(header, done, {a11yReport: true})
  })

  test('#moveToCalendarViewButton clicks the next calendar view button', function (done) {
    const buttons = $('.calendar_view_buttons button')
    buttons.first().click()
    buttons.eq(1).on('click', () => {
      // 'next button was clicked'
      expect(true).toBeTruthy()
      done()
    })
    header.moveToCalendarViewButton('next')
  })

  test('#moveToCalendarViewButton wraps around to the first calendar view button', function (done) {
    const buttons = $('.calendar_view_buttons button')
    buttons.last().click()
    buttons.first().on('click', () => {
      // first button was clicked
      expect(true).toBeTruthy()
      done()
    })
    header.moveToCalendarViewButton('next')
  })

  test('#moveToCalendarViewButton clicks the previous calendar view button', function (done) {
    const buttons = $('.calendar_view_buttons button')
    buttons.last().click()
    buttons.eq(buttons.length - 2).on('click', () => {
      // previous button was clicked
      expect(true).toBeTruthy()
      done()
    })
    header.moveToCalendarViewButton('prev')
  })

  test('#moveToCalendarViewButton wraps around to the last calendar view button', function (done) {
    const buttons = $('.calendar_view_buttons button')
    buttons.first().click()
    buttons.last().on('click', () => {
      // last button was clicked
      expect(true).toBeTruthy()
      done()
    })
    header.moveToCalendarViewButton('prev')
  })

  test("calls #moveToCalendarViewButton with 'prev' when left key is pressed", function (done) {
    const {moveToCalendarViewButton} = header
    header.moveToCalendarViewButton = direction => {
      expect(direction).toBe('prev')
      header.moveToCalendarViewButton = moveToCalendarViewButton
      done()
    }
    const e = $.Event('keydown', {which: 37})
    $('.calendar_view_buttons').trigger(e)
  })

  test("calls #moveToCalendarViewButton with 'prev' when up key is pressed", function (done) {
    const {moveToCalendarViewButton} = header
    header.moveToCalendarViewButton = direction => {
      expect(direction).toBe('prev')
      header.moveToCalendarViewButton = moveToCalendarViewButton
      done()
    }
    const e = $.Event('keydown', {which: 38})
    $('.calendar_view_buttons').trigger(e)
  })

  test("calls #moveToCalendarViewButton with 'next' when right key is pressed", function (done) {
    const {moveToCalendarViewButton} = header
    header.moveToCalendarViewButton = direction => {
      expect(direction).toBe('next')
      header.moveToCalendarViewButton = moveToCalendarViewButton
      done()
    }
    const e = $.Event('keydown', {which: 39})
    $('.calendar_view_buttons').trigger(e)
  })

  test("calls #moveToCalendarViewButton with 'next' when down key is pressed", function (done) {
    const {moveToCalendarViewButton} = header
    header.moveToCalendarViewButton = direction => {
      expect(direction).toBe('next')
      header.moveToCalendarViewButton = moveToCalendarViewButton
      done()
    }
    const e = $.Event('keydown', {which: 40})
    $('.calendar_view_buttons').trigger(e)
  })

  test('when a calendar view button is clicked it is properly activated', function (done) {
    $('.calendar_view_buttons button')
      .last()
      .on('click', e => {
        header.toggleView(e)
        const button = $('.calendar_view_buttons button').last()
        expect(button.attr('aria-selected')).toBe('true')
        expect(button.attr('tabindex')).toBe('0')
        expect(button.hasClass('active')).toBeTruthy()
        button.siblings().each(function () {
          expect($(this).attr('aria-selected')).toBe('false')
          expect($(this).attr('tabindex')).toBe('-1')
          expect($(this).hasClass('active')).not.toBeTruthy()
        })
        done()
      })
    $('.calendar_view_buttons button').last().click()
  })

  describe('_shouldShowCreateEventLink', function () {
    test('returns true when user is not a student', function () {
      global.ENV.current_user_roles = ['teacher']
      global.ENV.FEATURES = {restrict_student_access: true}
      expect(header._shouldShowCreateEventLink()).toBe(true)
    })

    test('returns true when user is a student but restrict_student_access is false', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: false}
      expect(header._shouldShowCreateEventLink()).toBe(true)
    })

    test('returns true when user is a student but restrict_student_access is undefined', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {}
      expect(header._shouldShowCreateEventLink()).toBe(true)
    })

    test('returns false when user is a student and restrict_student_access is true', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: true}
      expect(header._shouldShowCreateEventLink()).toBe(false)
    })

    test('returns false when user is a student with other roles and restrict_student_access is true', function () {
      global.ENV.current_user_roles = ['student', 'observer']
      global.ENV.FEATURES = {restrict_student_access: true}
      expect(header._shouldShowCreateEventLink()).toBe(false)
    })

    test('returns true when current_user_roles is undefined', function () {
      global.ENV.current_user_roles = undefined
      global.ENV.FEATURES = {restrict_student_access: true}
      expect(header._shouldShowCreateEventLink()).toBe(true)
    })

    test('returns true when current_user_roles is empty', function () {
      global.ENV.current_user_roles = []
      global.ENV.FEATURES = {restrict_student_access: true}
      expect(header._shouldShowCreateEventLink()).toBe(true)
    })
  })

  describe('showNavigator behavior with create event link', function () {
    beforeEach(function () {
      header.$navigator = {show: jest.fn()}

      header.$createNewEventLink = {
        show: jest.fn(),
        hide: jest.fn(),
      }
    })

    test('shows create event link when user is not a student', function () {
      global.ENV.current_user_roles = ['teacher']
      global.ENV.FEATURES = {restrict_student_access: true}

      header.showNavigator()

      expect(header.$createNewEventLink.show).toHaveBeenCalled()
      expect(header.$createNewEventLink.hide).not.toHaveBeenCalled()
    })

    test('hides create event link when user is a student and restrict_student_access is enabled', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: true}

      header.showNavigator()

      expect(header.$createNewEventLink.hide).toHaveBeenCalled()
      expect(header.$createNewEventLink.show).not.toHaveBeenCalled()
    })

    test('shows create event link when user is a student but restrict_student_access is disabled', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: false}

      header.showNavigator()

      expect(header.$createNewEventLink.show).toHaveBeenCalled()
      expect(header.$createNewEventLink.hide).not.toHaveBeenCalled()
    })

    test('handles missing create event link gracefully', function () {
      header.$createNewEventLink = null
      global.ENV.current_user_roles = ['teacher']
      global.ENV.FEATURES = {restrict_student_access: true}

      expect(() => {
        header.showNavigator()
      }).not.toThrow()
    })
  })

  describe('_triggerCreateNewEvent behavior', function () {
    let mockEvent
    let triggerSpy

    beforeEach(function () {
      mockEvent = {
        preventDefault: jest.fn(),
      }
      triggerSpy = jest.spyOn(header, 'trigger').mockImplementation(() => {})
    })

    afterEach(function () {
      triggerSpy.mockRestore()
    })

    test('triggers createNewEvent when user is not a student', function () {
      global.ENV.current_user_roles = ['teacher']
      global.ENV.FEATURES = {restrict_student_access: true}

      const result = header._triggerCreateNewEvent(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(triggerSpy).toHaveBeenCalledWith('createNewEvent')
      expect(result).not.toBe(false)
    })

    test('prevents default and returns false when user is a student and restrict_student_access is enabled', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: true}

      const result = header._triggerCreateNewEvent(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(triggerSpy).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    test('triggers createNewEvent when user is a student but restrict_student_access is disabled', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: false}

      const result = header._triggerCreateNewEvent(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(triggerSpy).toHaveBeenCalledWith('createNewEvent')
      expect(result).not.toBe(false)
    })
  })

  describe('_triggerCreateNewEvent behavior', function () {
    let mockEvent
    let triggerSpy

    beforeEach(function () {
      mockEvent = {
        preventDefault: jest.fn(),
      }
      triggerSpy = jest.spyOn(header, 'trigger').mockImplementation(() => {})
    })

    afterEach(function () {
      triggerSpy.mockRestore()
    })

    test('triggers createNewEvent when user is not a student', function () {
      global.ENV.current_user_roles = ['teacher']

      const result = header._triggerCreateNewEvent(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(triggerSpy).toHaveBeenCalledWith('createNewEvent')
      expect(result).not.toBe(false)
    })

    test('prevents default and returns false when user is a student', function () {
      global.ENV.current_user_roles = ['student']
      global.ENV.FEATURES = {restrict_student_access: true} // Add this line

      const result = header._triggerCreateNewEvent(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(triggerSpy).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })

  describe('_isUserStudent', function () {
    test('returns true when user has student role', function () {
      global.ENV.current_user_roles = ['student']
      expect(header._isUserStudent()).toBe(true)
    })

    test('returns true when user has student role among others', function () {
      global.ENV.current_user_roles = ['teacher', 'student', 'admin']
      expect(header._isUserStudent()).toBe(true)
    })

    test('returns false when user does not have student role', function () {
      global.ENV.current_user_roles = ['teacher', 'admin']
      expect(header._isUserStudent()).toBe(false)
    })

    test('returns undefined when current_user_roles is undefined', function () {
      global.ENV = {
        FEATURES: {},
        current_user_roles: undefined,
      }
      expect(header._isUserStudent()).toBeUndefined()
    })

    test('returns null when current_user_roles is null', function () {
      global.ENV.current_user_roles = null
      expect(header._isUserStudent()).toBeNull()
    })

    test('returns false when current_user_roles is empty', function () {
      global.ENV.current_user_roles = []
      expect(header._isUserStudent()).toBe(false)
    })
  })
})
