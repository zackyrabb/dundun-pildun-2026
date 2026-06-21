export function calculatePredictionPoints(match, prediction) {
  if (!match || !prediction) {
    return 0;
  }

  if (match.status !== "finished") {
    return 0;
  }

  const actualHomeScore = normalizeScore(match.home_score ?? match.homeScore);
  const actualAwayScore = normalizeScore(match.away_score ?? match.awayScore);
  const predictedHomeScore = normalizeScore(
    prediction.predicted_home_score ?? prediction.predictedHomeScore
  );
  const predictedAwayScore = normalizeScore(
    prediction.predicted_away_score ?? prediction.predictedAwayScore
  );

  if (
    actualHomeScore === null ||
    actualAwayScore === null ||
    predictedHomeScore === null ||
    predictedAwayScore === null
  ) {
    return 0;
  }

  if (
    actualHomeScore === predictedHomeScore &&
    actualAwayScore === predictedAwayScore
  ) {
    return 3;
  }

  const actualResult = getMatchResult(actualHomeScore, actualAwayScore);
  const predictedResult = getMatchResult(predictedHomeScore, predictedAwayScore);

  if (actualResult === predictedResult) {
    return 2;
  }

  if (
    actualHomeScore === predictedHomeScore ||
    actualAwayScore === predictedAwayScore
  ) {
    return 1;
  }

  return 0;
}

export function normalizeScore(score) {
  if (score === null || score === undefined || score === "") {
    return null;
  }

  const numericScore = Number(score);
  return Number.isFinite(numericScore) ? numericScore : null;
}

export function getMatchResult(homeScore, awayScore) {
  if (homeScore > awayScore) {
    return "HOME_WIN";
  }

  if (homeScore < awayScore) {
    return "AWAY_WIN";
  }

  return "DRAW";
}
