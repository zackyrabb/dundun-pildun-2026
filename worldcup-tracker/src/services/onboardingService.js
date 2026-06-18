import { getProfile } from "./profileService";
import { getUserFavoriteTeams } from "./favoriteTeamService";

export async function getOnboardingStatus(userId) {
  const { data: profile, error: profileError } = await getProfile(userId);

  if (profileError && profileError.code !== "PGRST116") {
    return {
      data: null,
      error: profileError,
    };
  }

  const hasCompleteProfile = Boolean(
    profile?.full_name?.trim() &&
      profile?.username?.trim() &&
      profile?.avatar_url?.trim()
  );

  const { data: favoriteTeams, error: favoriteError } =
    await getUserFavoriteTeams(userId);

  if (favoriteError) {
    return {
      data: null,
      error: favoriteError,
    };
  }

  const favoriteCount = favoriteTeams?.length || 0;
  const hasFavoriteTeams = favoriteCount === 4;

  return {
    data: {
      profile,
      hasCompleteProfile,
      hasFavoriteTeams,
      favoriteCount,
      nextPath: getNextOnboardingPath({
        hasCompleteProfile,
        hasFavoriteTeams,
      }),
    },
    error: null,
  };
}

function getNextOnboardingPath({ hasCompleteProfile, hasFavoriteTeams }) {
  if (!hasCompleteProfile) {
    return "/complete-profile";
  }

  if (!hasFavoriteTeams) {
    return "/favorite-teams";
  }

  return "/dashboard";
}
