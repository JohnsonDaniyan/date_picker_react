import * as React from 'react'

import { CalendarDate, CalendarStyles, CalendarValues, Target } from './types'
import { Flex, useMultiStyleConfig } from '@chakra-ui/react'
import {
  Locale,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  startOfWeek,
} from 'date-fns'

import { CalendarContext } from './context'
import { useCalendar } from './useCalendar'

export type Calendar = React.PropsWithChildren<{
  value: CalendarValues
  highlightedDay?: CalendarDate
  onSelectDate: (value: CalendarDate | CalendarValues) => void
  months?: number
  locale?: Locale
  allowOutsideDays?: boolean
  disablePastDates?: boolean | Date
  disableFutureDates?: boolean | Date
  disableWeekends?: boolean
  disableDates?: CalendarDate[]
  singleDateSelection?: boolean
  weekdayFormat?: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  highlightToday?: boolean
  weekDateSelection?: boolean
  allowSelectSameDay?: boolean
}>

export function Calendar({
  children,
  months,
  value,
  allowOutsideDays,
  singleDateSelection,
  disablePastDates,
  disableFutureDates,
  disableWeekends,
  disableDates,
  locale,
  weekdayFormat,
  onSelectDate,
  weekStartsOn,
  weekDateSelection,
  highlightToday,
  allowSelectSameDay,
  highlightedDay,
}: Calendar) {
  const styles = useMultiStyleConfig('Calendar', {}) as CalendarStyles

  const { resetDate, ...values } = useCalendar({
    allowOutsideDays,
    blockFuture: false,
    start: value?.start || new Date(),
    months,
    locale,
    weekStartsOn,
  })

  const [target, setTarget] = React.useState<Target>(Target.START)
  const [dt, setDt] = React.useState<CalendarDate|undefined>(highlightedDay)
  React.useEffect(() => {
    if (isValid(value.start)) {
      resetDate()
    }
    // missing resetDate, adding resetDate causes to calendar
    // impossible to navigation through months.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.start])

  const selectDateHandler = (date: CalendarDate) => {
    if (singleDateSelection) {
      setDt(date)
      return onSelectDate(date)
    }

    if (weekDateSelection) {
      return onSelectDate({
        start: startOfWeek(date, { locale, weekStartsOn }),
        end: endOfWeek(date, { locale, weekStartsOn }),
      })
    }

    if (
      !allowSelectSameDay &&
      ((value.start && isSameDay(date, value.start)) ||
        (value.end && isSameDay(date, value.end)))
    ) {
      return
    }

    if (value.start && isBefore(date, value.start)) {
      return onSelectDate({ ...value, start: date })
    }

    if (value.end && isAfter(date, value.end)) {
      return onSelectDate({ ...value, end: date })
    }

    if (target === Target.END) {
      setTarget(Target.START)
      return onSelectDate({ ...value, end: date })
    }

    setTarget(Target.END)
    return onSelectDate({ ...value, start: date })
  }

  return (
    <CalendarContext.Provider
      value={{
        ...values,
        onSelectDates: selectDateHandler,
        highlightedDay: dt,
        startSelectedDate: value?.start,
        endSelectedDate: value?.end,
        disableDates,
        disableFutureDates,
        disablePastDates,
        disableWeekends,
        locale,
        weekdayFormat,
        weekStartsOn,
        highlightToday,
      }}
    >
      <Flex sx={styles.calendar}>{children}</Flex>
    </CalendarContext.Provider>
  )
}
