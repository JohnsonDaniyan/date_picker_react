import * as React from 'react'

import {
  eachDayOfInterval,
  endOfMonth,
  isAfter,
  isBefore,
  isSameDay,
  isWeekend,
  startOfMonth,
} from 'date-fns'

import { CalendarContext } from './context'
import { CalendarDate } from './types'
import { MonthContext } from './month'

export type CalendarDayContext = {
  day: CalendarDate
}

export const DayContext = React.createContext<CalendarDayContext>({ day: 0 })

export function useCalendarDay() {
  const {
    dates,
    onSelectDates,
    startSelectedDate,
    endSelectedDate,
    disableDates,
    disableFutureDates,
    disablePastDates,
    disableWeekends,
    highlightToday,
    highlightedDay,
  } = React.useContext(CalendarContext)

  const { day } = React.useContext(DayContext)
  const { month } = React.useContext(MonthContext)

  let variant:
    | 'selected'
    | 'range'
    | 'outside'
    | 'today'
    | 'highlighted'
    | undefined

  if (highlightToday && isSameDay(new Date(), day)) {
    variant = 'today'
  }

  const isSelected =
    (startSelectedDate && isSameDay(day, startSelectedDate)) ||
    (endSelectedDate && isSameDay(day, endSelectedDate))

  const isHighlighted = highlightedDay && isSameDay(day, highlightedDay)

  if (isSelected) {
    variant = 'selected'
  }

  if (isHighlighted) {
    variant = 'highlighted'
  }

  if (
    (isBefore(day, startOfMonth(dates[Number(month)].startDateOfMonth)) ||
      isAfter(day, endOfMonth(dates[Number(month)].startDateOfMonth))) &&
    !isSelected
  ) {
    variant = 'outside'
  }

  const interval =
    startSelectedDate &&
    endSelectedDate &&
    eachDayOfInterval({
      start: startSelectedDate,
      end: endSelectedDate,
    })

  const isInRange = interval
    ? interval.some(date => isSameDay(day, date) && !isSelected)
    : false

  if (isInRange && !isSelected) {
    variant = 'range'
  }

  const isDisabled =
    (disablePastDates &&
      isBefore(
        day,
        disablePastDates instanceof Date ? disablePastDates : new Date()
      )) ||
    (disableFutureDates &&
      isAfter(
        day,
        disableFutureDates instanceof Date ? disableFutureDates : new Date()
      )) ||
    (disableWeekends && isWeekend(day)) ||
    (disableDates && disableDates.some(date => isSameDay(day, date)))

  return {
    day,
    variant,
    isSelected,
    interval,
    isInRange,
    isDisabled,
    onSelectDates,
  }
}
