import { useState } from 'react'
import { CalendarStep } from './CalendarStep'
import { ConfirmStep } from './ConfirmStep'

export function ScheduleForm() {
  const [schedulingDate, setSchedulingDate] = useState<Date>(null)

  function handleCancelConfirmation() {
    setSchedulingDate(null)
  }

  if (schedulingDate) {
    return (
      <ConfirmStep
        schedulingDate={schedulingDate}
        onCancelConfirmation={handleCancelConfirmation}
      />
    )
  } else {
    return <CalendarStep onSelectedDateTime={setSchedulingDate} />
  }
}
