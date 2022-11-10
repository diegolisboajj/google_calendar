import { CaretLeft, CaretRight } from 'phosphor-react'
import dayjs from 'dayjs'

import {
  CalendarContainer,
  CalendarHeader,
  CalendarTitle,
  CalendarActions,
  CalendarBody,
  CalendarDay,
} from './styles'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

import { capitalize } from '@/utils/capitalize'
import { api } from '@/lib/axios'

interface CalendarProps {
  selectedDate?: Date
  onDateSelected: (date: Date) => void
}

type CalendarWeeks = Array<{
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}>

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {
  const router = useRouter()

  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1)
  })

  const { username } = router.query

  const { data: blockedDatesResponse, isLoading: isBlockedDatesLoading } =
    useQuery(
      ['calendar', username, currentDate.get('year'), currentDate.get('month')],
      async () => {
        const response = await api.get(`/users/${username}/blocked-dates`, {
          params: {
            year: currentDate.get('year'),
            month: currentDate.get('month') + 1,
          },
        })

        return response.data
      },
      {
        enabled: !!username,
      },
    )

  function handlePreviousMonth() {
    const previousMonthDate = currentDate.subtract(1, 'month')

    setCurrentDate(previousMonthDate)
  }

  function handleNextMonth() {
    const nextMonthDate = currentDate.add(1, 'month')

    setCurrentDate(nextMonthDate)
  }

  const currentMonthDescription = capitalize(currentDate.format('MMMM'))
  const currentYearDescription = currentDate.format('YYYY')

  const calendarWeeks = useMemo(() => {
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      return currentDate.set('date', i + 1)
    })

    const firstWeekDay = currentDate.get('day')

    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day')
      })
      .reverse()

    const lastDayOnMonth = currentDate.set('date', currentDate.daysInMonth())

    const nextMonthFillArray = Array.from({
      length:
        7 - ((daysInMonthArray.length + previousMonthFillArray.length) % 7),
    }).map((_, i) => {
      return lastDayOnMonth.add(i + 1, 'day')
    })

    const calendarDays = [
      ...previousMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
      ...daysInMonthArray.map((date) => {
        return {
          date,
          disabled:
            date.endOf('day').isBefore(new Date()) ||
            blockedDatesResponse?.blockedWeekDays.includes(date.get('day')) ||
            blockedDatesResponse?.blockedDates.includes(date.get('date')),
        }
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ]

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        if (!(i % 7)) {
          weeks.push({
            week: i / 7 + 1,
            days: original.slice(i, i + 7),
          })
        }

        return weeks
      },
      [],
    )

    return calendarWeeks
  }, [currentDate, blockedDatesResponse])

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonthDescription} <span>{currentYearDescription}</span>
        </CalendarTitle>

        {isBlockedDatesLoading && <p>Carregando...</p>}

        <CalendarActions>
          <button onClick={handlePreviousMonth}>
            <CaretLeft />
          </button>
          <button onClick={handleNextMonth}>
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            <th>DOM.</th>
            <th>SEG.</th>
            <th>TER.</th>
            <th>QUA.</th>
            <th>QUI.</th>
            <th>SEX.</th>
            <th>SÁB.</th>
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        disabled={disabled || isBlockedDatesLoading}
                        selected={date.isSame(selectedDate)}
                        onClick={() => onDateSelected(date.toDate())}
                      >
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}
