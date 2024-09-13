
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EmailLogsScalarFieldEnum = {
  email_log_id: 'email_log_id',
  league_id: 'league_id',
  member_id: 'member_id',
  email_type: 'email_type',
  ts: 'ts',
  week: 'week',
  resend_id: 'resend_id'
};

exports.Prisma.RelationLoadStrategy = {
  query: 'query',
  join: 'join'
};

exports.Prisma.WeekWinnersScalarFieldEnum = {
  id: 'id',
  league_id: 'league_id',
  membership_id: 'membership_id',
  week: 'week',
  correct_count: 'correct_count',
  score_diff: 'score_diff'
};

exports.Prisma.GamesScalarFieldEnum = {
  gid: 'gid',
  season: 'season',
  week: 'week',
  ts: 'ts',
  home: 'home',
  away: 'away',
  homescore: 'homescore',
  awayscore: 'awayscore',
  done: 'done',
  winner: 'winner',
  international: 'international',
  seconds: 'seconds',
  current_record: 'current_record',
  is_tiebreaker: 'is_tiebreaker',
  homerecord: 'homerecord',
  awayrecord: 'awayrecord',
  current_quarter_seconds_remaining: 'current_quarter_seconds_remaining',
  current_quarter: 'current_quarter',
  msf_id: 'msf_id',
  espn_id: 'espn_id'
};

exports.Prisma.LeaguemembersScalarFieldEnum = {
  membership_id: 'membership_id',
  league_id: 'league_id',
  user_id: 'user_id',
  ts: 'ts',
  role: 'role',
  paid: 'paid'
};

exports.Prisma.LeaguemessagesScalarFieldEnum = {
  message_id: 'message_id',
  content: 'content',
  member_id: 'member_id',
  league_id: 'league_id',
  week: 'week',
  message_type: 'message_type',
  createdAt: 'createdAt',
  status: 'status'
};

exports.Prisma.LeaguesScalarFieldEnum = {
  league_id: 'league_id',
  created_by_user_id: 'created_by_user_id',
  name: 'name',
  created_time: 'created_time',
  season: 'season',
  late_policy: 'late_policy',
  pick_policy: 'pick_policy',
  reminder_policy: 'reminder_policy',
  scoring_type: 'scoring_type',
  share_code: 'share_code',
  superbowl_competition: 'superbowl_competition',
  prior_league_id: 'prior_league_id',
  status: 'status'
};

exports.Prisma.PeopleScalarFieldEnum = {
  uid: 'uid',
  username: 'username',
  fname: 'fname',
  lname: 'lname',
  email: 'email',
  season: 'season',
  email2: 'email2',
  google_photo_url: 'google_photo_url',
  google_email: 'google_email',
  google_userid: 'google_userid',
  supabase_id: 'supabase_id'
};

exports.Prisma.PicksScalarFieldEnum = {
  pickid: 'pickid',
  uid: 'uid',
  season: 'season',
  week: 'week',
  gid: 'gid',
  winner: 'winner',
  loser: 'loser',
  score: 'score',
  ts: 'ts',
  correct: 'correct',
  done: 'done',
  is_random: 'is_random',
  member_id: 'member_id'
};

exports.Prisma.SuperbowlScalarFieldEnum = {
  pickid: 'pickid',
  uid: 'uid',
  winner: 'winner',
  loser: 'loser',
  score: 'score',
  ts: 'ts',
  season: 'season',
  member_id: 'member_id'
};

exports.Prisma.SuperbowlsquaresScalarFieldEnum = {
  square_id: 'square_id',
  uid: 'uid',
  league_id: 'league_id',
  afc_score_index: 'afc_score_index',
  nfc_score_index: 'nfc_score_index',
  correct: 'correct',
  ts: 'ts'
};

exports.Prisma.TeamsScalarFieldEnum = {
  teamid: 'teamid',
  abbrev: 'abbrev',
  loc: 'loc',
  name: 'name',
  conference: 'conference',
  primary_color: 'primary_color',
  secondary_color: 'secondary_color',
  tertiary_color: 'tertiary_color'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.EmailType = exports.$Enums.EmailType = {
  week_reminder: 'week_reminder',
  week_summary: 'week_summary',
  week_picks: 'week_picks',
  league_registration: 'league_registration',
  league_broadcast: 'league_broadcast'
};

exports.MemberRole = exports.$Enums.MemberRole = {
  player: 'player',
  admin: 'admin'
};

exports.MessageType = exports.$Enums.MessageType = {
  WEEK_COMMENT: 'WEEK_COMMENT',
  LEAGUE_MESSAGE: 'LEAGUE_MESSAGE'
};

exports.MessageStatus = exports.$Enums.MessageStatus = {
  PUBLISHED: 'PUBLISHED',
  DELETED: 'DELETED'
};

exports.LatePolicy = exports.$Enums.LatePolicy = {
  allow_late_whole_week: 'allow_late_whole_week',
  close_at_first_game_start: 'close_at_first_game_start',
  allow_late_and_lock_after_start: 'allow_late_and_lock_after_start'
};

exports.PickPolicy = exports.$Enums.PickPolicy = {
  choose_winner: 'choose_winner'
};

exports.ReminderPolicy = exports.$Enums.ReminderPolicy = {
  three_hours_before: 'three_hours_before'
};

exports.ScoringType = exports.$Enums.ScoringType = {
  game_winner: 'game_winner'
};

exports.LeagueStatus = exports.$Enums.LeagueStatus = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  completed: 'completed'
};

exports.Prisma.ModelName = {
  EmailLogs: 'EmailLogs',
  WeekWinners: 'WeekWinners',
  games: 'games',
  leaguemembers: 'leaguemembers',
  leaguemessages: 'leaguemessages',
  leagues: 'leagues',
  people: 'people',
  picks: 'picks',
  superbowl: 'superbowl',
  superbowlsquares: 'superbowlsquares',
  teams: 'teams'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
