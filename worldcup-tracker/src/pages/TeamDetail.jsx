import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import { getTeamById, getTeamMatches } from "../services/teamService";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const getTeamName = (team) => team?.name ?? "Unknown team";
const getTeamFlag = (team) => team?.flag ?? "🏳️";

function MatchCard({ match }) {
  const isFinished = match.status === "finished";

  return (
    <Link
      to={`/matches/${match.id}`}
      className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          {match.stage}
        </span>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold",
            isFinished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          {isFinished ? "Finished" : "Upcoming"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h3 className="font-black text-slate-950">
          {getTeamFlag(match.home_team)} {getTeamName(match.home_team)} vs{" "}
          {getTeamFlag(match.away_team)} {getTeamName(match.away_team)}
        </h3>
        {isFinished ? (
          <p className="shrink-0 text-xl font-black text-blue-700">
            {match.home_score} - {match.away_score}
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-slate-500">{formatDate(match.match_date)}</p>
    </Link>
  );
}

function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTeamDetail() {
      const [{ data: teamData, error: teamError }, { data: matchData, error: matchError }] =
        await Promise.all([getTeamById(id), getTeamMatches(id)]);

      const error = teamError || matchError;

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setTeam(teamData);
      setMatches(matchData ?? []);
      setLoading(false);
    }

    loadTeamDetail();
  }, [id]);

  const { upcomingMatches, finishedMatches } = useMemo(() => {
    return {
      upcomingMatches: matches
        .filter((match) => match.status !== "finished")
        .sort((firstMatch, secondMatch) => new Date(firstMatch.match_date) - new Date(secondMatch.match_date)),
      finishedMatches: matches
        .filter((match) => match.status === "finished")
        .sort((firstMatch, secondMatch) => new Date(secondMatch.match_date) - new Date(firstMatch.match_date)),
    };
  }, [matches]);

  if (loading) {
    return <LoadingState text="Loading team details..." />;
  }

  if (!team) {
    return (
      <>
        <ErrorAlert message={message} />
        <EmptyState
          title="Team not found"
          description="This team is not available in Supabase."
          action={
            <Link
              to="/teams"
              className="inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Back to Teams
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={team.name}
        description="Team schedule, latest results, and upcoming fixtures."
        action={
          <Link
            to="/teams"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to Teams
          </Link>
        }
      />

      <div className="mb-6">
        <ErrorAlert message={message} />
      </div>

      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-5xl">
              {team.flag || "🏳️"}
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                {team.code || "N/A"}
              </p>
              <h1 className="text-3xl font-black">{team.name}</h1>
              <p className="mt-1 text-blue-50">{team.group_name || "Group not set"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-2xl font-black">{matches.length}</p>
              <p className="text-xs font-semibold text-blue-100">Matches</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-2xl font-black">{upcomingMatches.length}</p>
              <p className="text-xs font-semibold text-blue-100">Upcoming</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-2xl font-black">{finishedMatches.length}</p>
              <p className="text-xs font-semibold text-blue-100">Finished</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Upcoming Matches</h2>
          <div className="mt-4 space-y-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No upcoming matches for this team yet.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Latest Results</h2>
          <div className="mt-4 space-y-4">
            {finishedMatches.length > 0 ? (
              finishedMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No finished matches for this team yet.
              </p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}

export default TeamDetail;
