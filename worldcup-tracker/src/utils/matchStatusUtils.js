function getMatchDate(match) {
  return match?.match_date ?? match?.matchDate ?? null
}

export function hasMatchStarted(match) {
  const matchDate = getMatchDate(match)

  if (!matchDate) {
    return false
  }

  const matchTime = new Date(matchDate).getTime()

  if (Number.isNaN(matchTime)) {
    return false
  }

  return Date.now() >= matchTime
}

export function canPredictMatch(match) {
  const matchDate = getMatchDate(match)

  return Boolean(
    match?.status === 'scheduled' &&
      matchDate &&
      !hasMatchStarted(match),
  )
}

export function getPredictionLockReason(match) {
  if (!match) {
    return 'Match is not available.'
  }

  if (match.status === 'finished') {
    return 'Match finished.'
  }

  if (match.status === 'live') {
    return 'Match live.'
  }

  if (match.status === 'postponed') {
    return 'Match postponed.'
  }

  if (hasMatchStarted(match)) {
    return 'Match has already passed its match date.'
  }

  return 'Predictions are not available for this match.'
}
