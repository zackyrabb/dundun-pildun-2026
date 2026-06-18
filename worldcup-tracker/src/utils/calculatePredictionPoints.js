export function calculatePredictionPoints(match, prediction) {
  if (!match || !prediction) {
    return 0;
  }

  if (match.status !== "finished") {
    return 0;
  }

  const actualHomeScore = Number(match.home_score ?? match.homeScore);
  const actualAwayScore = Number(match.away_score ?? match.awayScore);

  const predictedHomeScore = Number(
    prediction.predicted_home_score ?? prediction.predictedHomeScore
  );

  const predictedAwayScore = Number(
    prediction.predicted_away_score ?? prediction.predictedAwayScore
  );

  if (
    Number.isNaN(actualHomeScore) ||
    Number.isNaN(actualAwayScore) ||
    Number.isNaN(predictedHomeScore) ||
    Number.isNaN(predictedAwayScore)
  ) {
    return 0;
  }

  if (
    actualHomeScore === predictedHomeScore &&
    actualAwayScore === predictedAwayScore
  ) {
    return 5;
  }

  const actualResult = getMatchResult(actualHomeScore, actualAwayScore);
  const predictedResult = getMatchResult(predictedHomeScore, predictedAwayScore);

  if (actualResult === predictedResult) {
    return 3;
  }

  if (
    actualHomeScore === predictedHomeScore ||
    actualAwayScore === predictedAwayScore
  ) {
    return 2;
  }

  return 0;
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
