
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.18.0
 * Query Engine version: 4c784e32044a8a016d99474bd02a3b6123742169
 */
Prisma.prismaVersion = {
  client: "5.18.0",
  engine: "4c784e32044a8a016d99474bd02a3b6123742169"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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


  const path = require('path')

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
  msf_id: 'msf_id'
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
  league_registration: 'league_registration'
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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/bambrose/Documents/hacking/funtime-t3/src/generated/prisma-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x"
      }
    ],
    "previewFeatures": [
      "relationJoins"
    ],
    "sourceFilePath": "/Users/bambrose/Documents/hacking/funtime-t3/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.18.0",
  "engineVersion": "4c784e32044a8a016d99474bd02a3b6123742169",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"relationJoins\"]\n  output          = \"../src/generated/prisma-client\"\n  binaryTargets   = [\"native\", \"debian-openssl-1.1.x\"]\n}\n\ndatasource db {\n  provider  = \"postgresql\"\n  url       = env(\"DATABASE_URL\")\n  directUrl = env(\"DIRECT_URL\")\n}\n\nmodel EmailLogs {\n  email_log_id  String        @id @default(cuid())\n  league_id     Int\n  member_id     Int\n  email_type    EmailType\n  ts            DateTime      @default(now()) @db.Timestamptz(6)\n  week          Int?\n  resend_id     String\n  leagues       leagues       @relation(fields: [league_id], references: [league_id], onUpdate: Restrict)\n  leaguemembers leaguemembers @relation(fields: [member_id], references: [membership_id], onDelete: Cascade)\n\n  @@index([league_id], map: \"idx_emaillogs_league_id\")\n  @@index([league_id, member_id], map: \"idx_emaillogs_league_member\")\n  @@index([league_id, member_id, week], map: \"idx_emaillogs_league_member_week\")\n  @@index([league_id, week], map: \"idx_emaillogs_league_week\")\n  @@index([member_id], map: \"idx_emaillogs_member_id\")\n  @@index([member_id, week], map: \"idx_emaillogs_member_week\")\n  @@index([resend_id], map: \"idx_emaillogs_resend_id\")\n  @@index([week], map: \"idx_emaillogs_week\")\n}\n\nmodel WeekWinners {\n  id            Int           @id(map: \"idx_184XX_primary\") @default(autoincrement())\n  league_id     Int\n  membership_id Int\n  week          Int\n  correct_count Int\n  score_diff    Int\n  leagues       leagues       @relation(fields: [league_id], references: [league_id])\n  leaguemembers leaguemembers @relation(fields: [membership_id], references: [membership_id])\n\n  @@index([league_id, membership_id], map: \"idx_184XX_league_and_membership\")\n  @@index([league_id], map: \"idx_184XX_league_id\")\n  @@index([membership_id], map: \"idx_184XX_membership_id\")\n}\n\nmodel games {\n  gid                     Int      @id(map: \"idx_18403_primary\") @default(autoincrement())\n  season                  Int\n  week                    Int\n  ts                      DateTime @db.Timestamptz(6)\n  home                    Int\n  away                    Int\n  homescore               Int?     @default(0)\n  awayscore               Int?     @default(0)\n  done                    Boolean? @default(false)\n  winner                  Int?     @default(0)\n  international           Boolean? @default(false)\n  seconds                 Int?\n  current_record          String?  @default(\"0-0,0-0\") @db.VarChar(50)\n  is_tiebreaker           Boolean?\n  homerecord              String?  @db.VarChar(10)\n  awayrecord              String?  @db.VarChar(10)\n  msf_id                  Int?\n  teams_games_homeToteams teams    @relation(\"games_homeToteams\", fields: [home], references: [teamid], onUpdate: Restrict, map: \"games_ibfk_1\")\n  teams_games_awayToteams teams    @relation(\"games_awayToteams\", fields: [away], references: [teamid], onUpdate: Restrict, map: \"games_ibfk_2\")\n  picks                   picks[]\n\n  @@index([away], map: \"idx_18403_away\")\n  @@index([home], map: \"idx_18403_home\")\n  @@index([msf_id], map: \"idx_18403_msf_id\")\n  @@index([season], map: \"idx_18403_season\")\n  @@index([ts], map: \"idx_18403_ts\")\n  @@index([week], map: \"idx_18403_week\")\n}\n\nmodel leaguemembers {\n  membership_id  Int              @id(map: \"idx_18414_primary\") @default(autoincrement())\n  league_id      Int\n  user_id        Int\n  ts             DateTime         @default(now()) @db.Timestamptz(6)\n  role           MemberRole?      @default(player)\n  paid           Boolean?         @default(false)\n  EmailLogs      EmailLogs[]\n  WeekWinners    WeekWinners[]\n  people         people           @relation(fields: [user_id], references: [uid], onDelete: Cascade, onUpdate: Restrict, map: \"leaguemembers_ibfk_1\")\n  leagues        leagues          @relation(fields: [league_id], references: [league_id], onUpdate: Restrict, map: \"leaguemembers_ibfk_2\")\n  leaguemessages leaguemessages[]\n  picks          picks[]\n  superbowl      superbowl[]\n\n  @@index([league_id], map: \"idx_18414_league_id\")\n  @@index([paid], map: \"idx_18414_paid\")\n  @@index([role], map: \"idx_18414_role\")\n  @@index([ts], map: \"idx_18414_ts\")\n  @@index([user_id], map: \"idx_18414_user_id\")\n}\n\nmodel leaguemessages {\n  message_id    String        @id @default(cuid())\n  content       String\n  member_id     Int\n  league_id     Int\n  week          Int?\n  message_type  MessageType\n  createdAt     DateTime      @default(now())\n  status        MessageStatus @default(PUBLISHED)\n  leagues       leagues       @relation(fields: [league_id], references: [league_id])\n  leaguemembers leaguemembers @relation(fields: [member_id], references: [membership_id])\n\n  @@index([createdAt])\n  @@index([league_id])\n  @@index([league_id, member_id])\n  @@index([league_id, message_type])\n  @@index([league_id, message_type, status])\n  @@index([member_id])\n  @@index([message_type])\n}\n\nmodel leagues {\n  league_id             Int              @id(map: \"idx_18422_primary\") @default(autoincrement())\n  created_by_user_id    Int\n  name                  String\n  created_time          DateTime         @default(now()) @db.Timestamptz(6)\n  season                Int\n  late_policy           LatePolicy?      @default(allow_late_whole_week)\n  pick_policy           PickPolicy?      @default(choose_winner)\n  reminder_policy       ReminderPolicy?  @default(three_hours_before)\n  scoring_type          ScoringType?     @default(game_winner)\n  share_code            String?          @unique @default(cuid())\n  superbowl_competition Boolean?         @default(true)\n  prior_league_id       Int?\n  status                LeagueStatus     @default(not_started)\n  EmailLogs             EmailLogs[]\n  WeekWinners           WeekWinners[]\n  leaguemembers         leaguemembers[]\n  leaguemessages        leaguemessages[]\n  people                people           @relation(fields: [created_by_user_id], references: [uid], onUpdate: Restrict, map: \"leagues_ibfk_1\")\n  prior_league          leagues?         @relation(\"leaguesToleagues\", fields: [prior_league_id], references: [league_id])\n  future_leagues        leagues[]        @relation(\"leaguesToleagues\")\n\n  @@index([created_by_user_id], map: \"idx_18422_created_by_user_id\")\n  @@index([prior_league_id])\n  @@index([created_time], map: \"idx_18422_created_time\")\n  @@index([name], map: \"idx_18422_name\")\n  @@index([season], map: \"idx_18422_season\")\n  @@index([share_code], map: \"idx_share_code\")\n}\n\nmodel people {\n  uid              Int             @id(map: \"idx_18430_primary\") @default(autoincrement())\n  username         String          @db.VarChar(255)\n  fname            String          @db.VarChar(255)\n  lname            String          @db.VarChar(255)\n  email            String          @unique @db.VarChar(255)\n  season           Int\n  email2           String?         @db.VarChar(255)\n  google_photo_url String?\n  google_email     String?\n  google_userid    String?\n  supabase_id      String?         @unique @db.VarChar(255)\n  leaguemembers    leaguemembers[]\n  leagues          leagues[]\n  picks            picks[]\n\n  @@index([email], map: \"idx_18430_email_index\")\n  @@index([season], map: \"idx_18430_season\")\n  @@index([supabase_id], map: \"idx_18430_supabase_id\")\n}\n\nmodel picks {\n  pickid        Int            @id(map: \"idx_18437_primary\") @default(autoincrement())\n  uid           Int\n  season        Int\n  week          Int\n  gid           Int\n  winner        Int?           @default(0)\n  loser         Int?           @default(0)\n  score         Int?           @default(0)\n  ts            DateTime       @default(now()) @db.Timestamptz(6)\n  correct       Int?           @default(0)\n  done          Int?           @default(0)\n  is_random     Boolean?\n  member_id     Int?\n  games         games          @relation(fields: [gid], references: [gid], onUpdate: Restrict, map: \"picks_ibfk_1\")\n  people        people         @relation(fields: [uid], references: [uid], onDelete: Cascade, map: \"picks_ibfk_2\")\n  leaguemembers leaguemembers? @relation(fields: [member_id], references: [membership_id], onDelete: Cascade, onUpdate: Restrict, map: \"picks_ibfk_3\")\n  teams         teams?         @relation(fields: [winner], references: [teamid])\n\n  @@index([gid], map: \"idx_18437_gid\")\n  @@index([winner])\n  @@index([member_id], map: \"idx_18437_picks_ibfk_3\")\n  @@index([season], map: \"idx_18437_season\")\n  @@index([ts], map: \"idx_18437_ts\")\n  @@index([uid], map: \"idx_18437_uid\")\n  @@index([week], map: \"idx_18437_week\")\n  @@index([week, member_id], map: \"idx_week_member\")\n  @@index([week, season], map: \"idx_week_season\")\n  @@index([week, season, member_id], map: \"idx_week_season_member\")\n}\n\nmodel superbowl {\n  pickid                        Int            @id(map: \"idx_18448_primary\") @default(autoincrement())\n  uid                           Int\n  winner                        Int\n  loser                         Int\n  score                         Int\n  ts                            DateTime?      @default(now()) @db.Timestamptz(6)\n  season                        Int?\n  member_id                     Int?\n  teams_superbowl_loserToteams  teams          @relation(\"superbowl_loserToteams\", fields: [loser], references: [teamid], onDelete: NoAction, onUpdate: NoAction, map: \"fk_loser_team\")\n  leaguemembers                 leaguemembers? @relation(fields: [member_id], references: [membership_id], onDelete: Cascade, onUpdate: NoAction, map: \"fk_member_id\")\n  teams_superbowl_winnerToteams teams          @relation(\"superbowl_winnerToteams\", fields: [winner], references: [teamid], onDelete: NoAction, onUpdate: NoAction, map: \"fk_winner_team\")\n\n  @@index([loser])\n  @@index([winner])\n  @@index([member_id], map: \"idx_18448_member_id\")\n  @@index([season], map: \"idx_18448_season\")\n  @@index([ts], map: \"idx_18448_ts\")\n}\n\nmodel superbowlsquares {\n  square_id       Int      @id(map: \"idx_18454_primary\") @default(autoincrement())\n  uid             Int\n  league_id       Int\n  afc_score_index Int\n  nfc_score_index Int\n  correct         Boolean\n  ts              DateTime @default(now()) @db.Timestamptz(6)\n\n  @@index([ts], map: \"idx_18454_ts\")\n}\n\nmodel teams {\n  teamid                            Int         @id(map: \"idx_18460_primary\") @default(autoincrement())\n  abbrev                            String?     @db.VarChar(50)\n  loc                               String      @db.VarChar(255)\n  name                              String      @db.VarChar(255)\n  conference                        String?     @db.VarChar(50)\n  primary_color                     String?     @db.VarChar(50)\n  secondary_color                   String?     @db.VarChar(50)\n  tertiary_color                    String?     @db.VarChar(50)\n  games_games_homeToteams           games[]     @relation(\"games_homeToteams\")\n  games_games_awayToteams           games[]     @relation(\"games_awayToteams\")\n  picks                             picks[]\n  superbowl_superbowl_loserToteams  superbowl[] @relation(\"superbowl_loserToteams\")\n  superbowl_superbowl_winnerToteams superbowl[] @relation(\"superbowl_winnerToteams\")\n\n  @@index([abbrev], map: \"idx_18460_abbrev\")\n  @@index([conference], map: \"idx_18460_conference\")\n  @@index([loc], map: \"idx_18460_loc\")\n}\n\nenum EmailType {\n  week_reminder\n  week_summary\n  week_picks\n  league_registration\n}\n\nenum LatePolicy {\n  allow_late_whole_week\n  close_at_first_game_start\n  allow_late_and_lock_after_start\n}\n\nenum MemberRole {\n  player\n  admin\n}\n\nenum MessageStatus {\n  PUBLISHED\n  DELETED\n}\n\nenum MessageType {\n  WEEK_COMMENT\n  LEAGUE_MESSAGE\n}\n\nenum PickPolicy {\n  choose_winner\n}\n\nenum ReminderPolicy {\n  three_hours_before\n}\n\nenum LeagueStatus {\n  not_started\n  in_progress\n  completed\n}\n\nenum ScoringType {\n  game_winner\n}\n",
  "inlineSchemaHash": "0ce9b7641b9e68246beefcf68526a538fd3d1b129a01ab57ad291707f3ffe0b8",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/prisma-client",
    "generated/prisma-client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"EmailLogs\":{\"dbName\":null,\"fields\":[{\"name\":\"email_log_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"member_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EmailType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resend_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagues\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"EmailLogsToleagues\",\"relationFromFields\":[\"league_id\"],\"relationToFields\":[\"league_id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"EmailLogsToleaguemembers\",\"relationFromFields\":[\"member_id\"],\"relationToFields\":[\"membership_id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WeekWinners\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"membership_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correct_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score_diff\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagues\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"WeekWinnersToleagues\",\"relationFromFields\":[\"league_id\"],\"relationToFields\":[\"league_id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"WeekWinnersToleaguemembers\",\"relationFromFields\":[\"membership_id\"],\"relationToFields\":[\"membership_id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"games\":{\"dbName\":null,\"fields\":[{\"name\":\"gid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"season\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"home\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"away\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"homescore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"awayscore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"done\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"winner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"international\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seconds\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_record\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"0-0,0-0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_tiebreaker\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"homerecord\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"awayrecord\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"msf_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teams_games_homeToteams\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"teams\",\"relationName\":\"games_homeToteams\",\"relationFromFields\":[\"home\"],\"relationToFields\":[\"teamid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teams_games_awayToteams\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"teams\",\"relationName\":\"games_awayToteams\",\"relationFromFields\":[\"away\"],\"relationToFields\":[\"teamid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"picks\",\"relationName\":\"gamesTopicks\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"leaguemembers\":{\"dbName\":null,\"fields\":[{\"name\":\"membership_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"MemberRole\",\"default\":\"player\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"EmailLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EmailLogs\",\"relationName\":\"EmailLogsToleaguemembers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"WeekWinners\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WeekWinners\",\"relationName\":\"WeekWinnersToleaguemembers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"people\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"people\",\"relationName\":\"leaguemembersTopeople\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"uid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagues\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"leaguemembersToleagues\",\"relationFromFields\":[\"league_id\"],\"relationToFields\":[\"league_id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemessages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemessages\",\"relationName\":\"leaguemembersToleaguemessages\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"picks\",\"relationName\":\"leaguemembersTopicks\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"superbowl\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"superbowl\",\"relationName\":\"leaguemembersTosuperbowl\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"leaguemessages\":{\"dbName\":null,\"fields\":[{\"name\":\"message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"member_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"MessageType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"MessageStatus\",\"default\":\"PUBLISHED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagues\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"leaguemessagesToleagues\",\"relationFromFields\":[\"league_id\"],\"relationToFields\":[\"league_id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"leaguemembersToleaguemessages\",\"relationFromFields\":[\"member_id\"],\"relationToFields\":[\"membership_id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"leagues\":{\"dbName\":null,\"fields\":[{\"name\":\"league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_by_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"season\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"late_policy\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"LatePolicy\",\"default\":\"allow_late_whole_week\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pick_policy\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PickPolicy\",\"default\":\"choose_winner\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminder_policy\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ReminderPolicy\",\"default\":\"three_hours_before\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scoring_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ScoringType\",\"default\":\"game_winner\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"share_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"superbowl_competition\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prior_league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"LeagueStatus\",\"default\":\"not_started\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"EmailLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EmailLogs\",\"relationName\":\"EmailLogsToleagues\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"WeekWinners\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WeekWinners\",\"relationName\":\"WeekWinnersToleagues\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"leaguemembersToleagues\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemessages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemessages\",\"relationName\":\"leaguemessagesToleagues\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"people\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"people\",\"relationName\":\"leaguesTopeople\",\"relationFromFields\":[\"created_by_user_id\"],\"relationToFields\":[\"uid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prior_league\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"leaguesToleagues\",\"relationFromFields\":[\"prior_league_id\"],\"relationToFields\":[\"league_id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"future_leagues\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"leaguesToleagues\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"people\":{\"dbName\":null,\"fields\":[{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"season\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"google_photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"google_email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"google_userid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"supabase_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"leaguemembersTopeople\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagues\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leagues\",\"relationName\":\"leaguesTopeople\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"picks\",\"relationName\":\"peopleTopicks\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"picks\":{\"dbName\":null,\"fields\":[{\"name\":\"pickid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"season\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"winner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loser\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correct\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"done\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_random\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"member_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"games\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"games\",\"relationName\":\"gamesTopicks\",\"relationFromFields\":[\"gid\"],\"relationToFields\":[\"gid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"people\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"people\",\"relationName\":\"peopleTopicks\",\"relationFromFields\":[\"uid\"],\"relationToFields\":[\"uid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"leaguemembersTopicks\",\"relationFromFields\":[\"member_id\"],\"relationToFields\":[\"membership_id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teams\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"teams\",\"relationName\":\"picksToteams\",\"relationFromFields\":[\"winner\"],\"relationToFields\":[\"teamid\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"superbowl\":{\"dbName\":null,\"fields\":[{\"name\":\"pickid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"winner\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loser\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"season\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"member_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teams_superbowl_loserToteams\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"teams\",\"relationName\":\"superbowl_loserToteams\",\"relationFromFields\":[\"loser\"],\"relationToFields\":[\"teamid\"],\"relationOnDelete\":\"NoAction\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaguemembers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"leaguemembers\",\"relationName\":\"leaguemembersTosuperbowl\",\"relationFromFields\":[\"member_id\"],\"relationToFields\":[\"membership_id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teams_superbowl_winnerToteams\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"teams\",\"relationName\":\"superbowl_winnerToteams\",\"relationFromFields\":[\"winner\"],\"relationToFields\":[\"teamid\"],\"relationOnDelete\":\"NoAction\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"superbowlsquares\":{\"dbName\":null,\"fields\":[{\"name\":\"square_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"afc_score_index\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nfc_score_index\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correct\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"teams\":{\"dbName\":null,\"fields\":[{\"name\":\"teamid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"abbrev\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"primary_color\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"secondary_color\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tertiary_color\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"games_games_homeToteams\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"games\",\"relationName\":\"games_homeToteams\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"games_games_awayToteams\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"games\",\"relationName\":\"games_awayToteams\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"picks\",\"relationName\":\"picksToteams\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"superbowl_superbowl_loserToteams\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"superbowl\",\"relationName\":\"superbowl_loserToteams\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"superbowl_superbowl_winnerToteams\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"superbowl\",\"relationName\":\"superbowl_winnerToteams\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"EmailType\":{\"values\":[{\"name\":\"week_reminder\",\"dbName\":null},{\"name\":\"week_summary\",\"dbName\":null},{\"name\":\"week_picks\",\"dbName\":null},{\"name\":\"league_registration\",\"dbName\":null}],\"dbName\":null},\"LatePolicy\":{\"values\":[{\"name\":\"allow_late_whole_week\",\"dbName\":null},{\"name\":\"close_at_first_game_start\",\"dbName\":null},{\"name\":\"allow_late_and_lock_after_start\",\"dbName\":null}],\"dbName\":null},\"MemberRole\":{\"values\":[{\"name\":\"player\",\"dbName\":null},{\"name\":\"admin\",\"dbName\":null}],\"dbName\":null},\"MessageStatus\":{\"values\":[{\"name\":\"PUBLISHED\",\"dbName\":null},{\"name\":\"DELETED\",\"dbName\":null}],\"dbName\":null},\"MessageType\":{\"values\":[{\"name\":\"WEEK_COMMENT\",\"dbName\":null},{\"name\":\"LEAGUE_MESSAGE\",\"dbName\":null}],\"dbName\":null},\"PickPolicy\":{\"values\":[{\"name\":\"choose_winner\",\"dbName\":null}],\"dbName\":null},\"ReminderPolicy\":{\"values\":[{\"name\":\"three_hours_before\",\"dbName\":null}],\"dbName\":null},\"LeagueStatus\":{\"values\":[{\"name\":\"not_started\",\"dbName\":null},{\"name\":\"in_progress\",\"dbName\":null},{\"name\":\"completed\",\"dbName\":null}],\"dbName\":null},\"ScoringType\":{\"values\":[{\"name\":\"game_winner\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "src/generated/prisma-client/libquery_engine-darwin-arm64.dylib.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "src/generated/prisma-client/libquery_engine-debian-openssl-1.1.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma-client/schema.prisma")
