interface GoalCalendarCellProps {
  goalsDue: number
  milestonesCompleted: number
}

export function GoalCalendarCell({ goalsDue, milestonesCompleted }: GoalCalendarCellProps) {
  if (goalsDue === 0 && milestonesCompleted === 0) return null

  return (
    <div className="flex items-center gap-0.5 mt-0.5">
      {goalsDue > 0 && (
        <div className="w-1.5 h-1.5 rounded-sm bg-violet-500" />
      )}
      {milestonesCompleted > 0 && (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      )}
    </div>
  )
}
