
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model EmailLogs
 * 
 */
export type EmailLogs = $Result.DefaultSelection<Prisma.$EmailLogsPayload>
/**
 * Model WeekWinners
 * 
 */
export type WeekWinners = $Result.DefaultSelection<Prisma.$WeekWinnersPayload>
/**
 * Model games
 * 
 */
export type games = $Result.DefaultSelection<Prisma.$gamesPayload>
/**
 * Model leaguemembers
 * 
 */
export type leaguemembers = $Result.DefaultSelection<Prisma.$leaguemembersPayload>
/**
 * Model leaguemessages
 * 
 */
export type leaguemessages = $Result.DefaultSelection<Prisma.$leaguemessagesPayload>
/**
 * Model leagues
 * 
 */
export type leagues = $Result.DefaultSelection<Prisma.$leaguesPayload>
/**
 * Model people
 * 
 */
export type people = $Result.DefaultSelection<Prisma.$peoplePayload>
/**
 * Model picks
 * 
 */
export type picks = $Result.DefaultSelection<Prisma.$picksPayload>
/**
 * Model superbowl
 * 
 */
export type superbowl = $Result.DefaultSelection<Prisma.$superbowlPayload>
/**
 * Model superbowlsquares
 * 
 */
export type superbowlsquares = $Result.DefaultSelection<Prisma.$superbowlsquaresPayload>
/**
 * Model teams
 * 
 */
export type teams = $Result.DefaultSelection<Prisma.$teamsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const EmailType: {
  week_reminder: 'week_reminder',
  week_summary: 'week_summary',
  week_picks: 'week_picks',
  league_registration: 'league_registration'
};

export type EmailType = (typeof EmailType)[keyof typeof EmailType]


export const MemberRole: {
  player: 'player',
  admin: 'admin'
};

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole]


export const MessageType: {
  WEEK_COMMENT: 'WEEK_COMMENT',
  LEAGUE_MESSAGE: 'LEAGUE_MESSAGE'
};

export type MessageType = (typeof MessageType)[keyof typeof MessageType]


export const MessageStatus: {
  PUBLISHED: 'PUBLISHED',
  DELETED: 'DELETED'
};

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]


export const LatePolicy: {
  allow_late_whole_week: 'allow_late_whole_week',
  close_at_first_game_start: 'close_at_first_game_start',
  allow_late_and_lock_after_start: 'allow_late_and_lock_after_start'
};

export type LatePolicy = (typeof LatePolicy)[keyof typeof LatePolicy]


export const PickPolicy: {
  choose_winner: 'choose_winner'
};

export type PickPolicy = (typeof PickPolicy)[keyof typeof PickPolicy]


export const ReminderPolicy: {
  three_hours_before: 'three_hours_before'
};

export type ReminderPolicy = (typeof ReminderPolicy)[keyof typeof ReminderPolicy]


export const ScoringType: {
  game_winner: 'game_winner'
};

export type ScoringType = (typeof ScoringType)[keyof typeof ScoringType]


export const LeagueStatus: {
  not_started: 'not_started',
  in_progress: 'in_progress',
  completed: 'completed'
};

export type LeagueStatus = (typeof LeagueStatus)[keyof typeof LeagueStatus]

}

export type EmailType = $Enums.EmailType

export const EmailType: typeof $Enums.EmailType

export type MemberRole = $Enums.MemberRole

export const MemberRole: typeof $Enums.MemberRole

export type MessageType = $Enums.MessageType

export const MessageType: typeof $Enums.MessageType

export type MessageStatus = $Enums.MessageStatus

export const MessageStatus: typeof $Enums.MessageStatus

export type LatePolicy = $Enums.LatePolicy

export const LatePolicy: typeof $Enums.LatePolicy

export type PickPolicy = $Enums.PickPolicy

export const PickPolicy: typeof $Enums.PickPolicy

export type ReminderPolicy = $Enums.ReminderPolicy

export const ReminderPolicy: typeof $Enums.ReminderPolicy

export type ScoringType = $Enums.ScoringType

export const ScoringType: typeof $Enums.ScoringType

export type LeagueStatus = $Enums.LeagueStatus

export const LeagueStatus: typeof $Enums.LeagueStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more EmailLogs
 * const emailLogs = await prisma.emailLogs.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more EmailLogs
   * const emailLogs = await prisma.emailLogs.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.emailLogs`: Exposes CRUD operations for the **EmailLogs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmailLogs
    * const emailLogs = await prisma.emailLogs.findMany()
    * ```
    */
  get emailLogs(): Prisma.EmailLogsDelegate<ExtArgs>;

  /**
   * `prisma.weekWinners`: Exposes CRUD operations for the **WeekWinners** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeekWinners
    * const weekWinners = await prisma.weekWinners.findMany()
    * ```
    */
  get weekWinners(): Prisma.WeekWinnersDelegate<ExtArgs>;

  /**
   * `prisma.games`: Exposes CRUD operations for the **games** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Games
    * const games = await prisma.games.findMany()
    * ```
    */
  get games(): Prisma.gamesDelegate<ExtArgs>;

  /**
   * `prisma.leaguemembers`: Exposes CRUD operations for the **leaguemembers** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leaguemembers
    * const leaguemembers = await prisma.leaguemembers.findMany()
    * ```
    */
  get leaguemembers(): Prisma.leaguemembersDelegate<ExtArgs>;

  /**
   * `prisma.leaguemessages`: Exposes CRUD operations for the **leaguemessages** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leaguemessages
    * const leaguemessages = await prisma.leaguemessages.findMany()
    * ```
    */
  get leaguemessages(): Prisma.leaguemessagesDelegate<ExtArgs>;

  /**
   * `prisma.leagues`: Exposes CRUD operations for the **leagues** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leagues
    * const leagues = await prisma.leagues.findMany()
    * ```
    */
  get leagues(): Prisma.leaguesDelegate<ExtArgs>;

  /**
   * `prisma.people`: Exposes CRUD operations for the **people** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more People
    * const people = await prisma.people.findMany()
    * ```
    */
  get people(): Prisma.peopleDelegate<ExtArgs>;

  /**
   * `prisma.picks`: Exposes CRUD operations for the **picks** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Picks
    * const picks = await prisma.picks.findMany()
    * ```
    */
  get picks(): Prisma.picksDelegate<ExtArgs>;

  /**
   * `prisma.superbowl`: Exposes CRUD operations for the **superbowl** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Superbowls
    * const superbowls = await prisma.superbowl.findMany()
    * ```
    */
  get superbowl(): Prisma.superbowlDelegate<ExtArgs>;

  /**
   * `prisma.superbowlsquares`: Exposes CRUD operations for the **superbowlsquares** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Superbowlsquares
    * const superbowlsquares = await prisma.superbowlsquares.findMany()
    * ```
    */
  get superbowlsquares(): Prisma.superbowlsquaresDelegate<ExtArgs>;

  /**
   * `prisma.teams`: Exposes CRUD operations for the **teams** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Teams
    * const teams = await prisma.teams.findMany()
    * ```
    */
  get teams(): Prisma.teamsDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.18.0
   * Query Engine version: 4c784e32044a8a016d99474bd02a3b6123742169
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "emailLogs" | "weekWinners" | "games" | "leaguemembers" | "leaguemessages" | "leagues" | "people" | "picks" | "superbowl" | "superbowlsquares" | "teams"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      EmailLogs: {
        payload: Prisma.$EmailLogsPayload<ExtArgs>
        fields: Prisma.EmailLogsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmailLogsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmailLogsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>
          }
          findFirst: {
            args: Prisma.EmailLogsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmailLogsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>
          }
          findMany: {
            args: Prisma.EmailLogsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>[]
          }
          create: {
            args: Prisma.EmailLogsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>
          }
          createMany: {
            args: Prisma.EmailLogsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmailLogsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>[]
          }
          delete: {
            args: Prisma.EmailLogsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>
          }
          update: {
            args: Prisma.EmailLogsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>
          }
          deleteMany: {
            args: Prisma.EmailLogsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmailLogsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmailLogsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogsPayload>
          }
          aggregate: {
            args: Prisma.EmailLogsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmailLogs>
          }
          groupBy: {
            args: Prisma.EmailLogsGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmailLogsGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmailLogsCountArgs<ExtArgs>
            result: $Utils.Optional<EmailLogsCountAggregateOutputType> | number
          }
        }
      }
      WeekWinners: {
        payload: Prisma.$WeekWinnersPayload<ExtArgs>
        fields: Prisma.WeekWinnersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeekWinnersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeekWinnersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>
          }
          findFirst: {
            args: Prisma.WeekWinnersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeekWinnersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>
          }
          findMany: {
            args: Prisma.WeekWinnersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>[]
          }
          create: {
            args: Prisma.WeekWinnersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>
          }
          createMany: {
            args: Prisma.WeekWinnersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeekWinnersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>[]
          }
          delete: {
            args: Prisma.WeekWinnersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>
          }
          update: {
            args: Prisma.WeekWinnersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>
          }
          deleteMany: {
            args: Prisma.WeekWinnersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeekWinnersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WeekWinnersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekWinnersPayload>
          }
          aggregate: {
            args: Prisma.WeekWinnersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeekWinners>
          }
          groupBy: {
            args: Prisma.WeekWinnersGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeekWinnersGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeekWinnersCountArgs<ExtArgs>
            result: $Utils.Optional<WeekWinnersCountAggregateOutputType> | number
          }
        }
      }
      games: {
        payload: Prisma.$gamesPayload<ExtArgs>
        fields: Prisma.gamesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.gamesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.gamesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>
          }
          findFirst: {
            args: Prisma.gamesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.gamesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>
          }
          findMany: {
            args: Prisma.gamesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>[]
          }
          create: {
            args: Prisma.gamesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>
          }
          createMany: {
            args: Prisma.gamesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.gamesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>[]
          }
          delete: {
            args: Prisma.gamesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>
          }
          update: {
            args: Prisma.gamesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>
          }
          deleteMany: {
            args: Prisma.gamesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.gamesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.gamesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gamesPayload>
          }
          aggregate: {
            args: Prisma.GamesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGames>
          }
          groupBy: {
            args: Prisma.gamesGroupByArgs<ExtArgs>
            result: $Utils.Optional<GamesGroupByOutputType>[]
          }
          count: {
            args: Prisma.gamesCountArgs<ExtArgs>
            result: $Utils.Optional<GamesCountAggregateOutputType> | number
          }
        }
      }
      leaguemembers: {
        payload: Prisma.$leaguemembersPayload<ExtArgs>
        fields: Prisma.leaguemembersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.leaguemembersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.leaguemembersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>
          }
          findFirst: {
            args: Prisma.leaguemembersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.leaguemembersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>
          }
          findMany: {
            args: Prisma.leaguemembersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>[]
          }
          create: {
            args: Prisma.leaguemembersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>
          }
          createMany: {
            args: Prisma.leaguemembersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.leaguemembersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>[]
          }
          delete: {
            args: Prisma.leaguemembersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>
          }
          update: {
            args: Prisma.leaguemembersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>
          }
          deleteMany: {
            args: Prisma.leaguemembersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.leaguemembersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.leaguemembersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemembersPayload>
          }
          aggregate: {
            args: Prisma.LeaguemembersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeaguemembers>
          }
          groupBy: {
            args: Prisma.leaguemembersGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeaguemembersGroupByOutputType>[]
          }
          count: {
            args: Prisma.leaguemembersCountArgs<ExtArgs>
            result: $Utils.Optional<LeaguemembersCountAggregateOutputType> | number
          }
        }
      }
      leaguemessages: {
        payload: Prisma.$leaguemessagesPayload<ExtArgs>
        fields: Prisma.leaguemessagesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.leaguemessagesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.leaguemessagesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>
          }
          findFirst: {
            args: Prisma.leaguemessagesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.leaguemessagesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>
          }
          findMany: {
            args: Prisma.leaguemessagesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>[]
          }
          create: {
            args: Prisma.leaguemessagesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>
          }
          createMany: {
            args: Prisma.leaguemessagesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.leaguemessagesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>[]
          }
          delete: {
            args: Prisma.leaguemessagesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>
          }
          update: {
            args: Prisma.leaguemessagesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>
          }
          deleteMany: {
            args: Prisma.leaguemessagesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.leaguemessagesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.leaguemessagesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguemessagesPayload>
          }
          aggregate: {
            args: Prisma.LeaguemessagesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeaguemessages>
          }
          groupBy: {
            args: Prisma.leaguemessagesGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeaguemessagesGroupByOutputType>[]
          }
          count: {
            args: Prisma.leaguemessagesCountArgs<ExtArgs>
            result: $Utils.Optional<LeaguemessagesCountAggregateOutputType> | number
          }
        }
      }
      leagues: {
        payload: Prisma.$leaguesPayload<ExtArgs>
        fields: Prisma.leaguesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.leaguesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.leaguesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>
          }
          findFirst: {
            args: Prisma.leaguesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.leaguesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>
          }
          findMany: {
            args: Prisma.leaguesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>[]
          }
          create: {
            args: Prisma.leaguesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>
          }
          createMany: {
            args: Prisma.leaguesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.leaguesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>[]
          }
          delete: {
            args: Prisma.leaguesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>
          }
          update: {
            args: Prisma.leaguesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>
          }
          deleteMany: {
            args: Prisma.leaguesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.leaguesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.leaguesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$leaguesPayload>
          }
          aggregate: {
            args: Prisma.LeaguesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeagues>
          }
          groupBy: {
            args: Prisma.leaguesGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeaguesGroupByOutputType>[]
          }
          count: {
            args: Prisma.leaguesCountArgs<ExtArgs>
            result: $Utils.Optional<LeaguesCountAggregateOutputType> | number
          }
        }
      }
      people: {
        payload: Prisma.$peoplePayload<ExtArgs>
        fields: Prisma.peopleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.peopleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.peopleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>
          }
          findFirst: {
            args: Prisma.peopleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.peopleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>
          }
          findMany: {
            args: Prisma.peopleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>[]
          }
          create: {
            args: Prisma.peopleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>
          }
          createMany: {
            args: Prisma.peopleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.peopleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>[]
          }
          delete: {
            args: Prisma.peopleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>
          }
          update: {
            args: Prisma.peopleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>
          }
          deleteMany: {
            args: Prisma.peopleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.peopleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.peopleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peoplePayload>
          }
          aggregate: {
            args: Prisma.PeopleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePeople>
          }
          groupBy: {
            args: Prisma.peopleGroupByArgs<ExtArgs>
            result: $Utils.Optional<PeopleGroupByOutputType>[]
          }
          count: {
            args: Prisma.peopleCountArgs<ExtArgs>
            result: $Utils.Optional<PeopleCountAggregateOutputType> | number
          }
        }
      }
      picks: {
        payload: Prisma.$picksPayload<ExtArgs>
        fields: Prisma.picksFieldRefs
        operations: {
          findUnique: {
            args: Prisma.picksFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.picksFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>
          }
          findFirst: {
            args: Prisma.picksFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.picksFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>
          }
          findMany: {
            args: Prisma.picksFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>[]
          }
          create: {
            args: Prisma.picksCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>
          }
          createMany: {
            args: Prisma.picksCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.picksCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>[]
          }
          delete: {
            args: Prisma.picksDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>
          }
          update: {
            args: Prisma.picksUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>
          }
          deleteMany: {
            args: Prisma.picksDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.picksUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.picksUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$picksPayload>
          }
          aggregate: {
            args: Prisma.PicksAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePicks>
          }
          groupBy: {
            args: Prisma.picksGroupByArgs<ExtArgs>
            result: $Utils.Optional<PicksGroupByOutputType>[]
          }
          count: {
            args: Prisma.picksCountArgs<ExtArgs>
            result: $Utils.Optional<PicksCountAggregateOutputType> | number
          }
        }
      }
      superbowl: {
        payload: Prisma.$superbowlPayload<ExtArgs>
        fields: Prisma.superbowlFieldRefs
        operations: {
          findUnique: {
            args: Prisma.superbowlFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.superbowlFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>
          }
          findFirst: {
            args: Prisma.superbowlFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.superbowlFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>
          }
          findMany: {
            args: Prisma.superbowlFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>[]
          }
          create: {
            args: Prisma.superbowlCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>
          }
          createMany: {
            args: Prisma.superbowlCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.superbowlCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>[]
          }
          delete: {
            args: Prisma.superbowlDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>
          }
          update: {
            args: Prisma.superbowlUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>
          }
          deleteMany: {
            args: Prisma.superbowlDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.superbowlUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.superbowlUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlPayload>
          }
          aggregate: {
            args: Prisma.SuperbowlAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperbowl>
          }
          groupBy: {
            args: Prisma.superbowlGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperbowlGroupByOutputType>[]
          }
          count: {
            args: Prisma.superbowlCountArgs<ExtArgs>
            result: $Utils.Optional<SuperbowlCountAggregateOutputType> | number
          }
        }
      }
      superbowlsquares: {
        payload: Prisma.$superbowlsquaresPayload<ExtArgs>
        fields: Prisma.superbowlsquaresFieldRefs
        operations: {
          findUnique: {
            args: Prisma.superbowlsquaresFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.superbowlsquaresFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>
          }
          findFirst: {
            args: Prisma.superbowlsquaresFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.superbowlsquaresFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>
          }
          findMany: {
            args: Prisma.superbowlsquaresFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>[]
          }
          create: {
            args: Prisma.superbowlsquaresCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>
          }
          createMany: {
            args: Prisma.superbowlsquaresCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.superbowlsquaresCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>[]
          }
          delete: {
            args: Prisma.superbowlsquaresDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>
          }
          update: {
            args: Prisma.superbowlsquaresUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>
          }
          deleteMany: {
            args: Prisma.superbowlsquaresDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.superbowlsquaresUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.superbowlsquaresUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$superbowlsquaresPayload>
          }
          aggregate: {
            args: Prisma.SuperbowlsquaresAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperbowlsquares>
          }
          groupBy: {
            args: Prisma.superbowlsquaresGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperbowlsquaresGroupByOutputType>[]
          }
          count: {
            args: Prisma.superbowlsquaresCountArgs<ExtArgs>
            result: $Utils.Optional<SuperbowlsquaresCountAggregateOutputType> | number
          }
        }
      }
      teams: {
        payload: Prisma.$teamsPayload<ExtArgs>
        fields: Prisma.teamsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.teamsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.teamsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>
          }
          findFirst: {
            args: Prisma.teamsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.teamsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>
          }
          findMany: {
            args: Prisma.teamsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>[]
          }
          create: {
            args: Prisma.teamsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>
          }
          createMany: {
            args: Prisma.teamsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.teamsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>[]
          }
          delete: {
            args: Prisma.teamsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>
          }
          update: {
            args: Prisma.teamsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>
          }
          deleteMany: {
            args: Prisma.teamsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.teamsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.teamsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teamsPayload>
          }
          aggregate: {
            args: Prisma.TeamsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeams>
          }
          groupBy: {
            args: Prisma.teamsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamsGroupByOutputType>[]
          }
          count: {
            args: Prisma.teamsCountArgs<ExtArgs>
            result: $Utils.Optional<TeamsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type GamesCountOutputType
   */

  export type GamesCountOutputType = {
    picks: number
  }

  export type GamesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    picks?: boolean | GamesCountOutputTypeCountPicksArgs
  }

  // Custom InputTypes
  /**
   * GamesCountOutputType without action
   */
  export type GamesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesCountOutputType
     */
    select?: GamesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GamesCountOutputType without action
   */
  export type GamesCountOutputTypeCountPicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: picksWhereInput
  }


  /**
   * Count Type LeaguemembersCountOutputType
   */

  export type LeaguemembersCountOutputType = {
    EmailLogs: number
    WeekWinners: number
    leaguemessages: number
    picks: number
    superbowl: number
  }

  export type LeaguemembersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    EmailLogs?: boolean | LeaguemembersCountOutputTypeCountEmailLogsArgs
    WeekWinners?: boolean | LeaguemembersCountOutputTypeCountWeekWinnersArgs
    leaguemessages?: boolean | LeaguemembersCountOutputTypeCountLeaguemessagesArgs
    picks?: boolean | LeaguemembersCountOutputTypeCountPicksArgs
    superbowl?: boolean | LeaguemembersCountOutputTypeCountSuperbowlArgs
  }

  // Custom InputTypes
  /**
   * LeaguemembersCountOutputType without action
   */
  export type LeaguemembersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaguemembersCountOutputType
     */
    select?: LeaguemembersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LeaguemembersCountOutputType without action
   */
  export type LeaguemembersCountOutputTypeCountEmailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailLogsWhereInput
  }

  /**
   * LeaguemembersCountOutputType without action
   */
  export type LeaguemembersCountOutputTypeCountWeekWinnersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeekWinnersWhereInput
  }

  /**
   * LeaguemembersCountOutputType without action
   */
  export type LeaguemembersCountOutputTypeCountLeaguemessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguemessagesWhereInput
  }

  /**
   * LeaguemembersCountOutputType without action
   */
  export type LeaguemembersCountOutputTypeCountPicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: picksWhereInput
  }

  /**
   * LeaguemembersCountOutputType without action
   */
  export type LeaguemembersCountOutputTypeCountSuperbowlArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: superbowlWhereInput
  }


  /**
   * Count Type LeaguesCountOutputType
   */

  export type LeaguesCountOutputType = {
    EmailLogs: number
    WeekWinners: number
    leaguemembers: number
    leaguemessages: number
    future_leagues: number
  }

  export type LeaguesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    EmailLogs?: boolean | LeaguesCountOutputTypeCountEmailLogsArgs
    WeekWinners?: boolean | LeaguesCountOutputTypeCountWeekWinnersArgs
    leaguemembers?: boolean | LeaguesCountOutputTypeCountLeaguemembersArgs
    leaguemessages?: boolean | LeaguesCountOutputTypeCountLeaguemessagesArgs
    future_leagues?: boolean | LeaguesCountOutputTypeCountFuture_leaguesArgs
  }

  // Custom InputTypes
  /**
   * LeaguesCountOutputType without action
   */
  export type LeaguesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaguesCountOutputType
     */
    select?: LeaguesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LeaguesCountOutputType without action
   */
  export type LeaguesCountOutputTypeCountEmailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailLogsWhereInput
  }

  /**
   * LeaguesCountOutputType without action
   */
  export type LeaguesCountOutputTypeCountWeekWinnersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeekWinnersWhereInput
  }

  /**
   * LeaguesCountOutputType without action
   */
  export type LeaguesCountOutputTypeCountLeaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguemembersWhereInput
  }

  /**
   * LeaguesCountOutputType without action
   */
  export type LeaguesCountOutputTypeCountLeaguemessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguemessagesWhereInput
  }

  /**
   * LeaguesCountOutputType without action
   */
  export type LeaguesCountOutputTypeCountFuture_leaguesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguesWhereInput
  }


  /**
   * Count Type PeopleCountOutputType
   */

  export type PeopleCountOutputType = {
    leaguemembers: number
    leagues: number
    picks: number
  }

  export type PeopleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leaguemembers?: boolean | PeopleCountOutputTypeCountLeaguemembersArgs
    leagues?: boolean | PeopleCountOutputTypeCountLeaguesArgs
    picks?: boolean | PeopleCountOutputTypeCountPicksArgs
  }

  // Custom InputTypes
  /**
   * PeopleCountOutputType without action
   */
  export type PeopleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PeopleCountOutputType
     */
    select?: PeopleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PeopleCountOutputType without action
   */
  export type PeopleCountOutputTypeCountLeaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguemembersWhereInput
  }

  /**
   * PeopleCountOutputType without action
   */
  export type PeopleCountOutputTypeCountLeaguesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguesWhereInput
  }

  /**
   * PeopleCountOutputType without action
   */
  export type PeopleCountOutputTypeCountPicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: picksWhereInput
  }


  /**
   * Count Type TeamsCountOutputType
   */

  export type TeamsCountOutputType = {
    games_games_homeToteams: number
    games_games_awayToteams: number
    picks: number
    superbowl_superbowl_loserToteams: number
    superbowl_superbowl_winnerToteams: number
  }

  export type TeamsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    games_games_homeToteams?: boolean | TeamsCountOutputTypeCountGames_games_homeToteamsArgs
    games_games_awayToteams?: boolean | TeamsCountOutputTypeCountGames_games_awayToteamsArgs
    picks?: boolean | TeamsCountOutputTypeCountPicksArgs
    superbowl_superbowl_loserToteams?: boolean | TeamsCountOutputTypeCountSuperbowl_superbowl_loserToteamsArgs
    superbowl_superbowl_winnerToteams?: boolean | TeamsCountOutputTypeCountSuperbowl_superbowl_winnerToteamsArgs
  }

  // Custom InputTypes
  /**
   * TeamsCountOutputType without action
   */
  export type TeamsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamsCountOutputType
     */
    select?: TeamsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TeamsCountOutputType without action
   */
  export type TeamsCountOutputTypeCountGames_games_homeToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: gamesWhereInput
  }

  /**
   * TeamsCountOutputType without action
   */
  export type TeamsCountOutputTypeCountGames_games_awayToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: gamesWhereInput
  }

  /**
   * TeamsCountOutputType without action
   */
  export type TeamsCountOutputTypeCountPicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: picksWhereInput
  }

  /**
   * TeamsCountOutputType without action
   */
  export type TeamsCountOutputTypeCountSuperbowl_superbowl_loserToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: superbowlWhereInput
  }

  /**
   * TeamsCountOutputType without action
   */
  export type TeamsCountOutputTypeCountSuperbowl_superbowl_winnerToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: superbowlWhereInput
  }


  /**
   * Models
   */

  /**
   * Model EmailLogs
   */

  export type AggregateEmailLogs = {
    _count: EmailLogsCountAggregateOutputType | null
    _avg: EmailLogsAvgAggregateOutputType | null
    _sum: EmailLogsSumAggregateOutputType | null
    _min: EmailLogsMinAggregateOutputType | null
    _max: EmailLogsMaxAggregateOutputType | null
  }

  export type EmailLogsAvgAggregateOutputType = {
    league_id: number | null
    member_id: number | null
    week: number | null
  }

  export type EmailLogsSumAggregateOutputType = {
    league_id: number | null
    member_id: number | null
    week: number | null
  }

  export type EmailLogsMinAggregateOutputType = {
    email_log_id: string | null
    league_id: number | null
    member_id: number | null
    email_type: $Enums.EmailType | null
    ts: Date | null
    week: number | null
    resend_id: string | null
  }

  export type EmailLogsMaxAggregateOutputType = {
    email_log_id: string | null
    league_id: number | null
    member_id: number | null
    email_type: $Enums.EmailType | null
    ts: Date | null
    week: number | null
    resend_id: string | null
  }

  export type EmailLogsCountAggregateOutputType = {
    email_log_id: number
    league_id: number
    member_id: number
    email_type: number
    ts: number
    week: number
    resend_id: number
    _all: number
  }


  export type EmailLogsAvgAggregateInputType = {
    league_id?: true
    member_id?: true
    week?: true
  }

  export type EmailLogsSumAggregateInputType = {
    league_id?: true
    member_id?: true
    week?: true
  }

  export type EmailLogsMinAggregateInputType = {
    email_log_id?: true
    league_id?: true
    member_id?: true
    email_type?: true
    ts?: true
    week?: true
    resend_id?: true
  }

  export type EmailLogsMaxAggregateInputType = {
    email_log_id?: true
    league_id?: true
    member_id?: true
    email_type?: true
    ts?: true
    week?: true
    resend_id?: true
  }

  export type EmailLogsCountAggregateInputType = {
    email_log_id?: true
    league_id?: true
    member_id?: true
    email_type?: true
    ts?: true
    week?: true
    resend_id?: true
    _all?: true
  }

  export type EmailLogsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailLogs to aggregate.
     */
    where?: EmailLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogsOrderByWithRelationInput | EmailLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmailLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmailLogs
    **/
    _count?: true | EmailLogsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmailLogsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmailLogsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmailLogsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmailLogsMaxAggregateInputType
  }

  export type GetEmailLogsAggregateType<T extends EmailLogsAggregateArgs> = {
        [P in keyof T & keyof AggregateEmailLogs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmailLogs[P]>
      : GetScalarType<T[P], AggregateEmailLogs[P]>
  }




  export type EmailLogsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailLogsWhereInput
    orderBy?: EmailLogsOrderByWithAggregationInput | EmailLogsOrderByWithAggregationInput[]
    by: EmailLogsScalarFieldEnum[] | EmailLogsScalarFieldEnum
    having?: EmailLogsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmailLogsCountAggregateInputType | true
    _avg?: EmailLogsAvgAggregateInputType
    _sum?: EmailLogsSumAggregateInputType
    _min?: EmailLogsMinAggregateInputType
    _max?: EmailLogsMaxAggregateInputType
  }

  export type EmailLogsGroupByOutputType = {
    email_log_id: string
    league_id: number
    member_id: number
    email_type: $Enums.EmailType
    ts: Date
    week: number | null
    resend_id: string
    _count: EmailLogsCountAggregateOutputType | null
    _avg: EmailLogsAvgAggregateOutputType | null
    _sum: EmailLogsSumAggregateOutputType | null
    _min: EmailLogsMinAggregateOutputType | null
    _max: EmailLogsMaxAggregateOutputType | null
  }

  type GetEmailLogsGroupByPayload<T extends EmailLogsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmailLogsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmailLogsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmailLogsGroupByOutputType[P]>
            : GetScalarType<T[P], EmailLogsGroupByOutputType[P]>
        }
      >
    >


  export type EmailLogsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    email_log_id?: boolean
    league_id?: boolean
    member_id?: boolean
    email_type?: boolean
    ts?: boolean
    week?: boolean
    resend_id?: boolean
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailLogs"]>

  export type EmailLogsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    email_log_id?: boolean
    league_id?: boolean
    member_id?: boolean
    email_type?: boolean
    ts?: boolean
    week?: boolean
    resend_id?: boolean
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailLogs"]>

  export type EmailLogsSelectScalar = {
    email_log_id?: boolean
    league_id?: boolean
    member_id?: boolean
    email_type?: boolean
    ts?: boolean
    week?: boolean
    resend_id?: boolean
  }

  export type EmailLogsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }
  export type EmailLogsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }

  export type $EmailLogsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmailLogs"
    objects: {
      leagues: Prisma.$leaguesPayload<ExtArgs>
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      email_log_id: string
      league_id: number
      member_id: number
      email_type: $Enums.EmailType
      ts: Date
      week: number | null
      resend_id: string
    }, ExtArgs["result"]["emailLogs"]>
    composites: {}
  }

  type EmailLogsGetPayload<S extends boolean | null | undefined | EmailLogsDefaultArgs> = $Result.GetResult<Prisma.$EmailLogsPayload, S>

  type EmailLogsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmailLogsFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: EmailLogsCountAggregateInputType | true
    }

  export interface EmailLogsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmailLogs'], meta: { name: 'EmailLogs' } }
    /**
     * Find zero or one EmailLogs that matches the filter.
     * @param {EmailLogsFindUniqueArgs} args - Arguments to find a EmailLogs
     * @example
     * // Get one EmailLogs
     * const emailLogs = await prisma.emailLogs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmailLogsFindUniqueArgs>(args: SelectSubset<T, EmailLogsFindUniqueArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EmailLogs that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmailLogsFindUniqueOrThrowArgs} args - Arguments to find a EmailLogs
     * @example
     * // Get one EmailLogs
     * const emailLogs = await prisma.emailLogs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmailLogsFindUniqueOrThrowArgs>(args: SelectSubset<T, EmailLogsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EmailLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsFindFirstArgs} args - Arguments to find a EmailLogs
     * @example
     * // Get one EmailLogs
     * const emailLogs = await prisma.emailLogs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmailLogsFindFirstArgs>(args?: SelectSubset<T, EmailLogsFindFirstArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EmailLogs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsFindFirstOrThrowArgs} args - Arguments to find a EmailLogs
     * @example
     * // Get one EmailLogs
     * const emailLogs = await prisma.emailLogs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmailLogsFindFirstOrThrowArgs>(args?: SelectSubset<T, EmailLogsFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EmailLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmailLogs
     * const emailLogs = await prisma.emailLogs.findMany()
     * 
     * // Get first 10 EmailLogs
     * const emailLogs = await prisma.emailLogs.findMany({ take: 10 })
     * 
     * // Only select the `email_log_id`
     * const emailLogsWithEmail_log_idOnly = await prisma.emailLogs.findMany({ select: { email_log_id: true } })
     * 
     */
    findMany<T extends EmailLogsFindManyArgs>(args?: SelectSubset<T, EmailLogsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EmailLogs.
     * @param {EmailLogsCreateArgs} args - Arguments to create a EmailLogs.
     * @example
     * // Create one EmailLogs
     * const EmailLogs = await prisma.emailLogs.create({
     *   data: {
     *     // ... data to create a EmailLogs
     *   }
     * })
     * 
     */
    create<T extends EmailLogsCreateArgs>(args: SelectSubset<T, EmailLogsCreateArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EmailLogs.
     * @param {EmailLogsCreateManyArgs} args - Arguments to create many EmailLogs.
     * @example
     * // Create many EmailLogs
     * const emailLogs = await prisma.emailLogs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmailLogsCreateManyArgs>(args?: SelectSubset<T, EmailLogsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmailLogs and returns the data saved in the database.
     * @param {EmailLogsCreateManyAndReturnArgs} args - Arguments to create many EmailLogs.
     * @example
     * // Create many EmailLogs
     * const emailLogs = await prisma.emailLogs.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmailLogs and only return the `email_log_id`
     * const emailLogsWithEmail_log_idOnly = await prisma.emailLogs.createManyAndReturn({ 
     *   select: { email_log_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmailLogsCreateManyAndReturnArgs>(args?: SelectSubset<T, EmailLogsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a EmailLogs.
     * @param {EmailLogsDeleteArgs} args - Arguments to delete one EmailLogs.
     * @example
     * // Delete one EmailLogs
     * const EmailLogs = await prisma.emailLogs.delete({
     *   where: {
     *     // ... filter to delete one EmailLogs
     *   }
     * })
     * 
     */
    delete<T extends EmailLogsDeleteArgs>(args: SelectSubset<T, EmailLogsDeleteArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EmailLogs.
     * @param {EmailLogsUpdateArgs} args - Arguments to update one EmailLogs.
     * @example
     * // Update one EmailLogs
     * const emailLogs = await prisma.emailLogs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmailLogsUpdateArgs>(args: SelectSubset<T, EmailLogsUpdateArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EmailLogs.
     * @param {EmailLogsDeleteManyArgs} args - Arguments to filter EmailLogs to delete.
     * @example
     * // Delete a few EmailLogs
     * const { count } = await prisma.emailLogs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmailLogsDeleteManyArgs>(args?: SelectSubset<T, EmailLogsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmailLogs
     * const emailLogs = await prisma.emailLogs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmailLogsUpdateManyArgs>(args: SelectSubset<T, EmailLogsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EmailLogs.
     * @param {EmailLogsUpsertArgs} args - Arguments to update or create a EmailLogs.
     * @example
     * // Update or create a EmailLogs
     * const emailLogs = await prisma.emailLogs.upsert({
     *   create: {
     *     // ... data to create a EmailLogs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmailLogs we want to update
     *   }
     * })
     */
    upsert<T extends EmailLogsUpsertArgs>(args: SelectSubset<T, EmailLogsUpsertArgs<ExtArgs>>): Prisma__EmailLogsClient<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of EmailLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsCountArgs} args - Arguments to filter EmailLogs to count.
     * @example
     * // Count the number of EmailLogs
     * const count = await prisma.emailLogs.count({
     *   where: {
     *     // ... the filter for the EmailLogs we want to count
     *   }
     * })
    **/
    count<T extends EmailLogsCountArgs>(
      args?: Subset<T, EmailLogsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmailLogsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmailLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmailLogsAggregateArgs>(args: Subset<T, EmailLogsAggregateArgs>): Prisma.PrismaPromise<GetEmailLogsAggregateType<T>>

    /**
     * Group by EmailLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmailLogsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmailLogsGroupByArgs['orderBy'] }
        : { orderBy?: EmailLogsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmailLogsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmailLogsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmailLogs model
   */
  readonly fields: EmailLogsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmailLogs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmailLogsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    leagues<T extends leaguesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguesDefaultArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leaguemembers<T extends leaguemembersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembersDefaultArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmailLogs model
   */ 
  interface EmailLogsFieldRefs {
    readonly email_log_id: FieldRef<"EmailLogs", 'String'>
    readonly league_id: FieldRef<"EmailLogs", 'Int'>
    readonly member_id: FieldRef<"EmailLogs", 'Int'>
    readonly email_type: FieldRef<"EmailLogs", 'EmailType'>
    readonly ts: FieldRef<"EmailLogs", 'DateTime'>
    readonly week: FieldRef<"EmailLogs", 'Int'>
    readonly resend_id: FieldRef<"EmailLogs", 'String'>
  }
    

  // Custom InputTypes
  /**
   * EmailLogs findUnique
   */
  export type EmailLogsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * Filter, which EmailLogs to fetch.
     */
    where: EmailLogsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs findUniqueOrThrow
   */
  export type EmailLogsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * Filter, which EmailLogs to fetch.
     */
    where: EmailLogsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs findFirst
   */
  export type EmailLogsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * Filter, which EmailLogs to fetch.
     */
    where?: EmailLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogsOrderByWithRelationInput | EmailLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailLogs.
     */
    cursor?: EmailLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailLogs.
     */
    distinct?: EmailLogsScalarFieldEnum | EmailLogsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs findFirstOrThrow
   */
  export type EmailLogsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * Filter, which EmailLogs to fetch.
     */
    where?: EmailLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogsOrderByWithRelationInput | EmailLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailLogs.
     */
    cursor?: EmailLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailLogs.
     */
    distinct?: EmailLogsScalarFieldEnum | EmailLogsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs findMany
   */
  export type EmailLogsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * Filter, which EmailLogs to fetch.
     */
    where?: EmailLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogsOrderByWithRelationInput | EmailLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmailLogs.
     */
    cursor?: EmailLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    distinct?: EmailLogsScalarFieldEnum | EmailLogsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs create
   */
  export type EmailLogsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * The data needed to create a EmailLogs.
     */
    data: XOR<EmailLogsCreateInput, EmailLogsUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs createMany
   */
  export type EmailLogsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmailLogs.
     */
    data: EmailLogsCreateManyInput | EmailLogsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmailLogs createManyAndReturn
   */
  export type EmailLogsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many EmailLogs.
     */
    data: EmailLogsCreateManyInput | EmailLogsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailLogs update
   */
  export type EmailLogsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * The data needed to update a EmailLogs.
     */
    data: XOR<EmailLogsUpdateInput, EmailLogsUncheckedUpdateInput>
    /**
     * Choose, which EmailLogs to update.
     */
    where: EmailLogsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs updateMany
   */
  export type EmailLogsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmailLogs.
     */
    data: XOR<EmailLogsUpdateManyMutationInput, EmailLogsUncheckedUpdateManyInput>
    /**
     * Filter which EmailLogs to update
     */
    where?: EmailLogsWhereInput
  }

  /**
   * EmailLogs upsert
   */
  export type EmailLogsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * The filter to search for the EmailLogs to update in case it exists.
     */
    where: EmailLogsWhereUniqueInput
    /**
     * In case the EmailLogs found by the `where` argument doesn't exist, create a new EmailLogs with this data.
     */
    create: XOR<EmailLogsCreateInput, EmailLogsUncheckedCreateInput>
    /**
     * In case the EmailLogs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmailLogsUpdateInput, EmailLogsUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs delete
   */
  export type EmailLogsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    /**
     * Filter which EmailLogs to delete.
     */
    where: EmailLogsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * EmailLogs deleteMany
   */
  export type EmailLogsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailLogs to delete
     */
    where?: EmailLogsWhereInput
  }

  /**
   * EmailLogs without action
   */
  export type EmailLogsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
  }


  /**
   * Model WeekWinners
   */

  export type AggregateWeekWinners = {
    _count: WeekWinnersCountAggregateOutputType | null
    _avg: WeekWinnersAvgAggregateOutputType | null
    _sum: WeekWinnersSumAggregateOutputType | null
    _min: WeekWinnersMinAggregateOutputType | null
    _max: WeekWinnersMaxAggregateOutputType | null
  }

  export type WeekWinnersAvgAggregateOutputType = {
    id: number | null
    league_id: number | null
    membership_id: number | null
    week: number | null
    correct_count: number | null
    score_diff: number | null
  }

  export type WeekWinnersSumAggregateOutputType = {
    id: number | null
    league_id: number | null
    membership_id: number | null
    week: number | null
    correct_count: number | null
    score_diff: number | null
  }

  export type WeekWinnersMinAggregateOutputType = {
    id: number | null
    league_id: number | null
    membership_id: number | null
    week: number | null
    correct_count: number | null
    score_diff: number | null
  }

  export type WeekWinnersMaxAggregateOutputType = {
    id: number | null
    league_id: number | null
    membership_id: number | null
    week: number | null
    correct_count: number | null
    score_diff: number | null
  }

  export type WeekWinnersCountAggregateOutputType = {
    id: number
    league_id: number
    membership_id: number
    week: number
    correct_count: number
    score_diff: number
    _all: number
  }


  export type WeekWinnersAvgAggregateInputType = {
    id?: true
    league_id?: true
    membership_id?: true
    week?: true
    correct_count?: true
    score_diff?: true
  }

  export type WeekWinnersSumAggregateInputType = {
    id?: true
    league_id?: true
    membership_id?: true
    week?: true
    correct_count?: true
    score_diff?: true
  }

  export type WeekWinnersMinAggregateInputType = {
    id?: true
    league_id?: true
    membership_id?: true
    week?: true
    correct_count?: true
    score_diff?: true
  }

  export type WeekWinnersMaxAggregateInputType = {
    id?: true
    league_id?: true
    membership_id?: true
    week?: true
    correct_count?: true
    score_diff?: true
  }

  export type WeekWinnersCountAggregateInputType = {
    id?: true
    league_id?: true
    membership_id?: true
    week?: true
    correct_count?: true
    score_diff?: true
    _all?: true
  }

  export type WeekWinnersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeekWinners to aggregate.
     */
    where?: WeekWinnersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeekWinners to fetch.
     */
    orderBy?: WeekWinnersOrderByWithRelationInput | WeekWinnersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeekWinnersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeekWinners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeekWinners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeekWinners
    **/
    _count?: true | WeekWinnersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeekWinnersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeekWinnersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeekWinnersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeekWinnersMaxAggregateInputType
  }

  export type GetWeekWinnersAggregateType<T extends WeekWinnersAggregateArgs> = {
        [P in keyof T & keyof AggregateWeekWinners]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeekWinners[P]>
      : GetScalarType<T[P], AggregateWeekWinners[P]>
  }




  export type WeekWinnersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeekWinnersWhereInput
    orderBy?: WeekWinnersOrderByWithAggregationInput | WeekWinnersOrderByWithAggregationInput[]
    by: WeekWinnersScalarFieldEnum[] | WeekWinnersScalarFieldEnum
    having?: WeekWinnersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeekWinnersCountAggregateInputType | true
    _avg?: WeekWinnersAvgAggregateInputType
    _sum?: WeekWinnersSumAggregateInputType
    _min?: WeekWinnersMinAggregateInputType
    _max?: WeekWinnersMaxAggregateInputType
  }

  export type WeekWinnersGroupByOutputType = {
    id: number
    league_id: number
    membership_id: number
    week: number
    correct_count: number
    score_diff: number
    _count: WeekWinnersCountAggregateOutputType | null
    _avg: WeekWinnersAvgAggregateOutputType | null
    _sum: WeekWinnersSumAggregateOutputType | null
    _min: WeekWinnersMinAggregateOutputType | null
    _max: WeekWinnersMaxAggregateOutputType | null
  }

  type GetWeekWinnersGroupByPayload<T extends WeekWinnersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeekWinnersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeekWinnersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeekWinnersGroupByOutputType[P]>
            : GetScalarType<T[P], WeekWinnersGroupByOutputType[P]>
        }
      >
    >


  export type WeekWinnersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    league_id?: boolean
    membership_id?: boolean
    week?: boolean
    correct_count?: boolean
    score_diff?: boolean
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weekWinners"]>

  export type WeekWinnersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    league_id?: boolean
    membership_id?: boolean
    week?: boolean
    correct_count?: boolean
    score_diff?: boolean
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["weekWinners"]>

  export type WeekWinnersSelectScalar = {
    id?: boolean
    league_id?: boolean
    membership_id?: boolean
    week?: boolean
    correct_count?: boolean
    score_diff?: boolean
  }

  export type WeekWinnersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }
  export type WeekWinnersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }

  export type $WeekWinnersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeekWinners"
    objects: {
      leagues: Prisma.$leaguesPayload<ExtArgs>
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      league_id: number
      membership_id: number
      week: number
      correct_count: number
      score_diff: number
    }, ExtArgs["result"]["weekWinners"]>
    composites: {}
  }

  type WeekWinnersGetPayload<S extends boolean | null | undefined | WeekWinnersDefaultArgs> = $Result.GetResult<Prisma.$WeekWinnersPayload, S>

  type WeekWinnersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WeekWinnersFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: WeekWinnersCountAggregateInputType | true
    }

  export interface WeekWinnersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeekWinners'], meta: { name: 'WeekWinners' } }
    /**
     * Find zero or one WeekWinners that matches the filter.
     * @param {WeekWinnersFindUniqueArgs} args - Arguments to find a WeekWinners
     * @example
     * // Get one WeekWinners
     * const weekWinners = await prisma.weekWinners.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeekWinnersFindUniqueArgs>(args: SelectSubset<T, WeekWinnersFindUniqueArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WeekWinners that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WeekWinnersFindUniqueOrThrowArgs} args - Arguments to find a WeekWinners
     * @example
     * // Get one WeekWinners
     * const weekWinners = await prisma.weekWinners.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeekWinnersFindUniqueOrThrowArgs>(args: SelectSubset<T, WeekWinnersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WeekWinners that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersFindFirstArgs} args - Arguments to find a WeekWinners
     * @example
     * // Get one WeekWinners
     * const weekWinners = await prisma.weekWinners.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeekWinnersFindFirstArgs>(args?: SelectSubset<T, WeekWinnersFindFirstArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WeekWinners that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersFindFirstOrThrowArgs} args - Arguments to find a WeekWinners
     * @example
     * // Get one WeekWinners
     * const weekWinners = await prisma.weekWinners.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeekWinnersFindFirstOrThrowArgs>(args?: SelectSubset<T, WeekWinnersFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WeekWinners that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeekWinners
     * const weekWinners = await prisma.weekWinners.findMany()
     * 
     * // Get first 10 WeekWinners
     * const weekWinners = await prisma.weekWinners.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weekWinnersWithIdOnly = await prisma.weekWinners.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeekWinnersFindManyArgs>(args?: SelectSubset<T, WeekWinnersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WeekWinners.
     * @param {WeekWinnersCreateArgs} args - Arguments to create a WeekWinners.
     * @example
     * // Create one WeekWinners
     * const WeekWinners = await prisma.weekWinners.create({
     *   data: {
     *     // ... data to create a WeekWinners
     *   }
     * })
     * 
     */
    create<T extends WeekWinnersCreateArgs>(args: SelectSubset<T, WeekWinnersCreateArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WeekWinners.
     * @param {WeekWinnersCreateManyArgs} args - Arguments to create many WeekWinners.
     * @example
     * // Create many WeekWinners
     * const weekWinners = await prisma.weekWinners.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeekWinnersCreateManyArgs>(args?: SelectSubset<T, WeekWinnersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WeekWinners and returns the data saved in the database.
     * @param {WeekWinnersCreateManyAndReturnArgs} args - Arguments to create many WeekWinners.
     * @example
     * // Create many WeekWinners
     * const weekWinners = await prisma.weekWinners.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WeekWinners and only return the `id`
     * const weekWinnersWithIdOnly = await prisma.weekWinners.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeekWinnersCreateManyAndReturnArgs>(args?: SelectSubset<T, WeekWinnersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WeekWinners.
     * @param {WeekWinnersDeleteArgs} args - Arguments to delete one WeekWinners.
     * @example
     * // Delete one WeekWinners
     * const WeekWinners = await prisma.weekWinners.delete({
     *   where: {
     *     // ... filter to delete one WeekWinners
     *   }
     * })
     * 
     */
    delete<T extends WeekWinnersDeleteArgs>(args: SelectSubset<T, WeekWinnersDeleteArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WeekWinners.
     * @param {WeekWinnersUpdateArgs} args - Arguments to update one WeekWinners.
     * @example
     * // Update one WeekWinners
     * const weekWinners = await prisma.weekWinners.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeekWinnersUpdateArgs>(args: SelectSubset<T, WeekWinnersUpdateArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WeekWinners.
     * @param {WeekWinnersDeleteManyArgs} args - Arguments to filter WeekWinners to delete.
     * @example
     * // Delete a few WeekWinners
     * const { count } = await prisma.weekWinners.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeekWinnersDeleteManyArgs>(args?: SelectSubset<T, WeekWinnersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeekWinners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeekWinners
     * const weekWinners = await prisma.weekWinners.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeekWinnersUpdateManyArgs>(args: SelectSubset<T, WeekWinnersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WeekWinners.
     * @param {WeekWinnersUpsertArgs} args - Arguments to update or create a WeekWinners.
     * @example
     * // Update or create a WeekWinners
     * const weekWinners = await prisma.weekWinners.upsert({
     *   create: {
     *     // ... data to create a WeekWinners
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeekWinners we want to update
     *   }
     * })
     */
    upsert<T extends WeekWinnersUpsertArgs>(args: SelectSubset<T, WeekWinnersUpsertArgs<ExtArgs>>): Prisma__WeekWinnersClient<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WeekWinners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersCountArgs} args - Arguments to filter WeekWinners to count.
     * @example
     * // Count the number of WeekWinners
     * const count = await prisma.weekWinners.count({
     *   where: {
     *     // ... the filter for the WeekWinners we want to count
     *   }
     * })
    **/
    count<T extends WeekWinnersCountArgs>(
      args?: Subset<T, WeekWinnersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeekWinnersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeekWinners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WeekWinnersAggregateArgs>(args: Subset<T, WeekWinnersAggregateArgs>): Prisma.PrismaPromise<GetWeekWinnersAggregateType<T>>

    /**
     * Group by WeekWinners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekWinnersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WeekWinnersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeekWinnersGroupByArgs['orderBy'] }
        : { orderBy?: WeekWinnersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeekWinnersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeekWinnersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeekWinners model
   */
  readonly fields: WeekWinnersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeekWinners.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeekWinnersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    leagues<T extends leaguesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguesDefaultArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leaguemembers<T extends leaguemembersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembersDefaultArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WeekWinners model
   */ 
  interface WeekWinnersFieldRefs {
    readonly id: FieldRef<"WeekWinners", 'Int'>
    readonly league_id: FieldRef<"WeekWinners", 'Int'>
    readonly membership_id: FieldRef<"WeekWinners", 'Int'>
    readonly week: FieldRef<"WeekWinners", 'Int'>
    readonly correct_count: FieldRef<"WeekWinners", 'Int'>
    readonly score_diff: FieldRef<"WeekWinners", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * WeekWinners findUnique
   */
  export type WeekWinnersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * Filter, which WeekWinners to fetch.
     */
    where: WeekWinnersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners findUniqueOrThrow
   */
  export type WeekWinnersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * Filter, which WeekWinners to fetch.
     */
    where: WeekWinnersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners findFirst
   */
  export type WeekWinnersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * Filter, which WeekWinners to fetch.
     */
    where?: WeekWinnersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeekWinners to fetch.
     */
    orderBy?: WeekWinnersOrderByWithRelationInput | WeekWinnersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeekWinners.
     */
    cursor?: WeekWinnersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeekWinners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeekWinners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeekWinners.
     */
    distinct?: WeekWinnersScalarFieldEnum | WeekWinnersScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners findFirstOrThrow
   */
  export type WeekWinnersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * Filter, which WeekWinners to fetch.
     */
    where?: WeekWinnersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeekWinners to fetch.
     */
    orderBy?: WeekWinnersOrderByWithRelationInput | WeekWinnersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeekWinners.
     */
    cursor?: WeekWinnersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeekWinners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeekWinners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeekWinners.
     */
    distinct?: WeekWinnersScalarFieldEnum | WeekWinnersScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners findMany
   */
  export type WeekWinnersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * Filter, which WeekWinners to fetch.
     */
    where?: WeekWinnersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeekWinners to fetch.
     */
    orderBy?: WeekWinnersOrderByWithRelationInput | WeekWinnersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeekWinners.
     */
    cursor?: WeekWinnersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeekWinners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeekWinners.
     */
    skip?: number
    distinct?: WeekWinnersScalarFieldEnum | WeekWinnersScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners create
   */
  export type WeekWinnersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * The data needed to create a WeekWinners.
     */
    data: XOR<WeekWinnersCreateInput, WeekWinnersUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners createMany
   */
  export type WeekWinnersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeekWinners.
     */
    data: WeekWinnersCreateManyInput | WeekWinnersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeekWinners createManyAndReturn
   */
  export type WeekWinnersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WeekWinners.
     */
    data: WeekWinnersCreateManyInput | WeekWinnersCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WeekWinners update
   */
  export type WeekWinnersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * The data needed to update a WeekWinners.
     */
    data: XOR<WeekWinnersUpdateInput, WeekWinnersUncheckedUpdateInput>
    /**
     * Choose, which WeekWinners to update.
     */
    where: WeekWinnersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners updateMany
   */
  export type WeekWinnersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeekWinners.
     */
    data: XOR<WeekWinnersUpdateManyMutationInput, WeekWinnersUncheckedUpdateManyInput>
    /**
     * Filter which WeekWinners to update
     */
    where?: WeekWinnersWhereInput
  }

  /**
   * WeekWinners upsert
   */
  export type WeekWinnersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * The filter to search for the WeekWinners to update in case it exists.
     */
    where: WeekWinnersWhereUniqueInput
    /**
     * In case the WeekWinners found by the `where` argument doesn't exist, create a new WeekWinners with this data.
     */
    create: XOR<WeekWinnersCreateInput, WeekWinnersUncheckedCreateInput>
    /**
     * In case the WeekWinners was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeekWinnersUpdateInput, WeekWinnersUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners delete
   */
  export type WeekWinnersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    /**
     * Filter which WeekWinners to delete.
     */
    where: WeekWinnersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * WeekWinners deleteMany
   */
  export type WeekWinnersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeekWinners to delete
     */
    where?: WeekWinnersWhereInput
  }

  /**
   * WeekWinners without action
   */
  export type WeekWinnersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
  }


  /**
   * Model games
   */

  export type AggregateGames = {
    _count: GamesCountAggregateOutputType | null
    _avg: GamesAvgAggregateOutputType | null
    _sum: GamesSumAggregateOutputType | null
    _min: GamesMinAggregateOutputType | null
    _max: GamesMaxAggregateOutputType | null
  }

  export type GamesAvgAggregateOutputType = {
    gid: number | null
    season: number | null
    week: number | null
    home: number | null
    away: number | null
    homescore: number | null
    awayscore: number | null
    winner: number | null
    seconds: number | null
    msf_id: number | null
  }

  export type GamesSumAggregateOutputType = {
    gid: number | null
    season: number | null
    week: number | null
    home: number | null
    away: number | null
    homescore: number | null
    awayscore: number | null
    winner: number | null
    seconds: number | null
    msf_id: number | null
  }

  export type GamesMinAggregateOutputType = {
    gid: number | null
    season: number | null
    week: number | null
    ts: Date | null
    home: number | null
    away: number | null
    homescore: number | null
    awayscore: number | null
    done: boolean | null
    winner: number | null
    international: boolean | null
    seconds: number | null
    current_record: string | null
    is_tiebreaker: boolean | null
    homerecord: string | null
    awayrecord: string | null
    msf_id: number | null
  }

  export type GamesMaxAggregateOutputType = {
    gid: number | null
    season: number | null
    week: number | null
    ts: Date | null
    home: number | null
    away: number | null
    homescore: number | null
    awayscore: number | null
    done: boolean | null
    winner: number | null
    international: boolean | null
    seconds: number | null
    current_record: string | null
    is_tiebreaker: boolean | null
    homerecord: string | null
    awayrecord: string | null
    msf_id: number | null
  }

  export type GamesCountAggregateOutputType = {
    gid: number
    season: number
    week: number
    ts: number
    home: number
    away: number
    homescore: number
    awayscore: number
    done: number
    winner: number
    international: number
    seconds: number
    current_record: number
    is_tiebreaker: number
    homerecord: number
    awayrecord: number
    msf_id: number
    _all: number
  }


  export type GamesAvgAggregateInputType = {
    gid?: true
    season?: true
    week?: true
    home?: true
    away?: true
    homescore?: true
    awayscore?: true
    winner?: true
    seconds?: true
    msf_id?: true
  }

  export type GamesSumAggregateInputType = {
    gid?: true
    season?: true
    week?: true
    home?: true
    away?: true
    homescore?: true
    awayscore?: true
    winner?: true
    seconds?: true
    msf_id?: true
  }

  export type GamesMinAggregateInputType = {
    gid?: true
    season?: true
    week?: true
    ts?: true
    home?: true
    away?: true
    homescore?: true
    awayscore?: true
    done?: true
    winner?: true
    international?: true
    seconds?: true
    current_record?: true
    is_tiebreaker?: true
    homerecord?: true
    awayrecord?: true
    msf_id?: true
  }

  export type GamesMaxAggregateInputType = {
    gid?: true
    season?: true
    week?: true
    ts?: true
    home?: true
    away?: true
    homescore?: true
    awayscore?: true
    done?: true
    winner?: true
    international?: true
    seconds?: true
    current_record?: true
    is_tiebreaker?: true
    homerecord?: true
    awayrecord?: true
    msf_id?: true
  }

  export type GamesCountAggregateInputType = {
    gid?: true
    season?: true
    week?: true
    ts?: true
    home?: true
    away?: true
    homescore?: true
    awayscore?: true
    done?: true
    winner?: true
    international?: true
    seconds?: true
    current_record?: true
    is_tiebreaker?: true
    homerecord?: true
    awayrecord?: true
    msf_id?: true
    _all?: true
  }

  export type GamesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which games to aggregate.
     */
    where?: gamesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of games to fetch.
     */
    orderBy?: gamesOrderByWithRelationInput | gamesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: gamesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned games
    **/
    _count?: true | GamesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GamesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GamesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GamesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GamesMaxAggregateInputType
  }

  export type GetGamesAggregateType<T extends GamesAggregateArgs> = {
        [P in keyof T & keyof AggregateGames]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGames[P]>
      : GetScalarType<T[P], AggregateGames[P]>
  }




  export type gamesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: gamesWhereInput
    orderBy?: gamesOrderByWithAggregationInput | gamesOrderByWithAggregationInput[]
    by: GamesScalarFieldEnum[] | GamesScalarFieldEnum
    having?: gamesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GamesCountAggregateInputType | true
    _avg?: GamesAvgAggregateInputType
    _sum?: GamesSumAggregateInputType
    _min?: GamesMinAggregateInputType
    _max?: GamesMaxAggregateInputType
  }

  export type GamesGroupByOutputType = {
    gid: number
    season: number
    week: number
    ts: Date
    home: number
    away: number
    homescore: number | null
    awayscore: number | null
    done: boolean | null
    winner: number | null
    international: boolean | null
    seconds: number | null
    current_record: string | null
    is_tiebreaker: boolean | null
    homerecord: string | null
    awayrecord: string | null
    msf_id: number | null
    _count: GamesCountAggregateOutputType | null
    _avg: GamesAvgAggregateOutputType | null
    _sum: GamesSumAggregateOutputType | null
    _min: GamesMinAggregateOutputType | null
    _max: GamesMaxAggregateOutputType | null
  }

  type GetGamesGroupByPayload<T extends gamesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GamesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GamesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GamesGroupByOutputType[P]>
            : GetScalarType<T[P], GamesGroupByOutputType[P]>
        }
      >
    >


  export type gamesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    gid?: boolean
    season?: boolean
    week?: boolean
    ts?: boolean
    home?: boolean
    away?: boolean
    homescore?: boolean
    awayscore?: boolean
    done?: boolean
    winner?: boolean
    international?: boolean
    seconds?: boolean
    current_record?: boolean
    is_tiebreaker?: boolean
    homerecord?: boolean
    awayrecord?: boolean
    msf_id?: boolean
    teams_games_homeToteams?: boolean | teamsDefaultArgs<ExtArgs>
    teams_games_awayToteams?: boolean | teamsDefaultArgs<ExtArgs>
    picks?: boolean | games$picksArgs<ExtArgs>
    _count?: boolean | GamesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["games"]>

  export type gamesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    gid?: boolean
    season?: boolean
    week?: boolean
    ts?: boolean
    home?: boolean
    away?: boolean
    homescore?: boolean
    awayscore?: boolean
    done?: boolean
    winner?: boolean
    international?: boolean
    seconds?: boolean
    current_record?: boolean
    is_tiebreaker?: boolean
    homerecord?: boolean
    awayrecord?: boolean
    msf_id?: boolean
    teams_games_homeToteams?: boolean | teamsDefaultArgs<ExtArgs>
    teams_games_awayToteams?: boolean | teamsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["games"]>

  export type gamesSelectScalar = {
    gid?: boolean
    season?: boolean
    week?: boolean
    ts?: boolean
    home?: boolean
    away?: boolean
    homescore?: boolean
    awayscore?: boolean
    done?: boolean
    winner?: boolean
    international?: boolean
    seconds?: boolean
    current_record?: boolean
    is_tiebreaker?: boolean
    homerecord?: boolean
    awayrecord?: boolean
    msf_id?: boolean
  }

  export type gamesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teams_games_homeToteams?: boolean | teamsDefaultArgs<ExtArgs>
    teams_games_awayToteams?: boolean | teamsDefaultArgs<ExtArgs>
    picks?: boolean | games$picksArgs<ExtArgs>
    _count?: boolean | GamesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type gamesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teams_games_homeToteams?: boolean | teamsDefaultArgs<ExtArgs>
    teams_games_awayToteams?: boolean | teamsDefaultArgs<ExtArgs>
  }

  export type $gamesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "games"
    objects: {
      teams_games_homeToteams: Prisma.$teamsPayload<ExtArgs>
      teams_games_awayToteams: Prisma.$teamsPayload<ExtArgs>
      picks: Prisma.$picksPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      gid: number
      season: number
      week: number
      ts: Date
      home: number
      away: number
      homescore: number | null
      awayscore: number | null
      done: boolean | null
      winner: number | null
      international: boolean | null
      seconds: number | null
      current_record: string | null
      is_tiebreaker: boolean | null
      homerecord: string | null
      awayrecord: string | null
      msf_id: number | null
    }, ExtArgs["result"]["games"]>
    composites: {}
  }

  type gamesGetPayload<S extends boolean | null | undefined | gamesDefaultArgs> = $Result.GetResult<Prisma.$gamesPayload, S>

  type gamesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<gamesFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: GamesCountAggregateInputType | true
    }

  export interface gamesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['games'], meta: { name: 'games' } }
    /**
     * Find zero or one Games that matches the filter.
     * @param {gamesFindUniqueArgs} args - Arguments to find a Games
     * @example
     * // Get one Games
     * const games = await prisma.games.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends gamesFindUniqueArgs>(args: SelectSubset<T, gamesFindUniqueArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Games that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {gamesFindUniqueOrThrowArgs} args - Arguments to find a Games
     * @example
     * // Get one Games
     * const games = await prisma.games.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends gamesFindUniqueOrThrowArgs>(args: SelectSubset<T, gamesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Games that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gamesFindFirstArgs} args - Arguments to find a Games
     * @example
     * // Get one Games
     * const games = await prisma.games.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends gamesFindFirstArgs>(args?: SelectSubset<T, gamesFindFirstArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Games that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gamesFindFirstOrThrowArgs} args - Arguments to find a Games
     * @example
     * // Get one Games
     * const games = await prisma.games.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends gamesFindFirstOrThrowArgs>(args?: SelectSubset<T, gamesFindFirstOrThrowArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Games that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gamesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Games
     * const games = await prisma.games.findMany()
     * 
     * // Get first 10 Games
     * const games = await prisma.games.findMany({ take: 10 })
     * 
     * // Only select the `gid`
     * const gamesWithGidOnly = await prisma.games.findMany({ select: { gid: true } })
     * 
     */
    findMany<T extends gamesFindManyArgs>(args?: SelectSubset<T, gamesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Games.
     * @param {gamesCreateArgs} args - Arguments to create a Games.
     * @example
     * // Create one Games
     * const Games = await prisma.games.create({
     *   data: {
     *     // ... data to create a Games
     *   }
     * })
     * 
     */
    create<T extends gamesCreateArgs>(args: SelectSubset<T, gamesCreateArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Games.
     * @param {gamesCreateManyArgs} args - Arguments to create many Games.
     * @example
     * // Create many Games
     * const games = await prisma.games.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends gamesCreateManyArgs>(args?: SelectSubset<T, gamesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Games and returns the data saved in the database.
     * @param {gamesCreateManyAndReturnArgs} args - Arguments to create many Games.
     * @example
     * // Create many Games
     * const games = await prisma.games.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Games and only return the `gid`
     * const gamesWithGidOnly = await prisma.games.createManyAndReturn({ 
     *   select: { gid: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends gamesCreateManyAndReturnArgs>(args?: SelectSubset<T, gamesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Games.
     * @param {gamesDeleteArgs} args - Arguments to delete one Games.
     * @example
     * // Delete one Games
     * const Games = await prisma.games.delete({
     *   where: {
     *     // ... filter to delete one Games
     *   }
     * })
     * 
     */
    delete<T extends gamesDeleteArgs>(args: SelectSubset<T, gamesDeleteArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Games.
     * @param {gamesUpdateArgs} args - Arguments to update one Games.
     * @example
     * // Update one Games
     * const games = await prisma.games.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends gamesUpdateArgs>(args: SelectSubset<T, gamesUpdateArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Games.
     * @param {gamesDeleteManyArgs} args - Arguments to filter Games to delete.
     * @example
     * // Delete a few Games
     * const { count } = await prisma.games.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends gamesDeleteManyArgs>(args?: SelectSubset<T, gamesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gamesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Games
     * const games = await prisma.games.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends gamesUpdateManyArgs>(args: SelectSubset<T, gamesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Games.
     * @param {gamesUpsertArgs} args - Arguments to update or create a Games.
     * @example
     * // Update or create a Games
     * const games = await prisma.games.upsert({
     *   create: {
     *     // ... data to create a Games
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Games we want to update
     *   }
     * })
     */
    upsert<T extends gamesUpsertArgs>(args: SelectSubset<T, gamesUpsertArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gamesCountArgs} args - Arguments to filter Games to count.
     * @example
     * // Count the number of Games
     * const count = await prisma.games.count({
     *   where: {
     *     // ... the filter for the Games we want to count
     *   }
     * })
    **/
    count<T extends gamesCountArgs>(
      args?: Subset<T, gamesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GamesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GamesAggregateArgs>(args: Subset<T, GamesAggregateArgs>): Prisma.PrismaPromise<GetGamesAggregateType<T>>

    /**
     * Group by Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gamesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends gamesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: gamesGroupByArgs['orderBy'] }
        : { orderBy?: gamesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, gamesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGamesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the games model
   */
  readonly fields: gamesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for games.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__gamesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    teams_games_homeToteams<T extends teamsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, teamsDefaultArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    teams_games_awayToteams<T extends teamsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, teamsDefaultArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    picks<T extends games$picksArgs<ExtArgs> = {}>(args?: Subset<T, games$picksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the games model
   */ 
  interface gamesFieldRefs {
    readonly gid: FieldRef<"games", 'Int'>
    readonly season: FieldRef<"games", 'Int'>
    readonly week: FieldRef<"games", 'Int'>
    readonly ts: FieldRef<"games", 'DateTime'>
    readonly home: FieldRef<"games", 'Int'>
    readonly away: FieldRef<"games", 'Int'>
    readonly homescore: FieldRef<"games", 'Int'>
    readonly awayscore: FieldRef<"games", 'Int'>
    readonly done: FieldRef<"games", 'Boolean'>
    readonly winner: FieldRef<"games", 'Int'>
    readonly international: FieldRef<"games", 'Boolean'>
    readonly seconds: FieldRef<"games", 'Int'>
    readonly current_record: FieldRef<"games", 'String'>
    readonly is_tiebreaker: FieldRef<"games", 'Boolean'>
    readonly homerecord: FieldRef<"games", 'String'>
    readonly awayrecord: FieldRef<"games", 'String'>
    readonly msf_id: FieldRef<"games", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * games findUnique
   */
  export type gamesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * Filter, which games to fetch.
     */
    where: gamesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games findUniqueOrThrow
   */
  export type gamesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * Filter, which games to fetch.
     */
    where: gamesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games findFirst
   */
  export type gamesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * Filter, which games to fetch.
     */
    where?: gamesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of games to fetch.
     */
    orderBy?: gamesOrderByWithRelationInput | gamesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for games.
     */
    cursor?: gamesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of games.
     */
    distinct?: GamesScalarFieldEnum | GamesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games findFirstOrThrow
   */
  export type gamesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * Filter, which games to fetch.
     */
    where?: gamesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of games to fetch.
     */
    orderBy?: gamesOrderByWithRelationInput | gamesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for games.
     */
    cursor?: gamesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of games.
     */
    distinct?: GamesScalarFieldEnum | GamesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games findMany
   */
  export type gamesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * Filter, which games to fetch.
     */
    where?: gamesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of games to fetch.
     */
    orderBy?: gamesOrderByWithRelationInput | gamesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing games.
     */
    cursor?: gamesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` games.
     */
    skip?: number
    distinct?: GamesScalarFieldEnum | GamesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games create
   */
  export type gamesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * The data needed to create a games.
     */
    data: XOR<gamesCreateInput, gamesUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games createMany
   */
  export type gamesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many games.
     */
    data: gamesCreateManyInput | gamesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * games createManyAndReturn
   */
  export type gamesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many games.
     */
    data: gamesCreateManyInput | gamesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * games update
   */
  export type gamesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * The data needed to update a games.
     */
    data: XOR<gamesUpdateInput, gamesUncheckedUpdateInput>
    /**
     * Choose, which games to update.
     */
    where: gamesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games updateMany
   */
  export type gamesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update games.
     */
    data: XOR<gamesUpdateManyMutationInput, gamesUncheckedUpdateManyInput>
    /**
     * Filter which games to update
     */
    where?: gamesWhereInput
  }

  /**
   * games upsert
   */
  export type gamesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * The filter to search for the games to update in case it exists.
     */
    where: gamesWhereUniqueInput
    /**
     * In case the games found by the `where` argument doesn't exist, create a new games with this data.
     */
    create: XOR<gamesCreateInput, gamesUncheckedCreateInput>
    /**
     * In case the games was found with the provided `where` argument, update it with this data.
     */
    update: XOR<gamesUpdateInput, gamesUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games delete
   */
  export type gamesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    /**
     * Filter which games to delete.
     */
    where: gamesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * games deleteMany
   */
  export type gamesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which games to delete
     */
    where?: gamesWhereInput
  }

  /**
   * games.picks
   */
  export type games$picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    where?: picksWhereInput
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    cursor?: picksWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
  }

  /**
   * games without action
   */
  export type gamesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
  }


  /**
   * Model leaguemembers
   */

  export type AggregateLeaguemembers = {
    _count: LeaguemembersCountAggregateOutputType | null
    _avg: LeaguemembersAvgAggregateOutputType | null
    _sum: LeaguemembersSumAggregateOutputType | null
    _min: LeaguemembersMinAggregateOutputType | null
    _max: LeaguemembersMaxAggregateOutputType | null
  }

  export type LeaguemembersAvgAggregateOutputType = {
    membership_id: number | null
    league_id: number | null
    user_id: number | null
  }

  export type LeaguemembersSumAggregateOutputType = {
    membership_id: number | null
    league_id: number | null
    user_id: number | null
  }

  export type LeaguemembersMinAggregateOutputType = {
    membership_id: number | null
    league_id: number | null
    user_id: number | null
    ts: Date | null
    role: $Enums.MemberRole | null
    paid: boolean | null
  }

  export type LeaguemembersMaxAggregateOutputType = {
    membership_id: number | null
    league_id: number | null
    user_id: number | null
    ts: Date | null
    role: $Enums.MemberRole | null
    paid: boolean | null
  }

  export type LeaguemembersCountAggregateOutputType = {
    membership_id: number
    league_id: number
    user_id: number
    ts: number
    role: number
    paid: number
    _all: number
  }


  export type LeaguemembersAvgAggregateInputType = {
    membership_id?: true
    league_id?: true
    user_id?: true
  }

  export type LeaguemembersSumAggregateInputType = {
    membership_id?: true
    league_id?: true
    user_id?: true
  }

  export type LeaguemembersMinAggregateInputType = {
    membership_id?: true
    league_id?: true
    user_id?: true
    ts?: true
    role?: true
    paid?: true
  }

  export type LeaguemembersMaxAggregateInputType = {
    membership_id?: true
    league_id?: true
    user_id?: true
    ts?: true
    role?: true
    paid?: true
  }

  export type LeaguemembersCountAggregateInputType = {
    membership_id?: true
    league_id?: true
    user_id?: true
    ts?: true
    role?: true
    paid?: true
    _all?: true
  }

  export type LeaguemembersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which leaguemembers to aggregate.
     */
    where?: leaguemembersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemembers to fetch.
     */
    orderBy?: leaguemembersOrderByWithRelationInput | leaguemembersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: leaguemembersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned leaguemembers
    **/
    _count?: true | LeaguemembersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeaguemembersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeaguemembersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeaguemembersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeaguemembersMaxAggregateInputType
  }

  export type GetLeaguemembersAggregateType<T extends LeaguemembersAggregateArgs> = {
        [P in keyof T & keyof AggregateLeaguemembers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeaguemembers[P]>
      : GetScalarType<T[P], AggregateLeaguemembers[P]>
  }




  export type leaguemembersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguemembersWhereInput
    orderBy?: leaguemembersOrderByWithAggregationInput | leaguemembersOrderByWithAggregationInput[]
    by: LeaguemembersScalarFieldEnum[] | LeaguemembersScalarFieldEnum
    having?: leaguemembersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeaguemembersCountAggregateInputType | true
    _avg?: LeaguemembersAvgAggregateInputType
    _sum?: LeaguemembersSumAggregateInputType
    _min?: LeaguemembersMinAggregateInputType
    _max?: LeaguemembersMaxAggregateInputType
  }

  export type LeaguemembersGroupByOutputType = {
    membership_id: number
    league_id: number
    user_id: number
    ts: Date
    role: $Enums.MemberRole | null
    paid: boolean | null
    _count: LeaguemembersCountAggregateOutputType | null
    _avg: LeaguemembersAvgAggregateOutputType | null
    _sum: LeaguemembersSumAggregateOutputType | null
    _min: LeaguemembersMinAggregateOutputType | null
    _max: LeaguemembersMaxAggregateOutputType | null
  }

  type GetLeaguemembersGroupByPayload<T extends leaguemembersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeaguemembersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeaguemembersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeaguemembersGroupByOutputType[P]>
            : GetScalarType<T[P], LeaguemembersGroupByOutputType[P]>
        }
      >
    >


  export type leaguemembersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    membership_id?: boolean
    league_id?: boolean
    user_id?: boolean
    ts?: boolean
    role?: boolean
    paid?: boolean
    EmailLogs?: boolean | leaguemembers$EmailLogsArgs<ExtArgs>
    WeekWinners?: boolean | leaguemembers$WeekWinnersArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemessages?: boolean | leaguemembers$leaguemessagesArgs<ExtArgs>
    picks?: boolean | leaguemembers$picksArgs<ExtArgs>
    superbowl?: boolean | leaguemembers$superbowlArgs<ExtArgs>
    _count?: boolean | LeaguemembersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaguemembers"]>

  export type leaguemembersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    membership_id?: boolean
    league_id?: boolean
    user_id?: boolean
    ts?: boolean
    role?: boolean
    paid?: boolean
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaguemembers"]>

  export type leaguemembersSelectScalar = {
    membership_id?: boolean
    league_id?: boolean
    user_id?: boolean
    ts?: boolean
    role?: boolean
    paid?: boolean
  }

  export type leaguemembersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    EmailLogs?: boolean | leaguemembers$EmailLogsArgs<ExtArgs>
    WeekWinners?: boolean | leaguemembers$WeekWinnersArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemessages?: boolean | leaguemembers$leaguemessagesArgs<ExtArgs>
    picks?: boolean | leaguemembers$picksArgs<ExtArgs>
    superbowl?: boolean | leaguemembers$superbowlArgs<ExtArgs>
    _count?: boolean | LeaguemembersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type leaguemembersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
  }

  export type $leaguemembersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "leaguemembers"
    objects: {
      EmailLogs: Prisma.$EmailLogsPayload<ExtArgs>[]
      WeekWinners: Prisma.$WeekWinnersPayload<ExtArgs>[]
      people: Prisma.$peoplePayload<ExtArgs>
      leagues: Prisma.$leaguesPayload<ExtArgs>
      leaguemessages: Prisma.$leaguemessagesPayload<ExtArgs>[]
      picks: Prisma.$picksPayload<ExtArgs>[]
      superbowl: Prisma.$superbowlPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      membership_id: number
      league_id: number
      user_id: number
      ts: Date
      role: $Enums.MemberRole | null
      paid: boolean | null
    }, ExtArgs["result"]["leaguemembers"]>
    composites: {}
  }

  type leaguemembersGetPayload<S extends boolean | null | undefined | leaguemembersDefaultArgs> = $Result.GetResult<Prisma.$leaguemembersPayload, S>

  type leaguemembersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<leaguemembersFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: LeaguemembersCountAggregateInputType | true
    }

  export interface leaguemembersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['leaguemembers'], meta: { name: 'leaguemembers' } }
    /**
     * Find zero or one Leaguemembers that matches the filter.
     * @param {leaguemembersFindUniqueArgs} args - Arguments to find a Leaguemembers
     * @example
     * // Get one Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends leaguemembersFindUniqueArgs>(args: SelectSubset<T, leaguemembersFindUniqueArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Leaguemembers that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {leaguemembersFindUniqueOrThrowArgs} args - Arguments to find a Leaguemembers
     * @example
     * // Get one Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends leaguemembersFindUniqueOrThrowArgs>(args: SelectSubset<T, leaguemembersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Leaguemembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemembersFindFirstArgs} args - Arguments to find a Leaguemembers
     * @example
     * // Get one Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends leaguemembersFindFirstArgs>(args?: SelectSubset<T, leaguemembersFindFirstArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Leaguemembers that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemembersFindFirstOrThrowArgs} args - Arguments to find a Leaguemembers
     * @example
     * // Get one Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends leaguemembersFindFirstOrThrowArgs>(args?: SelectSubset<T, leaguemembersFindFirstOrThrowArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Leaguemembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemembersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.findMany()
     * 
     * // Get first 10 Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.findMany({ take: 10 })
     * 
     * // Only select the `membership_id`
     * const leaguemembersWithMembership_idOnly = await prisma.leaguemembers.findMany({ select: { membership_id: true } })
     * 
     */
    findMany<T extends leaguemembersFindManyArgs>(args?: SelectSubset<T, leaguemembersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Leaguemembers.
     * @param {leaguemembersCreateArgs} args - Arguments to create a Leaguemembers.
     * @example
     * // Create one Leaguemembers
     * const Leaguemembers = await prisma.leaguemembers.create({
     *   data: {
     *     // ... data to create a Leaguemembers
     *   }
     * })
     * 
     */
    create<T extends leaguemembersCreateArgs>(args: SelectSubset<T, leaguemembersCreateArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Leaguemembers.
     * @param {leaguemembersCreateManyArgs} args - Arguments to create many Leaguemembers.
     * @example
     * // Create many Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends leaguemembersCreateManyArgs>(args?: SelectSubset<T, leaguemembersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leaguemembers and returns the data saved in the database.
     * @param {leaguemembersCreateManyAndReturnArgs} args - Arguments to create many Leaguemembers.
     * @example
     * // Create many Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leaguemembers and only return the `membership_id`
     * const leaguemembersWithMembership_idOnly = await prisma.leaguemembers.createManyAndReturn({ 
     *   select: { membership_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends leaguemembersCreateManyAndReturnArgs>(args?: SelectSubset<T, leaguemembersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Leaguemembers.
     * @param {leaguemembersDeleteArgs} args - Arguments to delete one Leaguemembers.
     * @example
     * // Delete one Leaguemembers
     * const Leaguemembers = await prisma.leaguemembers.delete({
     *   where: {
     *     // ... filter to delete one Leaguemembers
     *   }
     * })
     * 
     */
    delete<T extends leaguemembersDeleteArgs>(args: SelectSubset<T, leaguemembersDeleteArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Leaguemembers.
     * @param {leaguemembersUpdateArgs} args - Arguments to update one Leaguemembers.
     * @example
     * // Update one Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends leaguemembersUpdateArgs>(args: SelectSubset<T, leaguemembersUpdateArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Leaguemembers.
     * @param {leaguemembersDeleteManyArgs} args - Arguments to filter Leaguemembers to delete.
     * @example
     * // Delete a few Leaguemembers
     * const { count } = await prisma.leaguemembers.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends leaguemembersDeleteManyArgs>(args?: SelectSubset<T, leaguemembersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leaguemembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemembersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends leaguemembersUpdateManyArgs>(args: SelectSubset<T, leaguemembersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Leaguemembers.
     * @param {leaguemembersUpsertArgs} args - Arguments to update or create a Leaguemembers.
     * @example
     * // Update or create a Leaguemembers
     * const leaguemembers = await prisma.leaguemembers.upsert({
     *   create: {
     *     // ... data to create a Leaguemembers
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Leaguemembers we want to update
     *   }
     * })
     */
    upsert<T extends leaguemembersUpsertArgs>(args: SelectSubset<T, leaguemembersUpsertArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Leaguemembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemembersCountArgs} args - Arguments to filter Leaguemembers to count.
     * @example
     * // Count the number of Leaguemembers
     * const count = await prisma.leaguemembers.count({
     *   where: {
     *     // ... the filter for the Leaguemembers we want to count
     *   }
     * })
    **/
    count<T extends leaguemembersCountArgs>(
      args?: Subset<T, leaguemembersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeaguemembersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Leaguemembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaguemembersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeaguemembersAggregateArgs>(args: Subset<T, LeaguemembersAggregateArgs>): Prisma.PrismaPromise<GetLeaguemembersAggregateType<T>>

    /**
     * Group by Leaguemembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemembersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends leaguemembersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: leaguemembersGroupByArgs['orderBy'] }
        : { orderBy?: leaguemembersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, leaguemembersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeaguemembersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the leaguemembers model
   */
  readonly fields: leaguemembersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for leaguemembers.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__leaguemembersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    EmailLogs<T extends leaguemembers$EmailLogsArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembers$EmailLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findMany"> | Null>
    WeekWinners<T extends leaguemembers$WeekWinnersArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembers$WeekWinnersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findMany"> | Null>
    people<T extends peopleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, peopleDefaultArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leagues<T extends leaguesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguesDefaultArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leaguemessages<T extends leaguemembers$leaguemessagesArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembers$leaguemessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findMany"> | Null>
    picks<T extends leaguemembers$picksArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembers$picksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findMany"> | Null>
    superbowl<T extends leaguemembers$superbowlArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembers$superbowlArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the leaguemembers model
   */ 
  interface leaguemembersFieldRefs {
    readonly membership_id: FieldRef<"leaguemembers", 'Int'>
    readonly league_id: FieldRef<"leaguemembers", 'Int'>
    readonly user_id: FieldRef<"leaguemembers", 'Int'>
    readonly ts: FieldRef<"leaguemembers", 'DateTime'>
    readonly role: FieldRef<"leaguemembers", 'MemberRole'>
    readonly paid: FieldRef<"leaguemembers", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * leaguemembers findUnique
   */
  export type leaguemembersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * Filter, which leaguemembers to fetch.
     */
    where: leaguemembersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers findUniqueOrThrow
   */
  export type leaguemembersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * Filter, which leaguemembers to fetch.
     */
    where: leaguemembersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers findFirst
   */
  export type leaguemembersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * Filter, which leaguemembers to fetch.
     */
    where?: leaguemembersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemembers to fetch.
     */
    orderBy?: leaguemembersOrderByWithRelationInput | leaguemembersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for leaguemembers.
     */
    cursor?: leaguemembersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of leaguemembers.
     */
    distinct?: LeaguemembersScalarFieldEnum | LeaguemembersScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers findFirstOrThrow
   */
  export type leaguemembersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * Filter, which leaguemembers to fetch.
     */
    where?: leaguemembersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemembers to fetch.
     */
    orderBy?: leaguemembersOrderByWithRelationInput | leaguemembersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for leaguemembers.
     */
    cursor?: leaguemembersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of leaguemembers.
     */
    distinct?: LeaguemembersScalarFieldEnum | LeaguemembersScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers findMany
   */
  export type leaguemembersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * Filter, which leaguemembers to fetch.
     */
    where?: leaguemembersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemembers to fetch.
     */
    orderBy?: leaguemembersOrderByWithRelationInput | leaguemembersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing leaguemembers.
     */
    cursor?: leaguemembersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemembers.
     */
    skip?: number
    distinct?: LeaguemembersScalarFieldEnum | LeaguemembersScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers create
   */
  export type leaguemembersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * The data needed to create a leaguemembers.
     */
    data: XOR<leaguemembersCreateInput, leaguemembersUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers createMany
   */
  export type leaguemembersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many leaguemembers.
     */
    data: leaguemembersCreateManyInput | leaguemembersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * leaguemembers createManyAndReturn
   */
  export type leaguemembersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many leaguemembers.
     */
    data: leaguemembersCreateManyInput | leaguemembersCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * leaguemembers update
   */
  export type leaguemembersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * The data needed to update a leaguemembers.
     */
    data: XOR<leaguemembersUpdateInput, leaguemembersUncheckedUpdateInput>
    /**
     * Choose, which leaguemembers to update.
     */
    where: leaguemembersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers updateMany
   */
  export type leaguemembersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update leaguemembers.
     */
    data: XOR<leaguemembersUpdateManyMutationInput, leaguemembersUncheckedUpdateManyInput>
    /**
     * Filter which leaguemembers to update
     */
    where?: leaguemembersWhereInput
  }

  /**
   * leaguemembers upsert
   */
  export type leaguemembersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * The filter to search for the leaguemembers to update in case it exists.
     */
    where: leaguemembersWhereUniqueInput
    /**
     * In case the leaguemembers found by the `where` argument doesn't exist, create a new leaguemembers with this data.
     */
    create: XOR<leaguemembersCreateInput, leaguemembersUncheckedCreateInput>
    /**
     * In case the leaguemembers was found with the provided `where` argument, update it with this data.
     */
    update: XOR<leaguemembersUpdateInput, leaguemembersUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers delete
   */
  export type leaguemembersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    /**
     * Filter which leaguemembers to delete.
     */
    where: leaguemembersWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemembers deleteMany
   */
  export type leaguemembersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which leaguemembers to delete
     */
    where?: leaguemembersWhereInput
  }

  /**
   * leaguemembers.EmailLogs
   */
  export type leaguemembers$EmailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    where?: EmailLogsWhereInput
    orderBy?: EmailLogsOrderByWithRelationInput | EmailLogsOrderByWithRelationInput[]
    cursor?: EmailLogsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmailLogsScalarFieldEnum | EmailLogsScalarFieldEnum[]
  }

  /**
   * leaguemembers.WeekWinners
   */
  export type leaguemembers$WeekWinnersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    where?: WeekWinnersWhereInput
    orderBy?: WeekWinnersOrderByWithRelationInput | WeekWinnersOrderByWithRelationInput[]
    cursor?: WeekWinnersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WeekWinnersScalarFieldEnum | WeekWinnersScalarFieldEnum[]
  }

  /**
   * leaguemembers.leaguemessages
   */
  export type leaguemembers$leaguemessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    where?: leaguemessagesWhereInput
    orderBy?: leaguemessagesOrderByWithRelationInput | leaguemessagesOrderByWithRelationInput[]
    cursor?: leaguemessagesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaguemessagesScalarFieldEnum | LeaguemessagesScalarFieldEnum[]
  }

  /**
   * leaguemembers.picks
   */
  export type leaguemembers$picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    where?: picksWhereInput
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    cursor?: picksWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
  }

  /**
   * leaguemembers.superbowl
   */
  export type leaguemembers$superbowlArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    where?: superbowlWhereInput
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    cursor?: superbowlWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SuperbowlScalarFieldEnum | SuperbowlScalarFieldEnum[]
  }

  /**
   * leaguemembers without action
   */
  export type leaguemembersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
  }


  /**
   * Model leaguemessages
   */

  export type AggregateLeaguemessages = {
    _count: LeaguemessagesCountAggregateOutputType | null
    _avg: LeaguemessagesAvgAggregateOutputType | null
    _sum: LeaguemessagesSumAggregateOutputType | null
    _min: LeaguemessagesMinAggregateOutputType | null
    _max: LeaguemessagesMaxAggregateOutputType | null
  }

  export type LeaguemessagesAvgAggregateOutputType = {
    member_id: number | null
    league_id: number | null
    week: number | null
  }

  export type LeaguemessagesSumAggregateOutputType = {
    member_id: number | null
    league_id: number | null
    week: number | null
  }

  export type LeaguemessagesMinAggregateOutputType = {
    message_id: string | null
    content: string | null
    member_id: number | null
    league_id: number | null
    week: number | null
    message_type: $Enums.MessageType | null
    createdAt: Date | null
    status: $Enums.MessageStatus | null
  }

  export type LeaguemessagesMaxAggregateOutputType = {
    message_id: string | null
    content: string | null
    member_id: number | null
    league_id: number | null
    week: number | null
    message_type: $Enums.MessageType | null
    createdAt: Date | null
    status: $Enums.MessageStatus | null
  }

  export type LeaguemessagesCountAggregateOutputType = {
    message_id: number
    content: number
    member_id: number
    league_id: number
    week: number
    message_type: number
    createdAt: number
    status: number
    _all: number
  }


  export type LeaguemessagesAvgAggregateInputType = {
    member_id?: true
    league_id?: true
    week?: true
  }

  export type LeaguemessagesSumAggregateInputType = {
    member_id?: true
    league_id?: true
    week?: true
  }

  export type LeaguemessagesMinAggregateInputType = {
    message_id?: true
    content?: true
    member_id?: true
    league_id?: true
    week?: true
    message_type?: true
    createdAt?: true
    status?: true
  }

  export type LeaguemessagesMaxAggregateInputType = {
    message_id?: true
    content?: true
    member_id?: true
    league_id?: true
    week?: true
    message_type?: true
    createdAt?: true
    status?: true
  }

  export type LeaguemessagesCountAggregateInputType = {
    message_id?: true
    content?: true
    member_id?: true
    league_id?: true
    week?: true
    message_type?: true
    createdAt?: true
    status?: true
    _all?: true
  }

  export type LeaguemessagesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which leaguemessages to aggregate.
     */
    where?: leaguemessagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemessages to fetch.
     */
    orderBy?: leaguemessagesOrderByWithRelationInput | leaguemessagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: leaguemessagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned leaguemessages
    **/
    _count?: true | LeaguemessagesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeaguemessagesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeaguemessagesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeaguemessagesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeaguemessagesMaxAggregateInputType
  }

  export type GetLeaguemessagesAggregateType<T extends LeaguemessagesAggregateArgs> = {
        [P in keyof T & keyof AggregateLeaguemessages]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeaguemessages[P]>
      : GetScalarType<T[P], AggregateLeaguemessages[P]>
  }




  export type leaguemessagesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguemessagesWhereInput
    orderBy?: leaguemessagesOrderByWithAggregationInput | leaguemessagesOrderByWithAggregationInput[]
    by: LeaguemessagesScalarFieldEnum[] | LeaguemessagesScalarFieldEnum
    having?: leaguemessagesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeaguemessagesCountAggregateInputType | true
    _avg?: LeaguemessagesAvgAggregateInputType
    _sum?: LeaguemessagesSumAggregateInputType
    _min?: LeaguemessagesMinAggregateInputType
    _max?: LeaguemessagesMaxAggregateInputType
  }

  export type LeaguemessagesGroupByOutputType = {
    message_id: string
    content: string
    member_id: number
    league_id: number
    week: number | null
    message_type: $Enums.MessageType
    createdAt: Date
    status: $Enums.MessageStatus
    _count: LeaguemessagesCountAggregateOutputType | null
    _avg: LeaguemessagesAvgAggregateOutputType | null
    _sum: LeaguemessagesSumAggregateOutputType | null
    _min: LeaguemessagesMinAggregateOutputType | null
    _max: LeaguemessagesMaxAggregateOutputType | null
  }

  type GetLeaguemessagesGroupByPayload<T extends leaguemessagesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeaguemessagesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeaguemessagesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeaguemessagesGroupByOutputType[P]>
            : GetScalarType<T[P], LeaguemessagesGroupByOutputType[P]>
        }
      >
    >


  export type leaguemessagesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    message_id?: boolean
    content?: boolean
    member_id?: boolean
    league_id?: boolean
    week?: boolean
    message_type?: boolean
    createdAt?: boolean
    status?: boolean
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaguemessages"]>

  export type leaguemessagesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    message_id?: boolean
    content?: boolean
    member_id?: boolean
    league_id?: boolean
    week?: boolean
    message_type?: boolean
    createdAt?: boolean
    status?: boolean
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaguemessages"]>

  export type leaguemessagesSelectScalar = {
    message_id?: boolean
    content?: boolean
    member_id?: boolean
    league_id?: boolean
    week?: boolean
    message_type?: boolean
    createdAt?: boolean
    status?: boolean
  }

  export type leaguemessagesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }
  export type leaguemessagesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | leaguesDefaultArgs<ExtArgs>
    leaguemembers?: boolean | leaguemembersDefaultArgs<ExtArgs>
  }

  export type $leaguemessagesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "leaguemessages"
    objects: {
      leagues: Prisma.$leaguesPayload<ExtArgs>
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      message_id: string
      content: string
      member_id: number
      league_id: number
      week: number | null
      message_type: $Enums.MessageType
      createdAt: Date
      status: $Enums.MessageStatus
    }, ExtArgs["result"]["leaguemessages"]>
    composites: {}
  }

  type leaguemessagesGetPayload<S extends boolean | null | undefined | leaguemessagesDefaultArgs> = $Result.GetResult<Prisma.$leaguemessagesPayload, S>

  type leaguemessagesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<leaguemessagesFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: LeaguemessagesCountAggregateInputType | true
    }

  export interface leaguemessagesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['leaguemessages'], meta: { name: 'leaguemessages' } }
    /**
     * Find zero or one Leaguemessages that matches the filter.
     * @param {leaguemessagesFindUniqueArgs} args - Arguments to find a Leaguemessages
     * @example
     * // Get one Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends leaguemessagesFindUniqueArgs>(args: SelectSubset<T, leaguemessagesFindUniqueArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Leaguemessages that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {leaguemessagesFindUniqueOrThrowArgs} args - Arguments to find a Leaguemessages
     * @example
     * // Get one Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends leaguemessagesFindUniqueOrThrowArgs>(args: SelectSubset<T, leaguemessagesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Leaguemessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemessagesFindFirstArgs} args - Arguments to find a Leaguemessages
     * @example
     * // Get one Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends leaguemessagesFindFirstArgs>(args?: SelectSubset<T, leaguemessagesFindFirstArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Leaguemessages that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemessagesFindFirstOrThrowArgs} args - Arguments to find a Leaguemessages
     * @example
     * // Get one Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends leaguemessagesFindFirstOrThrowArgs>(args?: SelectSubset<T, leaguemessagesFindFirstOrThrowArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Leaguemessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemessagesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.findMany()
     * 
     * // Get first 10 Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.findMany({ take: 10 })
     * 
     * // Only select the `message_id`
     * const leaguemessagesWithMessage_idOnly = await prisma.leaguemessages.findMany({ select: { message_id: true } })
     * 
     */
    findMany<T extends leaguemessagesFindManyArgs>(args?: SelectSubset<T, leaguemessagesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Leaguemessages.
     * @param {leaguemessagesCreateArgs} args - Arguments to create a Leaguemessages.
     * @example
     * // Create one Leaguemessages
     * const Leaguemessages = await prisma.leaguemessages.create({
     *   data: {
     *     // ... data to create a Leaguemessages
     *   }
     * })
     * 
     */
    create<T extends leaguemessagesCreateArgs>(args: SelectSubset<T, leaguemessagesCreateArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Leaguemessages.
     * @param {leaguemessagesCreateManyArgs} args - Arguments to create many Leaguemessages.
     * @example
     * // Create many Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends leaguemessagesCreateManyArgs>(args?: SelectSubset<T, leaguemessagesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leaguemessages and returns the data saved in the database.
     * @param {leaguemessagesCreateManyAndReturnArgs} args - Arguments to create many Leaguemessages.
     * @example
     * // Create many Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leaguemessages and only return the `message_id`
     * const leaguemessagesWithMessage_idOnly = await prisma.leaguemessages.createManyAndReturn({ 
     *   select: { message_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends leaguemessagesCreateManyAndReturnArgs>(args?: SelectSubset<T, leaguemessagesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Leaguemessages.
     * @param {leaguemessagesDeleteArgs} args - Arguments to delete one Leaguemessages.
     * @example
     * // Delete one Leaguemessages
     * const Leaguemessages = await prisma.leaguemessages.delete({
     *   where: {
     *     // ... filter to delete one Leaguemessages
     *   }
     * })
     * 
     */
    delete<T extends leaguemessagesDeleteArgs>(args: SelectSubset<T, leaguemessagesDeleteArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Leaguemessages.
     * @param {leaguemessagesUpdateArgs} args - Arguments to update one Leaguemessages.
     * @example
     * // Update one Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends leaguemessagesUpdateArgs>(args: SelectSubset<T, leaguemessagesUpdateArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Leaguemessages.
     * @param {leaguemessagesDeleteManyArgs} args - Arguments to filter Leaguemessages to delete.
     * @example
     * // Delete a few Leaguemessages
     * const { count } = await prisma.leaguemessages.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends leaguemessagesDeleteManyArgs>(args?: SelectSubset<T, leaguemessagesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leaguemessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemessagesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends leaguemessagesUpdateManyArgs>(args: SelectSubset<T, leaguemessagesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Leaguemessages.
     * @param {leaguemessagesUpsertArgs} args - Arguments to update or create a Leaguemessages.
     * @example
     * // Update or create a Leaguemessages
     * const leaguemessages = await prisma.leaguemessages.upsert({
     *   create: {
     *     // ... data to create a Leaguemessages
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Leaguemessages we want to update
     *   }
     * })
     */
    upsert<T extends leaguemessagesUpsertArgs>(args: SelectSubset<T, leaguemessagesUpsertArgs<ExtArgs>>): Prisma__leaguemessagesClient<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Leaguemessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemessagesCountArgs} args - Arguments to filter Leaguemessages to count.
     * @example
     * // Count the number of Leaguemessages
     * const count = await prisma.leaguemessages.count({
     *   where: {
     *     // ... the filter for the Leaguemessages we want to count
     *   }
     * })
    **/
    count<T extends leaguemessagesCountArgs>(
      args?: Subset<T, leaguemessagesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeaguemessagesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Leaguemessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaguemessagesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeaguemessagesAggregateArgs>(args: Subset<T, LeaguemessagesAggregateArgs>): Prisma.PrismaPromise<GetLeaguemessagesAggregateType<T>>

    /**
     * Group by Leaguemessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguemessagesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends leaguemessagesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: leaguemessagesGroupByArgs['orderBy'] }
        : { orderBy?: leaguemessagesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, leaguemessagesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeaguemessagesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the leaguemessages model
   */
  readonly fields: leaguemessagesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for leaguemessages.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__leaguemessagesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    leagues<T extends leaguesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguesDefaultArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leaguemembers<T extends leaguemembersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, leaguemembersDefaultArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the leaguemessages model
   */ 
  interface leaguemessagesFieldRefs {
    readonly message_id: FieldRef<"leaguemessages", 'String'>
    readonly content: FieldRef<"leaguemessages", 'String'>
    readonly member_id: FieldRef<"leaguemessages", 'Int'>
    readonly league_id: FieldRef<"leaguemessages", 'Int'>
    readonly week: FieldRef<"leaguemessages", 'Int'>
    readonly message_type: FieldRef<"leaguemessages", 'MessageType'>
    readonly createdAt: FieldRef<"leaguemessages", 'DateTime'>
    readonly status: FieldRef<"leaguemessages", 'MessageStatus'>
  }
    

  // Custom InputTypes
  /**
   * leaguemessages findUnique
   */
  export type leaguemessagesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * Filter, which leaguemessages to fetch.
     */
    where: leaguemessagesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages findUniqueOrThrow
   */
  export type leaguemessagesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * Filter, which leaguemessages to fetch.
     */
    where: leaguemessagesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages findFirst
   */
  export type leaguemessagesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * Filter, which leaguemessages to fetch.
     */
    where?: leaguemessagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemessages to fetch.
     */
    orderBy?: leaguemessagesOrderByWithRelationInput | leaguemessagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for leaguemessages.
     */
    cursor?: leaguemessagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of leaguemessages.
     */
    distinct?: LeaguemessagesScalarFieldEnum | LeaguemessagesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages findFirstOrThrow
   */
  export type leaguemessagesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * Filter, which leaguemessages to fetch.
     */
    where?: leaguemessagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemessages to fetch.
     */
    orderBy?: leaguemessagesOrderByWithRelationInput | leaguemessagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for leaguemessages.
     */
    cursor?: leaguemessagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of leaguemessages.
     */
    distinct?: LeaguemessagesScalarFieldEnum | LeaguemessagesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages findMany
   */
  export type leaguemessagesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * Filter, which leaguemessages to fetch.
     */
    where?: leaguemessagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leaguemessages to fetch.
     */
    orderBy?: leaguemessagesOrderByWithRelationInput | leaguemessagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing leaguemessages.
     */
    cursor?: leaguemessagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leaguemessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leaguemessages.
     */
    skip?: number
    distinct?: LeaguemessagesScalarFieldEnum | LeaguemessagesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages create
   */
  export type leaguemessagesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * The data needed to create a leaguemessages.
     */
    data: XOR<leaguemessagesCreateInput, leaguemessagesUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages createMany
   */
  export type leaguemessagesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many leaguemessages.
     */
    data: leaguemessagesCreateManyInput | leaguemessagesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * leaguemessages createManyAndReturn
   */
  export type leaguemessagesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many leaguemessages.
     */
    data: leaguemessagesCreateManyInput | leaguemessagesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * leaguemessages update
   */
  export type leaguemessagesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * The data needed to update a leaguemessages.
     */
    data: XOR<leaguemessagesUpdateInput, leaguemessagesUncheckedUpdateInput>
    /**
     * Choose, which leaguemessages to update.
     */
    where: leaguemessagesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages updateMany
   */
  export type leaguemessagesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update leaguemessages.
     */
    data: XOR<leaguemessagesUpdateManyMutationInput, leaguemessagesUncheckedUpdateManyInput>
    /**
     * Filter which leaguemessages to update
     */
    where?: leaguemessagesWhereInput
  }

  /**
   * leaguemessages upsert
   */
  export type leaguemessagesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * The filter to search for the leaguemessages to update in case it exists.
     */
    where: leaguemessagesWhereUniqueInput
    /**
     * In case the leaguemessages found by the `where` argument doesn't exist, create a new leaguemessages with this data.
     */
    create: XOR<leaguemessagesCreateInput, leaguemessagesUncheckedCreateInput>
    /**
     * In case the leaguemessages was found with the provided `where` argument, update it with this data.
     */
    update: XOR<leaguemessagesUpdateInput, leaguemessagesUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages delete
   */
  export type leaguemessagesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    /**
     * Filter which leaguemessages to delete.
     */
    where: leaguemessagesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leaguemessages deleteMany
   */
  export type leaguemessagesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which leaguemessages to delete
     */
    where?: leaguemessagesWhereInput
  }

  /**
   * leaguemessages without action
   */
  export type leaguemessagesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
  }


  /**
   * Model leagues
   */

  export type AggregateLeagues = {
    _count: LeaguesCountAggregateOutputType | null
    _avg: LeaguesAvgAggregateOutputType | null
    _sum: LeaguesSumAggregateOutputType | null
    _min: LeaguesMinAggregateOutputType | null
    _max: LeaguesMaxAggregateOutputType | null
  }

  export type LeaguesAvgAggregateOutputType = {
    league_id: number | null
    created_by_user_id: number | null
    season: number | null
    prior_league_id: number | null
  }

  export type LeaguesSumAggregateOutputType = {
    league_id: number | null
    created_by_user_id: number | null
    season: number | null
    prior_league_id: number | null
  }

  export type LeaguesMinAggregateOutputType = {
    league_id: number | null
    created_by_user_id: number | null
    name: string | null
    created_time: Date | null
    season: number | null
    late_policy: $Enums.LatePolicy | null
    pick_policy: $Enums.PickPolicy | null
    reminder_policy: $Enums.ReminderPolicy | null
    scoring_type: $Enums.ScoringType | null
    share_code: string | null
    superbowl_competition: boolean | null
    prior_league_id: number | null
    status: $Enums.LeagueStatus | null
  }

  export type LeaguesMaxAggregateOutputType = {
    league_id: number | null
    created_by_user_id: number | null
    name: string | null
    created_time: Date | null
    season: number | null
    late_policy: $Enums.LatePolicy | null
    pick_policy: $Enums.PickPolicy | null
    reminder_policy: $Enums.ReminderPolicy | null
    scoring_type: $Enums.ScoringType | null
    share_code: string | null
    superbowl_competition: boolean | null
    prior_league_id: number | null
    status: $Enums.LeagueStatus | null
  }

  export type LeaguesCountAggregateOutputType = {
    league_id: number
    created_by_user_id: number
    name: number
    created_time: number
    season: number
    late_policy: number
    pick_policy: number
    reminder_policy: number
    scoring_type: number
    share_code: number
    superbowl_competition: number
    prior_league_id: number
    status: number
    _all: number
  }


  export type LeaguesAvgAggregateInputType = {
    league_id?: true
    created_by_user_id?: true
    season?: true
    prior_league_id?: true
  }

  export type LeaguesSumAggregateInputType = {
    league_id?: true
    created_by_user_id?: true
    season?: true
    prior_league_id?: true
  }

  export type LeaguesMinAggregateInputType = {
    league_id?: true
    created_by_user_id?: true
    name?: true
    created_time?: true
    season?: true
    late_policy?: true
    pick_policy?: true
    reminder_policy?: true
    scoring_type?: true
    share_code?: true
    superbowl_competition?: true
    prior_league_id?: true
    status?: true
  }

  export type LeaguesMaxAggregateInputType = {
    league_id?: true
    created_by_user_id?: true
    name?: true
    created_time?: true
    season?: true
    late_policy?: true
    pick_policy?: true
    reminder_policy?: true
    scoring_type?: true
    share_code?: true
    superbowl_competition?: true
    prior_league_id?: true
    status?: true
  }

  export type LeaguesCountAggregateInputType = {
    league_id?: true
    created_by_user_id?: true
    name?: true
    created_time?: true
    season?: true
    late_policy?: true
    pick_policy?: true
    reminder_policy?: true
    scoring_type?: true
    share_code?: true
    superbowl_competition?: true
    prior_league_id?: true
    status?: true
    _all?: true
  }

  export type LeaguesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which leagues to aggregate.
     */
    where?: leaguesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leagues to fetch.
     */
    orderBy?: leaguesOrderByWithRelationInput | leaguesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: leaguesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leagues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leagues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned leagues
    **/
    _count?: true | LeaguesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeaguesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeaguesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeaguesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeaguesMaxAggregateInputType
  }

  export type GetLeaguesAggregateType<T extends LeaguesAggregateArgs> = {
        [P in keyof T & keyof AggregateLeagues]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeagues[P]>
      : GetScalarType<T[P], AggregateLeagues[P]>
  }




  export type leaguesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: leaguesWhereInput
    orderBy?: leaguesOrderByWithAggregationInput | leaguesOrderByWithAggregationInput[]
    by: LeaguesScalarFieldEnum[] | LeaguesScalarFieldEnum
    having?: leaguesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeaguesCountAggregateInputType | true
    _avg?: LeaguesAvgAggregateInputType
    _sum?: LeaguesSumAggregateInputType
    _min?: LeaguesMinAggregateInputType
    _max?: LeaguesMaxAggregateInputType
  }

  export type LeaguesGroupByOutputType = {
    league_id: number
    created_by_user_id: number
    name: string
    created_time: Date
    season: number
    late_policy: $Enums.LatePolicy | null
    pick_policy: $Enums.PickPolicy | null
    reminder_policy: $Enums.ReminderPolicy | null
    scoring_type: $Enums.ScoringType | null
    share_code: string | null
    superbowl_competition: boolean | null
    prior_league_id: number | null
    status: $Enums.LeagueStatus
    _count: LeaguesCountAggregateOutputType | null
    _avg: LeaguesAvgAggregateOutputType | null
    _sum: LeaguesSumAggregateOutputType | null
    _min: LeaguesMinAggregateOutputType | null
    _max: LeaguesMaxAggregateOutputType | null
  }

  type GetLeaguesGroupByPayload<T extends leaguesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeaguesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeaguesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeaguesGroupByOutputType[P]>
            : GetScalarType<T[P], LeaguesGroupByOutputType[P]>
        }
      >
    >


  export type leaguesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    league_id?: boolean
    created_by_user_id?: boolean
    name?: boolean
    created_time?: boolean
    season?: boolean
    late_policy?: boolean
    pick_policy?: boolean
    reminder_policy?: boolean
    scoring_type?: boolean
    share_code?: boolean
    superbowl_competition?: boolean
    prior_league_id?: boolean
    status?: boolean
    EmailLogs?: boolean | leagues$EmailLogsArgs<ExtArgs>
    WeekWinners?: boolean | leagues$WeekWinnersArgs<ExtArgs>
    leaguemembers?: boolean | leagues$leaguemembersArgs<ExtArgs>
    leaguemessages?: boolean | leagues$leaguemessagesArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    prior_league?: boolean | leagues$prior_leagueArgs<ExtArgs>
    future_leagues?: boolean | leagues$future_leaguesArgs<ExtArgs>
    _count?: boolean | LeaguesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leagues"]>

  export type leaguesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    league_id?: boolean
    created_by_user_id?: boolean
    name?: boolean
    created_time?: boolean
    season?: boolean
    late_policy?: boolean
    pick_policy?: boolean
    reminder_policy?: boolean
    scoring_type?: boolean
    share_code?: boolean
    superbowl_competition?: boolean
    prior_league_id?: boolean
    status?: boolean
    people?: boolean | peopleDefaultArgs<ExtArgs>
    prior_league?: boolean | leagues$prior_leagueArgs<ExtArgs>
  }, ExtArgs["result"]["leagues"]>

  export type leaguesSelectScalar = {
    league_id?: boolean
    created_by_user_id?: boolean
    name?: boolean
    created_time?: boolean
    season?: boolean
    late_policy?: boolean
    pick_policy?: boolean
    reminder_policy?: boolean
    scoring_type?: boolean
    share_code?: boolean
    superbowl_competition?: boolean
    prior_league_id?: boolean
    status?: boolean
  }

  export type leaguesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    EmailLogs?: boolean | leagues$EmailLogsArgs<ExtArgs>
    WeekWinners?: boolean | leagues$WeekWinnersArgs<ExtArgs>
    leaguemembers?: boolean | leagues$leaguemembersArgs<ExtArgs>
    leaguemessages?: boolean | leagues$leaguemessagesArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    prior_league?: boolean | leagues$prior_leagueArgs<ExtArgs>
    future_leagues?: boolean | leagues$future_leaguesArgs<ExtArgs>
    _count?: boolean | LeaguesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type leaguesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    people?: boolean | peopleDefaultArgs<ExtArgs>
    prior_league?: boolean | leagues$prior_leagueArgs<ExtArgs>
  }

  export type $leaguesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "leagues"
    objects: {
      EmailLogs: Prisma.$EmailLogsPayload<ExtArgs>[]
      WeekWinners: Prisma.$WeekWinnersPayload<ExtArgs>[]
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs>[]
      leaguemessages: Prisma.$leaguemessagesPayload<ExtArgs>[]
      people: Prisma.$peoplePayload<ExtArgs>
      prior_league: Prisma.$leaguesPayload<ExtArgs> | null
      future_leagues: Prisma.$leaguesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      league_id: number
      created_by_user_id: number
      name: string
      created_time: Date
      season: number
      late_policy: $Enums.LatePolicy | null
      pick_policy: $Enums.PickPolicy | null
      reminder_policy: $Enums.ReminderPolicy | null
      scoring_type: $Enums.ScoringType | null
      share_code: string | null
      superbowl_competition: boolean | null
      prior_league_id: number | null
      status: $Enums.LeagueStatus
    }, ExtArgs["result"]["leagues"]>
    composites: {}
  }

  type leaguesGetPayload<S extends boolean | null | undefined | leaguesDefaultArgs> = $Result.GetResult<Prisma.$leaguesPayload, S>

  type leaguesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<leaguesFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: LeaguesCountAggregateInputType | true
    }

  export interface leaguesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['leagues'], meta: { name: 'leagues' } }
    /**
     * Find zero or one Leagues that matches the filter.
     * @param {leaguesFindUniqueArgs} args - Arguments to find a Leagues
     * @example
     * // Get one Leagues
     * const leagues = await prisma.leagues.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends leaguesFindUniqueArgs>(args: SelectSubset<T, leaguesFindUniqueArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Leagues that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {leaguesFindUniqueOrThrowArgs} args - Arguments to find a Leagues
     * @example
     * // Get one Leagues
     * const leagues = await prisma.leagues.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends leaguesFindUniqueOrThrowArgs>(args: SelectSubset<T, leaguesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Leagues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguesFindFirstArgs} args - Arguments to find a Leagues
     * @example
     * // Get one Leagues
     * const leagues = await prisma.leagues.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends leaguesFindFirstArgs>(args?: SelectSubset<T, leaguesFindFirstArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Leagues that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguesFindFirstOrThrowArgs} args - Arguments to find a Leagues
     * @example
     * // Get one Leagues
     * const leagues = await prisma.leagues.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends leaguesFindFirstOrThrowArgs>(args?: SelectSubset<T, leaguesFindFirstOrThrowArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Leagues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leagues
     * const leagues = await prisma.leagues.findMany()
     * 
     * // Get first 10 Leagues
     * const leagues = await prisma.leagues.findMany({ take: 10 })
     * 
     * // Only select the `league_id`
     * const leaguesWithLeague_idOnly = await prisma.leagues.findMany({ select: { league_id: true } })
     * 
     */
    findMany<T extends leaguesFindManyArgs>(args?: SelectSubset<T, leaguesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Leagues.
     * @param {leaguesCreateArgs} args - Arguments to create a Leagues.
     * @example
     * // Create one Leagues
     * const Leagues = await prisma.leagues.create({
     *   data: {
     *     // ... data to create a Leagues
     *   }
     * })
     * 
     */
    create<T extends leaguesCreateArgs>(args: SelectSubset<T, leaguesCreateArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Leagues.
     * @param {leaguesCreateManyArgs} args - Arguments to create many Leagues.
     * @example
     * // Create many Leagues
     * const leagues = await prisma.leagues.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends leaguesCreateManyArgs>(args?: SelectSubset<T, leaguesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leagues and returns the data saved in the database.
     * @param {leaguesCreateManyAndReturnArgs} args - Arguments to create many Leagues.
     * @example
     * // Create many Leagues
     * const leagues = await prisma.leagues.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leagues and only return the `league_id`
     * const leaguesWithLeague_idOnly = await prisma.leagues.createManyAndReturn({ 
     *   select: { league_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends leaguesCreateManyAndReturnArgs>(args?: SelectSubset<T, leaguesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Leagues.
     * @param {leaguesDeleteArgs} args - Arguments to delete one Leagues.
     * @example
     * // Delete one Leagues
     * const Leagues = await prisma.leagues.delete({
     *   where: {
     *     // ... filter to delete one Leagues
     *   }
     * })
     * 
     */
    delete<T extends leaguesDeleteArgs>(args: SelectSubset<T, leaguesDeleteArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Leagues.
     * @param {leaguesUpdateArgs} args - Arguments to update one Leagues.
     * @example
     * // Update one Leagues
     * const leagues = await prisma.leagues.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends leaguesUpdateArgs>(args: SelectSubset<T, leaguesUpdateArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Leagues.
     * @param {leaguesDeleteManyArgs} args - Arguments to filter Leagues to delete.
     * @example
     * // Delete a few Leagues
     * const { count } = await prisma.leagues.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends leaguesDeleteManyArgs>(args?: SelectSubset<T, leaguesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leagues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leagues
     * const leagues = await prisma.leagues.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends leaguesUpdateManyArgs>(args: SelectSubset<T, leaguesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Leagues.
     * @param {leaguesUpsertArgs} args - Arguments to update or create a Leagues.
     * @example
     * // Update or create a Leagues
     * const leagues = await prisma.leagues.upsert({
     *   create: {
     *     // ... data to create a Leagues
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Leagues we want to update
     *   }
     * })
     */
    upsert<T extends leaguesUpsertArgs>(args: SelectSubset<T, leaguesUpsertArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Leagues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguesCountArgs} args - Arguments to filter Leagues to count.
     * @example
     * // Count the number of Leagues
     * const count = await prisma.leagues.count({
     *   where: {
     *     // ... the filter for the Leagues we want to count
     *   }
     * })
    **/
    count<T extends leaguesCountArgs>(
      args?: Subset<T, leaguesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeaguesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Leagues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaguesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeaguesAggregateArgs>(args: Subset<T, LeaguesAggregateArgs>): Prisma.PrismaPromise<GetLeaguesAggregateType<T>>

    /**
     * Group by Leagues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {leaguesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends leaguesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: leaguesGroupByArgs['orderBy'] }
        : { orderBy?: leaguesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, leaguesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeaguesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the leagues model
   */
  readonly fields: leaguesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for leagues.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__leaguesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    EmailLogs<T extends leagues$EmailLogsArgs<ExtArgs> = {}>(args?: Subset<T, leagues$EmailLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogsPayload<ExtArgs>, T, "findMany"> | Null>
    WeekWinners<T extends leagues$WeekWinnersArgs<ExtArgs> = {}>(args?: Subset<T, leagues$WeekWinnersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekWinnersPayload<ExtArgs>, T, "findMany"> | Null>
    leaguemembers<T extends leagues$leaguemembersArgs<ExtArgs> = {}>(args?: Subset<T, leagues$leaguemembersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findMany"> | Null>
    leaguemessages<T extends leagues$leaguemessagesArgs<ExtArgs> = {}>(args?: Subset<T, leagues$leaguemessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemessagesPayload<ExtArgs>, T, "findMany"> | Null>
    people<T extends peopleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, peopleDefaultArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    prior_league<T extends leagues$prior_leagueArgs<ExtArgs> = {}>(args?: Subset<T, leagues$prior_leagueArgs<ExtArgs>>): Prisma__leaguesClient<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    future_leagues<T extends leagues$future_leaguesArgs<ExtArgs> = {}>(args?: Subset<T, leagues$future_leaguesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the leagues model
   */ 
  interface leaguesFieldRefs {
    readonly league_id: FieldRef<"leagues", 'Int'>
    readonly created_by_user_id: FieldRef<"leagues", 'Int'>
    readonly name: FieldRef<"leagues", 'String'>
    readonly created_time: FieldRef<"leagues", 'DateTime'>
    readonly season: FieldRef<"leagues", 'Int'>
    readonly late_policy: FieldRef<"leagues", 'LatePolicy'>
    readonly pick_policy: FieldRef<"leagues", 'PickPolicy'>
    readonly reminder_policy: FieldRef<"leagues", 'ReminderPolicy'>
    readonly scoring_type: FieldRef<"leagues", 'ScoringType'>
    readonly share_code: FieldRef<"leagues", 'String'>
    readonly superbowl_competition: FieldRef<"leagues", 'Boolean'>
    readonly prior_league_id: FieldRef<"leagues", 'Int'>
    readonly status: FieldRef<"leagues", 'LeagueStatus'>
  }
    

  // Custom InputTypes
  /**
   * leagues findUnique
   */
  export type leaguesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * Filter, which leagues to fetch.
     */
    where: leaguesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues findUniqueOrThrow
   */
  export type leaguesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * Filter, which leagues to fetch.
     */
    where: leaguesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues findFirst
   */
  export type leaguesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * Filter, which leagues to fetch.
     */
    where?: leaguesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leagues to fetch.
     */
    orderBy?: leaguesOrderByWithRelationInput | leaguesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for leagues.
     */
    cursor?: leaguesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leagues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leagues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of leagues.
     */
    distinct?: LeaguesScalarFieldEnum | LeaguesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues findFirstOrThrow
   */
  export type leaguesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * Filter, which leagues to fetch.
     */
    where?: leaguesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leagues to fetch.
     */
    orderBy?: leaguesOrderByWithRelationInput | leaguesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for leagues.
     */
    cursor?: leaguesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leagues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leagues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of leagues.
     */
    distinct?: LeaguesScalarFieldEnum | LeaguesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues findMany
   */
  export type leaguesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * Filter, which leagues to fetch.
     */
    where?: leaguesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of leagues to fetch.
     */
    orderBy?: leaguesOrderByWithRelationInput | leaguesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing leagues.
     */
    cursor?: leaguesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` leagues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` leagues.
     */
    skip?: number
    distinct?: LeaguesScalarFieldEnum | LeaguesScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues create
   */
  export type leaguesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * The data needed to create a leagues.
     */
    data: XOR<leaguesCreateInput, leaguesUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues createMany
   */
  export type leaguesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many leagues.
     */
    data: leaguesCreateManyInput | leaguesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * leagues createManyAndReturn
   */
  export type leaguesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many leagues.
     */
    data: leaguesCreateManyInput | leaguesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * leagues update
   */
  export type leaguesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * The data needed to update a leagues.
     */
    data: XOR<leaguesUpdateInput, leaguesUncheckedUpdateInput>
    /**
     * Choose, which leagues to update.
     */
    where: leaguesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues updateMany
   */
  export type leaguesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update leagues.
     */
    data: XOR<leaguesUpdateManyMutationInput, leaguesUncheckedUpdateManyInput>
    /**
     * Filter which leagues to update
     */
    where?: leaguesWhereInput
  }

  /**
   * leagues upsert
   */
  export type leaguesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * The filter to search for the leagues to update in case it exists.
     */
    where: leaguesWhereUniqueInput
    /**
     * In case the leagues found by the `where` argument doesn't exist, create a new leagues with this data.
     */
    create: XOR<leaguesCreateInput, leaguesUncheckedCreateInput>
    /**
     * In case the leagues was found with the provided `where` argument, update it with this data.
     */
    update: XOR<leaguesUpdateInput, leaguesUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues delete
   */
  export type leaguesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    /**
     * Filter which leagues to delete.
     */
    where: leaguesWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * leagues deleteMany
   */
  export type leaguesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which leagues to delete
     */
    where?: leaguesWhereInput
  }

  /**
   * leagues.EmailLogs
   */
  export type leagues$EmailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLogs
     */
    select?: EmailLogsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogsInclude<ExtArgs> | null
    where?: EmailLogsWhereInput
    orderBy?: EmailLogsOrderByWithRelationInput | EmailLogsOrderByWithRelationInput[]
    cursor?: EmailLogsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmailLogsScalarFieldEnum | EmailLogsScalarFieldEnum[]
  }

  /**
   * leagues.WeekWinners
   */
  export type leagues$WeekWinnersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekWinners
     */
    select?: WeekWinnersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekWinnersInclude<ExtArgs> | null
    where?: WeekWinnersWhereInput
    orderBy?: WeekWinnersOrderByWithRelationInput | WeekWinnersOrderByWithRelationInput[]
    cursor?: WeekWinnersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WeekWinnersScalarFieldEnum | WeekWinnersScalarFieldEnum[]
  }

  /**
   * leagues.leaguemembers
   */
  export type leagues$leaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    where?: leaguemembersWhereInput
    orderBy?: leaguemembersOrderByWithRelationInput | leaguemembersOrderByWithRelationInput[]
    cursor?: leaguemembersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaguemembersScalarFieldEnum | LeaguemembersScalarFieldEnum[]
  }

  /**
   * leagues.leaguemessages
   */
  export type leagues$leaguemessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemessages
     */
    select?: leaguemessagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemessagesInclude<ExtArgs> | null
    where?: leaguemessagesWhereInput
    orderBy?: leaguemessagesOrderByWithRelationInput | leaguemessagesOrderByWithRelationInput[]
    cursor?: leaguemessagesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaguemessagesScalarFieldEnum | LeaguemessagesScalarFieldEnum[]
  }

  /**
   * leagues.prior_league
   */
  export type leagues$prior_leagueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    where?: leaguesWhereInput
  }

  /**
   * leagues.future_leagues
   */
  export type leagues$future_leaguesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    where?: leaguesWhereInput
    orderBy?: leaguesOrderByWithRelationInput | leaguesOrderByWithRelationInput[]
    cursor?: leaguesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaguesScalarFieldEnum | LeaguesScalarFieldEnum[]
  }

  /**
   * leagues without action
   */
  export type leaguesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
  }


  /**
   * Model people
   */

  export type AggregatePeople = {
    _count: PeopleCountAggregateOutputType | null
    _avg: PeopleAvgAggregateOutputType | null
    _sum: PeopleSumAggregateOutputType | null
    _min: PeopleMinAggregateOutputType | null
    _max: PeopleMaxAggregateOutputType | null
  }

  export type PeopleAvgAggregateOutputType = {
    uid: number | null
    season: number | null
  }

  export type PeopleSumAggregateOutputType = {
    uid: number | null
    season: number | null
  }

  export type PeopleMinAggregateOutputType = {
    uid: number | null
    username: string | null
    fname: string | null
    lname: string | null
    email: string | null
    season: number | null
    email2: string | null
    google_photo_url: string | null
    google_email: string | null
    google_userid: string | null
    supabase_id: string | null
  }

  export type PeopleMaxAggregateOutputType = {
    uid: number | null
    username: string | null
    fname: string | null
    lname: string | null
    email: string | null
    season: number | null
    email2: string | null
    google_photo_url: string | null
    google_email: string | null
    google_userid: string | null
    supabase_id: string | null
  }

  export type PeopleCountAggregateOutputType = {
    uid: number
    username: number
    fname: number
    lname: number
    email: number
    season: number
    email2: number
    google_photo_url: number
    google_email: number
    google_userid: number
    supabase_id: number
    _all: number
  }


  export type PeopleAvgAggregateInputType = {
    uid?: true
    season?: true
  }

  export type PeopleSumAggregateInputType = {
    uid?: true
    season?: true
  }

  export type PeopleMinAggregateInputType = {
    uid?: true
    username?: true
    fname?: true
    lname?: true
    email?: true
    season?: true
    email2?: true
    google_photo_url?: true
    google_email?: true
    google_userid?: true
    supabase_id?: true
  }

  export type PeopleMaxAggregateInputType = {
    uid?: true
    username?: true
    fname?: true
    lname?: true
    email?: true
    season?: true
    email2?: true
    google_photo_url?: true
    google_email?: true
    google_userid?: true
    supabase_id?: true
  }

  export type PeopleCountAggregateInputType = {
    uid?: true
    username?: true
    fname?: true
    lname?: true
    email?: true
    season?: true
    email2?: true
    google_photo_url?: true
    google_email?: true
    google_userid?: true
    supabase_id?: true
    _all?: true
  }

  export type PeopleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which people to aggregate.
     */
    where?: peopleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of people to fetch.
     */
    orderBy?: peopleOrderByWithRelationInput | peopleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: peopleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` people from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` people.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned people
    **/
    _count?: true | PeopleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PeopleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PeopleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PeopleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PeopleMaxAggregateInputType
  }

  export type GetPeopleAggregateType<T extends PeopleAggregateArgs> = {
        [P in keyof T & keyof AggregatePeople]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePeople[P]>
      : GetScalarType<T[P], AggregatePeople[P]>
  }




  export type peopleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: peopleWhereInput
    orderBy?: peopleOrderByWithAggregationInput | peopleOrderByWithAggregationInput[]
    by: PeopleScalarFieldEnum[] | PeopleScalarFieldEnum
    having?: peopleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PeopleCountAggregateInputType | true
    _avg?: PeopleAvgAggregateInputType
    _sum?: PeopleSumAggregateInputType
    _min?: PeopleMinAggregateInputType
    _max?: PeopleMaxAggregateInputType
  }

  export type PeopleGroupByOutputType = {
    uid: number
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2: string | null
    google_photo_url: string | null
    google_email: string | null
    google_userid: string | null
    supabase_id: string | null
    _count: PeopleCountAggregateOutputType | null
    _avg: PeopleAvgAggregateOutputType | null
    _sum: PeopleSumAggregateOutputType | null
    _min: PeopleMinAggregateOutputType | null
    _max: PeopleMaxAggregateOutputType | null
  }

  type GetPeopleGroupByPayload<T extends peopleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PeopleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PeopleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PeopleGroupByOutputType[P]>
            : GetScalarType<T[P], PeopleGroupByOutputType[P]>
        }
      >
    >


  export type peopleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    uid?: boolean
    username?: boolean
    fname?: boolean
    lname?: boolean
    email?: boolean
    season?: boolean
    email2?: boolean
    google_photo_url?: boolean
    google_email?: boolean
    google_userid?: boolean
    supabase_id?: boolean
    leaguemembers?: boolean | people$leaguemembersArgs<ExtArgs>
    leagues?: boolean | people$leaguesArgs<ExtArgs>
    picks?: boolean | people$picksArgs<ExtArgs>
    _count?: boolean | PeopleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["people"]>

  export type peopleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    uid?: boolean
    username?: boolean
    fname?: boolean
    lname?: boolean
    email?: boolean
    season?: boolean
    email2?: boolean
    google_photo_url?: boolean
    google_email?: boolean
    google_userid?: boolean
    supabase_id?: boolean
  }, ExtArgs["result"]["people"]>

  export type peopleSelectScalar = {
    uid?: boolean
    username?: boolean
    fname?: boolean
    lname?: boolean
    email?: boolean
    season?: boolean
    email2?: boolean
    google_photo_url?: boolean
    google_email?: boolean
    google_userid?: boolean
    supabase_id?: boolean
  }

  export type peopleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leaguemembers?: boolean | people$leaguemembersArgs<ExtArgs>
    leagues?: boolean | people$leaguesArgs<ExtArgs>
    picks?: boolean | people$picksArgs<ExtArgs>
    _count?: boolean | PeopleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type peopleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $peoplePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "people"
    objects: {
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs>[]
      leagues: Prisma.$leaguesPayload<ExtArgs>[]
      picks: Prisma.$picksPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      uid: number
      username: string
      fname: string
      lname: string
      email: string
      season: number
      email2: string | null
      google_photo_url: string | null
      google_email: string | null
      google_userid: string | null
      supabase_id: string | null
    }, ExtArgs["result"]["people"]>
    composites: {}
  }

  type peopleGetPayload<S extends boolean | null | undefined | peopleDefaultArgs> = $Result.GetResult<Prisma.$peoplePayload, S>

  type peopleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<peopleFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: PeopleCountAggregateInputType | true
    }

  export interface peopleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['people'], meta: { name: 'people' } }
    /**
     * Find zero or one People that matches the filter.
     * @param {peopleFindUniqueArgs} args - Arguments to find a People
     * @example
     * // Get one People
     * const people = await prisma.people.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends peopleFindUniqueArgs>(args: SelectSubset<T, peopleFindUniqueArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one People that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {peopleFindUniqueOrThrowArgs} args - Arguments to find a People
     * @example
     * // Get one People
     * const people = await prisma.people.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends peopleFindUniqueOrThrowArgs>(args: SelectSubset<T, peopleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first People that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peopleFindFirstArgs} args - Arguments to find a People
     * @example
     * // Get one People
     * const people = await prisma.people.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends peopleFindFirstArgs>(args?: SelectSubset<T, peopleFindFirstArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first People that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peopleFindFirstOrThrowArgs} args - Arguments to find a People
     * @example
     * // Get one People
     * const people = await prisma.people.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends peopleFindFirstOrThrowArgs>(args?: SelectSubset<T, peopleFindFirstOrThrowArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more People that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peopleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all People
     * const people = await prisma.people.findMany()
     * 
     * // Get first 10 People
     * const people = await prisma.people.findMany({ take: 10 })
     * 
     * // Only select the `uid`
     * const peopleWithUidOnly = await prisma.people.findMany({ select: { uid: true } })
     * 
     */
    findMany<T extends peopleFindManyArgs>(args?: SelectSubset<T, peopleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a People.
     * @param {peopleCreateArgs} args - Arguments to create a People.
     * @example
     * // Create one People
     * const People = await prisma.people.create({
     *   data: {
     *     // ... data to create a People
     *   }
     * })
     * 
     */
    create<T extends peopleCreateArgs>(args: SelectSubset<T, peopleCreateArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many People.
     * @param {peopleCreateManyArgs} args - Arguments to create many People.
     * @example
     * // Create many People
     * const people = await prisma.people.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends peopleCreateManyArgs>(args?: SelectSubset<T, peopleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many People and returns the data saved in the database.
     * @param {peopleCreateManyAndReturnArgs} args - Arguments to create many People.
     * @example
     * // Create many People
     * const people = await prisma.people.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many People and only return the `uid`
     * const peopleWithUidOnly = await prisma.people.createManyAndReturn({ 
     *   select: { uid: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends peopleCreateManyAndReturnArgs>(args?: SelectSubset<T, peopleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a People.
     * @param {peopleDeleteArgs} args - Arguments to delete one People.
     * @example
     * // Delete one People
     * const People = await prisma.people.delete({
     *   where: {
     *     // ... filter to delete one People
     *   }
     * })
     * 
     */
    delete<T extends peopleDeleteArgs>(args: SelectSubset<T, peopleDeleteArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one People.
     * @param {peopleUpdateArgs} args - Arguments to update one People.
     * @example
     * // Update one People
     * const people = await prisma.people.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends peopleUpdateArgs>(args: SelectSubset<T, peopleUpdateArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more People.
     * @param {peopleDeleteManyArgs} args - Arguments to filter People to delete.
     * @example
     * // Delete a few People
     * const { count } = await prisma.people.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends peopleDeleteManyArgs>(args?: SelectSubset<T, peopleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more People.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peopleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many People
     * const people = await prisma.people.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends peopleUpdateManyArgs>(args: SelectSubset<T, peopleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one People.
     * @param {peopleUpsertArgs} args - Arguments to update or create a People.
     * @example
     * // Update or create a People
     * const people = await prisma.people.upsert({
     *   create: {
     *     // ... data to create a People
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the People we want to update
     *   }
     * })
     */
    upsert<T extends peopleUpsertArgs>(args: SelectSubset<T, peopleUpsertArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of People.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peopleCountArgs} args - Arguments to filter People to count.
     * @example
     * // Count the number of People
     * const count = await prisma.people.count({
     *   where: {
     *     // ... the filter for the People we want to count
     *   }
     * })
    **/
    count<T extends peopleCountArgs>(
      args?: Subset<T, peopleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PeopleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a People.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PeopleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PeopleAggregateArgs>(args: Subset<T, PeopleAggregateArgs>): Prisma.PrismaPromise<GetPeopleAggregateType<T>>

    /**
     * Group by People.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peopleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends peopleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: peopleGroupByArgs['orderBy'] }
        : { orderBy?: peopleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, peopleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPeopleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the people model
   */
  readonly fields: peopleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for people.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__peopleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    leaguemembers<T extends people$leaguemembersArgs<ExtArgs> = {}>(args?: Subset<T, people$leaguemembersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findMany"> | Null>
    leagues<T extends people$leaguesArgs<ExtArgs> = {}>(args?: Subset<T, people$leaguesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$leaguesPayload<ExtArgs>, T, "findMany"> | Null>
    picks<T extends people$picksArgs<ExtArgs> = {}>(args?: Subset<T, people$picksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the people model
   */ 
  interface peopleFieldRefs {
    readonly uid: FieldRef<"people", 'Int'>
    readonly username: FieldRef<"people", 'String'>
    readonly fname: FieldRef<"people", 'String'>
    readonly lname: FieldRef<"people", 'String'>
    readonly email: FieldRef<"people", 'String'>
    readonly season: FieldRef<"people", 'Int'>
    readonly email2: FieldRef<"people", 'String'>
    readonly google_photo_url: FieldRef<"people", 'String'>
    readonly google_email: FieldRef<"people", 'String'>
    readonly google_userid: FieldRef<"people", 'String'>
    readonly supabase_id: FieldRef<"people", 'String'>
  }
    

  // Custom InputTypes
  /**
   * people findUnique
   */
  export type peopleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * Filter, which people to fetch.
     */
    where: peopleWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people findUniqueOrThrow
   */
  export type peopleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * Filter, which people to fetch.
     */
    where: peopleWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people findFirst
   */
  export type peopleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * Filter, which people to fetch.
     */
    where?: peopleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of people to fetch.
     */
    orderBy?: peopleOrderByWithRelationInput | peopleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for people.
     */
    cursor?: peopleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` people from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` people.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of people.
     */
    distinct?: PeopleScalarFieldEnum | PeopleScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people findFirstOrThrow
   */
  export type peopleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * Filter, which people to fetch.
     */
    where?: peopleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of people to fetch.
     */
    orderBy?: peopleOrderByWithRelationInput | peopleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for people.
     */
    cursor?: peopleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` people from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` people.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of people.
     */
    distinct?: PeopleScalarFieldEnum | PeopleScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people findMany
   */
  export type peopleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * Filter, which people to fetch.
     */
    where?: peopleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of people to fetch.
     */
    orderBy?: peopleOrderByWithRelationInput | peopleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing people.
     */
    cursor?: peopleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` people from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` people.
     */
    skip?: number
    distinct?: PeopleScalarFieldEnum | PeopleScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people create
   */
  export type peopleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * The data needed to create a people.
     */
    data: XOR<peopleCreateInput, peopleUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people createMany
   */
  export type peopleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many people.
     */
    data: peopleCreateManyInput | peopleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * people createManyAndReturn
   */
  export type peopleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many people.
     */
    data: peopleCreateManyInput | peopleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * people update
   */
  export type peopleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * The data needed to update a people.
     */
    data: XOR<peopleUpdateInput, peopleUncheckedUpdateInput>
    /**
     * Choose, which people to update.
     */
    where: peopleWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people updateMany
   */
  export type peopleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update people.
     */
    data: XOR<peopleUpdateManyMutationInput, peopleUncheckedUpdateManyInput>
    /**
     * Filter which people to update
     */
    where?: peopleWhereInput
  }

  /**
   * people upsert
   */
  export type peopleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * The filter to search for the people to update in case it exists.
     */
    where: peopleWhereUniqueInput
    /**
     * In case the people found by the `where` argument doesn't exist, create a new people with this data.
     */
    create: XOR<peopleCreateInput, peopleUncheckedCreateInput>
    /**
     * In case the people was found with the provided `where` argument, update it with this data.
     */
    update: XOR<peopleUpdateInput, peopleUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people delete
   */
  export type peopleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
    /**
     * Filter which people to delete.
     */
    where: peopleWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * people deleteMany
   */
  export type peopleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which people to delete
     */
    where?: peopleWhereInput
  }

  /**
   * people.leaguemembers
   */
  export type people$leaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    where?: leaguemembersWhereInput
    orderBy?: leaguemembersOrderByWithRelationInput | leaguemembersOrderByWithRelationInput[]
    cursor?: leaguemembersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaguemembersScalarFieldEnum | LeaguemembersScalarFieldEnum[]
  }

  /**
   * people.leagues
   */
  export type people$leaguesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leagues
     */
    select?: leaguesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguesInclude<ExtArgs> | null
    where?: leaguesWhereInput
    orderBy?: leaguesOrderByWithRelationInput | leaguesOrderByWithRelationInput[]
    cursor?: leaguesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaguesScalarFieldEnum | LeaguesScalarFieldEnum[]
  }

  /**
   * people.picks
   */
  export type people$picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    where?: picksWhereInput
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    cursor?: picksWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
  }

  /**
   * people without action
   */
  export type peopleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the people
     */
    select?: peopleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: peopleInclude<ExtArgs> | null
  }


  /**
   * Model picks
   */

  export type AggregatePicks = {
    _count: PicksCountAggregateOutputType | null
    _avg: PicksAvgAggregateOutputType | null
    _sum: PicksSumAggregateOutputType | null
    _min: PicksMinAggregateOutputType | null
    _max: PicksMaxAggregateOutputType | null
  }

  export type PicksAvgAggregateOutputType = {
    pickid: number | null
    uid: number | null
    season: number | null
    week: number | null
    gid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    correct: number | null
    done: number | null
    member_id: number | null
  }

  export type PicksSumAggregateOutputType = {
    pickid: number | null
    uid: number | null
    season: number | null
    week: number | null
    gid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    correct: number | null
    done: number | null
    member_id: number | null
  }

  export type PicksMinAggregateOutputType = {
    pickid: number | null
    uid: number | null
    season: number | null
    week: number | null
    gid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    ts: Date | null
    correct: number | null
    done: number | null
    is_random: boolean | null
    member_id: number | null
  }

  export type PicksMaxAggregateOutputType = {
    pickid: number | null
    uid: number | null
    season: number | null
    week: number | null
    gid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    ts: Date | null
    correct: number | null
    done: number | null
    is_random: boolean | null
    member_id: number | null
  }

  export type PicksCountAggregateOutputType = {
    pickid: number
    uid: number
    season: number
    week: number
    gid: number
    winner: number
    loser: number
    score: number
    ts: number
    correct: number
    done: number
    is_random: number
    member_id: number
    _all: number
  }


  export type PicksAvgAggregateInputType = {
    pickid?: true
    uid?: true
    season?: true
    week?: true
    gid?: true
    winner?: true
    loser?: true
    score?: true
    correct?: true
    done?: true
    member_id?: true
  }

  export type PicksSumAggregateInputType = {
    pickid?: true
    uid?: true
    season?: true
    week?: true
    gid?: true
    winner?: true
    loser?: true
    score?: true
    correct?: true
    done?: true
    member_id?: true
  }

  export type PicksMinAggregateInputType = {
    pickid?: true
    uid?: true
    season?: true
    week?: true
    gid?: true
    winner?: true
    loser?: true
    score?: true
    ts?: true
    correct?: true
    done?: true
    is_random?: true
    member_id?: true
  }

  export type PicksMaxAggregateInputType = {
    pickid?: true
    uid?: true
    season?: true
    week?: true
    gid?: true
    winner?: true
    loser?: true
    score?: true
    ts?: true
    correct?: true
    done?: true
    is_random?: true
    member_id?: true
  }

  export type PicksCountAggregateInputType = {
    pickid?: true
    uid?: true
    season?: true
    week?: true
    gid?: true
    winner?: true
    loser?: true
    score?: true
    ts?: true
    correct?: true
    done?: true
    is_random?: true
    member_id?: true
    _all?: true
  }

  export type PicksAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which picks to aggregate.
     */
    where?: picksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of picks to fetch.
     */
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: picksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` picks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` picks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned picks
    **/
    _count?: true | PicksCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PicksAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PicksSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PicksMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PicksMaxAggregateInputType
  }

  export type GetPicksAggregateType<T extends PicksAggregateArgs> = {
        [P in keyof T & keyof AggregatePicks]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePicks[P]>
      : GetScalarType<T[P], AggregatePicks[P]>
  }




  export type picksGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: picksWhereInput
    orderBy?: picksOrderByWithAggregationInput | picksOrderByWithAggregationInput[]
    by: PicksScalarFieldEnum[] | PicksScalarFieldEnum
    having?: picksScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PicksCountAggregateInputType | true
    _avg?: PicksAvgAggregateInputType
    _sum?: PicksSumAggregateInputType
    _min?: PicksMinAggregateInputType
    _max?: PicksMaxAggregateInputType
  }

  export type PicksGroupByOutputType = {
    pickid: number
    uid: number
    season: number
    week: number
    gid: number
    winner: number | null
    loser: number | null
    score: number | null
    ts: Date
    correct: number | null
    done: number | null
    is_random: boolean | null
    member_id: number | null
    _count: PicksCountAggregateOutputType | null
    _avg: PicksAvgAggregateOutputType | null
    _sum: PicksSumAggregateOutputType | null
    _min: PicksMinAggregateOutputType | null
    _max: PicksMaxAggregateOutputType | null
  }

  type GetPicksGroupByPayload<T extends picksGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PicksGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PicksGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PicksGroupByOutputType[P]>
            : GetScalarType<T[P], PicksGroupByOutputType[P]>
        }
      >
    >


  export type picksSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    pickid?: boolean
    uid?: boolean
    season?: boolean
    week?: boolean
    gid?: boolean
    winner?: boolean
    loser?: boolean
    score?: boolean
    ts?: boolean
    correct?: boolean
    done?: boolean
    is_random?: boolean
    member_id?: boolean
    games?: boolean | gamesDefaultArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leaguemembers?: boolean | picks$leaguemembersArgs<ExtArgs>
    teams?: boolean | picks$teamsArgs<ExtArgs>
  }, ExtArgs["result"]["picks"]>

  export type picksSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    pickid?: boolean
    uid?: boolean
    season?: boolean
    week?: boolean
    gid?: boolean
    winner?: boolean
    loser?: boolean
    score?: boolean
    ts?: boolean
    correct?: boolean
    done?: boolean
    is_random?: boolean
    member_id?: boolean
    games?: boolean | gamesDefaultArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leaguemembers?: boolean | picks$leaguemembersArgs<ExtArgs>
    teams?: boolean | picks$teamsArgs<ExtArgs>
  }, ExtArgs["result"]["picks"]>

  export type picksSelectScalar = {
    pickid?: boolean
    uid?: boolean
    season?: boolean
    week?: boolean
    gid?: boolean
    winner?: boolean
    loser?: boolean
    score?: boolean
    ts?: boolean
    correct?: boolean
    done?: boolean
    is_random?: boolean
    member_id?: boolean
  }

  export type picksInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    games?: boolean | gamesDefaultArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leaguemembers?: boolean | picks$leaguemembersArgs<ExtArgs>
    teams?: boolean | picks$teamsArgs<ExtArgs>
  }
  export type picksIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    games?: boolean | gamesDefaultArgs<ExtArgs>
    people?: boolean | peopleDefaultArgs<ExtArgs>
    leaguemembers?: boolean | picks$leaguemembersArgs<ExtArgs>
    teams?: boolean | picks$teamsArgs<ExtArgs>
  }

  export type $picksPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "picks"
    objects: {
      games: Prisma.$gamesPayload<ExtArgs>
      people: Prisma.$peoplePayload<ExtArgs>
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs> | null
      teams: Prisma.$teamsPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      pickid: number
      uid: number
      season: number
      week: number
      gid: number
      winner: number | null
      loser: number | null
      score: number | null
      ts: Date
      correct: number | null
      done: number | null
      is_random: boolean | null
      member_id: number | null
    }, ExtArgs["result"]["picks"]>
    composites: {}
  }

  type picksGetPayload<S extends boolean | null | undefined | picksDefaultArgs> = $Result.GetResult<Prisma.$picksPayload, S>

  type picksCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<picksFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: PicksCountAggregateInputType | true
    }

  export interface picksDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['picks'], meta: { name: 'picks' } }
    /**
     * Find zero or one Picks that matches the filter.
     * @param {picksFindUniqueArgs} args - Arguments to find a Picks
     * @example
     * // Get one Picks
     * const picks = await prisma.picks.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends picksFindUniqueArgs>(args: SelectSubset<T, picksFindUniqueArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Picks that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {picksFindUniqueOrThrowArgs} args - Arguments to find a Picks
     * @example
     * // Get one Picks
     * const picks = await prisma.picks.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends picksFindUniqueOrThrowArgs>(args: SelectSubset<T, picksFindUniqueOrThrowArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Picks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {picksFindFirstArgs} args - Arguments to find a Picks
     * @example
     * // Get one Picks
     * const picks = await prisma.picks.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends picksFindFirstArgs>(args?: SelectSubset<T, picksFindFirstArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Picks that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {picksFindFirstOrThrowArgs} args - Arguments to find a Picks
     * @example
     * // Get one Picks
     * const picks = await prisma.picks.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends picksFindFirstOrThrowArgs>(args?: SelectSubset<T, picksFindFirstOrThrowArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Picks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {picksFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Picks
     * const picks = await prisma.picks.findMany()
     * 
     * // Get first 10 Picks
     * const picks = await prisma.picks.findMany({ take: 10 })
     * 
     * // Only select the `pickid`
     * const picksWithPickidOnly = await prisma.picks.findMany({ select: { pickid: true } })
     * 
     */
    findMany<T extends picksFindManyArgs>(args?: SelectSubset<T, picksFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Picks.
     * @param {picksCreateArgs} args - Arguments to create a Picks.
     * @example
     * // Create one Picks
     * const Picks = await prisma.picks.create({
     *   data: {
     *     // ... data to create a Picks
     *   }
     * })
     * 
     */
    create<T extends picksCreateArgs>(args: SelectSubset<T, picksCreateArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Picks.
     * @param {picksCreateManyArgs} args - Arguments to create many Picks.
     * @example
     * // Create many Picks
     * const picks = await prisma.picks.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends picksCreateManyArgs>(args?: SelectSubset<T, picksCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Picks and returns the data saved in the database.
     * @param {picksCreateManyAndReturnArgs} args - Arguments to create many Picks.
     * @example
     * // Create many Picks
     * const picks = await prisma.picks.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Picks and only return the `pickid`
     * const picksWithPickidOnly = await prisma.picks.createManyAndReturn({ 
     *   select: { pickid: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends picksCreateManyAndReturnArgs>(args?: SelectSubset<T, picksCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Picks.
     * @param {picksDeleteArgs} args - Arguments to delete one Picks.
     * @example
     * // Delete one Picks
     * const Picks = await prisma.picks.delete({
     *   where: {
     *     // ... filter to delete one Picks
     *   }
     * })
     * 
     */
    delete<T extends picksDeleteArgs>(args: SelectSubset<T, picksDeleteArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Picks.
     * @param {picksUpdateArgs} args - Arguments to update one Picks.
     * @example
     * // Update one Picks
     * const picks = await prisma.picks.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends picksUpdateArgs>(args: SelectSubset<T, picksUpdateArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Picks.
     * @param {picksDeleteManyArgs} args - Arguments to filter Picks to delete.
     * @example
     * // Delete a few Picks
     * const { count } = await prisma.picks.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends picksDeleteManyArgs>(args?: SelectSubset<T, picksDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Picks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {picksUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Picks
     * const picks = await prisma.picks.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends picksUpdateManyArgs>(args: SelectSubset<T, picksUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Picks.
     * @param {picksUpsertArgs} args - Arguments to update or create a Picks.
     * @example
     * // Update or create a Picks
     * const picks = await prisma.picks.upsert({
     *   create: {
     *     // ... data to create a Picks
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Picks we want to update
     *   }
     * })
     */
    upsert<T extends picksUpsertArgs>(args: SelectSubset<T, picksUpsertArgs<ExtArgs>>): Prisma__picksClient<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Picks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {picksCountArgs} args - Arguments to filter Picks to count.
     * @example
     * // Count the number of Picks
     * const count = await prisma.picks.count({
     *   where: {
     *     // ... the filter for the Picks we want to count
     *   }
     * })
    **/
    count<T extends picksCountArgs>(
      args?: Subset<T, picksCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PicksCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Picks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PicksAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PicksAggregateArgs>(args: Subset<T, PicksAggregateArgs>): Prisma.PrismaPromise<GetPicksAggregateType<T>>

    /**
     * Group by Picks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {picksGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends picksGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: picksGroupByArgs['orderBy'] }
        : { orderBy?: picksGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, picksGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPicksGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the picks model
   */
  readonly fields: picksFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for picks.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__picksClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    games<T extends gamesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, gamesDefaultArgs<ExtArgs>>): Prisma__gamesClient<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    people<T extends peopleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, peopleDefaultArgs<ExtArgs>>): Prisma__peopleClient<$Result.GetResult<Prisma.$peoplePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leaguemembers<T extends picks$leaguemembersArgs<ExtArgs> = {}>(args?: Subset<T, picks$leaguemembersArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    teams<T extends picks$teamsArgs<ExtArgs> = {}>(args?: Subset<T, picks$teamsArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the picks model
   */ 
  interface picksFieldRefs {
    readonly pickid: FieldRef<"picks", 'Int'>
    readonly uid: FieldRef<"picks", 'Int'>
    readonly season: FieldRef<"picks", 'Int'>
    readonly week: FieldRef<"picks", 'Int'>
    readonly gid: FieldRef<"picks", 'Int'>
    readonly winner: FieldRef<"picks", 'Int'>
    readonly loser: FieldRef<"picks", 'Int'>
    readonly score: FieldRef<"picks", 'Int'>
    readonly ts: FieldRef<"picks", 'DateTime'>
    readonly correct: FieldRef<"picks", 'Int'>
    readonly done: FieldRef<"picks", 'Int'>
    readonly is_random: FieldRef<"picks", 'Boolean'>
    readonly member_id: FieldRef<"picks", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * picks findUnique
   */
  export type picksFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * Filter, which picks to fetch.
     */
    where: picksWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks findUniqueOrThrow
   */
  export type picksFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * Filter, which picks to fetch.
     */
    where: picksWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks findFirst
   */
  export type picksFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * Filter, which picks to fetch.
     */
    where?: picksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of picks to fetch.
     */
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for picks.
     */
    cursor?: picksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` picks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` picks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of picks.
     */
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks findFirstOrThrow
   */
  export type picksFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * Filter, which picks to fetch.
     */
    where?: picksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of picks to fetch.
     */
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for picks.
     */
    cursor?: picksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` picks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` picks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of picks.
     */
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks findMany
   */
  export type picksFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * Filter, which picks to fetch.
     */
    where?: picksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of picks to fetch.
     */
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing picks.
     */
    cursor?: picksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` picks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` picks.
     */
    skip?: number
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks create
   */
  export type picksCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * The data needed to create a picks.
     */
    data: XOR<picksCreateInput, picksUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks createMany
   */
  export type picksCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many picks.
     */
    data: picksCreateManyInput | picksCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * picks createManyAndReturn
   */
  export type picksCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many picks.
     */
    data: picksCreateManyInput | picksCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * picks update
   */
  export type picksUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * The data needed to update a picks.
     */
    data: XOR<picksUpdateInput, picksUncheckedUpdateInput>
    /**
     * Choose, which picks to update.
     */
    where: picksWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks updateMany
   */
  export type picksUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update picks.
     */
    data: XOR<picksUpdateManyMutationInput, picksUncheckedUpdateManyInput>
    /**
     * Filter which picks to update
     */
    where?: picksWhereInput
  }

  /**
   * picks upsert
   */
  export type picksUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * The filter to search for the picks to update in case it exists.
     */
    where: picksWhereUniqueInput
    /**
     * In case the picks found by the `where` argument doesn't exist, create a new picks with this data.
     */
    create: XOR<picksCreateInput, picksUncheckedCreateInput>
    /**
     * In case the picks was found with the provided `where` argument, update it with this data.
     */
    update: XOR<picksUpdateInput, picksUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks delete
   */
  export type picksDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    /**
     * Filter which picks to delete.
     */
    where: picksWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * picks deleteMany
   */
  export type picksDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which picks to delete
     */
    where?: picksWhereInput
  }

  /**
   * picks.leaguemembers
   */
  export type picks$leaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    where?: leaguemembersWhereInput
  }

  /**
   * picks.teams
   */
  export type picks$teamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    where?: teamsWhereInput
  }

  /**
   * picks without action
   */
  export type picksDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
  }


  /**
   * Model superbowl
   */

  export type AggregateSuperbowl = {
    _count: SuperbowlCountAggregateOutputType | null
    _avg: SuperbowlAvgAggregateOutputType | null
    _sum: SuperbowlSumAggregateOutputType | null
    _min: SuperbowlMinAggregateOutputType | null
    _max: SuperbowlMaxAggregateOutputType | null
  }

  export type SuperbowlAvgAggregateOutputType = {
    pickid: number | null
    uid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    season: number | null
    member_id: number | null
  }

  export type SuperbowlSumAggregateOutputType = {
    pickid: number | null
    uid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    season: number | null
    member_id: number | null
  }

  export type SuperbowlMinAggregateOutputType = {
    pickid: number | null
    uid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    ts: Date | null
    season: number | null
    member_id: number | null
  }

  export type SuperbowlMaxAggregateOutputType = {
    pickid: number | null
    uid: number | null
    winner: number | null
    loser: number | null
    score: number | null
    ts: Date | null
    season: number | null
    member_id: number | null
  }

  export type SuperbowlCountAggregateOutputType = {
    pickid: number
    uid: number
    winner: number
    loser: number
    score: number
    ts: number
    season: number
    member_id: number
    _all: number
  }


  export type SuperbowlAvgAggregateInputType = {
    pickid?: true
    uid?: true
    winner?: true
    loser?: true
    score?: true
    season?: true
    member_id?: true
  }

  export type SuperbowlSumAggregateInputType = {
    pickid?: true
    uid?: true
    winner?: true
    loser?: true
    score?: true
    season?: true
    member_id?: true
  }

  export type SuperbowlMinAggregateInputType = {
    pickid?: true
    uid?: true
    winner?: true
    loser?: true
    score?: true
    ts?: true
    season?: true
    member_id?: true
  }

  export type SuperbowlMaxAggregateInputType = {
    pickid?: true
    uid?: true
    winner?: true
    loser?: true
    score?: true
    ts?: true
    season?: true
    member_id?: true
  }

  export type SuperbowlCountAggregateInputType = {
    pickid?: true
    uid?: true
    winner?: true
    loser?: true
    score?: true
    ts?: true
    season?: true
    member_id?: true
    _all?: true
  }

  export type SuperbowlAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which superbowl to aggregate.
     */
    where?: superbowlWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowls to fetch.
     */
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: superbowlWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned superbowls
    **/
    _count?: true | SuperbowlCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SuperbowlAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SuperbowlSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperbowlMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperbowlMaxAggregateInputType
  }

  export type GetSuperbowlAggregateType<T extends SuperbowlAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperbowl]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperbowl[P]>
      : GetScalarType<T[P], AggregateSuperbowl[P]>
  }




  export type superbowlGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: superbowlWhereInput
    orderBy?: superbowlOrderByWithAggregationInput | superbowlOrderByWithAggregationInput[]
    by: SuperbowlScalarFieldEnum[] | SuperbowlScalarFieldEnum
    having?: superbowlScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperbowlCountAggregateInputType | true
    _avg?: SuperbowlAvgAggregateInputType
    _sum?: SuperbowlSumAggregateInputType
    _min?: SuperbowlMinAggregateInputType
    _max?: SuperbowlMaxAggregateInputType
  }

  export type SuperbowlGroupByOutputType = {
    pickid: number
    uid: number
    winner: number
    loser: number
    score: number
    ts: Date | null
    season: number | null
    member_id: number | null
    _count: SuperbowlCountAggregateOutputType | null
    _avg: SuperbowlAvgAggregateOutputType | null
    _sum: SuperbowlSumAggregateOutputType | null
    _min: SuperbowlMinAggregateOutputType | null
    _max: SuperbowlMaxAggregateOutputType | null
  }

  type GetSuperbowlGroupByPayload<T extends superbowlGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperbowlGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperbowlGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperbowlGroupByOutputType[P]>
            : GetScalarType<T[P], SuperbowlGroupByOutputType[P]>
        }
      >
    >


  export type superbowlSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    pickid?: boolean
    uid?: boolean
    winner?: boolean
    loser?: boolean
    score?: boolean
    ts?: boolean
    season?: boolean
    member_id?: boolean
    teams_superbowl_loserToteams?: boolean | teamsDefaultArgs<ExtArgs>
    leaguemembers?: boolean | superbowl$leaguemembersArgs<ExtArgs>
    teams_superbowl_winnerToteams?: boolean | teamsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["superbowl"]>

  export type superbowlSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    pickid?: boolean
    uid?: boolean
    winner?: boolean
    loser?: boolean
    score?: boolean
    ts?: boolean
    season?: boolean
    member_id?: boolean
    teams_superbowl_loserToteams?: boolean | teamsDefaultArgs<ExtArgs>
    leaguemembers?: boolean | superbowl$leaguemembersArgs<ExtArgs>
    teams_superbowl_winnerToteams?: boolean | teamsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["superbowl"]>

  export type superbowlSelectScalar = {
    pickid?: boolean
    uid?: boolean
    winner?: boolean
    loser?: boolean
    score?: boolean
    ts?: boolean
    season?: boolean
    member_id?: boolean
  }

  export type superbowlInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teams_superbowl_loserToteams?: boolean | teamsDefaultArgs<ExtArgs>
    leaguemembers?: boolean | superbowl$leaguemembersArgs<ExtArgs>
    teams_superbowl_winnerToteams?: boolean | teamsDefaultArgs<ExtArgs>
  }
  export type superbowlIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teams_superbowl_loserToteams?: boolean | teamsDefaultArgs<ExtArgs>
    leaguemembers?: boolean | superbowl$leaguemembersArgs<ExtArgs>
    teams_superbowl_winnerToteams?: boolean | teamsDefaultArgs<ExtArgs>
  }

  export type $superbowlPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "superbowl"
    objects: {
      teams_superbowl_loserToteams: Prisma.$teamsPayload<ExtArgs>
      leaguemembers: Prisma.$leaguemembersPayload<ExtArgs> | null
      teams_superbowl_winnerToteams: Prisma.$teamsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      pickid: number
      uid: number
      winner: number
      loser: number
      score: number
      ts: Date | null
      season: number | null
      member_id: number | null
    }, ExtArgs["result"]["superbowl"]>
    composites: {}
  }

  type superbowlGetPayload<S extends boolean | null | undefined | superbowlDefaultArgs> = $Result.GetResult<Prisma.$superbowlPayload, S>

  type superbowlCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<superbowlFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: SuperbowlCountAggregateInputType | true
    }

  export interface superbowlDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['superbowl'], meta: { name: 'superbowl' } }
    /**
     * Find zero or one Superbowl that matches the filter.
     * @param {superbowlFindUniqueArgs} args - Arguments to find a Superbowl
     * @example
     * // Get one Superbowl
     * const superbowl = await prisma.superbowl.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends superbowlFindUniqueArgs>(args: SelectSubset<T, superbowlFindUniqueArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Superbowl that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {superbowlFindUniqueOrThrowArgs} args - Arguments to find a Superbowl
     * @example
     * // Get one Superbowl
     * const superbowl = await prisma.superbowl.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends superbowlFindUniqueOrThrowArgs>(args: SelectSubset<T, superbowlFindUniqueOrThrowArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Superbowl that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlFindFirstArgs} args - Arguments to find a Superbowl
     * @example
     * // Get one Superbowl
     * const superbowl = await prisma.superbowl.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends superbowlFindFirstArgs>(args?: SelectSubset<T, superbowlFindFirstArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Superbowl that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlFindFirstOrThrowArgs} args - Arguments to find a Superbowl
     * @example
     * // Get one Superbowl
     * const superbowl = await prisma.superbowl.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends superbowlFindFirstOrThrowArgs>(args?: SelectSubset<T, superbowlFindFirstOrThrowArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Superbowls that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Superbowls
     * const superbowls = await prisma.superbowl.findMany()
     * 
     * // Get first 10 Superbowls
     * const superbowls = await prisma.superbowl.findMany({ take: 10 })
     * 
     * // Only select the `pickid`
     * const superbowlWithPickidOnly = await prisma.superbowl.findMany({ select: { pickid: true } })
     * 
     */
    findMany<T extends superbowlFindManyArgs>(args?: SelectSubset<T, superbowlFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Superbowl.
     * @param {superbowlCreateArgs} args - Arguments to create a Superbowl.
     * @example
     * // Create one Superbowl
     * const Superbowl = await prisma.superbowl.create({
     *   data: {
     *     // ... data to create a Superbowl
     *   }
     * })
     * 
     */
    create<T extends superbowlCreateArgs>(args: SelectSubset<T, superbowlCreateArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Superbowls.
     * @param {superbowlCreateManyArgs} args - Arguments to create many Superbowls.
     * @example
     * // Create many Superbowls
     * const superbowl = await prisma.superbowl.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends superbowlCreateManyArgs>(args?: SelectSubset<T, superbowlCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Superbowls and returns the data saved in the database.
     * @param {superbowlCreateManyAndReturnArgs} args - Arguments to create many Superbowls.
     * @example
     * // Create many Superbowls
     * const superbowl = await prisma.superbowl.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Superbowls and only return the `pickid`
     * const superbowlWithPickidOnly = await prisma.superbowl.createManyAndReturn({ 
     *   select: { pickid: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends superbowlCreateManyAndReturnArgs>(args?: SelectSubset<T, superbowlCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Superbowl.
     * @param {superbowlDeleteArgs} args - Arguments to delete one Superbowl.
     * @example
     * // Delete one Superbowl
     * const Superbowl = await prisma.superbowl.delete({
     *   where: {
     *     // ... filter to delete one Superbowl
     *   }
     * })
     * 
     */
    delete<T extends superbowlDeleteArgs>(args: SelectSubset<T, superbowlDeleteArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Superbowl.
     * @param {superbowlUpdateArgs} args - Arguments to update one Superbowl.
     * @example
     * // Update one Superbowl
     * const superbowl = await prisma.superbowl.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends superbowlUpdateArgs>(args: SelectSubset<T, superbowlUpdateArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Superbowls.
     * @param {superbowlDeleteManyArgs} args - Arguments to filter Superbowls to delete.
     * @example
     * // Delete a few Superbowls
     * const { count } = await prisma.superbowl.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends superbowlDeleteManyArgs>(args?: SelectSubset<T, superbowlDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Superbowls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Superbowls
     * const superbowl = await prisma.superbowl.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends superbowlUpdateManyArgs>(args: SelectSubset<T, superbowlUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Superbowl.
     * @param {superbowlUpsertArgs} args - Arguments to update or create a Superbowl.
     * @example
     * // Update or create a Superbowl
     * const superbowl = await prisma.superbowl.upsert({
     *   create: {
     *     // ... data to create a Superbowl
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Superbowl we want to update
     *   }
     * })
     */
    upsert<T extends superbowlUpsertArgs>(args: SelectSubset<T, superbowlUpsertArgs<ExtArgs>>): Prisma__superbowlClient<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Superbowls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlCountArgs} args - Arguments to filter Superbowls to count.
     * @example
     * // Count the number of Superbowls
     * const count = await prisma.superbowl.count({
     *   where: {
     *     // ... the filter for the Superbowls we want to count
     *   }
     * })
    **/
    count<T extends superbowlCountArgs>(
      args?: Subset<T, superbowlCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperbowlCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Superbowl.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperbowlAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SuperbowlAggregateArgs>(args: Subset<T, SuperbowlAggregateArgs>): Prisma.PrismaPromise<GetSuperbowlAggregateType<T>>

    /**
     * Group by Superbowl.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends superbowlGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: superbowlGroupByArgs['orderBy'] }
        : { orderBy?: superbowlGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, superbowlGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperbowlGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the superbowl model
   */
  readonly fields: superbowlFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for superbowl.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__superbowlClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    teams_superbowl_loserToteams<T extends teamsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, teamsDefaultArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    leaguemembers<T extends superbowl$leaguemembersArgs<ExtArgs> = {}>(args?: Subset<T, superbowl$leaguemembersArgs<ExtArgs>>): Prisma__leaguemembersClient<$Result.GetResult<Prisma.$leaguemembersPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    teams_superbowl_winnerToteams<T extends teamsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, teamsDefaultArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the superbowl model
   */ 
  interface superbowlFieldRefs {
    readonly pickid: FieldRef<"superbowl", 'Int'>
    readonly uid: FieldRef<"superbowl", 'Int'>
    readonly winner: FieldRef<"superbowl", 'Int'>
    readonly loser: FieldRef<"superbowl", 'Int'>
    readonly score: FieldRef<"superbowl", 'Int'>
    readonly ts: FieldRef<"superbowl", 'DateTime'>
    readonly season: FieldRef<"superbowl", 'Int'>
    readonly member_id: FieldRef<"superbowl", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * superbowl findUnique
   */
  export type superbowlFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * Filter, which superbowl to fetch.
     */
    where: superbowlWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl findUniqueOrThrow
   */
  export type superbowlFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * Filter, which superbowl to fetch.
     */
    where: superbowlWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl findFirst
   */
  export type superbowlFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * Filter, which superbowl to fetch.
     */
    where?: superbowlWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowls to fetch.
     */
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for superbowls.
     */
    cursor?: superbowlWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of superbowls.
     */
    distinct?: SuperbowlScalarFieldEnum | SuperbowlScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl findFirstOrThrow
   */
  export type superbowlFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * Filter, which superbowl to fetch.
     */
    where?: superbowlWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowls to fetch.
     */
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for superbowls.
     */
    cursor?: superbowlWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of superbowls.
     */
    distinct?: SuperbowlScalarFieldEnum | SuperbowlScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl findMany
   */
  export type superbowlFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * Filter, which superbowls to fetch.
     */
    where?: superbowlWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowls to fetch.
     */
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing superbowls.
     */
    cursor?: superbowlWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowls.
     */
    skip?: number
    distinct?: SuperbowlScalarFieldEnum | SuperbowlScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl create
   */
  export type superbowlCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * The data needed to create a superbowl.
     */
    data: XOR<superbowlCreateInput, superbowlUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl createMany
   */
  export type superbowlCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many superbowls.
     */
    data: superbowlCreateManyInput | superbowlCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * superbowl createManyAndReturn
   */
  export type superbowlCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many superbowls.
     */
    data: superbowlCreateManyInput | superbowlCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * superbowl update
   */
  export type superbowlUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * The data needed to update a superbowl.
     */
    data: XOR<superbowlUpdateInput, superbowlUncheckedUpdateInput>
    /**
     * Choose, which superbowl to update.
     */
    where: superbowlWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl updateMany
   */
  export type superbowlUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update superbowls.
     */
    data: XOR<superbowlUpdateManyMutationInput, superbowlUncheckedUpdateManyInput>
    /**
     * Filter which superbowls to update
     */
    where?: superbowlWhereInput
  }

  /**
   * superbowl upsert
   */
  export type superbowlUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * The filter to search for the superbowl to update in case it exists.
     */
    where: superbowlWhereUniqueInput
    /**
     * In case the superbowl found by the `where` argument doesn't exist, create a new superbowl with this data.
     */
    create: XOR<superbowlCreateInput, superbowlUncheckedCreateInput>
    /**
     * In case the superbowl was found with the provided `where` argument, update it with this data.
     */
    update: XOR<superbowlUpdateInput, superbowlUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl delete
   */
  export type superbowlDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    /**
     * Filter which superbowl to delete.
     */
    where: superbowlWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowl deleteMany
   */
  export type superbowlDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which superbowls to delete
     */
    where?: superbowlWhereInput
  }

  /**
   * superbowl.leaguemembers
   */
  export type superbowl$leaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the leaguemembers
     */
    select?: leaguemembersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: leaguemembersInclude<ExtArgs> | null
    where?: leaguemembersWhereInput
  }

  /**
   * superbowl without action
   */
  export type superbowlDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
  }


  /**
   * Model superbowlsquares
   */

  export type AggregateSuperbowlsquares = {
    _count: SuperbowlsquaresCountAggregateOutputType | null
    _avg: SuperbowlsquaresAvgAggregateOutputType | null
    _sum: SuperbowlsquaresSumAggregateOutputType | null
    _min: SuperbowlsquaresMinAggregateOutputType | null
    _max: SuperbowlsquaresMaxAggregateOutputType | null
  }

  export type SuperbowlsquaresAvgAggregateOutputType = {
    square_id: number | null
    uid: number | null
    league_id: number | null
    afc_score_index: number | null
    nfc_score_index: number | null
  }

  export type SuperbowlsquaresSumAggregateOutputType = {
    square_id: number | null
    uid: number | null
    league_id: number | null
    afc_score_index: number | null
    nfc_score_index: number | null
  }

  export type SuperbowlsquaresMinAggregateOutputType = {
    square_id: number | null
    uid: number | null
    league_id: number | null
    afc_score_index: number | null
    nfc_score_index: number | null
    correct: boolean | null
    ts: Date | null
  }

  export type SuperbowlsquaresMaxAggregateOutputType = {
    square_id: number | null
    uid: number | null
    league_id: number | null
    afc_score_index: number | null
    nfc_score_index: number | null
    correct: boolean | null
    ts: Date | null
  }

  export type SuperbowlsquaresCountAggregateOutputType = {
    square_id: number
    uid: number
    league_id: number
    afc_score_index: number
    nfc_score_index: number
    correct: number
    ts: number
    _all: number
  }


  export type SuperbowlsquaresAvgAggregateInputType = {
    square_id?: true
    uid?: true
    league_id?: true
    afc_score_index?: true
    nfc_score_index?: true
  }

  export type SuperbowlsquaresSumAggregateInputType = {
    square_id?: true
    uid?: true
    league_id?: true
    afc_score_index?: true
    nfc_score_index?: true
  }

  export type SuperbowlsquaresMinAggregateInputType = {
    square_id?: true
    uid?: true
    league_id?: true
    afc_score_index?: true
    nfc_score_index?: true
    correct?: true
    ts?: true
  }

  export type SuperbowlsquaresMaxAggregateInputType = {
    square_id?: true
    uid?: true
    league_id?: true
    afc_score_index?: true
    nfc_score_index?: true
    correct?: true
    ts?: true
  }

  export type SuperbowlsquaresCountAggregateInputType = {
    square_id?: true
    uid?: true
    league_id?: true
    afc_score_index?: true
    nfc_score_index?: true
    correct?: true
    ts?: true
    _all?: true
  }

  export type SuperbowlsquaresAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which superbowlsquares to aggregate.
     */
    where?: superbowlsquaresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowlsquares to fetch.
     */
    orderBy?: superbowlsquaresOrderByWithRelationInput | superbowlsquaresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: superbowlsquaresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowlsquares from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowlsquares.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned superbowlsquares
    **/
    _count?: true | SuperbowlsquaresCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SuperbowlsquaresAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SuperbowlsquaresSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperbowlsquaresMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperbowlsquaresMaxAggregateInputType
  }

  export type GetSuperbowlsquaresAggregateType<T extends SuperbowlsquaresAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperbowlsquares]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperbowlsquares[P]>
      : GetScalarType<T[P], AggregateSuperbowlsquares[P]>
  }




  export type superbowlsquaresGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: superbowlsquaresWhereInput
    orderBy?: superbowlsquaresOrderByWithAggregationInput | superbowlsquaresOrderByWithAggregationInput[]
    by: SuperbowlsquaresScalarFieldEnum[] | SuperbowlsquaresScalarFieldEnum
    having?: superbowlsquaresScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperbowlsquaresCountAggregateInputType | true
    _avg?: SuperbowlsquaresAvgAggregateInputType
    _sum?: SuperbowlsquaresSumAggregateInputType
    _min?: SuperbowlsquaresMinAggregateInputType
    _max?: SuperbowlsquaresMaxAggregateInputType
  }

  export type SuperbowlsquaresGroupByOutputType = {
    square_id: number
    uid: number
    league_id: number
    afc_score_index: number
    nfc_score_index: number
    correct: boolean
    ts: Date
    _count: SuperbowlsquaresCountAggregateOutputType | null
    _avg: SuperbowlsquaresAvgAggregateOutputType | null
    _sum: SuperbowlsquaresSumAggregateOutputType | null
    _min: SuperbowlsquaresMinAggregateOutputType | null
    _max: SuperbowlsquaresMaxAggregateOutputType | null
  }

  type GetSuperbowlsquaresGroupByPayload<T extends superbowlsquaresGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperbowlsquaresGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperbowlsquaresGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperbowlsquaresGroupByOutputType[P]>
            : GetScalarType<T[P], SuperbowlsquaresGroupByOutputType[P]>
        }
      >
    >


  export type superbowlsquaresSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    square_id?: boolean
    uid?: boolean
    league_id?: boolean
    afc_score_index?: boolean
    nfc_score_index?: boolean
    correct?: boolean
    ts?: boolean
  }, ExtArgs["result"]["superbowlsquares"]>

  export type superbowlsquaresSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    square_id?: boolean
    uid?: boolean
    league_id?: boolean
    afc_score_index?: boolean
    nfc_score_index?: boolean
    correct?: boolean
    ts?: boolean
  }, ExtArgs["result"]["superbowlsquares"]>

  export type superbowlsquaresSelectScalar = {
    square_id?: boolean
    uid?: boolean
    league_id?: boolean
    afc_score_index?: boolean
    nfc_score_index?: boolean
    correct?: boolean
    ts?: boolean
  }


  export type $superbowlsquaresPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "superbowlsquares"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      square_id: number
      uid: number
      league_id: number
      afc_score_index: number
      nfc_score_index: number
      correct: boolean
      ts: Date
    }, ExtArgs["result"]["superbowlsquares"]>
    composites: {}
  }

  type superbowlsquaresGetPayload<S extends boolean | null | undefined | superbowlsquaresDefaultArgs> = $Result.GetResult<Prisma.$superbowlsquaresPayload, S>

  type superbowlsquaresCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<superbowlsquaresFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: SuperbowlsquaresCountAggregateInputType | true
    }

  export interface superbowlsquaresDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['superbowlsquares'], meta: { name: 'superbowlsquares' } }
    /**
     * Find zero or one Superbowlsquares that matches the filter.
     * @param {superbowlsquaresFindUniqueArgs} args - Arguments to find a Superbowlsquares
     * @example
     * // Get one Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends superbowlsquaresFindUniqueArgs>(args: SelectSubset<T, superbowlsquaresFindUniqueArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Superbowlsquares that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {superbowlsquaresFindUniqueOrThrowArgs} args - Arguments to find a Superbowlsquares
     * @example
     * // Get one Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends superbowlsquaresFindUniqueOrThrowArgs>(args: SelectSubset<T, superbowlsquaresFindUniqueOrThrowArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Superbowlsquares that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlsquaresFindFirstArgs} args - Arguments to find a Superbowlsquares
     * @example
     * // Get one Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends superbowlsquaresFindFirstArgs>(args?: SelectSubset<T, superbowlsquaresFindFirstArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Superbowlsquares that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlsquaresFindFirstOrThrowArgs} args - Arguments to find a Superbowlsquares
     * @example
     * // Get one Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends superbowlsquaresFindFirstOrThrowArgs>(args?: SelectSubset<T, superbowlsquaresFindFirstOrThrowArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Superbowlsquares that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlsquaresFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.findMany()
     * 
     * // Get first 10 Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.findMany({ take: 10 })
     * 
     * // Only select the `square_id`
     * const superbowlsquaresWithSquare_idOnly = await prisma.superbowlsquares.findMany({ select: { square_id: true } })
     * 
     */
    findMany<T extends superbowlsquaresFindManyArgs>(args?: SelectSubset<T, superbowlsquaresFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Superbowlsquares.
     * @param {superbowlsquaresCreateArgs} args - Arguments to create a Superbowlsquares.
     * @example
     * // Create one Superbowlsquares
     * const Superbowlsquares = await prisma.superbowlsquares.create({
     *   data: {
     *     // ... data to create a Superbowlsquares
     *   }
     * })
     * 
     */
    create<T extends superbowlsquaresCreateArgs>(args: SelectSubset<T, superbowlsquaresCreateArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Superbowlsquares.
     * @param {superbowlsquaresCreateManyArgs} args - Arguments to create many Superbowlsquares.
     * @example
     * // Create many Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends superbowlsquaresCreateManyArgs>(args?: SelectSubset<T, superbowlsquaresCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Superbowlsquares and returns the data saved in the database.
     * @param {superbowlsquaresCreateManyAndReturnArgs} args - Arguments to create many Superbowlsquares.
     * @example
     * // Create many Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Superbowlsquares and only return the `square_id`
     * const superbowlsquaresWithSquare_idOnly = await prisma.superbowlsquares.createManyAndReturn({ 
     *   select: { square_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends superbowlsquaresCreateManyAndReturnArgs>(args?: SelectSubset<T, superbowlsquaresCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Superbowlsquares.
     * @param {superbowlsquaresDeleteArgs} args - Arguments to delete one Superbowlsquares.
     * @example
     * // Delete one Superbowlsquares
     * const Superbowlsquares = await prisma.superbowlsquares.delete({
     *   where: {
     *     // ... filter to delete one Superbowlsquares
     *   }
     * })
     * 
     */
    delete<T extends superbowlsquaresDeleteArgs>(args: SelectSubset<T, superbowlsquaresDeleteArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Superbowlsquares.
     * @param {superbowlsquaresUpdateArgs} args - Arguments to update one Superbowlsquares.
     * @example
     * // Update one Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends superbowlsquaresUpdateArgs>(args: SelectSubset<T, superbowlsquaresUpdateArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Superbowlsquares.
     * @param {superbowlsquaresDeleteManyArgs} args - Arguments to filter Superbowlsquares to delete.
     * @example
     * // Delete a few Superbowlsquares
     * const { count } = await prisma.superbowlsquares.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends superbowlsquaresDeleteManyArgs>(args?: SelectSubset<T, superbowlsquaresDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Superbowlsquares.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlsquaresUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends superbowlsquaresUpdateManyArgs>(args: SelectSubset<T, superbowlsquaresUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Superbowlsquares.
     * @param {superbowlsquaresUpsertArgs} args - Arguments to update or create a Superbowlsquares.
     * @example
     * // Update or create a Superbowlsquares
     * const superbowlsquares = await prisma.superbowlsquares.upsert({
     *   create: {
     *     // ... data to create a Superbowlsquares
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Superbowlsquares we want to update
     *   }
     * })
     */
    upsert<T extends superbowlsquaresUpsertArgs>(args: SelectSubset<T, superbowlsquaresUpsertArgs<ExtArgs>>): Prisma__superbowlsquaresClient<$Result.GetResult<Prisma.$superbowlsquaresPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Superbowlsquares.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlsquaresCountArgs} args - Arguments to filter Superbowlsquares to count.
     * @example
     * // Count the number of Superbowlsquares
     * const count = await prisma.superbowlsquares.count({
     *   where: {
     *     // ... the filter for the Superbowlsquares we want to count
     *   }
     * })
    **/
    count<T extends superbowlsquaresCountArgs>(
      args?: Subset<T, superbowlsquaresCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperbowlsquaresCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Superbowlsquares.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperbowlsquaresAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SuperbowlsquaresAggregateArgs>(args: Subset<T, SuperbowlsquaresAggregateArgs>): Prisma.PrismaPromise<GetSuperbowlsquaresAggregateType<T>>

    /**
     * Group by Superbowlsquares.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {superbowlsquaresGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends superbowlsquaresGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: superbowlsquaresGroupByArgs['orderBy'] }
        : { orderBy?: superbowlsquaresGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, superbowlsquaresGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperbowlsquaresGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the superbowlsquares model
   */
  readonly fields: superbowlsquaresFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for superbowlsquares.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__superbowlsquaresClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the superbowlsquares model
   */ 
  interface superbowlsquaresFieldRefs {
    readonly square_id: FieldRef<"superbowlsquares", 'Int'>
    readonly uid: FieldRef<"superbowlsquares", 'Int'>
    readonly league_id: FieldRef<"superbowlsquares", 'Int'>
    readonly afc_score_index: FieldRef<"superbowlsquares", 'Int'>
    readonly nfc_score_index: FieldRef<"superbowlsquares", 'Int'>
    readonly correct: FieldRef<"superbowlsquares", 'Boolean'>
    readonly ts: FieldRef<"superbowlsquares", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * superbowlsquares findUnique
   */
  export type superbowlsquaresFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * Filter, which superbowlsquares to fetch.
     */
    where: superbowlsquaresWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares findUniqueOrThrow
   */
  export type superbowlsquaresFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * Filter, which superbowlsquares to fetch.
     */
    where: superbowlsquaresWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares findFirst
   */
  export type superbowlsquaresFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * Filter, which superbowlsquares to fetch.
     */
    where?: superbowlsquaresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowlsquares to fetch.
     */
    orderBy?: superbowlsquaresOrderByWithRelationInput | superbowlsquaresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for superbowlsquares.
     */
    cursor?: superbowlsquaresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowlsquares from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowlsquares.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of superbowlsquares.
     */
    distinct?: SuperbowlsquaresScalarFieldEnum | SuperbowlsquaresScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares findFirstOrThrow
   */
  export type superbowlsquaresFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * Filter, which superbowlsquares to fetch.
     */
    where?: superbowlsquaresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowlsquares to fetch.
     */
    orderBy?: superbowlsquaresOrderByWithRelationInput | superbowlsquaresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for superbowlsquares.
     */
    cursor?: superbowlsquaresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowlsquares from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowlsquares.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of superbowlsquares.
     */
    distinct?: SuperbowlsquaresScalarFieldEnum | SuperbowlsquaresScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares findMany
   */
  export type superbowlsquaresFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * Filter, which superbowlsquares to fetch.
     */
    where?: superbowlsquaresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of superbowlsquares to fetch.
     */
    orderBy?: superbowlsquaresOrderByWithRelationInput | superbowlsquaresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing superbowlsquares.
     */
    cursor?: superbowlsquaresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` superbowlsquares from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` superbowlsquares.
     */
    skip?: number
    distinct?: SuperbowlsquaresScalarFieldEnum | SuperbowlsquaresScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares create
   */
  export type superbowlsquaresCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * The data needed to create a superbowlsquares.
     */
    data: XOR<superbowlsquaresCreateInput, superbowlsquaresUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares createMany
   */
  export type superbowlsquaresCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many superbowlsquares.
     */
    data: superbowlsquaresCreateManyInput | superbowlsquaresCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * superbowlsquares createManyAndReturn
   */
  export type superbowlsquaresCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many superbowlsquares.
     */
    data: superbowlsquaresCreateManyInput | superbowlsquaresCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * superbowlsquares update
   */
  export type superbowlsquaresUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * The data needed to update a superbowlsquares.
     */
    data: XOR<superbowlsquaresUpdateInput, superbowlsquaresUncheckedUpdateInput>
    /**
     * Choose, which superbowlsquares to update.
     */
    where: superbowlsquaresWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares updateMany
   */
  export type superbowlsquaresUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update superbowlsquares.
     */
    data: XOR<superbowlsquaresUpdateManyMutationInput, superbowlsquaresUncheckedUpdateManyInput>
    /**
     * Filter which superbowlsquares to update
     */
    where?: superbowlsquaresWhereInput
  }

  /**
   * superbowlsquares upsert
   */
  export type superbowlsquaresUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * The filter to search for the superbowlsquares to update in case it exists.
     */
    where: superbowlsquaresWhereUniqueInput
    /**
     * In case the superbowlsquares found by the `where` argument doesn't exist, create a new superbowlsquares with this data.
     */
    create: XOR<superbowlsquaresCreateInput, superbowlsquaresUncheckedCreateInput>
    /**
     * In case the superbowlsquares was found with the provided `where` argument, update it with this data.
     */
    update: XOR<superbowlsquaresUpdateInput, superbowlsquaresUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares delete
   */
  export type superbowlsquaresDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
    /**
     * Filter which superbowlsquares to delete.
     */
    where: superbowlsquaresWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * superbowlsquares deleteMany
   */
  export type superbowlsquaresDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which superbowlsquares to delete
     */
    where?: superbowlsquaresWhereInput
  }

  /**
   * superbowlsquares without action
   */
  export type superbowlsquaresDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowlsquares
     */
    select?: superbowlsquaresSelect<ExtArgs> | null
  }


  /**
   * Model teams
   */

  export type AggregateTeams = {
    _count: TeamsCountAggregateOutputType | null
    _avg: TeamsAvgAggregateOutputType | null
    _sum: TeamsSumAggregateOutputType | null
    _min: TeamsMinAggregateOutputType | null
    _max: TeamsMaxAggregateOutputType | null
  }

  export type TeamsAvgAggregateOutputType = {
    teamid: number | null
  }

  export type TeamsSumAggregateOutputType = {
    teamid: number | null
  }

  export type TeamsMinAggregateOutputType = {
    teamid: number | null
    abbrev: string | null
    loc: string | null
    name: string | null
    conference: string | null
    primary_color: string | null
    secondary_color: string | null
    tertiary_color: string | null
  }

  export type TeamsMaxAggregateOutputType = {
    teamid: number | null
    abbrev: string | null
    loc: string | null
    name: string | null
    conference: string | null
    primary_color: string | null
    secondary_color: string | null
    tertiary_color: string | null
  }

  export type TeamsCountAggregateOutputType = {
    teamid: number
    abbrev: number
    loc: number
    name: number
    conference: number
    primary_color: number
    secondary_color: number
    tertiary_color: number
    _all: number
  }


  export type TeamsAvgAggregateInputType = {
    teamid?: true
  }

  export type TeamsSumAggregateInputType = {
    teamid?: true
  }

  export type TeamsMinAggregateInputType = {
    teamid?: true
    abbrev?: true
    loc?: true
    name?: true
    conference?: true
    primary_color?: true
    secondary_color?: true
    tertiary_color?: true
  }

  export type TeamsMaxAggregateInputType = {
    teamid?: true
    abbrev?: true
    loc?: true
    name?: true
    conference?: true
    primary_color?: true
    secondary_color?: true
    tertiary_color?: true
  }

  export type TeamsCountAggregateInputType = {
    teamid?: true
    abbrev?: true
    loc?: true
    name?: true
    conference?: true
    primary_color?: true
    secondary_color?: true
    tertiary_color?: true
    _all?: true
  }

  export type TeamsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which teams to aggregate.
     */
    where?: teamsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teams to fetch.
     */
    orderBy?: teamsOrderByWithRelationInput | teamsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: teamsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned teams
    **/
    _count?: true | TeamsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TeamsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TeamsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamsMaxAggregateInputType
  }

  export type GetTeamsAggregateType<T extends TeamsAggregateArgs> = {
        [P in keyof T & keyof AggregateTeams]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeams[P]>
      : GetScalarType<T[P], AggregateTeams[P]>
  }




  export type teamsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teamsWhereInput
    orderBy?: teamsOrderByWithAggregationInput | teamsOrderByWithAggregationInput[]
    by: TeamsScalarFieldEnum[] | TeamsScalarFieldEnum
    having?: teamsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamsCountAggregateInputType | true
    _avg?: TeamsAvgAggregateInputType
    _sum?: TeamsSumAggregateInputType
    _min?: TeamsMinAggregateInputType
    _max?: TeamsMaxAggregateInputType
  }

  export type TeamsGroupByOutputType = {
    teamid: number
    abbrev: string | null
    loc: string
    name: string
    conference: string | null
    primary_color: string | null
    secondary_color: string | null
    tertiary_color: string | null
    _count: TeamsCountAggregateOutputType | null
    _avg: TeamsAvgAggregateOutputType | null
    _sum: TeamsSumAggregateOutputType | null
    _min: TeamsMinAggregateOutputType | null
    _max: TeamsMaxAggregateOutputType | null
  }

  type GetTeamsGroupByPayload<T extends teamsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamsGroupByOutputType[P]>
            : GetScalarType<T[P], TeamsGroupByOutputType[P]>
        }
      >
    >


  export type teamsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    teamid?: boolean
    abbrev?: boolean
    loc?: boolean
    name?: boolean
    conference?: boolean
    primary_color?: boolean
    secondary_color?: boolean
    tertiary_color?: boolean
    games_games_homeToteams?: boolean | teams$games_games_homeToteamsArgs<ExtArgs>
    games_games_awayToteams?: boolean | teams$games_games_awayToteamsArgs<ExtArgs>
    picks?: boolean | teams$picksArgs<ExtArgs>
    superbowl_superbowl_loserToteams?: boolean | teams$superbowl_superbowl_loserToteamsArgs<ExtArgs>
    superbowl_superbowl_winnerToteams?: boolean | teams$superbowl_superbowl_winnerToteamsArgs<ExtArgs>
    _count?: boolean | TeamsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teams"]>

  export type teamsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    teamid?: boolean
    abbrev?: boolean
    loc?: boolean
    name?: boolean
    conference?: boolean
    primary_color?: boolean
    secondary_color?: boolean
    tertiary_color?: boolean
  }, ExtArgs["result"]["teams"]>

  export type teamsSelectScalar = {
    teamid?: boolean
    abbrev?: boolean
    loc?: boolean
    name?: boolean
    conference?: boolean
    primary_color?: boolean
    secondary_color?: boolean
    tertiary_color?: boolean
  }

  export type teamsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    games_games_homeToteams?: boolean | teams$games_games_homeToteamsArgs<ExtArgs>
    games_games_awayToteams?: boolean | teams$games_games_awayToteamsArgs<ExtArgs>
    picks?: boolean | teams$picksArgs<ExtArgs>
    superbowl_superbowl_loserToteams?: boolean | teams$superbowl_superbowl_loserToteamsArgs<ExtArgs>
    superbowl_superbowl_winnerToteams?: boolean | teams$superbowl_superbowl_winnerToteamsArgs<ExtArgs>
    _count?: boolean | TeamsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type teamsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $teamsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "teams"
    objects: {
      games_games_homeToteams: Prisma.$gamesPayload<ExtArgs>[]
      games_games_awayToteams: Prisma.$gamesPayload<ExtArgs>[]
      picks: Prisma.$picksPayload<ExtArgs>[]
      superbowl_superbowl_loserToteams: Prisma.$superbowlPayload<ExtArgs>[]
      superbowl_superbowl_winnerToteams: Prisma.$superbowlPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      teamid: number
      abbrev: string | null
      loc: string
      name: string
      conference: string | null
      primary_color: string | null
      secondary_color: string | null
      tertiary_color: string | null
    }, ExtArgs["result"]["teams"]>
    composites: {}
  }

  type teamsGetPayload<S extends boolean | null | undefined | teamsDefaultArgs> = $Result.GetResult<Prisma.$teamsPayload, S>

  type teamsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<teamsFindManyArgs, 'select' | 'include' | 'distinct' | 'relationLoadStrategy'> & {
      select?: TeamsCountAggregateInputType | true
    }

  export interface teamsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['teams'], meta: { name: 'teams' } }
    /**
     * Find zero or one Teams that matches the filter.
     * @param {teamsFindUniqueArgs} args - Arguments to find a Teams
     * @example
     * // Get one Teams
     * const teams = await prisma.teams.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends teamsFindUniqueArgs>(args: SelectSubset<T, teamsFindUniqueArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Teams that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {teamsFindUniqueOrThrowArgs} args - Arguments to find a Teams
     * @example
     * // Get one Teams
     * const teams = await prisma.teams.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends teamsFindUniqueOrThrowArgs>(args: SelectSubset<T, teamsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Teams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teamsFindFirstArgs} args - Arguments to find a Teams
     * @example
     * // Get one Teams
     * const teams = await prisma.teams.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends teamsFindFirstArgs>(args?: SelectSubset<T, teamsFindFirstArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Teams that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teamsFindFirstOrThrowArgs} args - Arguments to find a Teams
     * @example
     * // Get one Teams
     * const teams = await prisma.teams.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends teamsFindFirstOrThrowArgs>(args?: SelectSubset<T, teamsFindFirstOrThrowArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Teams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teamsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teams
     * const teams = await prisma.teams.findMany()
     * 
     * // Get first 10 Teams
     * const teams = await prisma.teams.findMany({ take: 10 })
     * 
     * // Only select the `teamid`
     * const teamsWithTeamidOnly = await prisma.teams.findMany({ select: { teamid: true } })
     * 
     */
    findMany<T extends teamsFindManyArgs>(args?: SelectSubset<T, teamsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Teams.
     * @param {teamsCreateArgs} args - Arguments to create a Teams.
     * @example
     * // Create one Teams
     * const Teams = await prisma.teams.create({
     *   data: {
     *     // ... data to create a Teams
     *   }
     * })
     * 
     */
    create<T extends teamsCreateArgs>(args: SelectSubset<T, teamsCreateArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Teams.
     * @param {teamsCreateManyArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const teams = await prisma.teams.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends teamsCreateManyArgs>(args?: SelectSubset<T, teamsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Teams and returns the data saved in the database.
     * @param {teamsCreateManyAndReturnArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const teams = await prisma.teams.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Teams and only return the `teamid`
     * const teamsWithTeamidOnly = await prisma.teams.createManyAndReturn({ 
     *   select: { teamid: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends teamsCreateManyAndReturnArgs>(args?: SelectSubset<T, teamsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Teams.
     * @param {teamsDeleteArgs} args - Arguments to delete one Teams.
     * @example
     * // Delete one Teams
     * const Teams = await prisma.teams.delete({
     *   where: {
     *     // ... filter to delete one Teams
     *   }
     * })
     * 
     */
    delete<T extends teamsDeleteArgs>(args: SelectSubset<T, teamsDeleteArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Teams.
     * @param {teamsUpdateArgs} args - Arguments to update one Teams.
     * @example
     * // Update one Teams
     * const teams = await prisma.teams.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends teamsUpdateArgs>(args: SelectSubset<T, teamsUpdateArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Teams.
     * @param {teamsDeleteManyArgs} args - Arguments to filter Teams to delete.
     * @example
     * // Delete a few Teams
     * const { count } = await prisma.teams.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends teamsDeleteManyArgs>(args?: SelectSubset<T, teamsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teamsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teams
     * const teams = await prisma.teams.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends teamsUpdateManyArgs>(args: SelectSubset<T, teamsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Teams.
     * @param {teamsUpsertArgs} args - Arguments to update or create a Teams.
     * @example
     * // Update or create a Teams
     * const teams = await prisma.teams.upsert({
     *   create: {
     *     // ... data to create a Teams
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Teams we want to update
     *   }
     * })
     */
    upsert<T extends teamsUpsertArgs>(args: SelectSubset<T, teamsUpsertArgs<ExtArgs>>): Prisma__teamsClient<$Result.GetResult<Prisma.$teamsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teamsCountArgs} args - Arguments to filter Teams to count.
     * @example
     * // Count the number of Teams
     * const count = await prisma.teams.count({
     *   where: {
     *     // ... the filter for the Teams we want to count
     *   }
     * })
    **/
    count<T extends teamsCountArgs>(
      args?: Subset<T, teamsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeamsAggregateArgs>(args: Subset<T, TeamsAggregateArgs>): Prisma.PrismaPromise<GetTeamsAggregateType<T>>

    /**
     * Group by Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teamsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends teamsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: teamsGroupByArgs['orderBy'] }
        : { orderBy?: teamsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, teamsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the teams model
   */
  readonly fields: teamsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for teams.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__teamsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    games_games_homeToteams<T extends teams$games_games_homeToteamsArgs<ExtArgs> = {}>(args?: Subset<T, teams$games_games_homeToteamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findMany"> | Null>
    games_games_awayToteams<T extends teams$games_games_awayToteamsArgs<ExtArgs> = {}>(args?: Subset<T, teams$games_games_awayToteamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gamesPayload<ExtArgs>, T, "findMany"> | Null>
    picks<T extends teams$picksArgs<ExtArgs> = {}>(args?: Subset<T, teams$picksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$picksPayload<ExtArgs>, T, "findMany"> | Null>
    superbowl_superbowl_loserToteams<T extends teams$superbowl_superbowl_loserToteamsArgs<ExtArgs> = {}>(args?: Subset<T, teams$superbowl_superbowl_loserToteamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findMany"> | Null>
    superbowl_superbowl_winnerToteams<T extends teams$superbowl_superbowl_winnerToteamsArgs<ExtArgs> = {}>(args?: Subset<T, teams$superbowl_superbowl_winnerToteamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$superbowlPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the teams model
   */ 
  interface teamsFieldRefs {
    readonly teamid: FieldRef<"teams", 'Int'>
    readonly abbrev: FieldRef<"teams", 'String'>
    readonly loc: FieldRef<"teams", 'String'>
    readonly name: FieldRef<"teams", 'String'>
    readonly conference: FieldRef<"teams", 'String'>
    readonly primary_color: FieldRef<"teams", 'String'>
    readonly secondary_color: FieldRef<"teams", 'String'>
    readonly tertiary_color: FieldRef<"teams", 'String'>
  }
    

  // Custom InputTypes
  /**
   * teams findUnique
   */
  export type teamsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * Filter, which teams to fetch.
     */
    where: teamsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams findUniqueOrThrow
   */
  export type teamsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * Filter, which teams to fetch.
     */
    where: teamsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams findFirst
   */
  export type teamsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * Filter, which teams to fetch.
     */
    where?: teamsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teams to fetch.
     */
    orderBy?: teamsOrderByWithRelationInput | teamsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for teams.
     */
    cursor?: teamsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of teams.
     */
    distinct?: TeamsScalarFieldEnum | TeamsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams findFirstOrThrow
   */
  export type teamsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * Filter, which teams to fetch.
     */
    where?: teamsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teams to fetch.
     */
    orderBy?: teamsOrderByWithRelationInput | teamsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for teams.
     */
    cursor?: teamsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of teams.
     */
    distinct?: TeamsScalarFieldEnum | TeamsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams findMany
   */
  export type teamsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * Filter, which teams to fetch.
     */
    where?: teamsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teams to fetch.
     */
    orderBy?: teamsOrderByWithRelationInput | teamsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing teams.
     */
    cursor?: teamsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teams.
     */
    skip?: number
    distinct?: TeamsScalarFieldEnum | TeamsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams create
   */
  export type teamsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * The data needed to create a teams.
     */
    data: XOR<teamsCreateInput, teamsUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams createMany
   */
  export type teamsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many teams.
     */
    data: teamsCreateManyInput | teamsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * teams createManyAndReturn
   */
  export type teamsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many teams.
     */
    data: teamsCreateManyInput | teamsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * teams update
   */
  export type teamsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * The data needed to update a teams.
     */
    data: XOR<teamsUpdateInput, teamsUncheckedUpdateInput>
    /**
     * Choose, which teams to update.
     */
    where: teamsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams updateMany
   */
  export type teamsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update teams.
     */
    data: XOR<teamsUpdateManyMutationInput, teamsUncheckedUpdateManyInput>
    /**
     * Filter which teams to update
     */
    where?: teamsWhereInput
  }

  /**
   * teams upsert
   */
  export type teamsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * The filter to search for the teams to update in case it exists.
     */
    where: teamsWhereUniqueInput
    /**
     * In case the teams found by the `where` argument doesn't exist, create a new teams with this data.
     */
    create: XOR<teamsCreateInput, teamsUncheckedCreateInput>
    /**
     * In case the teams was found with the provided `where` argument, update it with this data.
     */
    update: XOR<teamsUpdateInput, teamsUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams delete
   */
  export type teamsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
    /**
     * Filter which teams to delete.
     */
    where: teamsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * teams deleteMany
   */
  export type teamsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which teams to delete
     */
    where?: teamsWhereInput
  }

  /**
   * teams.games_games_homeToteams
   */
  export type teams$games_games_homeToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    where?: gamesWhereInput
    orderBy?: gamesOrderByWithRelationInput | gamesOrderByWithRelationInput[]
    cursor?: gamesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GamesScalarFieldEnum | GamesScalarFieldEnum[]
  }

  /**
   * teams.games_games_awayToteams
   */
  export type teams$games_games_awayToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the games
     */
    select?: gamesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gamesInclude<ExtArgs> | null
    where?: gamesWhereInput
    orderBy?: gamesOrderByWithRelationInput | gamesOrderByWithRelationInput[]
    cursor?: gamesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GamesScalarFieldEnum | GamesScalarFieldEnum[]
  }

  /**
   * teams.picks
   */
  export type teams$picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the picks
     */
    select?: picksSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: picksInclude<ExtArgs> | null
    where?: picksWhereInput
    orderBy?: picksOrderByWithRelationInput | picksOrderByWithRelationInput[]
    cursor?: picksWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PicksScalarFieldEnum | PicksScalarFieldEnum[]
  }

  /**
   * teams.superbowl_superbowl_loserToteams
   */
  export type teams$superbowl_superbowl_loserToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    where?: superbowlWhereInput
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    cursor?: superbowlWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SuperbowlScalarFieldEnum | SuperbowlScalarFieldEnum[]
  }

  /**
   * teams.superbowl_superbowl_winnerToteams
   */
  export type teams$superbowl_superbowl_winnerToteamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the superbowl
     */
    select?: superbowlSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: superbowlInclude<ExtArgs> | null
    where?: superbowlWhereInput
    orderBy?: superbowlOrderByWithRelationInput | superbowlOrderByWithRelationInput[]
    cursor?: superbowlWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SuperbowlScalarFieldEnum | SuperbowlScalarFieldEnum[]
  }

  /**
   * teams without action
   */
  export type teamsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teams
     */
    select?: teamsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teamsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const EmailLogsScalarFieldEnum: {
    email_log_id: 'email_log_id',
    league_id: 'league_id',
    member_id: 'member_id',
    email_type: 'email_type',
    ts: 'ts',
    week: 'week',
    resend_id: 'resend_id'
  };

  export type EmailLogsScalarFieldEnum = (typeof EmailLogsScalarFieldEnum)[keyof typeof EmailLogsScalarFieldEnum]


  export const RelationLoadStrategy: {
    query: 'query',
    join: 'join'
  };

  export type RelationLoadStrategy = (typeof RelationLoadStrategy)[keyof typeof RelationLoadStrategy]


  export const WeekWinnersScalarFieldEnum: {
    id: 'id',
    league_id: 'league_id',
    membership_id: 'membership_id',
    week: 'week',
    correct_count: 'correct_count',
    score_diff: 'score_diff'
  };

  export type WeekWinnersScalarFieldEnum = (typeof WeekWinnersScalarFieldEnum)[keyof typeof WeekWinnersScalarFieldEnum]


  export const GamesScalarFieldEnum: {
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

  export type GamesScalarFieldEnum = (typeof GamesScalarFieldEnum)[keyof typeof GamesScalarFieldEnum]


  export const LeaguemembersScalarFieldEnum: {
    membership_id: 'membership_id',
    league_id: 'league_id',
    user_id: 'user_id',
    ts: 'ts',
    role: 'role',
    paid: 'paid'
  };

  export type LeaguemembersScalarFieldEnum = (typeof LeaguemembersScalarFieldEnum)[keyof typeof LeaguemembersScalarFieldEnum]


  export const LeaguemessagesScalarFieldEnum: {
    message_id: 'message_id',
    content: 'content',
    member_id: 'member_id',
    league_id: 'league_id',
    week: 'week',
    message_type: 'message_type',
    createdAt: 'createdAt',
    status: 'status'
  };

  export type LeaguemessagesScalarFieldEnum = (typeof LeaguemessagesScalarFieldEnum)[keyof typeof LeaguemessagesScalarFieldEnum]


  export const LeaguesScalarFieldEnum: {
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

  export type LeaguesScalarFieldEnum = (typeof LeaguesScalarFieldEnum)[keyof typeof LeaguesScalarFieldEnum]


  export const PeopleScalarFieldEnum: {
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

  export type PeopleScalarFieldEnum = (typeof PeopleScalarFieldEnum)[keyof typeof PeopleScalarFieldEnum]


  export const PicksScalarFieldEnum: {
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

  export type PicksScalarFieldEnum = (typeof PicksScalarFieldEnum)[keyof typeof PicksScalarFieldEnum]


  export const SuperbowlScalarFieldEnum: {
    pickid: 'pickid',
    uid: 'uid',
    winner: 'winner',
    loser: 'loser',
    score: 'score',
    ts: 'ts',
    season: 'season',
    member_id: 'member_id'
  };

  export type SuperbowlScalarFieldEnum = (typeof SuperbowlScalarFieldEnum)[keyof typeof SuperbowlScalarFieldEnum]


  export const SuperbowlsquaresScalarFieldEnum: {
    square_id: 'square_id',
    uid: 'uid',
    league_id: 'league_id',
    afc_score_index: 'afc_score_index',
    nfc_score_index: 'nfc_score_index',
    correct: 'correct',
    ts: 'ts'
  };

  export type SuperbowlsquaresScalarFieldEnum = (typeof SuperbowlsquaresScalarFieldEnum)[keyof typeof SuperbowlsquaresScalarFieldEnum]


  export const TeamsScalarFieldEnum: {
    teamid: 'teamid',
    abbrev: 'abbrev',
    loc: 'loc',
    name: 'name',
    conference: 'conference',
    primary_color: 'primary_color',
    secondary_color: 'secondary_color',
    tertiary_color: 'tertiary_color'
  };

  export type TeamsScalarFieldEnum = (typeof TeamsScalarFieldEnum)[keyof typeof TeamsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'EmailType'
   */
  export type EnumEmailTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EmailType'>
    


  /**
   * Reference to a field of type 'EmailType[]'
   */
  export type ListEnumEmailTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EmailType[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'MemberRole'
   */
  export type EnumMemberRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemberRole'>
    


  /**
   * Reference to a field of type 'MemberRole[]'
   */
  export type ListEnumMemberRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemberRole[]'>
    


  /**
   * Reference to a field of type 'MessageType'
   */
  export type EnumMessageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageType'>
    


  /**
   * Reference to a field of type 'MessageType[]'
   */
  export type ListEnumMessageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageType[]'>
    


  /**
   * Reference to a field of type 'MessageStatus'
   */
  export type EnumMessageStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageStatus'>
    


  /**
   * Reference to a field of type 'MessageStatus[]'
   */
  export type ListEnumMessageStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageStatus[]'>
    


  /**
   * Reference to a field of type 'LatePolicy'
   */
  export type EnumLatePolicyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LatePolicy'>
    


  /**
   * Reference to a field of type 'LatePolicy[]'
   */
  export type ListEnumLatePolicyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LatePolicy[]'>
    


  /**
   * Reference to a field of type 'PickPolicy'
   */
  export type EnumPickPolicyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PickPolicy'>
    


  /**
   * Reference to a field of type 'PickPolicy[]'
   */
  export type ListEnumPickPolicyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PickPolicy[]'>
    


  /**
   * Reference to a field of type 'ReminderPolicy'
   */
  export type EnumReminderPolicyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReminderPolicy'>
    


  /**
   * Reference to a field of type 'ReminderPolicy[]'
   */
  export type ListEnumReminderPolicyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReminderPolicy[]'>
    


  /**
   * Reference to a field of type 'ScoringType'
   */
  export type EnumScoringTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScoringType'>
    


  /**
   * Reference to a field of type 'ScoringType[]'
   */
  export type ListEnumScoringTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScoringType[]'>
    


  /**
   * Reference to a field of type 'LeagueStatus'
   */
  export type EnumLeagueStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeagueStatus'>
    


  /**
   * Reference to a field of type 'LeagueStatus[]'
   */
  export type ListEnumLeagueStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeagueStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type EmailLogsWhereInput = {
    AND?: EmailLogsWhereInput | EmailLogsWhereInput[]
    OR?: EmailLogsWhereInput[]
    NOT?: EmailLogsWhereInput | EmailLogsWhereInput[]
    email_log_id?: StringFilter<"EmailLogs"> | string
    league_id?: IntFilter<"EmailLogs"> | number
    member_id?: IntFilter<"EmailLogs"> | number
    email_type?: EnumEmailTypeFilter<"EmailLogs"> | $Enums.EmailType
    ts?: DateTimeFilter<"EmailLogs"> | Date | string
    week?: IntNullableFilter<"EmailLogs"> | number | null
    resend_id?: StringFilter<"EmailLogs"> | string
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemembers?: XOR<LeaguemembersRelationFilter, leaguemembersWhereInput>
  }

  export type EmailLogsOrderByWithRelationInput = {
    email_log_id?: SortOrder
    league_id?: SortOrder
    member_id?: SortOrder
    email_type?: SortOrder
    ts?: SortOrder
    week?: SortOrderInput | SortOrder
    resend_id?: SortOrder
    leagues?: leaguesOrderByWithRelationInput
    leaguemembers?: leaguemembersOrderByWithRelationInput
  }

  export type EmailLogsWhereUniqueInput = Prisma.AtLeast<{
    email_log_id?: string
    AND?: EmailLogsWhereInput | EmailLogsWhereInput[]
    OR?: EmailLogsWhereInput[]
    NOT?: EmailLogsWhereInput | EmailLogsWhereInput[]
    league_id?: IntFilter<"EmailLogs"> | number
    member_id?: IntFilter<"EmailLogs"> | number
    email_type?: EnumEmailTypeFilter<"EmailLogs"> | $Enums.EmailType
    ts?: DateTimeFilter<"EmailLogs"> | Date | string
    week?: IntNullableFilter<"EmailLogs"> | number | null
    resend_id?: StringFilter<"EmailLogs"> | string
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemembers?: XOR<LeaguemembersRelationFilter, leaguemembersWhereInput>
  }, "email_log_id">

  export type EmailLogsOrderByWithAggregationInput = {
    email_log_id?: SortOrder
    league_id?: SortOrder
    member_id?: SortOrder
    email_type?: SortOrder
    ts?: SortOrder
    week?: SortOrderInput | SortOrder
    resend_id?: SortOrder
    _count?: EmailLogsCountOrderByAggregateInput
    _avg?: EmailLogsAvgOrderByAggregateInput
    _max?: EmailLogsMaxOrderByAggregateInput
    _min?: EmailLogsMinOrderByAggregateInput
    _sum?: EmailLogsSumOrderByAggregateInput
  }

  export type EmailLogsScalarWhereWithAggregatesInput = {
    AND?: EmailLogsScalarWhereWithAggregatesInput | EmailLogsScalarWhereWithAggregatesInput[]
    OR?: EmailLogsScalarWhereWithAggregatesInput[]
    NOT?: EmailLogsScalarWhereWithAggregatesInput | EmailLogsScalarWhereWithAggregatesInput[]
    email_log_id?: StringWithAggregatesFilter<"EmailLogs"> | string
    league_id?: IntWithAggregatesFilter<"EmailLogs"> | number
    member_id?: IntWithAggregatesFilter<"EmailLogs"> | number
    email_type?: EnumEmailTypeWithAggregatesFilter<"EmailLogs"> | $Enums.EmailType
    ts?: DateTimeWithAggregatesFilter<"EmailLogs"> | Date | string
    week?: IntNullableWithAggregatesFilter<"EmailLogs"> | number | null
    resend_id?: StringWithAggregatesFilter<"EmailLogs"> | string
  }

  export type WeekWinnersWhereInput = {
    AND?: WeekWinnersWhereInput | WeekWinnersWhereInput[]
    OR?: WeekWinnersWhereInput[]
    NOT?: WeekWinnersWhereInput | WeekWinnersWhereInput[]
    id?: IntFilter<"WeekWinners"> | number
    league_id?: IntFilter<"WeekWinners"> | number
    membership_id?: IntFilter<"WeekWinners"> | number
    week?: IntFilter<"WeekWinners"> | number
    correct_count?: IntFilter<"WeekWinners"> | number
    score_diff?: IntFilter<"WeekWinners"> | number
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemembers?: XOR<LeaguemembersRelationFilter, leaguemembersWhereInput>
  }

  export type WeekWinnersOrderByWithRelationInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
    leagues?: leaguesOrderByWithRelationInput
    leaguemembers?: leaguemembersOrderByWithRelationInput
  }

  export type WeekWinnersWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: WeekWinnersWhereInput | WeekWinnersWhereInput[]
    OR?: WeekWinnersWhereInput[]
    NOT?: WeekWinnersWhereInput | WeekWinnersWhereInput[]
    league_id?: IntFilter<"WeekWinners"> | number
    membership_id?: IntFilter<"WeekWinners"> | number
    week?: IntFilter<"WeekWinners"> | number
    correct_count?: IntFilter<"WeekWinners"> | number
    score_diff?: IntFilter<"WeekWinners"> | number
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemembers?: XOR<LeaguemembersRelationFilter, leaguemembersWhereInput>
  }, "id">

  export type WeekWinnersOrderByWithAggregationInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
    _count?: WeekWinnersCountOrderByAggregateInput
    _avg?: WeekWinnersAvgOrderByAggregateInput
    _max?: WeekWinnersMaxOrderByAggregateInput
    _min?: WeekWinnersMinOrderByAggregateInput
    _sum?: WeekWinnersSumOrderByAggregateInput
  }

  export type WeekWinnersScalarWhereWithAggregatesInput = {
    AND?: WeekWinnersScalarWhereWithAggregatesInput | WeekWinnersScalarWhereWithAggregatesInput[]
    OR?: WeekWinnersScalarWhereWithAggregatesInput[]
    NOT?: WeekWinnersScalarWhereWithAggregatesInput | WeekWinnersScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"WeekWinners"> | number
    league_id?: IntWithAggregatesFilter<"WeekWinners"> | number
    membership_id?: IntWithAggregatesFilter<"WeekWinners"> | number
    week?: IntWithAggregatesFilter<"WeekWinners"> | number
    correct_count?: IntWithAggregatesFilter<"WeekWinners"> | number
    score_diff?: IntWithAggregatesFilter<"WeekWinners"> | number
  }

  export type gamesWhereInput = {
    AND?: gamesWhereInput | gamesWhereInput[]
    OR?: gamesWhereInput[]
    NOT?: gamesWhereInput | gamesWhereInput[]
    gid?: IntFilter<"games"> | number
    season?: IntFilter<"games"> | number
    week?: IntFilter<"games"> | number
    ts?: DateTimeFilter<"games"> | Date | string
    home?: IntFilter<"games"> | number
    away?: IntFilter<"games"> | number
    homescore?: IntNullableFilter<"games"> | number | null
    awayscore?: IntNullableFilter<"games"> | number | null
    done?: BoolNullableFilter<"games"> | boolean | null
    winner?: IntNullableFilter<"games"> | number | null
    international?: BoolNullableFilter<"games"> | boolean | null
    seconds?: IntNullableFilter<"games"> | number | null
    current_record?: StringNullableFilter<"games"> | string | null
    is_tiebreaker?: BoolNullableFilter<"games"> | boolean | null
    homerecord?: StringNullableFilter<"games"> | string | null
    awayrecord?: StringNullableFilter<"games"> | string | null
    msf_id?: IntNullableFilter<"games"> | number | null
    teams_games_homeToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
    teams_games_awayToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
    picks?: PicksListRelationFilter
  }

  export type gamesOrderByWithRelationInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    ts?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrderInput | SortOrder
    awayscore?: SortOrderInput | SortOrder
    done?: SortOrderInput | SortOrder
    winner?: SortOrderInput | SortOrder
    international?: SortOrderInput | SortOrder
    seconds?: SortOrderInput | SortOrder
    current_record?: SortOrderInput | SortOrder
    is_tiebreaker?: SortOrderInput | SortOrder
    homerecord?: SortOrderInput | SortOrder
    awayrecord?: SortOrderInput | SortOrder
    msf_id?: SortOrderInput | SortOrder
    teams_games_homeToteams?: teamsOrderByWithRelationInput
    teams_games_awayToteams?: teamsOrderByWithRelationInput
    picks?: picksOrderByRelationAggregateInput
  }

  export type gamesWhereUniqueInput = Prisma.AtLeast<{
    gid?: number
    AND?: gamesWhereInput | gamesWhereInput[]
    OR?: gamesWhereInput[]
    NOT?: gamesWhereInput | gamesWhereInput[]
    season?: IntFilter<"games"> | number
    week?: IntFilter<"games"> | number
    ts?: DateTimeFilter<"games"> | Date | string
    home?: IntFilter<"games"> | number
    away?: IntFilter<"games"> | number
    homescore?: IntNullableFilter<"games"> | number | null
    awayscore?: IntNullableFilter<"games"> | number | null
    done?: BoolNullableFilter<"games"> | boolean | null
    winner?: IntNullableFilter<"games"> | number | null
    international?: BoolNullableFilter<"games"> | boolean | null
    seconds?: IntNullableFilter<"games"> | number | null
    current_record?: StringNullableFilter<"games"> | string | null
    is_tiebreaker?: BoolNullableFilter<"games"> | boolean | null
    homerecord?: StringNullableFilter<"games"> | string | null
    awayrecord?: StringNullableFilter<"games"> | string | null
    msf_id?: IntNullableFilter<"games"> | number | null
    teams_games_homeToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
    teams_games_awayToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
    picks?: PicksListRelationFilter
  }, "gid">

  export type gamesOrderByWithAggregationInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    ts?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrderInput | SortOrder
    awayscore?: SortOrderInput | SortOrder
    done?: SortOrderInput | SortOrder
    winner?: SortOrderInput | SortOrder
    international?: SortOrderInput | SortOrder
    seconds?: SortOrderInput | SortOrder
    current_record?: SortOrderInput | SortOrder
    is_tiebreaker?: SortOrderInput | SortOrder
    homerecord?: SortOrderInput | SortOrder
    awayrecord?: SortOrderInput | SortOrder
    msf_id?: SortOrderInput | SortOrder
    _count?: gamesCountOrderByAggregateInput
    _avg?: gamesAvgOrderByAggregateInput
    _max?: gamesMaxOrderByAggregateInput
    _min?: gamesMinOrderByAggregateInput
    _sum?: gamesSumOrderByAggregateInput
  }

  export type gamesScalarWhereWithAggregatesInput = {
    AND?: gamesScalarWhereWithAggregatesInput | gamesScalarWhereWithAggregatesInput[]
    OR?: gamesScalarWhereWithAggregatesInput[]
    NOT?: gamesScalarWhereWithAggregatesInput | gamesScalarWhereWithAggregatesInput[]
    gid?: IntWithAggregatesFilter<"games"> | number
    season?: IntWithAggregatesFilter<"games"> | number
    week?: IntWithAggregatesFilter<"games"> | number
    ts?: DateTimeWithAggregatesFilter<"games"> | Date | string
    home?: IntWithAggregatesFilter<"games"> | number
    away?: IntWithAggregatesFilter<"games"> | number
    homescore?: IntNullableWithAggregatesFilter<"games"> | number | null
    awayscore?: IntNullableWithAggregatesFilter<"games"> | number | null
    done?: BoolNullableWithAggregatesFilter<"games"> | boolean | null
    winner?: IntNullableWithAggregatesFilter<"games"> | number | null
    international?: BoolNullableWithAggregatesFilter<"games"> | boolean | null
    seconds?: IntNullableWithAggregatesFilter<"games"> | number | null
    current_record?: StringNullableWithAggregatesFilter<"games"> | string | null
    is_tiebreaker?: BoolNullableWithAggregatesFilter<"games"> | boolean | null
    homerecord?: StringNullableWithAggregatesFilter<"games"> | string | null
    awayrecord?: StringNullableWithAggregatesFilter<"games"> | string | null
    msf_id?: IntNullableWithAggregatesFilter<"games"> | number | null
  }

  export type leaguemembersWhereInput = {
    AND?: leaguemembersWhereInput | leaguemembersWhereInput[]
    OR?: leaguemembersWhereInput[]
    NOT?: leaguemembersWhereInput | leaguemembersWhereInput[]
    membership_id?: IntFilter<"leaguemembers"> | number
    league_id?: IntFilter<"leaguemembers"> | number
    user_id?: IntFilter<"leaguemembers"> | number
    ts?: DateTimeFilter<"leaguemembers"> | Date | string
    role?: EnumMemberRoleNullableFilter<"leaguemembers"> | $Enums.MemberRole | null
    paid?: BoolNullableFilter<"leaguemembers"> | boolean | null
    EmailLogs?: EmailLogsListRelationFilter
    WeekWinners?: WeekWinnersListRelationFilter
    people?: XOR<PeopleRelationFilter, peopleWhereInput>
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemessages?: LeaguemessagesListRelationFilter
    picks?: PicksListRelationFilter
    superbowl?: SuperbowlListRelationFilter
  }

  export type leaguemembersOrderByWithRelationInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
    ts?: SortOrder
    role?: SortOrderInput | SortOrder
    paid?: SortOrderInput | SortOrder
    EmailLogs?: EmailLogsOrderByRelationAggregateInput
    WeekWinners?: WeekWinnersOrderByRelationAggregateInput
    people?: peopleOrderByWithRelationInput
    leagues?: leaguesOrderByWithRelationInput
    leaguemessages?: leaguemessagesOrderByRelationAggregateInput
    picks?: picksOrderByRelationAggregateInput
    superbowl?: superbowlOrderByRelationAggregateInput
  }

  export type leaguemembersWhereUniqueInput = Prisma.AtLeast<{
    membership_id?: number
    AND?: leaguemembersWhereInput | leaguemembersWhereInput[]
    OR?: leaguemembersWhereInput[]
    NOT?: leaguemembersWhereInput | leaguemembersWhereInput[]
    league_id?: IntFilter<"leaguemembers"> | number
    user_id?: IntFilter<"leaguemembers"> | number
    ts?: DateTimeFilter<"leaguemembers"> | Date | string
    role?: EnumMemberRoleNullableFilter<"leaguemembers"> | $Enums.MemberRole | null
    paid?: BoolNullableFilter<"leaguemembers"> | boolean | null
    EmailLogs?: EmailLogsListRelationFilter
    WeekWinners?: WeekWinnersListRelationFilter
    people?: XOR<PeopleRelationFilter, peopleWhereInput>
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemessages?: LeaguemessagesListRelationFilter
    picks?: PicksListRelationFilter
    superbowl?: SuperbowlListRelationFilter
  }, "membership_id">

  export type leaguemembersOrderByWithAggregationInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
    ts?: SortOrder
    role?: SortOrderInput | SortOrder
    paid?: SortOrderInput | SortOrder
    _count?: leaguemembersCountOrderByAggregateInput
    _avg?: leaguemembersAvgOrderByAggregateInput
    _max?: leaguemembersMaxOrderByAggregateInput
    _min?: leaguemembersMinOrderByAggregateInput
    _sum?: leaguemembersSumOrderByAggregateInput
  }

  export type leaguemembersScalarWhereWithAggregatesInput = {
    AND?: leaguemembersScalarWhereWithAggregatesInput | leaguemembersScalarWhereWithAggregatesInput[]
    OR?: leaguemembersScalarWhereWithAggregatesInput[]
    NOT?: leaguemembersScalarWhereWithAggregatesInput | leaguemembersScalarWhereWithAggregatesInput[]
    membership_id?: IntWithAggregatesFilter<"leaguemembers"> | number
    league_id?: IntWithAggregatesFilter<"leaguemembers"> | number
    user_id?: IntWithAggregatesFilter<"leaguemembers"> | number
    ts?: DateTimeWithAggregatesFilter<"leaguemembers"> | Date | string
    role?: EnumMemberRoleNullableWithAggregatesFilter<"leaguemembers"> | $Enums.MemberRole | null
    paid?: BoolNullableWithAggregatesFilter<"leaguemembers"> | boolean | null
  }

  export type leaguemessagesWhereInput = {
    AND?: leaguemessagesWhereInput | leaguemessagesWhereInput[]
    OR?: leaguemessagesWhereInput[]
    NOT?: leaguemessagesWhereInput | leaguemessagesWhereInput[]
    message_id?: StringFilter<"leaguemessages"> | string
    content?: StringFilter<"leaguemessages"> | string
    member_id?: IntFilter<"leaguemessages"> | number
    league_id?: IntFilter<"leaguemessages"> | number
    week?: IntNullableFilter<"leaguemessages"> | number | null
    message_type?: EnumMessageTypeFilter<"leaguemessages"> | $Enums.MessageType
    createdAt?: DateTimeFilter<"leaguemessages"> | Date | string
    status?: EnumMessageStatusFilter<"leaguemessages"> | $Enums.MessageStatus
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemembers?: XOR<LeaguemembersRelationFilter, leaguemembersWhereInput>
  }

  export type leaguemessagesOrderByWithRelationInput = {
    message_id?: SortOrder
    content?: SortOrder
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrderInput | SortOrder
    message_type?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    leagues?: leaguesOrderByWithRelationInput
    leaguemembers?: leaguemembersOrderByWithRelationInput
  }

  export type leaguemessagesWhereUniqueInput = Prisma.AtLeast<{
    message_id?: string
    AND?: leaguemessagesWhereInput | leaguemessagesWhereInput[]
    OR?: leaguemessagesWhereInput[]
    NOT?: leaguemessagesWhereInput | leaguemessagesWhereInput[]
    content?: StringFilter<"leaguemessages"> | string
    member_id?: IntFilter<"leaguemessages"> | number
    league_id?: IntFilter<"leaguemessages"> | number
    week?: IntNullableFilter<"leaguemessages"> | number | null
    message_type?: EnumMessageTypeFilter<"leaguemessages"> | $Enums.MessageType
    createdAt?: DateTimeFilter<"leaguemessages"> | Date | string
    status?: EnumMessageStatusFilter<"leaguemessages"> | $Enums.MessageStatus
    leagues?: XOR<LeaguesRelationFilter, leaguesWhereInput>
    leaguemembers?: XOR<LeaguemembersRelationFilter, leaguemembersWhereInput>
  }, "message_id">

  export type leaguemessagesOrderByWithAggregationInput = {
    message_id?: SortOrder
    content?: SortOrder
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrderInput | SortOrder
    message_type?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    _count?: leaguemessagesCountOrderByAggregateInput
    _avg?: leaguemessagesAvgOrderByAggregateInput
    _max?: leaguemessagesMaxOrderByAggregateInput
    _min?: leaguemessagesMinOrderByAggregateInput
    _sum?: leaguemessagesSumOrderByAggregateInput
  }

  export type leaguemessagesScalarWhereWithAggregatesInput = {
    AND?: leaguemessagesScalarWhereWithAggregatesInput | leaguemessagesScalarWhereWithAggregatesInput[]
    OR?: leaguemessagesScalarWhereWithAggregatesInput[]
    NOT?: leaguemessagesScalarWhereWithAggregatesInput | leaguemessagesScalarWhereWithAggregatesInput[]
    message_id?: StringWithAggregatesFilter<"leaguemessages"> | string
    content?: StringWithAggregatesFilter<"leaguemessages"> | string
    member_id?: IntWithAggregatesFilter<"leaguemessages"> | number
    league_id?: IntWithAggregatesFilter<"leaguemessages"> | number
    week?: IntNullableWithAggregatesFilter<"leaguemessages"> | number | null
    message_type?: EnumMessageTypeWithAggregatesFilter<"leaguemessages"> | $Enums.MessageType
    createdAt?: DateTimeWithAggregatesFilter<"leaguemessages"> | Date | string
    status?: EnumMessageStatusWithAggregatesFilter<"leaguemessages"> | $Enums.MessageStatus
  }

  export type leaguesWhereInput = {
    AND?: leaguesWhereInput | leaguesWhereInput[]
    OR?: leaguesWhereInput[]
    NOT?: leaguesWhereInput | leaguesWhereInput[]
    league_id?: IntFilter<"leagues"> | number
    created_by_user_id?: IntFilter<"leagues"> | number
    name?: StringFilter<"leagues"> | string
    created_time?: DateTimeFilter<"leagues"> | Date | string
    season?: IntFilter<"leagues"> | number
    late_policy?: EnumLatePolicyNullableFilter<"leagues"> | $Enums.LatePolicy | null
    pick_policy?: EnumPickPolicyNullableFilter<"leagues"> | $Enums.PickPolicy | null
    reminder_policy?: EnumReminderPolicyNullableFilter<"leagues"> | $Enums.ReminderPolicy | null
    scoring_type?: EnumScoringTypeNullableFilter<"leagues"> | $Enums.ScoringType | null
    share_code?: StringNullableFilter<"leagues"> | string | null
    superbowl_competition?: BoolNullableFilter<"leagues"> | boolean | null
    prior_league_id?: IntNullableFilter<"leagues"> | number | null
    status?: EnumLeagueStatusFilter<"leagues"> | $Enums.LeagueStatus
    EmailLogs?: EmailLogsListRelationFilter
    WeekWinners?: WeekWinnersListRelationFilter
    leaguemembers?: LeaguemembersListRelationFilter
    leaguemessages?: LeaguemessagesListRelationFilter
    people?: XOR<PeopleRelationFilter, peopleWhereInput>
    prior_league?: XOR<LeaguesNullableRelationFilter, leaguesWhereInput> | null
    future_leagues?: LeaguesListRelationFilter
  }

  export type leaguesOrderByWithRelationInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    name?: SortOrder
    created_time?: SortOrder
    season?: SortOrder
    late_policy?: SortOrderInput | SortOrder
    pick_policy?: SortOrderInput | SortOrder
    reminder_policy?: SortOrderInput | SortOrder
    scoring_type?: SortOrderInput | SortOrder
    share_code?: SortOrderInput | SortOrder
    superbowl_competition?: SortOrderInput | SortOrder
    prior_league_id?: SortOrderInput | SortOrder
    status?: SortOrder
    EmailLogs?: EmailLogsOrderByRelationAggregateInput
    WeekWinners?: WeekWinnersOrderByRelationAggregateInput
    leaguemembers?: leaguemembersOrderByRelationAggregateInput
    leaguemessages?: leaguemessagesOrderByRelationAggregateInput
    people?: peopleOrderByWithRelationInput
    prior_league?: leaguesOrderByWithRelationInput
    future_leagues?: leaguesOrderByRelationAggregateInput
  }

  export type leaguesWhereUniqueInput = Prisma.AtLeast<{
    league_id?: number
    share_code?: string
    AND?: leaguesWhereInput | leaguesWhereInput[]
    OR?: leaguesWhereInput[]
    NOT?: leaguesWhereInput | leaguesWhereInput[]
    created_by_user_id?: IntFilter<"leagues"> | number
    name?: StringFilter<"leagues"> | string
    created_time?: DateTimeFilter<"leagues"> | Date | string
    season?: IntFilter<"leagues"> | number
    late_policy?: EnumLatePolicyNullableFilter<"leagues"> | $Enums.LatePolicy | null
    pick_policy?: EnumPickPolicyNullableFilter<"leagues"> | $Enums.PickPolicy | null
    reminder_policy?: EnumReminderPolicyNullableFilter<"leagues"> | $Enums.ReminderPolicy | null
    scoring_type?: EnumScoringTypeNullableFilter<"leagues"> | $Enums.ScoringType | null
    superbowl_competition?: BoolNullableFilter<"leagues"> | boolean | null
    prior_league_id?: IntNullableFilter<"leagues"> | number | null
    status?: EnumLeagueStatusFilter<"leagues"> | $Enums.LeagueStatus
    EmailLogs?: EmailLogsListRelationFilter
    WeekWinners?: WeekWinnersListRelationFilter
    leaguemembers?: LeaguemembersListRelationFilter
    leaguemessages?: LeaguemessagesListRelationFilter
    people?: XOR<PeopleRelationFilter, peopleWhereInput>
    prior_league?: XOR<LeaguesNullableRelationFilter, leaguesWhereInput> | null
    future_leagues?: LeaguesListRelationFilter
  }, "league_id" | "share_code">

  export type leaguesOrderByWithAggregationInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    name?: SortOrder
    created_time?: SortOrder
    season?: SortOrder
    late_policy?: SortOrderInput | SortOrder
    pick_policy?: SortOrderInput | SortOrder
    reminder_policy?: SortOrderInput | SortOrder
    scoring_type?: SortOrderInput | SortOrder
    share_code?: SortOrderInput | SortOrder
    superbowl_competition?: SortOrderInput | SortOrder
    prior_league_id?: SortOrderInput | SortOrder
    status?: SortOrder
    _count?: leaguesCountOrderByAggregateInput
    _avg?: leaguesAvgOrderByAggregateInput
    _max?: leaguesMaxOrderByAggregateInput
    _min?: leaguesMinOrderByAggregateInput
    _sum?: leaguesSumOrderByAggregateInput
  }

  export type leaguesScalarWhereWithAggregatesInput = {
    AND?: leaguesScalarWhereWithAggregatesInput | leaguesScalarWhereWithAggregatesInput[]
    OR?: leaguesScalarWhereWithAggregatesInput[]
    NOT?: leaguesScalarWhereWithAggregatesInput | leaguesScalarWhereWithAggregatesInput[]
    league_id?: IntWithAggregatesFilter<"leagues"> | number
    created_by_user_id?: IntWithAggregatesFilter<"leagues"> | number
    name?: StringWithAggregatesFilter<"leagues"> | string
    created_time?: DateTimeWithAggregatesFilter<"leagues"> | Date | string
    season?: IntWithAggregatesFilter<"leagues"> | number
    late_policy?: EnumLatePolicyNullableWithAggregatesFilter<"leagues"> | $Enums.LatePolicy | null
    pick_policy?: EnumPickPolicyNullableWithAggregatesFilter<"leagues"> | $Enums.PickPolicy | null
    reminder_policy?: EnumReminderPolicyNullableWithAggregatesFilter<"leagues"> | $Enums.ReminderPolicy | null
    scoring_type?: EnumScoringTypeNullableWithAggregatesFilter<"leagues"> | $Enums.ScoringType | null
    share_code?: StringNullableWithAggregatesFilter<"leagues"> | string | null
    superbowl_competition?: BoolNullableWithAggregatesFilter<"leagues"> | boolean | null
    prior_league_id?: IntNullableWithAggregatesFilter<"leagues"> | number | null
    status?: EnumLeagueStatusWithAggregatesFilter<"leagues"> | $Enums.LeagueStatus
  }

  export type peopleWhereInput = {
    AND?: peopleWhereInput | peopleWhereInput[]
    OR?: peopleWhereInput[]
    NOT?: peopleWhereInput | peopleWhereInput[]
    uid?: IntFilter<"people"> | number
    username?: StringFilter<"people"> | string
    fname?: StringFilter<"people"> | string
    lname?: StringFilter<"people"> | string
    email?: StringFilter<"people"> | string
    season?: IntFilter<"people"> | number
    email2?: StringNullableFilter<"people"> | string | null
    google_photo_url?: StringNullableFilter<"people"> | string | null
    google_email?: StringNullableFilter<"people"> | string | null
    google_userid?: StringNullableFilter<"people"> | string | null
    supabase_id?: StringNullableFilter<"people"> | string | null
    leaguemembers?: LeaguemembersListRelationFilter
    leagues?: LeaguesListRelationFilter
    picks?: PicksListRelationFilter
  }

  export type peopleOrderByWithRelationInput = {
    uid?: SortOrder
    username?: SortOrder
    fname?: SortOrder
    lname?: SortOrder
    email?: SortOrder
    season?: SortOrder
    email2?: SortOrderInput | SortOrder
    google_photo_url?: SortOrderInput | SortOrder
    google_email?: SortOrderInput | SortOrder
    google_userid?: SortOrderInput | SortOrder
    supabase_id?: SortOrderInput | SortOrder
    leaguemembers?: leaguemembersOrderByRelationAggregateInput
    leagues?: leaguesOrderByRelationAggregateInput
    picks?: picksOrderByRelationAggregateInput
  }

  export type peopleWhereUniqueInput = Prisma.AtLeast<{
    uid?: number
    email?: string
    supabase_id?: string
    AND?: peopleWhereInput | peopleWhereInput[]
    OR?: peopleWhereInput[]
    NOT?: peopleWhereInput | peopleWhereInput[]
    username?: StringFilter<"people"> | string
    fname?: StringFilter<"people"> | string
    lname?: StringFilter<"people"> | string
    season?: IntFilter<"people"> | number
    email2?: StringNullableFilter<"people"> | string | null
    google_photo_url?: StringNullableFilter<"people"> | string | null
    google_email?: StringNullableFilter<"people"> | string | null
    google_userid?: StringNullableFilter<"people"> | string | null
    leaguemembers?: LeaguemembersListRelationFilter
    leagues?: LeaguesListRelationFilter
    picks?: PicksListRelationFilter
  }, "uid" | "email" | "supabase_id">

  export type peopleOrderByWithAggregationInput = {
    uid?: SortOrder
    username?: SortOrder
    fname?: SortOrder
    lname?: SortOrder
    email?: SortOrder
    season?: SortOrder
    email2?: SortOrderInput | SortOrder
    google_photo_url?: SortOrderInput | SortOrder
    google_email?: SortOrderInput | SortOrder
    google_userid?: SortOrderInput | SortOrder
    supabase_id?: SortOrderInput | SortOrder
    _count?: peopleCountOrderByAggregateInput
    _avg?: peopleAvgOrderByAggregateInput
    _max?: peopleMaxOrderByAggregateInput
    _min?: peopleMinOrderByAggregateInput
    _sum?: peopleSumOrderByAggregateInput
  }

  export type peopleScalarWhereWithAggregatesInput = {
    AND?: peopleScalarWhereWithAggregatesInput | peopleScalarWhereWithAggregatesInput[]
    OR?: peopleScalarWhereWithAggregatesInput[]
    NOT?: peopleScalarWhereWithAggregatesInput | peopleScalarWhereWithAggregatesInput[]
    uid?: IntWithAggregatesFilter<"people"> | number
    username?: StringWithAggregatesFilter<"people"> | string
    fname?: StringWithAggregatesFilter<"people"> | string
    lname?: StringWithAggregatesFilter<"people"> | string
    email?: StringWithAggregatesFilter<"people"> | string
    season?: IntWithAggregatesFilter<"people"> | number
    email2?: StringNullableWithAggregatesFilter<"people"> | string | null
    google_photo_url?: StringNullableWithAggregatesFilter<"people"> | string | null
    google_email?: StringNullableWithAggregatesFilter<"people"> | string | null
    google_userid?: StringNullableWithAggregatesFilter<"people"> | string | null
    supabase_id?: StringNullableWithAggregatesFilter<"people"> | string | null
  }

  export type picksWhereInput = {
    AND?: picksWhereInput | picksWhereInput[]
    OR?: picksWhereInput[]
    NOT?: picksWhereInput | picksWhereInput[]
    pickid?: IntFilter<"picks"> | number
    uid?: IntFilter<"picks"> | number
    season?: IntFilter<"picks"> | number
    week?: IntFilter<"picks"> | number
    gid?: IntFilter<"picks"> | number
    winner?: IntNullableFilter<"picks"> | number | null
    loser?: IntNullableFilter<"picks"> | number | null
    score?: IntNullableFilter<"picks"> | number | null
    ts?: DateTimeFilter<"picks"> | Date | string
    correct?: IntNullableFilter<"picks"> | number | null
    done?: IntNullableFilter<"picks"> | number | null
    is_random?: BoolNullableFilter<"picks"> | boolean | null
    member_id?: IntNullableFilter<"picks"> | number | null
    games?: XOR<GamesRelationFilter, gamesWhereInput>
    people?: XOR<PeopleRelationFilter, peopleWhereInput>
    leaguemembers?: XOR<LeaguemembersNullableRelationFilter, leaguemembersWhereInput> | null
    teams?: XOR<TeamsNullableRelationFilter, teamsWhereInput> | null
  }

  export type picksOrderByWithRelationInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrderInput | SortOrder
    loser?: SortOrderInput | SortOrder
    score?: SortOrderInput | SortOrder
    ts?: SortOrder
    correct?: SortOrderInput | SortOrder
    done?: SortOrderInput | SortOrder
    is_random?: SortOrderInput | SortOrder
    member_id?: SortOrderInput | SortOrder
    games?: gamesOrderByWithRelationInput
    people?: peopleOrderByWithRelationInput
    leaguemembers?: leaguemembersOrderByWithRelationInput
    teams?: teamsOrderByWithRelationInput
  }

  export type picksWhereUniqueInput = Prisma.AtLeast<{
    pickid?: number
    AND?: picksWhereInput | picksWhereInput[]
    OR?: picksWhereInput[]
    NOT?: picksWhereInput | picksWhereInput[]
    uid?: IntFilter<"picks"> | number
    season?: IntFilter<"picks"> | number
    week?: IntFilter<"picks"> | number
    gid?: IntFilter<"picks"> | number
    winner?: IntNullableFilter<"picks"> | number | null
    loser?: IntNullableFilter<"picks"> | number | null
    score?: IntNullableFilter<"picks"> | number | null
    ts?: DateTimeFilter<"picks"> | Date | string
    correct?: IntNullableFilter<"picks"> | number | null
    done?: IntNullableFilter<"picks"> | number | null
    is_random?: BoolNullableFilter<"picks"> | boolean | null
    member_id?: IntNullableFilter<"picks"> | number | null
    games?: XOR<GamesRelationFilter, gamesWhereInput>
    people?: XOR<PeopleRelationFilter, peopleWhereInput>
    leaguemembers?: XOR<LeaguemembersNullableRelationFilter, leaguemembersWhereInput> | null
    teams?: XOR<TeamsNullableRelationFilter, teamsWhereInput> | null
  }, "pickid">

  export type picksOrderByWithAggregationInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrderInput | SortOrder
    loser?: SortOrderInput | SortOrder
    score?: SortOrderInput | SortOrder
    ts?: SortOrder
    correct?: SortOrderInput | SortOrder
    done?: SortOrderInput | SortOrder
    is_random?: SortOrderInput | SortOrder
    member_id?: SortOrderInput | SortOrder
    _count?: picksCountOrderByAggregateInput
    _avg?: picksAvgOrderByAggregateInput
    _max?: picksMaxOrderByAggregateInput
    _min?: picksMinOrderByAggregateInput
    _sum?: picksSumOrderByAggregateInput
  }

  export type picksScalarWhereWithAggregatesInput = {
    AND?: picksScalarWhereWithAggregatesInput | picksScalarWhereWithAggregatesInput[]
    OR?: picksScalarWhereWithAggregatesInput[]
    NOT?: picksScalarWhereWithAggregatesInput | picksScalarWhereWithAggregatesInput[]
    pickid?: IntWithAggregatesFilter<"picks"> | number
    uid?: IntWithAggregatesFilter<"picks"> | number
    season?: IntWithAggregatesFilter<"picks"> | number
    week?: IntWithAggregatesFilter<"picks"> | number
    gid?: IntWithAggregatesFilter<"picks"> | number
    winner?: IntNullableWithAggregatesFilter<"picks"> | number | null
    loser?: IntNullableWithAggregatesFilter<"picks"> | number | null
    score?: IntNullableWithAggregatesFilter<"picks"> | number | null
    ts?: DateTimeWithAggregatesFilter<"picks"> | Date | string
    correct?: IntNullableWithAggregatesFilter<"picks"> | number | null
    done?: IntNullableWithAggregatesFilter<"picks"> | number | null
    is_random?: BoolNullableWithAggregatesFilter<"picks"> | boolean | null
    member_id?: IntNullableWithAggregatesFilter<"picks"> | number | null
  }

  export type superbowlWhereInput = {
    AND?: superbowlWhereInput | superbowlWhereInput[]
    OR?: superbowlWhereInput[]
    NOT?: superbowlWhereInput | superbowlWhereInput[]
    pickid?: IntFilter<"superbowl"> | number
    uid?: IntFilter<"superbowl"> | number
    winner?: IntFilter<"superbowl"> | number
    loser?: IntFilter<"superbowl"> | number
    score?: IntFilter<"superbowl"> | number
    ts?: DateTimeNullableFilter<"superbowl"> | Date | string | null
    season?: IntNullableFilter<"superbowl"> | number | null
    member_id?: IntNullableFilter<"superbowl"> | number | null
    teams_superbowl_loserToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
    leaguemembers?: XOR<LeaguemembersNullableRelationFilter, leaguemembersWhereInput> | null
    teams_superbowl_winnerToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
  }

  export type superbowlOrderByWithRelationInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrderInput | SortOrder
    season?: SortOrderInput | SortOrder
    member_id?: SortOrderInput | SortOrder
    teams_superbowl_loserToteams?: teamsOrderByWithRelationInput
    leaguemembers?: leaguemembersOrderByWithRelationInput
    teams_superbowl_winnerToteams?: teamsOrderByWithRelationInput
  }

  export type superbowlWhereUniqueInput = Prisma.AtLeast<{
    pickid?: number
    AND?: superbowlWhereInput | superbowlWhereInput[]
    OR?: superbowlWhereInput[]
    NOT?: superbowlWhereInput | superbowlWhereInput[]
    uid?: IntFilter<"superbowl"> | number
    winner?: IntFilter<"superbowl"> | number
    loser?: IntFilter<"superbowl"> | number
    score?: IntFilter<"superbowl"> | number
    ts?: DateTimeNullableFilter<"superbowl"> | Date | string | null
    season?: IntNullableFilter<"superbowl"> | number | null
    member_id?: IntNullableFilter<"superbowl"> | number | null
    teams_superbowl_loserToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
    leaguemembers?: XOR<LeaguemembersNullableRelationFilter, leaguemembersWhereInput> | null
    teams_superbowl_winnerToteams?: XOR<TeamsRelationFilter, teamsWhereInput>
  }, "pickid">

  export type superbowlOrderByWithAggregationInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrderInput | SortOrder
    season?: SortOrderInput | SortOrder
    member_id?: SortOrderInput | SortOrder
    _count?: superbowlCountOrderByAggregateInput
    _avg?: superbowlAvgOrderByAggregateInput
    _max?: superbowlMaxOrderByAggregateInput
    _min?: superbowlMinOrderByAggregateInput
    _sum?: superbowlSumOrderByAggregateInput
  }

  export type superbowlScalarWhereWithAggregatesInput = {
    AND?: superbowlScalarWhereWithAggregatesInput | superbowlScalarWhereWithAggregatesInput[]
    OR?: superbowlScalarWhereWithAggregatesInput[]
    NOT?: superbowlScalarWhereWithAggregatesInput | superbowlScalarWhereWithAggregatesInput[]
    pickid?: IntWithAggregatesFilter<"superbowl"> | number
    uid?: IntWithAggregatesFilter<"superbowl"> | number
    winner?: IntWithAggregatesFilter<"superbowl"> | number
    loser?: IntWithAggregatesFilter<"superbowl"> | number
    score?: IntWithAggregatesFilter<"superbowl"> | number
    ts?: DateTimeNullableWithAggregatesFilter<"superbowl"> | Date | string | null
    season?: IntNullableWithAggregatesFilter<"superbowl"> | number | null
    member_id?: IntNullableWithAggregatesFilter<"superbowl"> | number | null
  }

  export type superbowlsquaresWhereInput = {
    AND?: superbowlsquaresWhereInput | superbowlsquaresWhereInput[]
    OR?: superbowlsquaresWhereInput[]
    NOT?: superbowlsquaresWhereInput | superbowlsquaresWhereInput[]
    square_id?: IntFilter<"superbowlsquares"> | number
    uid?: IntFilter<"superbowlsquares"> | number
    league_id?: IntFilter<"superbowlsquares"> | number
    afc_score_index?: IntFilter<"superbowlsquares"> | number
    nfc_score_index?: IntFilter<"superbowlsquares"> | number
    correct?: BoolFilter<"superbowlsquares"> | boolean
    ts?: DateTimeFilter<"superbowlsquares"> | Date | string
  }

  export type superbowlsquaresOrderByWithRelationInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
    correct?: SortOrder
    ts?: SortOrder
  }

  export type superbowlsquaresWhereUniqueInput = Prisma.AtLeast<{
    square_id?: number
    AND?: superbowlsquaresWhereInput | superbowlsquaresWhereInput[]
    OR?: superbowlsquaresWhereInput[]
    NOT?: superbowlsquaresWhereInput | superbowlsquaresWhereInput[]
    uid?: IntFilter<"superbowlsquares"> | number
    league_id?: IntFilter<"superbowlsquares"> | number
    afc_score_index?: IntFilter<"superbowlsquares"> | number
    nfc_score_index?: IntFilter<"superbowlsquares"> | number
    correct?: BoolFilter<"superbowlsquares"> | boolean
    ts?: DateTimeFilter<"superbowlsquares"> | Date | string
  }, "square_id">

  export type superbowlsquaresOrderByWithAggregationInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
    correct?: SortOrder
    ts?: SortOrder
    _count?: superbowlsquaresCountOrderByAggregateInput
    _avg?: superbowlsquaresAvgOrderByAggregateInput
    _max?: superbowlsquaresMaxOrderByAggregateInput
    _min?: superbowlsquaresMinOrderByAggregateInput
    _sum?: superbowlsquaresSumOrderByAggregateInput
  }

  export type superbowlsquaresScalarWhereWithAggregatesInput = {
    AND?: superbowlsquaresScalarWhereWithAggregatesInput | superbowlsquaresScalarWhereWithAggregatesInput[]
    OR?: superbowlsquaresScalarWhereWithAggregatesInput[]
    NOT?: superbowlsquaresScalarWhereWithAggregatesInput | superbowlsquaresScalarWhereWithAggregatesInput[]
    square_id?: IntWithAggregatesFilter<"superbowlsquares"> | number
    uid?: IntWithAggregatesFilter<"superbowlsquares"> | number
    league_id?: IntWithAggregatesFilter<"superbowlsquares"> | number
    afc_score_index?: IntWithAggregatesFilter<"superbowlsquares"> | number
    nfc_score_index?: IntWithAggregatesFilter<"superbowlsquares"> | number
    correct?: BoolWithAggregatesFilter<"superbowlsquares"> | boolean
    ts?: DateTimeWithAggregatesFilter<"superbowlsquares"> | Date | string
  }

  export type teamsWhereInput = {
    AND?: teamsWhereInput | teamsWhereInput[]
    OR?: teamsWhereInput[]
    NOT?: teamsWhereInput | teamsWhereInput[]
    teamid?: IntFilter<"teams"> | number
    abbrev?: StringNullableFilter<"teams"> | string | null
    loc?: StringFilter<"teams"> | string
    name?: StringFilter<"teams"> | string
    conference?: StringNullableFilter<"teams"> | string | null
    primary_color?: StringNullableFilter<"teams"> | string | null
    secondary_color?: StringNullableFilter<"teams"> | string | null
    tertiary_color?: StringNullableFilter<"teams"> | string | null
    games_games_homeToteams?: GamesListRelationFilter
    games_games_awayToteams?: GamesListRelationFilter
    picks?: PicksListRelationFilter
    superbowl_superbowl_loserToteams?: SuperbowlListRelationFilter
    superbowl_superbowl_winnerToteams?: SuperbowlListRelationFilter
  }

  export type teamsOrderByWithRelationInput = {
    teamid?: SortOrder
    abbrev?: SortOrderInput | SortOrder
    loc?: SortOrder
    name?: SortOrder
    conference?: SortOrderInput | SortOrder
    primary_color?: SortOrderInput | SortOrder
    secondary_color?: SortOrderInput | SortOrder
    tertiary_color?: SortOrderInput | SortOrder
    games_games_homeToteams?: gamesOrderByRelationAggregateInput
    games_games_awayToteams?: gamesOrderByRelationAggregateInput
    picks?: picksOrderByRelationAggregateInput
    superbowl_superbowl_loserToteams?: superbowlOrderByRelationAggregateInput
    superbowl_superbowl_winnerToteams?: superbowlOrderByRelationAggregateInput
  }

  export type teamsWhereUniqueInput = Prisma.AtLeast<{
    teamid?: number
    AND?: teamsWhereInput | teamsWhereInput[]
    OR?: teamsWhereInput[]
    NOT?: teamsWhereInput | teamsWhereInput[]
    abbrev?: StringNullableFilter<"teams"> | string | null
    loc?: StringFilter<"teams"> | string
    name?: StringFilter<"teams"> | string
    conference?: StringNullableFilter<"teams"> | string | null
    primary_color?: StringNullableFilter<"teams"> | string | null
    secondary_color?: StringNullableFilter<"teams"> | string | null
    tertiary_color?: StringNullableFilter<"teams"> | string | null
    games_games_homeToteams?: GamesListRelationFilter
    games_games_awayToteams?: GamesListRelationFilter
    picks?: PicksListRelationFilter
    superbowl_superbowl_loserToteams?: SuperbowlListRelationFilter
    superbowl_superbowl_winnerToteams?: SuperbowlListRelationFilter
  }, "teamid">

  export type teamsOrderByWithAggregationInput = {
    teamid?: SortOrder
    abbrev?: SortOrderInput | SortOrder
    loc?: SortOrder
    name?: SortOrder
    conference?: SortOrderInput | SortOrder
    primary_color?: SortOrderInput | SortOrder
    secondary_color?: SortOrderInput | SortOrder
    tertiary_color?: SortOrderInput | SortOrder
    _count?: teamsCountOrderByAggregateInput
    _avg?: teamsAvgOrderByAggregateInput
    _max?: teamsMaxOrderByAggregateInput
    _min?: teamsMinOrderByAggregateInput
    _sum?: teamsSumOrderByAggregateInput
  }

  export type teamsScalarWhereWithAggregatesInput = {
    AND?: teamsScalarWhereWithAggregatesInput | teamsScalarWhereWithAggregatesInput[]
    OR?: teamsScalarWhereWithAggregatesInput[]
    NOT?: teamsScalarWhereWithAggregatesInput | teamsScalarWhereWithAggregatesInput[]
    teamid?: IntWithAggregatesFilter<"teams"> | number
    abbrev?: StringNullableWithAggregatesFilter<"teams"> | string | null
    loc?: StringWithAggregatesFilter<"teams"> | string
    name?: StringWithAggregatesFilter<"teams"> | string
    conference?: StringNullableWithAggregatesFilter<"teams"> | string | null
    primary_color?: StringNullableWithAggregatesFilter<"teams"> | string | null
    secondary_color?: StringNullableWithAggregatesFilter<"teams"> | string | null
    tertiary_color?: StringNullableWithAggregatesFilter<"teams"> | string | null
  }

  export type EmailLogsCreateInput = {
    email_log_id?: string
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
    leagues: leaguesCreateNestedOneWithoutEmailLogsInput
    leaguemembers: leaguemembersCreateNestedOneWithoutEmailLogsInput
  }

  export type EmailLogsUncheckedCreateInput = {
    email_log_id?: string
    league_id: number
    member_id: number
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
  }

  export type EmailLogsUpdateInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
    leagues?: leaguesUpdateOneRequiredWithoutEmailLogsNestedInput
    leaguemembers?: leaguemembersUpdateOneRequiredWithoutEmailLogsNestedInput
  }

  export type EmailLogsUncheckedUpdateInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    league_id?: IntFieldUpdateOperationsInput | number
    member_id?: IntFieldUpdateOperationsInput | number
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type EmailLogsCreateManyInput = {
    email_log_id?: string
    league_id: number
    member_id: number
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
  }

  export type EmailLogsUpdateManyMutationInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type EmailLogsUncheckedUpdateManyInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    league_id?: IntFieldUpdateOperationsInput | number
    member_id?: IntFieldUpdateOperationsInput | number
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type WeekWinnersCreateInput = {
    week: number
    correct_count: number
    score_diff: number
    leagues: leaguesCreateNestedOneWithoutWeekWinnersInput
    leaguemembers: leaguemembersCreateNestedOneWithoutWeekWinnersInput
  }

  export type WeekWinnersUncheckedCreateInput = {
    id?: number
    league_id: number
    membership_id: number
    week: number
    correct_count: number
    score_diff: number
  }

  export type WeekWinnersUpdateInput = {
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
    leagues?: leaguesUpdateOneRequiredWithoutWeekWinnersNestedInput
    leaguemembers?: leaguemembersUpdateOneRequiredWithoutWeekWinnersNestedInput
  }

  export type WeekWinnersUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    membership_id?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type WeekWinnersCreateManyInput = {
    id?: number
    league_id: number
    membership_id: number
    week: number
    correct_count: number
    score_diff: number
  }

  export type WeekWinnersUpdateManyMutationInput = {
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type WeekWinnersUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    membership_id?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type gamesCreateInput = {
    season: number
    week: number
    ts: Date | string
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    teams_games_homeToteams: teamsCreateNestedOneWithoutGames_games_homeToteamsInput
    teams_games_awayToteams: teamsCreateNestedOneWithoutGames_games_awayToteamsInput
    picks?: picksCreateNestedManyWithoutGamesInput
  }

  export type gamesUncheckedCreateInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    home: number
    away: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    picks?: picksUncheckedCreateNestedManyWithoutGamesInput
  }

  export type gamesUpdateInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    teams_games_homeToteams?: teamsUpdateOneRequiredWithoutGames_games_homeToteamsNestedInput
    teams_games_awayToteams?: teamsUpdateOneRequiredWithoutGames_games_awayToteamsNestedInput
    picks?: picksUpdateManyWithoutGamesNestedInput
  }

  export type gamesUncheckedUpdateInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    home?: IntFieldUpdateOperationsInput | number
    away?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    picks?: picksUncheckedUpdateManyWithoutGamesNestedInput
  }

  export type gamesCreateManyInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    home: number
    away: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
  }

  export type gamesUpdateManyMutationInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type gamesUncheckedUpdateManyInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    home?: IntFieldUpdateOperationsInput | number
    away?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type leaguemembersCreateInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUpdateInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersCreateManyInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
  }

  export type leaguemembersUpdateManyMutationInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type leaguemembersUncheckedUpdateManyInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type leaguemessagesCreateInput = {
    message_id?: string
    content: string
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
    leagues: leaguesCreateNestedOneWithoutLeaguemessagesInput
    leaguemembers: leaguemembersCreateNestedOneWithoutLeaguemessagesInput
  }

  export type leaguemessagesUncheckedCreateInput = {
    message_id?: string
    content: string
    member_id: number
    league_id: number
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
  }

  export type leaguemessagesUpdateInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemessagesNestedInput
    leaguemembers?: leaguemembersUpdateOneRequiredWithoutLeaguemessagesNestedInput
  }

  export type leaguemessagesUncheckedUpdateInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    member_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type leaguemessagesCreateManyInput = {
    message_id?: string
    content: string
    member_id: number
    league_id: number
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
  }

  export type leaguemessagesUpdateManyMutationInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type leaguemessagesUncheckedUpdateManyInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    member_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type leaguesCreateInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesCreateManyInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
  }

  export type leaguesUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
  }

  export type leaguesUncheckedUpdateManyInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
  }

  export type peopleCreateInput = {
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leaguemembers?: leaguemembersCreateNestedManyWithoutPeopleInput
    leagues?: leaguesCreateNestedManyWithoutPeopleInput
    picks?: picksCreateNestedManyWithoutPeopleInput
  }

  export type peopleUncheckedCreateInput = {
    uid?: number
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutPeopleInput
    leagues?: leaguesUncheckedCreateNestedManyWithoutPeopleInput
    picks?: picksUncheckedCreateNestedManyWithoutPeopleInput
  }

  export type peopleUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leaguemembers?: leaguemembersUpdateManyWithoutPeopleNestedInput
    leagues?: leaguesUpdateManyWithoutPeopleNestedInput
    picks?: picksUpdateManyWithoutPeopleNestedInput
  }

  export type peopleUncheckedUpdateInput = {
    uid?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutPeopleNestedInput
    leagues?: leaguesUncheckedUpdateManyWithoutPeopleNestedInput
    picks?: picksUncheckedUpdateManyWithoutPeopleNestedInput
  }

  export type peopleCreateManyInput = {
    uid?: number
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
  }

  export type peopleUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type peopleUncheckedUpdateManyInput = {
    uid?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type picksCreateInput = {
    season: number
    week: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    games: gamesCreateNestedOneWithoutPicksInput
    people: peopleCreateNestedOneWithoutPicksInput
    leaguemembers?: leaguemembersCreateNestedOneWithoutPicksInput
    teams?: teamsCreateNestedOneWithoutPicksInput
  }

  export type picksUncheckedCreateInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    gid: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type picksUpdateInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    games?: gamesUpdateOneRequiredWithoutPicksNestedInput
    people?: peopleUpdateOneRequiredWithoutPicksNestedInput
    leaguemembers?: leaguemembersUpdateOneWithoutPicksNestedInput
    teams?: teamsUpdateOneWithoutPicksNestedInput
  }

  export type picksUncheckedUpdateInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type picksCreateManyInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    gid: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type picksUpdateManyMutationInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type picksUncheckedUpdateManyInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlCreateInput = {
    uid: number
    score: number
    ts?: Date | string | null
    season?: number | null
    teams_superbowl_loserToteams: teamsCreateNestedOneWithoutSuperbowl_superbowl_loserToteamsInput
    leaguemembers?: leaguemembersCreateNestedOneWithoutSuperbowlInput
    teams_superbowl_winnerToteams: teamsCreateNestedOneWithoutSuperbowl_superbowl_winnerToteamsInput
  }

  export type superbowlUncheckedCreateInput = {
    pickid?: number
    uid: number
    winner: number
    loser: number
    score: number
    ts?: Date | string | null
    season?: number | null
    member_id?: number | null
  }

  export type superbowlUpdateInput = {
    uid?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    teams_superbowl_loserToteams?: teamsUpdateOneRequiredWithoutSuperbowl_superbowl_loserToteamsNestedInput
    leaguemembers?: leaguemembersUpdateOneWithoutSuperbowlNestedInput
    teams_superbowl_winnerToteams?: teamsUpdateOneRequiredWithoutSuperbowl_superbowl_winnerToteamsNestedInput
  }

  export type superbowlUncheckedUpdateInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    winner?: IntFieldUpdateOperationsInput | number
    loser?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlCreateManyInput = {
    pickid?: number
    uid: number
    winner: number
    loser: number
    score: number
    ts?: Date | string | null
    season?: number | null
    member_id?: number | null
  }

  export type superbowlUpdateManyMutationInput = {
    uid?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlUncheckedUpdateManyInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    winner?: IntFieldUpdateOperationsInput | number
    loser?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlsquaresCreateInput = {
    uid: number
    league_id: number
    afc_score_index: number
    nfc_score_index: number
    correct: boolean
    ts?: Date | string
  }

  export type superbowlsquaresUncheckedCreateInput = {
    square_id?: number
    uid: number
    league_id: number
    afc_score_index: number
    nfc_score_index: number
    correct: boolean
    ts?: Date | string
  }

  export type superbowlsquaresUpdateInput = {
    uid?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    afc_score_index?: IntFieldUpdateOperationsInput | number
    nfc_score_index?: IntFieldUpdateOperationsInput | number
    correct?: BoolFieldUpdateOperationsInput | boolean
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type superbowlsquaresUncheckedUpdateInput = {
    square_id?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    afc_score_index?: IntFieldUpdateOperationsInput | number
    nfc_score_index?: IntFieldUpdateOperationsInput | number
    correct?: BoolFieldUpdateOperationsInput | boolean
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type superbowlsquaresCreateManyInput = {
    square_id?: number
    uid: number
    league_id: number
    afc_score_index: number
    nfc_score_index: number
    correct: boolean
    ts?: Date | string
  }

  export type superbowlsquaresUpdateManyMutationInput = {
    uid?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    afc_score_index?: IntFieldUpdateOperationsInput | number
    nfc_score_index?: IntFieldUpdateOperationsInput | number
    correct?: BoolFieldUpdateOperationsInput | boolean
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type superbowlsquaresUncheckedUpdateManyInput = {
    square_id?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    afc_score_index?: IntFieldUpdateOperationsInput | number
    nfc_score_index?: IntFieldUpdateOperationsInput | number
    correct?: BoolFieldUpdateOperationsInput | boolean
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type teamsCreateInput = {
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsUncheckedCreateInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksUncheckedCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsUpdateInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsUncheckedUpdateInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUncheckedUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsCreateManyInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
  }

  export type teamsUpdateManyMutationInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type teamsUncheckedUpdateManyInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumEmailTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailType | EnumEmailTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailTypeFilter<$PrismaModel> | $Enums.EmailType
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type LeaguesRelationFilter = {
    is?: leaguesWhereInput
    isNot?: leaguesWhereInput
  }

  export type LeaguemembersRelationFilter = {
    is?: leaguemembersWhereInput
    isNot?: leaguemembersWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type EmailLogsCountOrderByAggregateInput = {
    email_log_id?: SortOrder
    league_id?: SortOrder
    member_id?: SortOrder
    email_type?: SortOrder
    ts?: SortOrder
    week?: SortOrder
    resend_id?: SortOrder
  }

  export type EmailLogsAvgOrderByAggregateInput = {
    league_id?: SortOrder
    member_id?: SortOrder
    week?: SortOrder
  }

  export type EmailLogsMaxOrderByAggregateInput = {
    email_log_id?: SortOrder
    league_id?: SortOrder
    member_id?: SortOrder
    email_type?: SortOrder
    ts?: SortOrder
    week?: SortOrder
    resend_id?: SortOrder
  }

  export type EmailLogsMinOrderByAggregateInput = {
    email_log_id?: SortOrder
    league_id?: SortOrder
    member_id?: SortOrder
    email_type?: SortOrder
    ts?: SortOrder
    week?: SortOrder
    resend_id?: SortOrder
  }

  export type EmailLogsSumOrderByAggregateInput = {
    league_id?: SortOrder
    member_id?: SortOrder
    week?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumEmailTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailType | EnumEmailTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailTypeWithAggregatesFilter<$PrismaModel> | $Enums.EmailType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEmailTypeFilter<$PrismaModel>
    _max?: NestedEnumEmailTypeFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type WeekWinnersCountOrderByAggregateInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
  }

  export type WeekWinnersAvgOrderByAggregateInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
  }

  export type WeekWinnersMaxOrderByAggregateInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
  }

  export type WeekWinnersMinOrderByAggregateInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
  }

  export type WeekWinnersSumOrderByAggregateInput = {
    id?: SortOrder
    league_id?: SortOrder
    membership_id?: SortOrder
    week?: SortOrder
    correct_count?: SortOrder
    score_diff?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type TeamsRelationFilter = {
    is?: teamsWhereInput
    isNot?: teamsWhereInput
  }

  export type PicksListRelationFilter = {
    every?: picksWhereInput
    some?: picksWhereInput
    none?: picksWhereInput
  }

  export type picksOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type gamesCountOrderByAggregateInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    ts?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrder
    awayscore?: SortOrder
    done?: SortOrder
    winner?: SortOrder
    international?: SortOrder
    seconds?: SortOrder
    current_record?: SortOrder
    is_tiebreaker?: SortOrder
    homerecord?: SortOrder
    awayrecord?: SortOrder
    msf_id?: SortOrder
  }

  export type gamesAvgOrderByAggregateInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrder
    awayscore?: SortOrder
    winner?: SortOrder
    seconds?: SortOrder
    msf_id?: SortOrder
  }

  export type gamesMaxOrderByAggregateInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    ts?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrder
    awayscore?: SortOrder
    done?: SortOrder
    winner?: SortOrder
    international?: SortOrder
    seconds?: SortOrder
    current_record?: SortOrder
    is_tiebreaker?: SortOrder
    homerecord?: SortOrder
    awayrecord?: SortOrder
    msf_id?: SortOrder
  }

  export type gamesMinOrderByAggregateInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    ts?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrder
    awayscore?: SortOrder
    done?: SortOrder
    winner?: SortOrder
    international?: SortOrder
    seconds?: SortOrder
    current_record?: SortOrder
    is_tiebreaker?: SortOrder
    homerecord?: SortOrder
    awayrecord?: SortOrder
    msf_id?: SortOrder
  }

  export type gamesSumOrderByAggregateInput = {
    gid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    home?: SortOrder
    away?: SortOrder
    homescore?: SortOrder
    awayscore?: SortOrder
    winner?: SortOrder
    seconds?: SortOrder
    msf_id?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumMemberRoleNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MemberRole | EnumMemberRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMemberRoleNullableFilter<$PrismaModel> | $Enums.MemberRole | null
  }

  export type EmailLogsListRelationFilter = {
    every?: EmailLogsWhereInput
    some?: EmailLogsWhereInput
    none?: EmailLogsWhereInput
  }

  export type WeekWinnersListRelationFilter = {
    every?: WeekWinnersWhereInput
    some?: WeekWinnersWhereInput
    none?: WeekWinnersWhereInput
  }

  export type PeopleRelationFilter = {
    is?: peopleWhereInput
    isNot?: peopleWhereInput
  }

  export type LeaguemessagesListRelationFilter = {
    every?: leaguemessagesWhereInput
    some?: leaguemessagesWhereInput
    none?: leaguemessagesWhereInput
  }

  export type SuperbowlListRelationFilter = {
    every?: superbowlWhereInput
    some?: superbowlWhereInput
    none?: superbowlWhereInput
  }

  export type EmailLogsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WeekWinnersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type leaguemessagesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type superbowlOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type leaguemembersCountOrderByAggregateInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
    ts?: SortOrder
    role?: SortOrder
    paid?: SortOrder
  }

  export type leaguemembersAvgOrderByAggregateInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
  }

  export type leaguemembersMaxOrderByAggregateInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
    ts?: SortOrder
    role?: SortOrder
    paid?: SortOrder
  }

  export type leaguemembersMinOrderByAggregateInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
    ts?: SortOrder
    role?: SortOrder
    paid?: SortOrder
  }

  export type leaguemembersSumOrderByAggregateInput = {
    membership_id?: SortOrder
    league_id?: SortOrder
    user_id?: SortOrder
  }

  export type EnumMemberRoleNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemberRole | EnumMemberRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMemberRoleNullableWithAggregatesFilter<$PrismaModel> | $Enums.MemberRole | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumMemberRoleNullableFilter<$PrismaModel>
    _max?: NestedEnumMemberRoleNullableFilter<$PrismaModel>
  }

  export type EnumMessageTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageType | EnumMessageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageTypeFilter<$PrismaModel> | $Enums.MessageType
  }

  export type EnumMessageStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusFilter<$PrismaModel> | $Enums.MessageStatus
  }

  export type leaguemessagesCountOrderByAggregateInput = {
    message_id?: SortOrder
    content?: SortOrder
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrder
    message_type?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
  }

  export type leaguemessagesAvgOrderByAggregateInput = {
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrder
  }

  export type leaguemessagesMaxOrderByAggregateInput = {
    message_id?: SortOrder
    content?: SortOrder
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrder
    message_type?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
  }

  export type leaguemessagesMinOrderByAggregateInput = {
    message_id?: SortOrder
    content?: SortOrder
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrder
    message_type?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
  }

  export type leaguemessagesSumOrderByAggregateInput = {
    member_id?: SortOrder
    league_id?: SortOrder
    week?: SortOrder
  }

  export type EnumMessageTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageType | EnumMessageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageTypeWithAggregatesFilter<$PrismaModel> | $Enums.MessageType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageTypeFilter<$PrismaModel>
    _max?: NestedEnumMessageTypeFilter<$PrismaModel>
  }

  export type EnumMessageStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusWithAggregatesFilter<$PrismaModel> | $Enums.MessageStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageStatusFilter<$PrismaModel>
    _max?: NestedEnumMessageStatusFilter<$PrismaModel>
  }

  export type EnumLatePolicyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.LatePolicy | EnumLatePolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLatePolicyNullableFilter<$PrismaModel> | $Enums.LatePolicy | null
  }

  export type EnumPickPolicyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PickPolicy | EnumPickPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPickPolicyNullableFilter<$PrismaModel> | $Enums.PickPolicy | null
  }

  export type EnumReminderPolicyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderPolicy | EnumReminderPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReminderPolicyNullableFilter<$PrismaModel> | $Enums.ReminderPolicy | null
  }

  export type EnumScoringTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringType | EnumScoringTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumScoringTypeNullableFilter<$PrismaModel> | $Enums.ScoringType | null
  }

  export type EnumLeagueStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStatus | EnumLeagueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStatusFilter<$PrismaModel> | $Enums.LeagueStatus
  }

  export type LeaguemembersListRelationFilter = {
    every?: leaguemembersWhereInput
    some?: leaguemembersWhereInput
    none?: leaguemembersWhereInput
  }

  export type LeaguesNullableRelationFilter = {
    is?: leaguesWhereInput | null
    isNot?: leaguesWhereInput | null
  }

  export type LeaguesListRelationFilter = {
    every?: leaguesWhereInput
    some?: leaguesWhereInput
    none?: leaguesWhereInput
  }

  export type leaguemembersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type leaguesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type leaguesCountOrderByAggregateInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    name?: SortOrder
    created_time?: SortOrder
    season?: SortOrder
    late_policy?: SortOrder
    pick_policy?: SortOrder
    reminder_policy?: SortOrder
    scoring_type?: SortOrder
    share_code?: SortOrder
    superbowl_competition?: SortOrder
    prior_league_id?: SortOrder
    status?: SortOrder
  }

  export type leaguesAvgOrderByAggregateInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    season?: SortOrder
    prior_league_id?: SortOrder
  }

  export type leaguesMaxOrderByAggregateInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    name?: SortOrder
    created_time?: SortOrder
    season?: SortOrder
    late_policy?: SortOrder
    pick_policy?: SortOrder
    reminder_policy?: SortOrder
    scoring_type?: SortOrder
    share_code?: SortOrder
    superbowl_competition?: SortOrder
    prior_league_id?: SortOrder
    status?: SortOrder
  }

  export type leaguesMinOrderByAggregateInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    name?: SortOrder
    created_time?: SortOrder
    season?: SortOrder
    late_policy?: SortOrder
    pick_policy?: SortOrder
    reminder_policy?: SortOrder
    scoring_type?: SortOrder
    share_code?: SortOrder
    superbowl_competition?: SortOrder
    prior_league_id?: SortOrder
    status?: SortOrder
  }

  export type leaguesSumOrderByAggregateInput = {
    league_id?: SortOrder
    created_by_user_id?: SortOrder
    season?: SortOrder
    prior_league_id?: SortOrder
  }

  export type EnumLatePolicyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LatePolicy | EnumLatePolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLatePolicyNullableWithAggregatesFilter<$PrismaModel> | $Enums.LatePolicy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumLatePolicyNullableFilter<$PrismaModel>
    _max?: NestedEnumLatePolicyNullableFilter<$PrismaModel>
  }

  export type EnumPickPolicyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PickPolicy | EnumPickPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPickPolicyNullableWithAggregatesFilter<$PrismaModel> | $Enums.PickPolicy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPickPolicyNullableFilter<$PrismaModel>
    _max?: NestedEnumPickPolicyNullableFilter<$PrismaModel>
  }

  export type EnumReminderPolicyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderPolicy | EnumReminderPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReminderPolicyNullableWithAggregatesFilter<$PrismaModel> | $Enums.ReminderPolicy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumReminderPolicyNullableFilter<$PrismaModel>
    _max?: NestedEnumReminderPolicyNullableFilter<$PrismaModel>
  }

  export type EnumScoringTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringType | EnumScoringTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumScoringTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.ScoringType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumScoringTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumScoringTypeNullableFilter<$PrismaModel>
  }

  export type EnumLeagueStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStatus | EnumLeagueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeagueStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeagueStatusFilter<$PrismaModel>
    _max?: NestedEnumLeagueStatusFilter<$PrismaModel>
  }

  export type peopleCountOrderByAggregateInput = {
    uid?: SortOrder
    username?: SortOrder
    fname?: SortOrder
    lname?: SortOrder
    email?: SortOrder
    season?: SortOrder
    email2?: SortOrder
    google_photo_url?: SortOrder
    google_email?: SortOrder
    google_userid?: SortOrder
    supabase_id?: SortOrder
  }

  export type peopleAvgOrderByAggregateInput = {
    uid?: SortOrder
    season?: SortOrder
  }

  export type peopleMaxOrderByAggregateInput = {
    uid?: SortOrder
    username?: SortOrder
    fname?: SortOrder
    lname?: SortOrder
    email?: SortOrder
    season?: SortOrder
    email2?: SortOrder
    google_photo_url?: SortOrder
    google_email?: SortOrder
    google_userid?: SortOrder
    supabase_id?: SortOrder
  }

  export type peopleMinOrderByAggregateInput = {
    uid?: SortOrder
    username?: SortOrder
    fname?: SortOrder
    lname?: SortOrder
    email?: SortOrder
    season?: SortOrder
    email2?: SortOrder
    google_photo_url?: SortOrder
    google_email?: SortOrder
    google_userid?: SortOrder
    supabase_id?: SortOrder
  }

  export type peopleSumOrderByAggregateInput = {
    uid?: SortOrder
    season?: SortOrder
  }

  export type GamesRelationFilter = {
    is?: gamesWhereInput
    isNot?: gamesWhereInput
  }

  export type LeaguemembersNullableRelationFilter = {
    is?: leaguemembersWhereInput | null
    isNot?: leaguemembersWhereInput | null
  }

  export type TeamsNullableRelationFilter = {
    is?: teamsWhereInput | null
    isNot?: teamsWhereInput | null
  }

  export type picksCountOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrder
    correct?: SortOrder
    done?: SortOrder
    is_random?: SortOrder
    member_id?: SortOrder
  }

  export type picksAvgOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    correct?: SortOrder
    done?: SortOrder
    member_id?: SortOrder
  }

  export type picksMaxOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrder
    correct?: SortOrder
    done?: SortOrder
    is_random?: SortOrder
    member_id?: SortOrder
  }

  export type picksMinOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrder
    correct?: SortOrder
    done?: SortOrder
    is_random?: SortOrder
    member_id?: SortOrder
  }

  export type picksSumOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    season?: SortOrder
    week?: SortOrder
    gid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    correct?: SortOrder
    done?: SortOrder
    member_id?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type superbowlCountOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrder
    season?: SortOrder
    member_id?: SortOrder
  }

  export type superbowlAvgOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    season?: SortOrder
    member_id?: SortOrder
  }

  export type superbowlMaxOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrder
    season?: SortOrder
    member_id?: SortOrder
  }

  export type superbowlMinOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    ts?: SortOrder
    season?: SortOrder
    member_id?: SortOrder
  }

  export type superbowlSumOrderByAggregateInput = {
    pickid?: SortOrder
    uid?: SortOrder
    winner?: SortOrder
    loser?: SortOrder
    score?: SortOrder
    season?: SortOrder
    member_id?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type superbowlsquaresCountOrderByAggregateInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
    correct?: SortOrder
    ts?: SortOrder
  }

  export type superbowlsquaresAvgOrderByAggregateInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
  }

  export type superbowlsquaresMaxOrderByAggregateInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
    correct?: SortOrder
    ts?: SortOrder
  }

  export type superbowlsquaresMinOrderByAggregateInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
    correct?: SortOrder
    ts?: SortOrder
  }

  export type superbowlsquaresSumOrderByAggregateInput = {
    square_id?: SortOrder
    uid?: SortOrder
    league_id?: SortOrder
    afc_score_index?: SortOrder
    nfc_score_index?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type GamesListRelationFilter = {
    every?: gamesWhereInput
    some?: gamesWhereInput
    none?: gamesWhereInput
  }

  export type gamesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type teamsCountOrderByAggregateInput = {
    teamid?: SortOrder
    abbrev?: SortOrder
    loc?: SortOrder
    name?: SortOrder
    conference?: SortOrder
    primary_color?: SortOrder
    secondary_color?: SortOrder
    tertiary_color?: SortOrder
  }

  export type teamsAvgOrderByAggregateInput = {
    teamid?: SortOrder
  }

  export type teamsMaxOrderByAggregateInput = {
    teamid?: SortOrder
    abbrev?: SortOrder
    loc?: SortOrder
    name?: SortOrder
    conference?: SortOrder
    primary_color?: SortOrder
    secondary_color?: SortOrder
    tertiary_color?: SortOrder
  }

  export type teamsMinOrderByAggregateInput = {
    teamid?: SortOrder
    abbrev?: SortOrder
    loc?: SortOrder
    name?: SortOrder
    conference?: SortOrder
    primary_color?: SortOrder
    secondary_color?: SortOrder
    tertiary_color?: SortOrder
  }

  export type teamsSumOrderByAggregateInput = {
    teamid?: SortOrder
  }

  export type leaguesCreateNestedOneWithoutEmailLogsInput = {
    create?: XOR<leaguesCreateWithoutEmailLogsInput, leaguesUncheckedCreateWithoutEmailLogsInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutEmailLogsInput
    connect?: leaguesWhereUniqueInput
  }

  export type leaguemembersCreateNestedOneWithoutEmailLogsInput = {
    create?: XOR<leaguemembersCreateWithoutEmailLogsInput, leaguemembersUncheckedCreateWithoutEmailLogsInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutEmailLogsInput
    connect?: leaguemembersWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumEmailTypeFieldUpdateOperationsInput = {
    set?: $Enums.EmailType
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type leaguesUpdateOneRequiredWithoutEmailLogsNestedInput = {
    create?: XOR<leaguesCreateWithoutEmailLogsInput, leaguesUncheckedCreateWithoutEmailLogsInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutEmailLogsInput
    upsert?: leaguesUpsertWithoutEmailLogsInput
    connect?: leaguesWhereUniqueInput
    update?: XOR<XOR<leaguesUpdateToOneWithWhereWithoutEmailLogsInput, leaguesUpdateWithoutEmailLogsInput>, leaguesUncheckedUpdateWithoutEmailLogsInput>
  }

  export type leaguemembersUpdateOneRequiredWithoutEmailLogsNestedInput = {
    create?: XOR<leaguemembersCreateWithoutEmailLogsInput, leaguemembersUncheckedCreateWithoutEmailLogsInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutEmailLogsInput
    upsert?: leaguemembersUpsertWithoutEmailLogsInput
    connect?: leaguemembersWhereUniqueInput
    update?: XOR<XOR<leaguemembersUpdateToOneWithWhereWithoutEmailLogsInput, leaguemembersUpdateWithoutEmailLogsInput>, leaguemembersUncheckedUpdateWithoutEmailLogsInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type leaguesCreateNestedOneWithoutWeekWinnersInput = {
    create?: XOR<leaguesCreateWithoutWeekWinnersInput, leaguesUncheckedCreateWithoutWeekWinnersInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutWeekWinnersInput
    connect?: leaguesWhereUniqueInput
  }

  export type leaguemembersCreateNestedOneWithoutWeekWinnersInput = {
    create?: XOR<leaguemembersCreateWithoutWeekWinnersInput, leaguemembersUncheckedCreateWithoutWeekWinnersInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutWeekWinnersInput
    connect?: leaguemembersWhereUniqueInput
  }

  export type leaguesUpdateOneRequiredWithoutWeekWinnersNestedInput = {
    create?: XOR<leaguesCreateWithoutWeekWinnersInput, leaguesUncheckedCreateWithoutWeekWinnersInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutWeekWinnersInput
    upsert?: leaguesUpsertWithoutWeekWinnersInput
    connect?: leaguesWhereUniqueInput
    update?: XOR<XOR<leaguesUpdateToOneWithWhereWithoutWeekWinnersInput, leaguesUpdateWithoutWeekWinnersInput>, leaguesUncheckedUpdateWithoutWeekWinnersInput>
  }

  export type leaguemembersUpdateOneRequiredWithoutWeekWinnersNestedInput = {
    create?: XOR<leaguemembersCreateWithoutWeekWinnersInput, leaguemembersUncheckedCreateWithoutWeekWinnersInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutWeekWinnersInput
    upsert?: leaguemembersUpsertWithoutWeekWinnersInput
    connect?: leaguemembersWhereUniqueInput
    update?: XOR<XOR<leaguemembersUpdateToOneWithWhereWithoutWeekWinnersInput, leaguemembersUpdateWithoutWeekWinnersInput>, leaguemembersUncheckedUpdateWithoutWeekWinnersInput>
  }

  export type teamsCreateNestedOneWithoutGames_games_homeToteamsInput = {
    create?: XOR<teamsCreateWithoutGames_games_homeToteamsInput, teamsUncheckedCreateWithoutGames_games_homeToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutGames_games_homeToteamsInput
    connect?: teamsWhereUniqueInput
  }

  export type teamsCreateNestedOneWithoutGames_games_awayToteamsInput = {
    create?: XOR<teamsCreateWithoutGames_games_awayToteamsInput, teamsUncheckedCreateWithoutGames_games_awayToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutGames_games_awayToteamsInput
    connect?: teamsWhereUniqueInput
  }

  export type picksCreateNestedManyWithoutGamesInput = {
    create?: XOR<picksCreateWithoutGamesInput, picksUncheckedCreateWithoutGamesInput> | picksCreateWithoutGamesInput[] | picksUncheckedCreateWithoutGamesInput[]
    connectOrCreate?: picksCreateOrConnectWithoutGamesInput | picksCreateOrConnectWithoutGamesInput[]
    createMany?: picksCreateManyGamesInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type picksUncheckedCreateNestedManyWithoutGamesInput = {
    create?: XOR<picksCreateWithoutGamesInput, picksUncheckedCreateWithoutGamesInput> | picksCreateWithoutGamesInput[] | picksUncheckedCreateWithoutGamesInput[]
    connectOrCreate?: picksCreateOrConnectWithoutGamesInput | picksCreateOrConnectWithoutGamesInput[]
    createMany?: picksCreateManyGamesInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type teamsUpdateOneRequiredWithoutGames_games_homeToteamsNestedInput = {
    create?: XOR<teamsCreateWithoutGames_games_homeToteamsInput, teamsUncheckedCreateWithoutGames_games_homeToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutGames_games_homeToteamsInput
    upsert?: teamsUpsertWithoutGames_games_homeToteamsInput
    connect?: teamsWhereUniqueInput
    update?: XOR<XOR<teamsUpdateToOneWithWhereWithoutGames_games_homeToteamsInput, teamsUpdateWithoutGames_games_homeToteamsInput>, teamsUncheckedUpdateWithoutGames_games_homeToteamsInput>
  }

  export type teamsUpdateOneRequiredWithoutGames_games_awayToteamsNestedInput = {
    create?: XOR<teamsCreateWithoutGames_games_awayToteamsInput, teamsUncheckedCreateWithoutGames_games_awayToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutGames_games_awayToteamsInput
    upsert?: teamsUpsertWithoutGames_games_awayToteamsInput
    connect?: teamsWhereUniqueInput
    update?: XOR<XOR<teamsUpdateToOneWithWhereWithoutGames_games_awayToteamsInput, teamsUpdateWithoutGames_games_awayToteamsInput>, teamsUncheckedUpdateWithoutGames_games_awayToteamsInput>
  }

  export type picksUpdateManyWithoutGamesNestedInput = {
    create?: XOR<picksCreateWithoutGamesInput, picksUncheckedCreateWithoutGamesInput> | picksCreateWithoutGamesInput[] | picksUncheckedCreateWithoutGamesInput[]
    connectOrCreate?: picksCreateOrConnectWithoutGamesInput | picksCreateOrConnectWithoutGamesInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutGamesInput | picksUpsertWithWhereUniqueWithoutGamesInput[]
    createMany?: picksCreateManyGamesInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutGamesInput | picksUpdateWithWhereUniqueWithoutGamesInput[]
    updateMany?: picksUpdateManyWithWhereWithoutGamesInput | picksUpdateManyWithWhereWithoutGamesInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type picksUncheckedUpdateManyWithoutGamesNestedInput = {
    create?: XOR<picksCreateWithoutGamesInput, picksUncheckedCreateWithoutGamesInput> | picksCreateWithoutGamesInput[] | picksUncheckedCreateWithoutGamesInput[]
    connectOrCreate?: picksCreateOrConnectWithoutGamesInput | picksCreateOrConnectWithoutGamesInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutGamesInput | picksUpsertWithWhereUniqueWithoutGamesInput[]
    createMany?: picksCreateManyGamesInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutGamesInput | picksUpdateWithWhereUniqueWithoutGamesInput[]
    updateMany?: picksUpdateManyWithWhereWithoutGamesInput | picksUpdateManyWithWhereWithoutGamesInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type EmailLogsCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguemembersInput, EmailLogsUncheckedCreateWithoutLeaguemembersInput> | EmailLogsCreateWithoutLeaguemembersInput[] | EmailLogsUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguemembersInput | EmailLogsCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: EmailLogsCreateManyLeaguemembersInputEnvelope
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
  }

  export type WeekWinnersCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguemembersInput, WeekWinnersUncheckedCreateWithoutLeaguemembersInput> | WeekWinnersCreateWithoutLeaguemembersInput[] | WeekWinnersUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguemembersInput | WeekWinnersCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: WeekWinnersCreateManyLeaguemembersInputEnvelope
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
  }

  export type peopleCreateNestedOneWithoutLeaguemembersInput = {
    create?: XOR<peopleCreateWithoutLeaguemembersInput, peopleUncheckedCreateWithoutLeaguemembersInput>
    connectOrCreate?: peopleCreateOrConnectWithoutLeaguemembersInput
    connect?: peopleWhereUniqueInput
  }

  export type leaguesCreateNestedOneWithoutLeaguemembersInput = {
    create?: XOR<leaguesCreateWithoutLeaguemembersInput, leaguesUncheckedCreateWithoutLeaguemembersInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutLeaguemembersInput
    connect?: leaguesWhereUniqueInput
  }

  export type leaguemessagesCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguemembersInput, leaguemessagesUncheckedCreateWithoutLeaguemembersInput> | leaguemessagesCreateWithoutLeaguemembersInput[] | leaguemessagesUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguemembersInput | leaguemessagesCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: leaguemessagesCreateManyLeaguemembersInputEnvelope
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
  }

  export type picksCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<picksCreateWithoutLeaguemembersInput, picksUncheckedCreateWithoutLeaguemembersInput> | picksCreateWithoutLeaguemembersInput[] | picksUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: picksCreateOrConnectWithoutLeaguemembersInput | picksCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: picksCreateManyLeaguemembersInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type superbowlCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<superbowlCreateWithoutLeaguemembersInput, superbowlUncheckedCreateWithoutLeaguemembersInput> | superbowlCreateWithoutLeaguemembersInput[] | superbowlUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutLeaguemembersInput | superbowlCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: superbowlCreateManyLeaguemembersInputEnvelope
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
  }

  export type EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguemembersInput, EmailLogsUncheckedCreateWithoutLeaguemembersInput> | EmailLogsCreateWithoutLeaguemembersInput[] | EmailLogsUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguemembersInput | EmailLogsCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: EmailLogsCreateManyLeaguemembersInputEnvelope
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
  }

  export type WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguemembersInput, WeekWinnersUncheckedCreateWithoutLeaguemembersInput> | WeekWinnersCreateWithoutLeaguemembersInput[] | WeekWinnersUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguemembersInput | WeekWinnersCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: WeekWinnersCreateManyLeaguemembersInputEnvelope
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
  }

  export type leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguemembersInput, leaguemessagesUncheckedCreateWithoutLeaguemembersInput> | leaguemessagesCreateWithoutLeaguemembersInput[] | leaguemessagesUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguemembersInput | leaguemessagesCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: leaguemessagesCreateManyLeaguemembersInputEnvelope
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
  }

  export type picksUncheckedCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<picksCreateWithoutLeaguemembersInput, picksUncheckedCreateWithoutLeaguemembersInput> | picksCreateWithoutLeaguemembersInput[] | picksUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: picksCreateOrConnectWithoutLeaguemembersInput | picksCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: picksCreateManyLeaguemembersInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput = {
    create?: XOR<superbowlCreateWithoutLeaguemembersInput, superbowlUncheckedCreateWithoutLeaguemembersInput> | superbowlCreateWithoutLeaguemembersInput[] | superbowlUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutLeaguemembersInput | superbowlCreateOrConnectWithoutLeaguemembersInput[]
    createMany?: superbowlCreateManyLeaguemembersInputEnvelope
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
  }

  export type NullableEnumMemberRoleFieldUpdateOperationsInput = {
    set?: $Enums.MemberRole | null
  }

  export type EmailLogsUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguemembersInput, EmailLogsUncheckedCreateWithoutLeaguemembersInput> | EmailLogsCreateWithoutLeaguemembersInput[] | EmailLogsUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguemembersInput | EmailLogsCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: EmailLogsUpsertWithWhereUniqueWithoutLeaguemembersInput | EmailLogsUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: EmailLogsCreateManyLeaguemembersInputEnvelope
    set?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    disconnect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    delete?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    update?: EmailLogsUpdateWithWhereUniqueWithoutLeaguemembersInput | EmailLogsUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: EmailLogsUpdateManyWithWhereWithoutLeaguemembersInput | EmailLogsUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: EmailLogsScalarWhereInput | EmailLogsScalarWhereInput[]
  }

  export type WeekWinnersUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguemembersInput, WeekWinnersUncheckedCreateWithoutLeaguemembersInput> | WeekWinnersCreateWithoutLeaguemembersInput[] | WeekWinnersUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguemembersInput | WeekWinnersCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: WeekWinnersUpsertWithWhereUniqueWithoutLeaguemembersInput | WeekWinnersUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: WeekWinnersCreateManyLeaguemembersInputEnvelope
    set?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    disconnect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    delete?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    update?: WeekWinnersUpdateWithWhereUniqueWithoutLeaguemembersInput | WeekWinnersUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: WeekWinnersUpdateManyWithWhereWithoutLeaguemembersInput | WeekWinnersUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: WeekWinnersScalarWhereInput | WeekWinnersScalarWhereInput[]
  }

  export type peopleUpdateOneRequiredWithoutLeaguemembersNestedInput = {
    create?: XOR<peopleCreateWithoutLeaguemembersInput, peopleUncheckedCreateWithoutLeaguemembersInput>
    connectOrCreate?: peopleCreateOrConnectWithoutLeaguemembersInput
    upsert?: peopleUpsertWithoutLeaguemembersInput
    connect?: peopleWhereUniqueInput
    update?: XOR<XOR<peopleUpdateToOneWithWhereWithoutLeaguemembersInput, peopleUpdateWithoutLeaguemembersInput>, peopleUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput = {
    create?: XOR<leaguesCreateWithoutLeaguemembersInput, leaguesUncheckedCreateWithoutLeaguemembersInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutLeaguemembersInput
    upsert?: leaguesUpsertWithoutLeaguemembersInput
    connect?: leaguesWhereUniqueInput
    update?: XOR<XOR<leaguesUpdateToOneWithWhereWithoutLeaguemembersInput, leaguesUpdateWithoutLeaguemembersInput>, leaguesUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type leaguemessagesUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguemembersInput, leaguemessagesUncheckedCreateWithoutLeaguemembersInput> | leaguemessagesCreateWithoutLeaguemembersInput[] | leaguemessagesUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguemembersInput | leaguemessagesCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: leaguemessagesUpsertWithWhereUniqueWithoutLeaguemembersInput | leaguemessagesUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: leaguemessagesCreateManyLeaguemembersInputEnvelope
    set?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    disconnect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    delete?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    update?: leaguemessagesUpdateWithWhereUniqueWithoutLeaguemembersInput | leaguemessagesUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: leaguemessagesUpdateManyWithWhereWithoutLeaguemembersInput | leaguemessagesUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: leaguemessagesScalarWhereInput | leaguemessagesScalarWhereInput[]
  }

  export type picksUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<picksCreateWithoutLeaguemembersInput, picksUncheckedCreateWithoutLeaguemembersInput> | picksCreateWithoutLeaguemembersInput[] | picksUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: picksCreateOrConnectWithoutLeaguemembersInput | picksCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutLeaguemembersInput | picksUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: picksCreateManyLeaguemembersInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutLeaguemembersInput | picksUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: picksUpdateManyWithWhereWithoutLeaguemembersInput | picksUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type superbowlUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<superbowlCreateWithoutLeaguemembersInput, superbowlUncheckedCreateWithoutLeaguemembersInput> | superbowlCreateWithoutLeaguemembersInput[] | superbowlUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutLeaguemembersInput | superbowlCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: superbowlUpsertWithWhereUniqueWithoutLeaguemembersInput | superbowlUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: superbowlCreateManyLeaguemembersInputEnvelope
    set?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    disconnect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    delete?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    update?: superbowlUpdateWithWhereUniqueWithoutLeaguemembersInput | superbowlUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: superbowlUpdateManyWithWhereWithoutLeaguemembersInput | superbowlUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
  }

  export type EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguemembersInput, EmailLogsUncheckedCreateWithoutLeaguemembersInput> | EmailLogsCreateWithoutLeaguemembersInput[] | EmailLogsUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguemembersInput | EmailLogsCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: EmailLogsUpsertWithWhereUniqueWithoutLeaguemembersInput | EmailLogsUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: EmailLogsCreateManyLeaguemembersInputEnvelope
    set?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    disconnect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    delete?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    update?: EmailLogsUpdateWithWhereUniqueWithoutLeaguemembersInput | EmailLogsUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: EmailLogsUpdateManyWithWhereWithoutLeaguemembersInput | EmailLogsUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: EmailLogsScalarWhereInput | EmailLogsScalarWhereInput[]
  }

  export type WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguemembersInput, WeekWinnersUncheckedCreateWithoutLeaguemembersInput> | WeekWinnersCreateWithoutLeaguemembersInput[] | WeekWinnersUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguemembersInput | WeekWinnersCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: WeekWinnersUpsertWithWhereUniqueWithoutLeaguemembersInput | WeekWinnersUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: WeekWinnersCreateManyLeaguemembersInputEnvelope
    set?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    disconnect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    delete?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    update?: WeekWinnersUpdateWithWhereUniqueWithoutLeaguemembersInput | WeekWinnersUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: WeekWinnersUpdateManyWithWhereWithoutLeaguemembersInput | WeekWinnersUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: WeekWinnersScalarWhereInput | WeekWinnersScalarWhereInput[]
  }

  export type leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguemembersInput, leaguemessagesUncheckedCreateWithoutLeaguemembersInput> | leaguemessagesCreateWithoutLeaguemembersInput[] | leaguemessagesUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguemembersInput | leaguemessagesCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: leaguemessagesUpsertWithWhereUniqueWithoutLeaguemembersInput | leaguemessagesUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: leaguemessagesCreateManyLeaguemembersInputEnvelope
    set?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    disconnect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    delete?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    update?: leaguemessagesUpdateWithWhereUniqueWithoutLeaguemembersInput | leaguemessagesUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: leaguemessagesUpdateManyWithWhereWithoutLeaguemembersInput | leaguemessagesUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: leaguemessagesScalarWhereInput | leaguemessagesScalarWhereInput[]
  }

  export type picksUncheckedUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<picksCreateWithoutLeaguemembersInput, picksUncheckedCreateWithoutLeaguemembersInput> | picksCreateWithoutLeaguemembersInput[] | picksUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: picksCreateOrConnectWithoutLeaguemembersInput | picksCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutLeaguemembersInput | picksUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: picksCreateManyLeaguemembersInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutLeaguemembersInput | picksUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: picksUpdateManyWithWhereWithoutLeaguemembersInput | picksUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput = {
    create?: XOR<superbowlCreateWithoutLeaguemembersInput, superbowlUncheckedCreateWithoutLeaguemembersInput> | superbowlCreateWithoutLeaguemembersInput[] | superbowlUncheckedCreateWithoutLeaguemembersInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutLeaguemembersInput | superbowlCreateOrConnectWithoutLeaguemembersInput[]
    upsert?: superbowlUpsertWithWhereUniqueWithoutLeaguemembersInput | superbowlUpsertWithWhereUniqueWithoutLeaguemembersInput[]
    createMany?: superbowlCreateManyLeaguemembersInputEnvelope
    set?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    disconnect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    delete?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    update?: superbowlUpdateWithWhereUniqueWithoutLeaguemembersInput | superbowlUpdateWithWhereUniqueWithoutLeaguemembersInput[]
    updateMany?: superbowlUpdateManyWithWhereWithoutLeaguemembersInput | superbowlUpdateManyWithWhereWithoutLeaguemembersInput[]
    deleteMany?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
  }

  export type leaguesCreateNestedOneWithoutLeaguemessagesInput = {
    create?: XOR<leaguesCreateWithoutLeaguemessagesInput, leaguesUncheckedCreateWithoutLeaguemessagesInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutLeaguemessagesInput
    connect?: leaguesWhereUniqueInput
  }

  export type leaguemembersCreateNestedOneWithoutLeaguemessagesInput = {
    create?: XOR<leaguemembersCreateWithoutLeaguemessagesInput, leaguemembersUncheckedCreateWithoutLeaguemessagesInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutLeaguemessagesInput
    connect?: leaguemembersWhereUniqueInput
  }

  export type EnumMessageTypeFieldUpdateOperationsInput = {
    set?: $Enums.MessageType
  }

  export type EnumMessageStatusFieldUpdateOperationsInput = {
    set?: $Enums.MessageStatus
  }

  export type leaguesUpdateOneRequiredWithoutLeaguemessagesNestedInput = {
    create?: XOR<leaguesCreateWithoutLeaguemessagesInput, leaguesUncheckedCreateWithoutLeaguemessagesInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutLeaguemessagesInput
    upsert?: leaguesUpsertWithoutLeaguemessagesInput
    connect?: leaguesWhereUniqueInput
    update?: XOR<XOR<leaguesUpdateToOneWithWhereWithoutLeaguemessagesInput, leaguesUpdateWithoutLeaguemessagesInput>, leaguesUncheckedUpdateWithoutLeaguemessagesInput>
  }

  export type leaguemembersUpdateOneRequiredWithoutLeaguemessagesNestedInput = {
    create?: XOR<leaguemembersCreateWithoutLeaguemessagesInput, leaguemembersUncheckedCreateWithoutLeaguemessagesInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutLeaguemessagesInput
    upsert?: leaguemembersUpsertWithoutLeaguemessagesInput
    connect?: leaguemembersWhereUniqueInput
    update?: XOR<XOR<leaguemembersUpdateToOneWithWhereWithoutLeaguemessagesInput, leaguemembersUpdateWithoutLeaguemessagesInput>, leaguemembersUncheckedUpdateWithoutLeaguemessagesInput>
  }

  export type EmailLogsCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguesInput, EmailLogsUncheckedCreateWithoutLeaguesInput> | EmailLogsCreateWithoutLeaguesInput[] | EmailLogsUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguesInput | EmailLogsCreateOrConnectWithoutLeaguesInput[]
    createMany?: EmailLogsCreateManyLeaguesInputEnvelope
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
  }

  export type WeekWinnersCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguesInput, WeekWinnersUncheckedCreateWithoutLeaguesInput> | WeekWinnersCreateWithoutLeaguesInput[] | WeekWinnersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguesInput | WeekWinnersCreateOrConnectWithoutLeaguesInput[]
    createMany?: WeekWinnersCreateManyLeaguesInputEnvelope
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
  }

  export type leaguemembersCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<leaguemembersCreateWithoutLeaguesInput, leaguemembersUncheckedCreateWithoutLeaguesInput> | leaguemembersCreateWithoutLeaguesInput[] | leaguemembersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutLeaguesInput | leaguemembersCreateOrConnectWithoutLeaguesInput[]
    createMany?: leaguemembersCreateManyLeaguesInputEnvelope
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
  }

  export type leaguemessagesCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguesInput, leaguemessagesUncheckedCreateWithoutLeaguesInput> | leaguemessagesCreateWithoutLeaguesInput[] | leaguemessagesUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguesInput | leaguemessagesCreateOrConnectWithoutLeaguesInput[]
    createMany?: leaguemessagesCreateManyLeaguesInputEnvelope
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
  }

  export type peopleCreateNestedOneWithoutLeaguesInput = {
    create?: XOR<peopleCreateWithoutLeaguesInput, peopleUncheckedCreateWithoutLeaguesInput>
    connectOrCreate?: peopleCreateOrConnectWithoutLeaguesInput
    connect?: peopleWhereUniqueInput
  }

  export type leaguesCreateNestedOneWithoutFuture_leaguesInput = {
    create?: XOR<leaguesCreateWithoutFuture_leaguesInput, leaguesUncheckedCreateWithoutFuture_leaguesInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutFuture_leaguesInput
    connect?: leaguesWhereUniqueInput
  }

  export type leaguesCreateNestedManyWithoutPrior_leagueInput = {
    create?: XOR<leaguesCreateWithoutPrior_leagueInput, leaguesUncheckedCreateWithoutPrior_leagueInput> | leaguesCreateWithoutPrior_leagueInput[] | leaguesUncheckedCreateWithoutPrior_leagueInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPrior_leagueInput | leaguesCreateOrConnectWithoutPrior_leagueInput[]
    createMany?: leaguesCreateManyPrior_leagueInputEnvelope
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
  }

  export type EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguesInput, EmailLogsUncheckedCreateWithoutLeaguesInput> | EmailLogsCreateWithoutLeaguesInput[] | EmailLogsUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguesInput | EmailLogsCreateOrConnectWithoutLeaguesInput[]
    createMany?: EmailLogsCreateManyLeaguesInputEnvelope
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
  }

  export type WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguesInput, WeekWinnersUncheckedCreateWithoutLeaguesInput> | WeekWinnersCreateWithoutLeaguesInput[] | WeekWinnersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguesInput | WeekWinnersCreateOrConnectWithoutLeaguesInput[]
    createMany?: WeekWinnersCreateManyLeaguesInputEnvelope
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
  }

  export type leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<leaguemembersCreateWithoutLeaguesInput, leaguemembersUncheckedCreateWithoutLeaguesInput> | leaguemembersCreateWithoutLeaguesInput[] | leaguemembersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutLeaguesInput | leaguemembersCreateOrConnectWithoutLeaguesInput[]
    createMany?: leaguemembersCreateManyLeaguesInputEnvelope
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
  }

  export type leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguesInput, leaguemessagesUncheckedCreateWithoutLeaguesInput> | leaguemessagesCreateWithoutLeaguesInput[] | leaguemessagesUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguesInput | leaguemessagesCreateOrConnectWithoutLeaguesInput[]
    createMany?: leaguemessagesCreateManyLeaguesInputEnvelope
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
  }

  export type leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput = {
    create?: XOR<leaguesCreateWithoutPrior_leagueInput, leaguesUncheckedCreateWithoutPrior_leagueInput> | leaguesCreateWithoutPrior_leagueInput[] | leaguesUncheckedCreateWithoutPrior_leagueInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPrior_leagueInput | leaguesCreateOrConnectWithoutPrior_leagueInput[]
    createMany?: leaguesCreateManyPrior_leagueInputEnvelope
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
  }

  export type NullableEnumLatePolicyFieldUpdateOperationsInput = {
    set?: $Enums.LatePolicy | null
  }

  export type NullableEnumPickPolicyFieldUpdateOperationsInput = {
    set?: $Enums.PickPolicy | null
  }

  export type NullableEnumReminderPolicyFieldUpdateOperationsInput = {
    set?: $Enums.ReminderPolicy | null
  }

  export type NullableEnumScoringTypeFieldUpdateOperationsInput = {
    set?: $Enums.ScoringType | null
  }

  export type EnumLeagueStatusFieldUpdateOperationsInput = {
    set?: $Enums.LeagueStatus
  }

  export type EmailLogsUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguesInput, EmailLogsUncheckedCreateWithoutLeaguesInput> | EmailLogsCreateWithoutLeaguesInput[] | EmailLogsUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguesInput | EmailLogsCreateOrConnectWithoutLeaguesInput[]
    upsert?: EmailLogsUpsertWithWhereUniqueWithoutLeaguesInput | EmailLogsUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: EmailLogsCreateManyLeaguesInputEnvelope
    set?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    disconnect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    delete?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    update?: EmailLogsUpdateWithWhereUniqueWithoutLeaguesInput | EmailLogsUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: EmailLogsUpdateManyWithWhereWithoutLeaguesInput | EmailLogsUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: EmailLogsScalarWhereInput | EmailLogsScalarWhereInput[]
  }

  export type WeekWinnersUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguesInput, WeekWinnersUncheckedCreateWithoutLeaguesInput> | WeekWinnersCreateWithoutLeaguesInput[] | WeekWinnersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguesInput | WeekWinnersCreateOrConnectWithoutLeaguesInput[]
    upsert?: WeekWinnersUpsertWithWhereUniqueWithoutLeaguesInput | WeekWinnersUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: WeekWinnersCreateManyLeaguesInputEnvelope
    set?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    disconnect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    delete?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    update?: WeekWinnersUpdateWithWhereUniqueWithoutLeaguesInput | WeekWinnersUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: WeekWinnersUpdateManyWithWhereWithoutLeaguesInput | WeekWinnersUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: WeekWinnersScalarWhereInput | WeekWinnersScalarWhereInput[]
  }

  export type leaguemembersUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<leaguemembersCreateWithoutLeaguesInput, leaguemembersUncheckedCreateWithoutLeaguesInput> | leaguemembersCreateWithoutLeaguesInput[] | leaguemembersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutLeaguesInput | leaguemembersCreateOrConnectWithoutLeaguesInput[]
    upsert?: leaguemembersUpsertWithWhereUniqueWithoutLeaguesInput | leaguemembersUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: leaguemembersCreateManyLeaguesInputEnvelope
    set?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    disconnect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    delete?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    update?: leaguemembersUpdateWithWhereUniqueWithoutLeaguesInput | leaguemembersUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: leaguemembersUpdateManyWithWhereWithoutLeaguesInput | leaguemembersUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: leaguemembersScalarWhereInput | leaguemembersScalarWhereInput[]
  }

  export type leaguemessagesUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguesInput, leaguemessagesUncheckedCreateWithoutLeaguesInput> | leaguemessagesCreateWithoutLeaguesInput[] | leaguemessagesUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguesInput | leaguemessagesCreateOrConnectWithoutLeaguesInput[]
    upsert?: leaguemessagesUpsertWithWhereUniqueWithoutLeaguesInput | leaguemessagesUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: leaguemessagesCreateManyLeaguesInputEnvelope
    set?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    disconnect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    delete?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    update?: leaguemessagesUpdateWithWhereUniqueWithoutLeaguesInput | leaguemessagesUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: leaguemessagesUpdateManyWithWhereWithoutLeaguesInput | leaguemessagesUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: leaguemessagesScalarWhereInput | leaguemessagesScalarWhereInput[]
  }

  export type peopleUpdateOneRequiredWithoutLeaguesNestedInput = {
    create?: XOR<peopleCreateWithoutLeaguesInput, peopleUncheckedCreateWithoutLeaguesInput>
    connectOrCreate?: peopleCreateOrConnectWithoutLeaguesInput
    upsert?: peopleUpsertWithoutLeaguesInput
    connect?: peopleWhereUniqueInput
    update?: XOR<XOR<peopleUpdateToOneWithWhereWithoutLeaguesInput, peopleUpdateWithoutLeaguesInput>, peopleUncheckedUpdateWithoutLeaguesInput>
  }

  export type leaguesUpdateOneWithoutFuture_leaguesNestedInput = {
    create?: XOR<leaguesCreateWithoutFuture_leaguesInput, leaguesUncheckedCreateWithoutFuture_leaguesInput>
    connectOrCreate?: leaguesCreateOrConnectWithoutFuture_leaguesInput
    upsert?: leaguesUpsertWithoutFuture_leaguesInput
    disconnect?: leaguesWhereInput | boolean
    delete?: leaguesWhereInput | boolean
    connect?: leaguesWhereUniqueInput
    update?: XOR<XOR<leaguesUpdateToOneWithWhereWithoutFuture_leaguesInput, leaguesUpdateWithoutFuture_leaguesInput>, leaguesUncheckedUpdateWithoutFuture_leaguesInput>
  }

  export type leaguesUpdateManyWithoutPrior_leagueNestedInput = {
    create?: XOR<leaguesCreateWithoutPrior_leagueInput, leaguesUncheckedCreateWithoutPrior_leagueInput> | leaguesCreateWithoutPrior_leagueInput[] | leaguesUncheckedCreateWithoutPrior_leagueInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPrior_leagueInput | leaguesCreateOrConnectWithoutPrior_leagueInput[]
    upsert?: leaguesUpsertWithWhereUniqueWithoutPrior_leagueInput | leaguesUpsertWithWhereUniqueWithoutPrior_leagueInput[]
    createMany?: leaguesCreateManyPrior_leagueInputEnvelope
    set?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    disconnect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    delete?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    update?: leaguesUpdateWithWhereUniqueWithoutPrior_leagueInput | leaguesUpdateWithWhereUniqueWithoutPrior_leagueInput[]
    updateMany?: leaguesUpdateManyWithWhereWithoutPrior_leagueInput | leaguesUpdateManyWithWhereWithoutPrior_leagueInput[]
    deleteMany?: leaguesScalarWhereInput | leaguesScalarWhereInput[]
  }

  export type EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<EmailLogsCreateWithoutLeaguesInput, EmailLogsUncheckedCreateWithoutLeaguesInput> | EmailLogsCreateWithoutLeaguesInput[] | EmailLogsUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: EmailLogsCreateOrConnectWithoutLeaguesInput | EmailLogsCreateOrConnectWithoutLeaguesInput[]
    upsert?: EmailLogsUpsertWithWhereUniqueWithoutLeaguesInput | EmailLogsUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: EmailLogsCreateManyLeaguesInputEnvelope
    set?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    disconnect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    delete?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    connect?: EmailLogsWhereUniqueInput | EmailLogsWhereUniqueInput[]
    update?: EmailLogsUpdateWithWhereUniqueWithoutLeaguesInput | EmailLogsUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: EmailLogsUpdateManyWithWhereWithoutLeaguesInput | EmailLogsUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: EmailLogsScalarWhereInput | EmailLogsScalarWhereInput[]
  }

  export type WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<WeekWinnersCreateWithoutLeaguesInput, WeekWinnersUncheckedCreateWithoutLeaguesInput> | WeekWinnersCreateWithoutLeaguesInput[] | WeekWinnersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: WeekWinnersCreateOrConnectWithoutLeaguesInput | WeekWinnersCreateOrConnectWithoutLeaguesInput[]
    upsert?: WeekWinnersUpsertWithWhereUniqueWithoutLeaguesInput | WeekWinnersUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: WeekWinnersCreateManyLeaguesInputEnvelope
    set?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    disconnect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    delete?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    connect?: WeekWinnersWhereUniqueInput | WeekWinnersWhereUniqueInput[]
    update?: WeekWinnersUpdateWithWhereUniqueWithoutLeaguesInput | WeekWinnersUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: WeekWinnersUpdateManyWithWhereWithoutLeaguesInput | WeekWinnersUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: WeekWinnersScalarWhereInput | WeekWinnersScalarWhereInput[]
  }

  export type leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<leaguemembersCreateWithoutLeaguesInput, leaguemembersUncheckedCreateWithoutLeaguesInput> | leaguemembersCreateWithoutLeaguesInput[] | leaguemembersUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutLeaguesInput | leaguemembersCreateOrConnectWithoutLeaguesInput[]
    upsert?: leaguemembersUpsertWithWhereUniqueWithoutLeaguesInput | leaguemembersUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: leaguemembersCreateManyLeaguesInputEnvelope
    set?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    disconnect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    delete?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    update?: leaguemembersUpdateWithWhereUniqueWithoutLeaguesInput | leaguemembersUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: leaguemembersUpdateManyWithWhereWithoutLeaguesInput | leaguemembersUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: leaguemembersScalarWhereInput | leaguemembersScalarWhereInput[]
  }

  export type leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput = {
    create?: XOR<leaguemessagesCreateWithoutLeaguesInput, leaguemessagesUncheckedCreateWithoutLeaguesInput> | leaguemessagesCreateWithoutLeaguesInput[] | leaguemessagesUncheckedCreateWithoutLeaguesInput[]
    connectOrCreate?: leaguemessagesCreateOrConnectWithoutLeaguesInput | leaguemessagesCreateOrConnectWithoutLeaguesInput[]
    upsert?: leaguemessagesUpsertWithWhereUniqueWithoutLeaguesInput | leaguemessagesUpsertWithWhereUniqueWithoutLeaguesInput[]
    createMany?: leaguemessagesCreateManyLeaguesInputEnvelope
    set?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    disconnect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    delete?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    connect?: leaguemessagesWhereUniqueInput | leaguemessagesWhereUniqueInput[]
    update?: leaguemessagesUpdateWithWhereUniqueWithoutLeaguesInput | leaguemessagesUpdateWithWhereUniqueWithoutLeaguesInput[]
    updateMany?: leaguemessagesUpdateManyWithWhereWithoutLeaguesInput | leaguemessagesUpdateManyWithWhereWithoutLeaguesInput[]
    deleteMany?: leaguemessagesScalarWhereInput | leaguemessagesScalarWhereInput[]
  }

  export type leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput = {
    create?: XOR<leaguesCreateWithoutPrior_leagueInput, leaguesUncheckedCreateWithoutPrior_leagueInput> | leaguesCreateWithoutPrior_leagueInput[] | leaguesUncheckedCreateWithoutPrior_leagueInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPrior_leagueInput | leaguesCreateOrConnectWithoutPrior_leagueInput[]
    upsert?: leaguesUpsertWithWhereUniqueWithoutPrior_leagueInput | leaguesUpsertWithWhereUniqueWithoutPrior_leagueInput[]
    createMany?: leaguesCreateManyPrior_leagueInputEnvelope
    set?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    disconnect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    delete?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    update?: leaguesUpdateWithWhereUniqueWithoutPrior_leagueInput | leaguesUpdateWithWhereUniqueWithoutPrior_leagueInput[]
    updateMany?: leaguesUpdateManyWithWhereWithoutPrior_leagueInput | leaguesUpdateManyWithWhereWithoutPrior_leagueInput[]
    deleteMany?: leaguesScalarWhereInput | leaguesScalarWhereInput[]
  }

  export type leaguemembersCreateNestedManyWithoutPeopleInput = {
    create?: XOR<leaguemembersCreateWithoutPeopleInput, leaguemembersUncheckedCreateWithoutPeopleInput> | leaguemembersCreateWithoutPeopleInput[] | leaguemembersUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutPeopleInput | leaguemembersCreateOrConnectWithoutPeopleInput[]
    createMany?: leaguemembersCreateManyPeopleInputEnvelope
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
  }

  export type leaguesCreateNestedManyWithoutPeopleInput = {
    create?: XOR<leaguesCreateWithoutPeopleInput, leaguesUncheckedCreateWithoutPeopleInput> | leaguesCreateWithoutPeopleInput[] | leaguesUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPeopleInput | leaguesCreateOrConnectWithoutPeopleInput[]
    createMany?: leaguesCreateManyPeopleInputEnvelope
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
  }

  export type picksCreateNestedManyWithoutPeopleInput = {
    create?: XOR<picksCreateWithoutPeopleInput, picksUncheckedCreateWithoutPeopleInput> | picksCreateWithoutPeopleInput[] | picksUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: picksCreateOrConnectWithoutPeopleInput | picksCreateOrConnectWithoutPeopleInput[]
    createMany?: picksCreateManyPeopleInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type leaguemembersUncheckedCreateNestedManyWithoutPeopleInput = {
    create?: XOR<leaguemembersCreateWithoutPeopleInput, leaguemembersUncheckedCreateWithoutPeopleInput> | leaguemembersCreateWithoutPeopleInput[] | leaguemembersUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutPeopleInput | leaguemembersCreateOrConnectWithoutPeopleInput[]
    createMany?: leaguemembersCreateManyPeopleInputEnvelope
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
  }

  export type leaguesUncheckedCreateNestedManyWithoutPeopleInput = {
    create?: XOR<leaguesCreateWithoutPeopleInput, leaguesUncheckedCreateWithoutPeopleInput> | leaguesCreateWithoutPeopleInput[] | leaguesUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPeopleInput | leaguesCreateOrConnectWithoutPeopleInput[]
    createMany?: leaguesCreateManyPeopleInputEnvelope
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
  }

  export type picksUncheckedCreateNestedManyWithoutPeopleInput = {
    create?: XOR<picksCreateWithoutPeopleInput, picksUncheckedCreateWithoutPeopleInput> | picksCreateWithoutPeopleInput[] | picksUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: picksCreateOrConnectWithoutPeopleInput | picksCreateOrConnectWithoutPeopleInput[]
    createMany?: picksCreateManyPeopleInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type leaguemembersUpdateManyWithoutPeopleNestedInput = {
    create?: XOR<leaguemembersCreateWithoutPeopleInput, leaguemembersUncheckedCreateWithoutPeopleInput> | leaguemembersCreateWithoutPeopleInput[] | leaguemembersUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutPeopleInput | leaguemembersCreateOrConnectWithoutPeopleInput[]
    upsert?: leaguemembersUpsertWithWhereUniqueWithoutPeopleInput | leaguemembersUpsertWithWhereUniqueWithoutPeopleInput[]
    createMany?: leaguemembersCreateManyPeopleInputEnvelope
    set?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    disconnect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    delete?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    update?: leaguemembersUpdateWithWhereUniqueWithoutPeopleInput | leaguemembersUpdateWithWhereUniqueWithoutPeopleInput[]
    updateMany?: leaguemembersUpdateManyWithWhereWithoutPeopleInput | leaguemembersUpdateManyWithWhereWithoutPeopleInput[]
    deleteMany?: leaguemembersScalarWhereInput | leaguemembersScalarWhereInput[]
  }

  export type leaguesUpdateManyWithoutPeopleNestedInput = {
    create?: XOR<leaguesCreateWithoutPeopleInput, leaguesUncheckedCreateWithoutPeopleInput> | leaguesCreateWithoutPeopleInput[] | leaguesUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPeopleInput | leaguesCreateOrConnectWithoutPeopleInput[]
    upsert?: leaguesUpsertWithWhereUniqueWithoutPeopleInput | leaguesUpsertWithWhereUniqueWithoutPeopleInput[]
    createMany?: leaguesCreateManyPeopleInputEnvelope
    set?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    disconnect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    delete?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    update?: leaguesUpdateWithWhereUniqueWithoutPeopleInput | leaguesUpdateWithWhereUniqueWithoutPeopleInput[]
    updateMany?: leaguesUpdateManyWithWhereWithoutPeopleInput | leaguesUpdateManyWithWhereWithoutPeopleInput[]
    deleteMany?: leaguesScalarWhereInput | leaguesScalarWhereInput[]
  }

  export type picksUpdateManyWithoutPeopleNestedInput = {
    create?: XOR<picksCreateWithoutPeopleInput, picksUncheckedCreateWithoutPeopleInput> | picksCreateWithoutPeopleInput[] | picksUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: picksCreateOrConnectWithoutPeopleInput | picksCreateOrConnectWithoutPeopleInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutPeopleInput | picksUpsertWithWhereUniqueWithoutPeopleInput[]
    createMany?: picksCreateManyPeopleInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutPeopleInput | picksUpdateWithWhereUniqueWithoutPeopleInput[]
    updateMany?: picksUpdateManyWithWhereWithoutPeopleInput | picksUpdateManyWithWhereWithoutPeopleInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type leaguemembersUncheckedUpdateManyWithoutPeopleNestedInput = {
    create?: XOR<leaguemembersCreateWithoutPeopleInput, leaguemembersUncheckedCreateWithoutPeopleInput> | leaguemembersCreateWithoutPeopleInput[] | leaguemembersUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguemembersCreateOrConnectWithoutPeopleInput | leaguemembersCreateOrConnectWithoutPeopleInput[]
    upsert?: leaguemembersUpsertWithWhereUniqueWithoutPeopleInput | leaguemembersUpsertWithWhereUniqueWithoutPeopleInput[]
    createMany?: leaguemembersCreateManyPeopleInputEnvelope
    set?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    disconnect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    delete?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    connect?: leaguemembersWhereUniqueInput | leaguemembersWhereUniqueInput[]
    update?: leaguemembersUpdateWithWhereUniqueWithoutPeopleInput | leaguemembersUpdateWithWhereUniqueWithoutPeopleInput[]
    updateMany?: leaguemembersUpdateManyWithWhereWithoutPeopleInput | leaguemembersUpdateManyWithWhereWithoutPeopleInput[]
    deleteMany?: leaguemembersScalarWhereInput | leaguemembersScalarWhereInput[]
  }

  export type leaguesUncheckedUpdateManyWithoutPeopleNestedInput = {
    create?: XOR<leaguesCreateWithoutPeopleInput, leaguesUncheckedCreateWithoutPeopleInput> | leaguesCreateWithoutPeopleInput[] | leaguesUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: leaguesCreateOrConnectWithoutPeopleInput | leaguesCreateOrConnectWithoutPeopleInput[]
    upsert?: leaguesUpsertWithWhereUniqueWithoutPeopleInput | leaguesUpsertWithWhereUniqueWithoutPeopleInput[]
    createMany?: leaguesCreateManyPeopleInputEnvelope
    set?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    disconnect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    delete?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    connect?: leaguesWhereUniqueInput | leaguesWhereUniqueInput[]
    update?: leaguesUpdateWithWhereUniqueWithoutPeopleInput | leaguesUpdateWithWhereUniqueWithoutPeopleInput[]
    updateMany?: leaguesUpdateManyWithWhereWithoutPeopleInput | leaguesUpdateManyWithWhereWithoutPeopleInput[]
    deleteMany?: leaguesScalarWhereInput | leaguesScalarWhereInput[]
  }

  export type picksUncheckedUpdateManyWithoutPeopleNestedInput = {
    create?: XOR<picksCreateWithoutPeopleInput, picksUncheckedCreateWithoutPeopleInput> | picksCreateWithoutPeopleInput[] | picksUncheckedCreateWithoutPeopleInput[]
    connectOrCreate?: picksCreateOrConnectWithoutPeopleInput | picksCreateOrConnectWithoutPeopleInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutPeopleInput | picksUpsertWithWhereUniqueWithoutPeopleInput[]
    createMany?: picksCreateManyPeopleInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutPeopleInput | picksUpdateWithWhereUniqueWithoutPeopleInput[]
    updateMany?: picksUpdateManyWithWhereWithoutPeopleInput | picksUpdateManyWithWhereWithoutPeopleInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type gamesCreateNestedOneWithoutPicksInput = {
    create?: XOR<gamesCreateWithoutPicksInput, gamesUncheckedCreateWithoutPicksInput>
    connectOrCreate?: gamesCreateOrConnectWithoutPicksInput
    connect?: gamesWhereUniqueInput
  }

  export type peopleCreateNestedOneWithoutPicksInput = {
    create?: XOR<peopleCreateWithoutPicksInput, peopleUncheckedCreateWithoutPicksInput>
    connectOrCreate?: peopleCreateOrConnectWithoutPicksInput
    connect?: peopleWhereUniqueInput
  }

  export type leaguemembersCreateNestedOneWithoutPicksInput = {
    create?: XOR<leaguemembersCreateWithoutPicksInput, leaguemembersUncheckedCreateWithoutPicksInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutPicksInput
    connect?: leaguemembersWhereUniqueInput
  }

  export type teamsCreateNestedOneWithoutPicksInput = {
    create?: XOR<teamsCreateWithoutPicksInput, teamsUncheckedCreateWithoutPicksInput>
    connectOrCreate?: teamsCreateOrConnectWithoutPicksInput
    connect?: teamsWhereUniqueInput
  }

  export type gamesUpdateOneRequiredWithoutPicksNestedInput = {
    create?: XOR<gamesCreateWithoutPicksInput, gamesUncheckedCreateWithoutPicksInput>
    connectOrCreate?: gamesCreateOrConnectWithoutPicksInput
    upsert?: gamesUpsertWithoutPicksInput
    connect?: gamesWhereUniqueInput
    update?: XOR<XOR<gamesUpdateToOneWithWhereWithoutPicksInput, gamesUpdateWithoutPicksInput>, gamesUncheckedUpdateWithoutPicksInput>
  }

  export type peopleUpdateOneRequiredWithoutPicksNestedInput = {
    create?: XOR<peopleCreateWithoutPicksInput, peopleUncheckedCreateWithoutPicksInput>
    connectOrCreate?: peopleCreateOrConnectWithoutPicksInput
    upsert?: peopleUpsertWithoutPicksInput
    connect?: peopleWhereUniqueInput
    update?: XOR<XOR<peopleUpdateToOneWithWhereWithoutPicksInput, peopleUpdateWithoutPicksInput>, peopleUncheckedUpdateWithoutPicksInput>
  }

  export type leaguemembersUpdateOneWithoutPicksNestedInput = {
    create?: XOR<leaguemembersCreateWithoutPicksInput, leaguemembersUncheckedCreateWithoutPicksInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutPicksInput
    upsert?: leaguemembersUpsertWithoutPicksInput
    disconnect?: leaguemembersWhereInput | boolean
    delete?: leaguemembersWhereInput | boolean
    connect?: leaguemembersWhereUniqueInput
    update?: XOR<XOR<leaguemembersUpdateToOneWithWhereWithoutPicksInput, leaguemembersUpdateWithoutPicksInput>, leaguemembersUncheckedUpdateWithoutPicksInput>
  }

  export type teamsUpdateOneWithoutPicksNestedInput = {
    create?: XOR<teamsCreateWithoutPicksInput, teamsUncheckedCreateWithoutPicksInput>
    connectOrCreate?: teamsCreateOrConnectWithoutPicksInput
    upsert?: teamsUpsertWithoutPicksInput
    disconnect?: teamsWhereInput | boolean
    delete?: teamsWhereInput | boolean
    connect?: teamsWhereUniqueInput
    update?: XOR<XOR<teamsUpdateToOneWithWhereWithoutPicksInput, teamsUpdateWithoutPicksInput>, teamsUncheckedUpdateWithoutPicksInput>
  }

  export type teamsCreateNestedOneWithoutSuperbowl_superbowl_loserToteamsInput = {
    create?: XOR<teamsCreateWithoutSuperbowl_superbowl_loserToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_loserToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutSuperbowl_superbowl_loserToteamsInput
    connect?: teamsWhereUniqueInput
  }

  export type leaguemembersCreateNestedOneWithoutSuperbowlInput = {
    create?: XOR<leaguemembersCreateWithoutSuperbowlInput, leaguemembersUncheckedCreateWithoutSuperbowlInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutSuperbowlInput
    connect?: leaguemembersWhereUniqueInput
  }

  export type teamsCreateNestedOneWithoutSuperbowl_superbowl_winnerToteamsInput = {
    create?: XOR<teamsCreateWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_winnerToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutSuperbowl_superbowl_winnerToteamsInput
    connect?: teamsWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type teamsUpdateOneRequiredWithoutSuperbowl_superbowl_loserToteamsNestedInput = {
    create?: XOR<teamsCreateWithoutSuperbowl_superbowl_loserToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_loserToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutSuperbowl_superbowl_loserToteamsInput
    upsert?: teamsUpsertWithoutSuperbowl_superbowl_loserToteamsInput
    connect?: teamsWhereUniqueInput
    update?: XOR<XOR<teamsUpdateToOneWithWhereWithoutSuperbowl_superbowl_loserToteamsInput, teamsUpdateWithoutSuperbowl_superbowl_loserToteamsInput>, teamsUncheckedUpdateWithoutSuperbowl_superbowl_loserToteamsInput>
  }

  export type leaguemembersUpdateOneWithoutSuperbowlNestedInput = {
    create?: XOR<leaguemembersCreateWithoutSuperbowlInput, leaguemembersUncheckedCreateWithoutSuperbowlInput>
    connectOrCreate?: leaguemembersCreateOrConnectWithoutSuperbowlInput
    upsert?: leaguemembersUpsertWithoutSuperbowlInput
    disconnect?: leaguemembersWhereInput | boolean
    delete?: leaguemembersWhereInput | boolean
    connect?: leaguemembersWhereUniqueInput
    update?: XOR<XOR<leaguemembersUpdateToOneWithWhereWithoutSuperbowlInput, leaguemembersUpdateWithoutSuperbowlInput>, leaguemembersUncheckedUpdateWithoutSuperbowlInput>
  }

  export type teamsUpdateOneRequiredWithoutSuperbowl_superbowl_winnerToteamsNestedInput = {
    create?: XOR<teamsCreateWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_winnerToteamsInput>
    connectOrCreate?: teamsCreateOrConnectWithoutSuperbowl_superbowl_winnerToteamsInput
    upsert?: teamsUpsertWithoutSuperbowl_superbowl_winnerToteamsInput
    connect?: teamsWhereUniqueInput
    update?: XOR<XOR<teamsUpdateToOneWithWhereWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUpdateWithoutSuperbowl_superbowl_winnerToteamsInput>, teamsUncheckedUpdateWithoutSuperbowl_superbowl_winnerToteamsInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type gamesCreateNestedManyWithoutTeams_games_homeToteamsInput = {
    create?: XOR<gamesCreateWithoutTeams_games_homeToteamsInput, gamesUncheckedCreateWithoutTeams_games_homeToteamsInput> | gamesCreateWithoutTeams_games_homeToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_homeToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_homeToteamsInput | gamesCreateOrConnectWithoutTeams_games_homeToteamsInput[]
    createMany?: gamesCreateManyTeams_games_homeToteamsInputEnvelope
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
  }

  export type gamesCreateNestedManyWithoutTeams_games_awayToteamsInput = {
    create?: XOR<gamesCreateWithoutTeams_games_awayToteamsInput, gamesUncheckedCreateWithoutTeams_games_awayToteamsInput> | gamesCreateWithoutTeams_games_awayToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_awayToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_awayToteamsInput | gamesCreateOrConnectWithoutTeams_games_awayToteamsInput[]
    createMany?: gamesCreateManyTeams_games_awayToteamsInputEnvelope
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
  }

  export type picksCreateNestedManyWithoutTeamsInput = {
    create?: XOR<picksCreateWithoutTeamsInput, picksUncheckedCreateWithoutTeamsInput> | picksCreateWithoutTeamsInput[] | picksUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: picksCreateOrConnectWithoutTeamsInput | picksCreateOrConnectWithoutTeamsInput[]
    createMany?: picksCreateManyTeamsInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type superbowlCreateNestedManyWithoutTeams_superbowl_loserToteamsInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput> | superbowlCreateWithoutTeams_superbowl_loserToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_loserToteamsInputEnvelope
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
  }

  export type superbowlCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput> | superbowlCreateWithoutTeams_superbowl_winnerToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_winnerToteamsInputEnvelope
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
  }

  export type gamesUncheckedCreateNestedManyWithoutTeams_games_homeToteamsInput = {
    create?: XOR<gamesCreateWithoutTeams_games_homeToteamsInput, gamesUncheckedCreateWithoutTeams_games_homeToteamsInput> | gamesCreateWithoutTeams_games_homeToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_homeToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_homeToteamsInput | gamesCreateOrConnectWithoutTeams_games_homeToteamsInput[]
    createMany?: gamesCreateManyTeams_games_homeToteamsInputEnvelope
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
  }

  export type gamesUncheckedCreateNestedManyWithoutTeams_games_awayToteamsInput = {
    create?: XOR<gamesCreateWithoutTeams_games_awayToteamsInput, gamesUncheckedCreateWithoutTeams_games_awayToteamsInput> | gamesCreateWithoutTeams_games_awayToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_awayToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_awayToteamsInput | gamesCreateOrConnectWithoutTeams_games_awayToteamsInput[]
    createMany?: gamesCreateManyTeams_games_awayToteamsInputEnvelope
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
  }

  export type picksUncheckedCreateNestedManyWithoutTeamsInput = {
    create?: XOR<picksCreateWithoutTeamsInput, picksUncheckedCreateWithoutTeamsInput> | picksCreateWithoutTeamsInput[] | picksUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: picksCreateOrConnectWithoutTeamsInput | picksCreateOrConnectWithoutTeamsInput[]
    createMany?: picksCreateManyTeamsInputEnvelope
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
  }

  export type superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_loserToteamsInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput> | superbowlCreateWithoutTeams_superbowl_loserToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_loserToteamsInputEnvelope
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
  }

  export type superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput> | superbowlCreateWithoutTeams_superbowl_winnerToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_winnerToteamsInputEnvelope
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
  }

  export type gamesUpdateManyWithoutTeams_games_homeToteamsNestedInput = {
    create?: XOR<gamesCreateWithoutTeams_games_homeToteamsInput, gamesUncheckedCreateWithoutTeams_games_homeToteamsInput> | gamesCreateWithoutTeams_games_homeToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_homeToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_homeToteamsInput | gamesCreateOrConnectWithoutTeams_games_homeToteamsInput[]
    upsert?: gamesUpsertWithWhereUniqueWithoutTeams_games_homeToteamsInput | gamesUpsertWithWhereUniqueWithoutTeams_games_homeToteamsInput[]
    createMany?: gamesCreateManyTeams_games_homeToteamsInputEnvelope
    set?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    disconnect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    delete?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    update?: gamesUpdateWithWhereUniqueWithoutTeams_games_homeToteamsInput | gamesUpdateWithWhereUniqueWithoutTeams_games_homeToteamsInput[]
    updateMany?: gamesUpdateManyWithWhereWithoutTeams_games_homeToteamsInput | gamesUpdateManyWithWhereWithoutTeams_games_homeToteamsInput[]
    deleteMany?: gamesScalarWhereInput | gamesScalarWhereInput[]
  }

  export type gamesUpdateManyWithoutTeams_games_awayToteamsNestedInput = {
    create?: XOR<gamesCreateWithoutTeams_games_awayToteamsInput, gamesUncheckedCreateWithoutTeams_games_awayToteamsInput> | gamesCreateWithoutTeams_games_awayToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_awayToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_awayToteamsInput | gamesCreateOrConnectWithoutTeams_games_awayToteamsInput[]
    upsert?: gamesUpsertWithWhereUniqueWithoutTeams_games_awayToteamsInput | gamesUpsertWithWhereUniqueWithoutTeams_games_awayToteamsInput[]
    createMany?: gamesCreateManyTeams_games_awayToteamsInputEnvelope
    set?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    disconnect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    delete?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    update?: gamesUpdateWithWhereUniqueWithoutTeams_games_awayToteamsInput | gamesUpdateWithWhereUniqueWithoutTeams_games_awayToteamsInput[]
    updateMany?: gamesUpdateManyWithWhereWithoutTeams_games_awayToteamsInput | gamesUpdateManyWithWhereWithoutTeams_games_awayToteamsInput[]
    deleteMany?: gamesScalarWhereInput | gamesScalarWhereInput[]
  }

  export type picksUpdateManyWithoutTeamsNestedInput = {
    create?: XOR<picksCreateWithoutTeamsInput, picksUncheckedCreateWithoutTeamsInput> | picksCreateWithoutTeamsInput[] | picksUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: picksCreateOrConnectWithoutTeamsInput | picksCreateOrConnectWithoutTeamsInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutTeamsInput | picksUpsertWithWhereUniqueWithoutTeamsInput[]
    createMany?: picksCreateManyTeamsInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutTeamsInput | picksUpdateWithWhereUniqueWithoutTeamsInput[]
    updateMany?: picksUpdateManyWithWhereWithoutTeamsInput | picksUpdateManyWithWhereWithoutTeamsInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type superbowlUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput> | superbowlCreateWithoutTeams_superbowl_loserToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput[]
    upsert?: superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput | superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_loserToteamsInputEnvelope
    set?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    disconnect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    delete?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    update?: superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput | superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput[]
    updateMany?: superbowlUpdateManyWithWhereWithoutTeams_superbowl_loserToteamsInput | superbowlUpdateManyWithWhereWithoutTeams_superbowl_loserToteamsInput[]
    deleteMany?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
  }

  export type superbowlUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput> | superbowlCreateWithoutTeams_superbowl_winnerToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput[]
    upsert?: superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput | superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_winnerToteamsInputEnvelope
    set?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    disconnect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    delete?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    update?: superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput | superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput[]
    updateMany?: superbowlUpdateManyWithWhereWithoutTeams_superbowl_winnerToteamsInput | superbowlUpdateManyWithWhereWithoutTeams_superbowl_winnerToteamsInput[]
    deleteMany?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
  }

  export type gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsNestedInput = {
    create?: XOR<gamesCreateWithoutTeams_games_homeToteamsInput, gamesUncheckedCreateWithoutTeams_games_homeToteamsInput> | gamesCreateWithoutTeams_games_homeToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_homeToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_homeToteamsInput | gamesCreateOrConnectWithoutTeams_games_homeToteamsInput[]
    upsert?: gamesUpsertWithWhereUniqueWithoutTeams_games_homeToteamsInput | gamesUpsertWithWhereUniqueWithoutTeams_games_homeToteamsInput[]
    createMany?: gamesCreateManyTeams_games_homeToteamsInputEnvelope
    set?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    disconnect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    delete?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    update?: gamesUpdateWithWhereUniqueWithoutTeams_games_homeToteamsInput | gamesUpdateWithWhereUniqueWithoutTeams_games_homeToteamsInput[]
    updateMany?: gamesUpdateManyWithWhereWithoutTeams_games_homeToteamsInput | gamesUpdateManyWithWhereWithoutTeams_games_homeToteamsInput[]
    deleteMany?: gamesScalarWhereInput | gamesScalarWhereInput[]
  }

  export type gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsNestedInput = {
    create?: XOR<gamesCreateWithoutTeams_games_awayToteamsInput, gamesUncheckedCreateWithoutTeams_games_awayToteamsInput> | gamesCreateWithoutTeams_games_awayToteamsInput[] | gamesUncheckedCreateWithoutTeams_games_awayToteamsInput[]
    connectOrCreate?: gamesCreateOrConnectWithoutTeams_games_awayToteamsInput | gamesCreateOrConnectWithoutTeams_games_awayToteamsInput[]
    upsert?: gamesUpsertWithWhereUniqueWithoutTeams_games_awayToteamsInput | gamesUpsertWithWhereUniqueWithoutTeams_games_awayToteamsInput[]
    createMany?: gamesCreateManyTeams_games_awayToteamsInputEnvelope
    set?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    disconnect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    delete?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    connect?: gamesWhereUniqueInput | gamesWhereUniqueInput[]
    update?: gamesUpdateWithWhereUniqueWithoutTeams_games_awayToteamsInput | gamesUpdateWithWhereUniqueWithoutTeams_games_awayToteamsInput[]
    updateMany?: gamesUpdateManyWithWhereWithoutTeams_games_awayToteamsInput | gamesUpdateManyWithWhereWithoutTeams_games_awayToteamsInput[]
    deleteMany?: gamesScalarWhereInput | gamesScalarWhereInput[]
  }

  export type picksUncheckedUpdateManyWithoutTeamsNestedInput = {
    create?: XOR<picksCreateWithoutTeamsInput, picksUncheckedCreateWithoutTeamsInput> | picksCreateWithoutTeamsInput[] | picksUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: picksCreateOrConnectWithoutTeamsInput | picksCreateOrConnectWithoutTeamsInput[]
    upsert?: picksUpsertWithWhereUniqueWithoutTeamsInput | picksUpsertWithWhereUniqueWithoutTeamsInput[]
    createMany?: picksCreateManyTeamsInputEnvelope
    set?: picksWhereUniqueInput | picksWhereUniqueInput[]
    disconnect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    delete?: picksWhereUniqueInput | picksWhereUniqueInput[]
    connect?: picksWhereUniqueInput | picksWhereUniqueInput[]
    update?: picksUpdateWithWhereUniqueWithoutTeamsInput | picksUpdateWithWhereUniqueWithoutTeamsInput[]
    updateMany?: picksUpdateManyWithWhereWithoutTeamsInput | picksUpdateManyWithWhereWithoutTeamsInput[]
    deleteMany?: picksScalarWhereInput | picksScalarWhereInput[]
  }

  export type superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput> | superbowlCreateWithoutTeams_superbowl_loserToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput[]
    upsert?: superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput | superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_loserToteamsInputEnvelope
    set?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    disconnect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    delete?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    update?: superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput | superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput[]
    updateMany?: superbowlUpdateManyWithWhereWithoutTeams_superbowl_loserToteamsInput | superbowlUpdateManyWithWhereWithoutTeams_superbowl_loserToteamsInput[]
    deleteMany?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
  }

  export type superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput = {
    create?: XOR<superbowlCreateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput> | superbowlCreateWithoutTeams_superbowl_winnerToteamsInput[] | superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput[]
    connectOrCreate?: superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput | superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput[]
    upsert?: superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput | superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput[]
    createMany?: superbowlCreateManyTeams_superbowl_winnerToteamsInputEnvelope
    set?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    disconnect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    delete?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    connect?: superbowlWhereUniqueInput | superbowlWhereUniqueInput[]
    update?: superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput | superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput[]
    updateMany?: superbowlUpdateManyWithWhereWithoutTeams_superbowl_winnerToteamsInput | superbowlUpdateManyWithWhereWithoutTeams_superbowl_winnerToteamsInput[]
    deleteMany?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumEmailTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailType | EnumEmailTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailTypeFilter<$PrismaModel> | $Enums.EmailType
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumEmailTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailType | EnumEmailTypeFieldRefInput<$PrismaModel>
    in?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailType[] | ListEnumEmailTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailTypeWithAggregatesFilter<$PrismaModel> | $Enums.EmailType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEmailTypeFilter<$PrismaModel>
    _max?: NestedEnumEmailTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumMemberRoleNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MemberRole | EnumMemberRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMemberRoleNullableFilter<$PrismaModel> | $Enums.MemberRole | null
  }

  export type NestedEnumMemberRoleNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemberRole | EnumMemberRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MemberRole[] | ListEnumMemberRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMemberRoleNullableWithAggregatesFilter<$PrismaModel> | $Enums.MemberRole | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumMemberRoleNullableFilter<$PrismaModel>
    _max?: NestedEnumMemberRoleNullableFilter<$PrismaModel>
  }

  export type NestedEnumMessageTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageType | EnumMessageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageTypeFilter<$PrismaModel> | $Enums.MessageType
  }

  export type NestedEnumMessageStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusFilter<$PrismaModel> | $Enums.MessageStatus
  }

  export type NestedEnumMessageTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageType | EnumMessageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageType[] | ListEnumMessageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageTypeWithAggregatesFilter<$PrismaModel> | $Enums.MessageType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageTypeFilter<$PrismaModel>
    _max?: NestedEnumMessageTypeFilter<$PrismaModel>
  }

  export type NestedEnumMessageStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusWithAggregatesFilter<$PrismaModel> | $Enums.MessageStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageStatusFilter<$PrismaModel>
    _max?: NestedEnumMessageStatusFilter<$PrismaModel>
  }

  export type NestedEnumLatePolicyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.LatePolicy | EnumLatePolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLatePolicyNullableFilter<$PrismaModel> | $Enums.LatePolicy | null
  }

  export type NestedEnumPickPolicyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PickPolicy | EnumPickPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPickPolicyNullableFilter<$PrismaModel> | $Enums.PickPolicy | null
  }

  export type NestedEnumReminderPolicyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderPolicy | EnumReminderPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReminderPolicyNullableFilter<$PrismaModel> | $Enums.ReminderPolicy | null
  }

  export type NestedEnumScoringTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringType | EnumScoringTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumScoringTypeNullableFilter<$PrismaModel> | $Enums.ScoringType | null
  }

  export type NestedEnumLeagueStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStatus | EnumLeagueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStatusFilter<$PrismaModel> | $Enums.LeagueStatus
  }

  export type NestedEnumLatePolicyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LatePolicy | EnumLatePolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.LatePolicy[] | ListEnumLatePolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLatePolicyNullableWithAggregatesFilter<$PrismaModel> | $Enums.LatePolicy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumLatePolicyNullableFilter<$PrismaModel>
    _max?: NestedEnumLatePolicyNullableFilter<$PrismaModel>
  }

  export type NestedEnumPickPolicyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PickPolicy | EnumPickPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PickPolicy[] | ListEnumPickPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPickPolicyNullableWithAggregatesFilter<$PrismaModel> | $Enums.PickPolicy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPickPolicyNullableFilter<$PrismaModel>
    _max?: NestedEnumPickPolicyNullableFilter<$PrismaModel>
  }

  export type NestedEnumReminderPolicyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReminderPolicy | EnumReminderPolicyFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReminderPolicy[] | ListEnumReminderPolicyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReminderPolicyNullableWithAggregatesFilter<$PrismaModel> | $Enums.ReminderPolicy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumReminderPolicyNullableFilter<$PrismaModel>
    _max?: NestedEnumReminderPolicyNullableFilter<$PrismaModel>
  }

  export type NestedEnumScoringTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringType | EnumScoringTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ScoringType[] | ListEnumScoringTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumScoringTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.ScoringType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumScoringTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumScoringTypeNullableFilter<$PrismaModel>
  }

  export type NestedEnumLeagueStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStatus | EnumLeagueStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStatus[] | ListEnumLeagueStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeagueStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeagueStatusFilter<$PrismaModel>
    _max?: NestedEnumLeagueStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type leaguesCreateWithoutEmailLogsInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateWithoutEmailLogsInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesCreateOrConnectWithoutEmailLogsInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutEmailLogsInput, leaguesUncheckedCreateWithoutEmailLogsInput>
  }

  export type leaguemembersCreateWithoutEmailLogsInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutEmailLogsInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutEmailLogsInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutEmailLogsInput, leaguemembersUncheckedCreateWithoutEmailLogsInput>
  }

  export type leaguesUpsertWithoutEmailLogsInput = {
    update: XOR<leaguesUpdateWithoutEmailLogsInput, leaguesUncheckedUpdateWithoutEmailLogsInput>
    create: XOR<leaguesCreateWithoutEmailLogsInput, leaguesUncheckedCreateWithoutEmailLogsInput>
    where?: leaguesWhereInput
  }

  export type leaguesUpdateToOneWithWhereWithoutEmailLogsInput = {
    where?: leaguesWhereInput
    data: XOR<leaguesUpdateWithoutEmailLogsInput, leaguesUncheckedUpdateWithoutEmailLogsInput>
  }

  export type leaguesUpdateWithoutEmailLogsInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateWithoutEmailLogsInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguemembersUpsertWithoutEmailLogsInput = {
    update: XOR<leaguemembersUpdateWithoutEmailLogsInput, leaguemembersUncheckedUpdateWithoutEmailLogsInput>
    create: XOR<leaguemembersCreateWithoutEmailLogsInput, leaguemembersUncheckedCreateWithoutEmailLogsInput>
    where?: leaguemembersWhereInput
  }

  export type leaguemembersUpdateToOneWithWhereWithoutEmailLogsInput = {
    where?: leaguemembersWhereInput
    data: XOR<leaguemembersUpdateWithoutEmailLogsInput, leaguemembersUncheckedUpdateWithoutEmailLogsInput>
  }

  export type leaguemembersUpdateWithoutEmailLogsInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutEmailLogsInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguesCreateWithoutWeekWinnersInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateWithoutWeekWinnersInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesCreateOrConnectWithoutWeekWinnersInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutWeekWinnersInput, leaguesUncheckedCreateWithoutWeekWinnersInput>
  }

  export type leaguemembersCreateWithoutWeekWinnersInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutWeekWinnersInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutWeekWinnersInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutWeekWinnersInput, leaguemembersUncheckedCreateWithoutWeekWinnersInput>
  }

  export type leaguesUpsertWithoutWeekWinnersInput = {
    update: XOR<leaguesUpdateWithoutWeekWinnersInput, leaguesUncheckedUpdateWithoutWeekWinnersInput>
    create: XOR<leaguesCreateWithoutWeekWinnersInput, leaguesUncheckedCreateWithoutWeekWinnersInput>
    where?: leaguesWhereInput
  }

  export type leaguesUpdateToOneWithWhereWithoutWeekWinnersInput = {
    where?: leaguesWhereInput
    data: XOR<leaguesUpdateWithoutWeekWinnersInput, leaguesUncheckedUpdateWithoutWeekWinnersInput>
  }

  export type leaguesUpdateWithoutWeekWinnersInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateWithoutWeekWinnersInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguemembersUpsertWithoutWeekWinnersInput = {
    update: XOR<leaguemembersUpdateWithoutWeekWinnersInput, leaguemembersUncheckedUpdateWithoutWeekWinnersInput>
    create: XOR<leaguemembersCreateWithoutWeekWinnersInput, leaguemembersUncheckedCreateWithoutWeekWinnersInput>
    where?: leaguemembersWhereInput
  }

  export type leaguemembersUpdateToOneWithWhereWithoutWeekWinnersInput = {
    where?: leaguemembersWhereInput
    data: XOR<leaguemembersUpdateWithoutWeekWinnersInput, leaguemembersUncheckedUpdateWithoutWeekWinnersInput>
  }

  export type leaguemembersUpdateWithoutWeekWinnersInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutWeekWinnersInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type teamsCreateWithoutGames_games_homeToteamsInput = {
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_awayToteams?: gamesCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsUncheckedCreateWithoutGames_games_homeToteamsInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_awayToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksUncheckedCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsCreateOrConnectWithoutGames_games_homeToteamsInput = {
    where: teamsWhereUniqueInput
    create: XOR<teamsCreateWithoutGames_games_homeToteamsInput, teamsUncheckedCreateWithoutGames_games_homeToteamsInput>
  }

  export type teamsCreateWithoutGames_games_awayToteamsInput = {
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesCreateNestedManyWithoutTeams_games_homeToteamsInput
    picks?: picksCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsUncheckedCreateWithoutGames_games_awayToteamsInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_homeToteamsInput
    picks?: picksUncheckedCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsCreateOrConnectWithoutGames_games_awayToteamsInput = {
    where: teamsWhereUniqueInput
    create: XOR<teamsCreateWithoutGames_games_awayToteamsInput, teamsUncheckedCreateWithoutGames_games_awayToteamsInput>
  }

  export type picksCreateWithoutGamesInput = {
    season: number
    week: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    people: peopleCreateNestedOneWithoutPicksInput
    leaguemembers?: leaguemembersCreateNestedOneWithoutPicksInput
    teams?: teamsCreateNestedOneWithoutPicksInput
  }

  export type picksUncheckedCreateWithoutGamesInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type picksCreateOrConnectWithoutGamesInput = {
    where: picksWhereUniqueInput
    create: XOR<picksCreateWithoutGamesInput, picksUncheckedCreateWithoutGamesInput>
  }

  export type picksCreateManyGamesInputEnvelope = {
    data: picksCreateManyGamesInput | picksCreateManyGamesInput[]
    skipDuplicates?: boolean
  }

  export type teamsUpsertWithoutGames_games_homeToteamsInput = {
    update: XOR<teamsUpdateWithoutGames_games_homeToteamsInput, teamsUncheckedUpdateWithoutGames_games_homeToteamsInput>
    create: XOR<teamsCreateWithoutGames_games_homeToteamsInput, teamsUncheckedCreateWithoutGames_games_homeToteamsInput>
    where?: teamsWhereInput
  }

  export type teamsUpdateToOneWithWhereWithoutGames_games_homeToteamsInput = {
    where?: teamsWhereInput
    data: XOR<teamsUpdateWithoutGames_games_homeToteamsInput, teamsUncheckedUpdateWithoutGames_games_homeToteamsInput>
  }

  export type teamsUpdateWithoutGames_games_homeToteamsInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_awayToteams?: gamesUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsUncheckedUpdateWithoutGames_games_homeToteamsInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_awayToteams?: gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUncheckedUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsUpsertWithoutGames_games_awayToteamsInput = {
    update: XOR<teamsUpdateWithoutGames_games_awayToteamsInput, teamsUncheckedUpdateWithoutGames_games_awayToteamsInput>
    create: XOR<teamsCreateWithoutGames_games_awayToteamsInput, teamsUncheckedCreateWithoutGames_games_awayToteamsInput>
    where?: teamsWhereInput
  }

  export type teamsUpdateToOneWithWhereWithoutGames_games_awayToteamsInput = {
    where?: teamsWhereInput
    data: XOR<teamsUpdateWithoutGames_games_awayToteamsInput, teamsUncheckedUpdateWithoutGames_games_awayToteamsInput>
  }

  export type teamsUpdateWithoutGames_games_awayToteamsInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUpdateManyWithoutTeams_games_homeToteamsNestedInput
    picks?: picksUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsUncheckedUpdateWithoutGames_games_awayToteamsInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsNestedInput
    picks?: picksUncheckedUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type picksUpsertWithWhereUniqueWithoutGamesInput = {
    where: picksWhereUniqueInput
    update: XOR<picksUpdateWithoutGamesInput, picksUncheckedUpdateWithoutGamesInput>
    create: XOR<picksCreateWithoutGamesInput, picksUncheckedCreateWithoutGamesInput>
  }

  export type picksUpdateWithWhereUniqueWithoutGamesInput = {
    where: picksWhereUniqueInput
    data: XOR<picksUpdateWithoutGamesInput, picksUncheckedUpdateWithoutGamesInput>
  }

  export type picksUpdateManyWithWhereWithoutGamesInput = {
    where: picksScalarWhereInput
    data: XOR<picksUpdateManyMutationInput, picksUncheckedUpdateManyWithoutGamesInput>
  }

  export type picksScalarWhereInput = {
    AND?: picksScalarWhereInput | picksScalarWhereInput[]
    OR?: picksScalarWhereInput[]
    NOT?: picksScalarWhereInput | picksScalarWhereInput[]
    pickid?: IntFilter<"picks"> | number
    uid?: IntFilter<"picks"> | number
    season?: IntFilter<"picks"> | number
    week?: IntFilter<"picks"> | number
    gid?: IntFilter<"picks"> | number
    winner?: IntNullableFilter<"picks"> | number | null
    loser?: IntNullableFilter<"picks"> | number | null
    score?: IntNullableFilter<"picks"> | number | null
    ts?: DateTimeFilter<"picks"> | Date | string
    correct?: IntNullableFilter<"picks"> | number | null
    done?: IntNullableFilter<"picks"> | number | null
    is_random?: BoolNullableFilter<"picks"> | boolean | null
    member_id?: IntNullableFilter<"picks"> | number | null
  }

  export type EmailLogsCreateWithoutLeaguemembersInput = {
    email_log_id?: string
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
    leagues: leaguesCreateNestedOneWithoutEmailLogsInput
  }

  export type EmailLogsUncheckedCreateWithoutLeaguemembersInput = {
    email_log_id?: string
    league_id: number
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
  }

  export type EmailLogsCreateOrConnectWithoutLeaguemembersInput = {
    where: EmailLogsWhereUniqueInput
    create: XOR<EmailLogsCreateWithoutLeaguemembersInput, EmailLogsUncheckedCreateWithoutLeaguemembersInput>
  }

  export type EmailLogsCreateManyLeaguemembersInputEnvelope = {
    data: EmailLogsCreateManyLeaguemembersInput | EmailLogsCreateManyLeaguemembersInput[]
    skipDuplicates?: boolean
  }

  export type WeekWinnersCreateWithoutLeaguemembersInput = {
    week: number
    correct_count: number
    score_diff: number
    leagues: leaguesCreateNestedOneWithoutWeekWinnersInput
  }

  export type WeekWinnersUncheckedCreateWithoutLeaguemembersInput = {
    id?: number
    league_id: number
    week: number
    correct_count: number
    score_diff: number
  }

  export type WeekWinnersCreateOrConnectWithoutLeaguemembersInput = {
    where: WeekWinnersWhereUniqueInput
    create: XOR<WeekWinnersCreateWithoutLeaguemembersInput, WeekWinnersUncheckedCreateWithoutLeaguemembersInput>
  }

  export type WeekWinnersCreateManyLeaguemembersInputEnvelope = {
    data: WeekWinnersCreateManyLeaguemembersInput | WeekWinnersCreateManyLeaguemembersInput[]
    skipDuplicates?: boolean
  }

  export type peopleCreateWithoutLeaguemembersInput = {
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leagues?: leaguesCreateNestedManyWithoutPeopleInput
    picks?: picksCreateNestedManyWithoutPeopleInput
  }

  export type peopleUncheckedCreateWithoutLeaguemembersInput = {
    uid?: number
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leagues?: leaguesUncheckedCreateNestedManyWithoutPeopleInput
    picks?: picksUncheckedCreateNestedManyWithoutPeopleInput
  }

  export type peopleCreateOrConnectWithoutLeaguemembersInput = {
    where: peopleWhereUniqueInput
    create: XOR<peopleCreateWithoutLeaguemembersInput, peopleUncheckedCreateWithoutLeaguemembersInput>
  }

  export type leaguesCreateWithoutLeaguemembersInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateWithoutLeaguemembersInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesCreateOrConnectWithoutLeaguemembersInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutLeaguemembersInput, leaguesUncheckedCreateWithoutLeaguemembersInput>
  }

  export type leaguemessagesCreateWithoutLeaguemembersInput = {
    message_id?: string
    content: string
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
    leagues: leaguesCreateNestedOneWithoutLeaguemessagesInput
  }

  export type leaguemessagesUncheckedCreateWithoutLeaguemembersInput = {
    message_id?: string
    content: string
    league_id: number
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
  }

  export type leaguemessagesCreateOrConnectWithoutLeaguemembersInput = {
    where: leaguemessagesWhereUniqueInput
    create: XOR<leaguemessagesCreateWithoutLeaguemembersInput, leaguemessagesUncheckedCreateWithoutLeaguemembersInput>
  }

  export type leaguemessagesCreateManyLeaguemembersInputEnvelope = {
    data: leaguemessagesCreateManyLeaguemembersInput | leaguemessagesCreateManyLeaguemembersInput[]
    skipDuplicates?: boolean
  }

  export type picksCreateWithoutLeaguemembersInput = {
    season: number
    week: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    games: gamesCreateNestedOneWithoutPicksInput
    people: peopleCreateNestedOneWithoutPicksInput
    teams?: teamsCreateNestedOneWithoutPicksInput
  }

  export type picksUncheckedCreateWithoutLeaguemembersInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    gid: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
  }

  export type picksCreateOrConnectWithoutLeaguemembersInput = {
    where: picksWhereUniqueInput
    create: XOR<picksCreateWithoutLeaguemembersInput, picksUncheckedCreateWithoutLeaguemembersInput>
  }

  export type picksCreateManyLeaguemembersInputEnvelope = {
    data: picksCreateManyLeaguemembersInput | picksCreateManyLeaguemembersInput[]
    skipDuplicates?: boolean
  }

  export type superbowlCreateWithoutLeaguemembersInput = {
    uid: number
    score: number
    ts?: Date | string | null
    season?: number | null
    teams_superbowl_loserToteams: teamsCreateNestedOneWithoutSuperbowl_superbowl_loserToteamsInput
    teams_superbowl_winnerToteams: teamsCreateNestedOneWithoutSuperbowl_superbowl_winnerToteamsInput
  }

  export type superbowlUncheckedCreateWithoutLeaguemembersInput = {
    pickid?: number
    uid: number
    winner: number
    loser: number
    score: number
    ts?: Date | string | null
    season?: number | null
  }

  export type superbowlCreateOrConnectWithoutLeaguemembersInput = {
    where: superbowlWhereUniqueInput
    create: XOR<superbowlCreateWithoutLeaguemembersInput, superbowlUncheckedCreateWithoutLeaguemembersInput>
  }

  export type superbowlCreateManyLeaguemembersInputEnvelope = {
    data: superbowlCreateManyLeaguemembersInput | superbowlCreateManyLeaguemembersInput[]
    skipDuplicates?: boolean
  }

  export type EmailLogsUpsertWithWhereUniqueWithoutLeaguemembersInput = {
    where: EmailLogsWhereUniqueInput
    update: XOR<EmailLogsUpdateWithoutLeaguemembersInput, EmailLogsUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<EmailLogsCreateWithoutLeaguemembersInput, EmailLogsUncheckedCreateWithoutLeaguemembersInput>
  }

  export type EmailLogsUpdateWithWhereUniqueWithoutLeaguemembersInput = {
    where: EmailLogsWhereUniqueInput
    data: XOR<EmailLogsUpdateWithoutLeaguemembersInput, EmailLogsUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type EmailLogsUpdateManyWithWhereWithoutLeaguemembersInput = {
    where: EmailLogsScalarWhereInput
    data: XOR<EmailLogsUpdateManyMutationInput, EmailLogsUncheckedUpdateManyWithoutLeaguemembersInput>
  }

  export type EmailLogsScalarWhereInput = {
    AND?: EmailLogsScalarWhereInput | EmailLogsScalarWhereInput[]
    OR?: EmailLogsScalarWhereInput[]
    NOT?: EmailLogsScalarWhereInput | EmailLogsScalarWhereInput[]
    email_log_id?: StringFilter<"EmailLogs"> | string
    league_id?: IntFilter<"EmailLogs"> | number
    member_id?: IntFilter<"EmailLogs"> | number
    email_type?: EnumEmailTypeFilter<"EmailLogs"> | $Enums.EmailType
    ts?: DateTimeFilter<"EmailLogs"> | Date | string
    week?: IntNullableFilter<"EmailLogs"> | number | null
    resend_id?: StringFilter<"EmailLogs"> | string
  }

  export type WeekWinnersUpsertWithWhereUniqueWithoutLeaguemembersInput = {
    where: WeekWinnersWhereUniqueInput
    update: XOR<WeekWinnersUpdateWithoutLeaguemembersInput, WeekWinnersUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<WeekWinnersCreateWithoutLeaguemembersInput, WeekWinnersUncheckedCreateWithoutLeaguemembersInput>
  }

  export type WeekWinnersUpdateWithWhereUniqueWithoutLeaguemembersInput = {
    where: WeekWinnersWhereUniqueInput
    data: XOR<WeekWinnersUpdateWithoutLeaguemembersInput, WeekWinnersUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type WeekWinnersUpdateManyWithWhereWithoutLeaguemembersInput = {
    where: WeekWinnersScalarWhereInput
    data: XOR<WeekWinnersUpdateManyMutationInput, WeekWinnersUncheckedUpdateManyWithoutLeaguemembersInput>
  }

  export type WeekWinnersScalarWhereInput = {
    AND?: WeekWinnersScalarWhereInput | WeekWinnersScalarWhereInput[]
    OR?: WeekWinnersScalarWhereInput[]
    NOT?: WeekWinnersScalarWhereInput | WeekWinnersScalarWhereInput[]
    id?: IntFilter<"WeekWinners"> | number
    league_id?: IntFilter<"WeekWinners"> | number
    membership_id?: IntFilter<"WeekWinners"> | number
    week?: IntFilter<"WeekWinners"> | number
    correct_count?: IntFilter<"WeekWinners"> | number
    score_diff?: IntFilter<"WeekWinners"> | number
  }

  export type peopleUpsertWithoutLeaguemembersInput = {
    update: XOR<peopleUpdateWithoutLeaguemembersInput, peopleUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<peopleCreateWithoutLeaguemembersInput, peopleUncheckedCreateWithoutLeaguemembersInput>
    where?: peopleWhereInput
  }

  export type peopleUpdateToOneWithWhereWithoutLeaguemembersInput = {
    where?: peopleWhereInput
    data: XOR<peopleUpdateWithoutLeaguemembersInput, peopleUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type peopleUpdateWithoutLeaguemembersInput = {
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leagues?: leaguesUpdateManyWithoutPeopleNestedInput
    picks?: picksUpdateManyWithoutPeopleNestedInput
  }

  export type peopleUncheckedUpdateWithoutLeaguemembersInput = {
    uid?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leagues?: leaguesUncheckedUpdateManyWithoutPeopleNestedInput
    picks?: picksUncheckedUpdateManyWithoutPeopleNestedInput
  }

  export type leaguesUpsertWithoutLeaguemembersInput = {
    update: XOR<leaguesUpdateWithoutLeaguemembersInput, leaguesUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<leaguesCreateWithoutLeaguemembersInput, leaguesUncheckedCreateWithoutLeaguemembersInput>
    where?: leaguesWhereInput
  }

  export type leaguesUpdateToOneWithWhereWithoutLeaguemembersInput = {
    where?: leaguesWhereInput
    data: XOR<leaguesUpdateWithoutLeaguemembersInput, leaguesUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type leaguesUpdateWithoutLeaguemembersInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateWithoutLeaguemembersInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguemessagesUpsertWithWhereUniqueWithoutLeaguemembersInput = {
    where: leaguemessagesWhereUniqueInput
    update: XOR<leaguemessagesUpdateWithoutLeaguemembersInput, leaguemessagesUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<leaguemessagesCreateWithoutLeaguemembersInput, leaguemessagesUncheckedCreateWithoutLeaguemembersInput>
  }

  export type leaguemessagesUpdateWithWhereUniqueWithoutLeaguemembersInput = {
    where: leaguemessagesWhereUniqueInput
    data: XOR<leaguemessagesUpdateWithoutLeaguemembersInput, leaguemessagesUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type leaguemessagesUpdateManyWithWhereWithoutLeaguemembersInput = {
    where: leaguemessagesScalarWhereInput
    data: XOR<leaguemessagesUpdateManyMutationInput, leaguemessagesUncheckedUpdateManyWithoutLeaguemembersInput>
  }

  export type leaguemessagesScalarWhereInput = {
    AND?: leaguemessagesScalarWhereInput | leaguemessagesScalarWhereInput[]
    OR?: leaguemessagesScalarWhereInput[]
    NOT?: leaguemessagesScalarWhereInput | leaguemessagesScalarWhereInput[]
    message_id?: StringFilter<"leaguemessages"> | string
    content?: StringFilter<"leaguemessages"> | string
    member_id?: IntFilter<"leaguemessages"> | number
    league_id?: IntFilter<"leaguemessages"> | number
    week?: IntNullableFilter<"leaguemessages"> | number | null
    message_type?: EnumMessageTypeFilter<"leaguemessages"> | $Enums.MessageType
    createdAt?: DateTimeFilter<"leaguemessages"> | Date | string
    status?: EnumMessageStatusFilter<"leaguemessages"> | $Enums.MessageStatus
  }

  export type picksUpsertWithWhereUniqueWithoutLeaguemembersInput = {
    where: picksWhereUniqueInput
    update: XOR<picksUpdateWithoutLeaguemembersInput, picksUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<picksCreateWithoutLeaguemembersInput, picksUncheckedCreateWithoutLeaguemembersInput>
  }

  export type picksUpdateWithWhereUniqueWithoutLeaguemembersInput = {
    where: picksWhereUniqueInput
    data: XOR<picksUpdateWithoutLeaguemembersInput, picksUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type picksUpdateManyWithWhereWithoutLeaguemembersInput = {
    where: picksScalarWhereInput
    data: XOR<picksUpdateManyMutationInput, picksUncheckedUpdateManyWithoutLeaguemembersInput>
  }

  export type superbowlUpsertWithWhereUniqueWithoutLeaguemembersInput = {
    where: superbowlWhereUniqueInput
    update: XOR<superbowlUpdateWithoutLeaguemembersInput, superbowlUncheckedUpdateWithoutLeaguemembersInput>
    create: XOR<superbowlCreateWithoutLeaguemembersInput, superbowlUncheckedCreateWithoutLeaguemembersInput>
  }

  export type superbowlUpdateWithWhereUniqueWithoutLeaguemembersInput = {
    where: superbowlWhereUniqueInput
    data: XOR<superbowlUpdateWithoutLeaguemembersInput, superbowlUncheckedUpdateWithoutLeaguemembersInput>
  }

  export type superbowlUpdateManyWithWhereWithoutLeaguemembersInput = {
    where: superbowlScalarWhereInput
    data: XOR<superbowlUpdateManyMutationInput, superbowlUncheckedUpdateManyWithoutLeaguemembersInput>
  }

  export type superbowlScalarWhereInput = {
    AND?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
    OR?: superbowlScalarWhereInput[]
    NOT?: superbowlScalarWhereInput | superbowlScalarWhereInput[]
    pickid?: IntFilter<"superbowl"> | number
    uid?: IntFilter<"superbowl"> | number
    winner?: IntFilter<"superbowl"> | number
    loser?: IntFilter<"superbowl"> | number
    score?: IntFilter<"superbowl"> | number
    ts?: DateTimeNullableFilter<"superbowl"> | Date | string | null
    season?: IntNullableFilter<"superbowl"> | number | null
    member_id?: IntNullableFilter<"superbowl"> | number | null
  }

  export type leaguesCreateWithoutLeaguemessagesInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateWithoutLeaguemessagesInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesCreateOrConnectWithoutLeaguemessagesInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutLeaguemessagesInput, leaguesUncheckedCreateWithoutLeaguemessagesInput>
  }

  export type leaguemembersCreateWithoutLeaguemessagesInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutLeaguemessagesInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutLeaguemessagesInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutLeaguemessagesInput, leaguemembersUncheckedCreateWithoutLeaguemessagesInput>
  }

  export type leaguesUpsertWithoutLeaguemessagesInput = {
    update: XOR<leaguesUpdateWithoutLeaguemessagesInput, leaguesUncheckedUpdateWithoutLeaguemessagesInput>
    create: XOR<leaguesCreateWithoutLeaguemessagesInput, leaguesUncheckedCreateWithoutLeaguemessagesInput>
    where?: leaguesWhereInput
  }

  export type leaguesUpdateToOneWithWhereWithoutLeaguemessagesInput = {
    where?: leaguesWhereInput
    data: XOR<leaguesUpdateWithoutLeaguemessagesInput, leaguesUncheckedUpdateWithoutLeaguemessagesInput>
  }

  export type leaguesUpdateWithoutLeaguemessagesInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateWithoutLeaguemessagesInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguemembersUpsertWithoutLeaguemessagesInput = {
    update: XOR<leaguemembersUpdateWithoutLeaguemessagesInput, leaguemembersUncheckedUpdateWithoutLeaguemessagesInput>
    create: XOR<leaguemembersCreateWithoutLeaguemessagesInput, leaguemembersUncheckedCreateWithoutLeaguemessagesInput>
    where?: leaguemembersWhereInput
  }

  export type leaguemembersUpdateToOneWithWhereWithoutLeaguemessagesInput = {
    where?: leaguemembersWhereInput
    data: XOR<leaguemembersUpdateWithoutLeaguemessagesInput, leaguemembersUncheckedUpdateWithoutLeaguemessagesInput>
  }

  export type leaguemembersUpdateWithoutLeaguemessagesInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutLeaguemessagesInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type EmailLogsCreateWithoutLeaguesInput = {
    email_log_id?: string
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
    leaguemembers: leaguemembersCreateNestedOneWithoutEmailLogsInput
  }

  export type EmailLogsUncheckedCreateWithoutLeaguesInput = {
    email_log_id?: string
    member_id: number
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
  }

  export type EmailLogsCreateOrConnectWithoutLeaguesInput = {
    where: EmailLogsWhereUniqueInput
    create: XOR<EmailLogsCreateWithoutLeaguesInput, EmailLogsUncheckedCreateWithoutLeaguesInput>
  }

  export type EmailLogsCreateManyLeaguesInputEnvelope = {
    data: EmailLogsCreateManyLeaguesInput | EmailLogsCreateManyLeaguesInput[]
    skipDuplicates?: boolean
  }

  export type WeekWinnersCreateWithoutLeaguesInput = {
    week: number
    correct_count: number
    score_diff: number
    leaguemembers: leaguemembersCreateNestedOneWithoutWeekWinnersInput
  }

  export type WeekWinnersUncheckedCreateWithoutLeaguesInput = {
    id?: number
    membership_id: number
    week: number
    correct_count: number
    score_diff: number
  }

  export type WeekWinnersCreateOrConnectWithoutLeaguesInput = {
    where: WeekWinnersWhereUniqueInput
    create: XOR<WeekWinnersCreateWithoutLeaguesInput, WeekWinnersUncheckedCreateWithoutLeaguesInput>
  }

  export type WeekWinnersCreateManyLeaguesInputEnvelope = {
    data: WeekWinnersCreateManyLeaguesInput | WeekWinnersCreateManyLeaguesInput[]
    skipDuplicates?: boolean
  }

  export type leaguemembersCreateWithoutLeaguesInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutLeaguesInput = {
    membership_id?: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutLeaguesInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutLeaguesInput, leaguemembersUncheckedCreateWithoutLeaguesInput>
  }

  export type leaguemembersCreateManyLeaguesInputEnvelope = {
    data: leaguemembersCreateManyLeaguesInput | leaguemembersCreateManyLeaguesInput[]
    skipDuplicates?: boolean
  }

  export type leaguemessagesCreateWithoutLeaguesInput = {
    message_id?: string
    content: string
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
    leaguemembers: leaguemembersCreateNestedOneWithoutLeaguemessagesInput
  }

  export type leaguemessagesUncheckedCreateWithoutLeaguesInput = {
    message_id?: string
    content: string
    member_id: number
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
  }

  export type leaguemessagesCreateOrConnectWithoutLeaguesInput = {
    where: leaguemessagesWhereUniqueInput
    create: XOR<leaguemessagesCreateWithoutLeaguesInput, leaguemessagesUncheckedCreateWithoutLeaguesInput>
  }

  export type leaguemessagesCreateManyLeaguesInputEnvelope = {
    data: leaguemessagesCreateManyLeaguesInput | leaguemessagesCreateManyLeaguesInput[]
    skipDuplicates?: boolean
  }

  export type peopleCreateWithoutLeaguesInput = {
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leaguemembers?: leaguemembersCreateNestedManyWithoutPeopleInput
    picks?: picksCreateNestedManyWithoutPeopleInput
  }

  export type peopleUncheckedCreateWithoutLeaguesInput = {
    uid?: number
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutPeopleInput
    picks?: picksUncheckedCreateNestedManyWithoutPeopleInput
  }

  export type peopleCreateOrConnectWithoutLeaguesInput = {
    where: peopleWhereUniqueInput
    create: XOR<peopleCreateWithoutLeaguesInput, peopleUncheckedCreateWithoutLeaguesInput>
  }

  export type leaguesCreateWithoutFuture_leaguesInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
  }

  export type leaguesUncheckedCreateWithoutFuture_leaguesInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
  }

  export type leaguesCreateOrConnectWithoutFuture_leaguesInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutFuture_leaguesInput, leaguesUncheckedCreateWithoutFuture_leaguesInput>
  }

  export type leaguesCreateWithoutPrior_leagueInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    people: peopleCreateNestedOneWithoutLeaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateWithoutPrior_leagueInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesCreateOrConnectWithoutPrior_leagueInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutPrior_leagueInput, leaguesUncheckedCreateWithoutPrior_leagueInput>
  }

  export type leaguesCreateManyPrior_leagueInputEnvelope = {
    data: leaguesCreateManyPrior_leagueInput | leaguesCreateManyPrior_leagueInput[]
    skipDuplicates?: boolean
  }

  export type EmailLogsUpsertWithWhereUniqueWithoutLeaguesInput = {
    where: EmailLogsWhereUniqueInput
    update: XOR<EmailLogsUpdateWithoutLeaguesInput, EmailLogsUncheckedUpdateWithoutLeaguesInput>
    create: XOR<EmailLogsCreateWithoutLeaguesInput, EmailLogsUncheckedCreateWithoutLeaguesInput>
  }

  export type EmailLogsUpdateWithWhereUniqueWithoutLeaguesInput = {
    where: EmailLogsWhereUniqueInput
    data: XOR<EmailLogsUpdateWithoutLeaguesInput, EmailLogsUncheckedUpdateWithoutLeaguesInput>
  }

  export type EmailLogsUpdateManyWithWhereWithoutLeaguesInput = {
    where: EmailLogsScalarWhereInput
    data: XOR<EmailLogsUpdateManyMutationInput, EmailLogsUncheckedUpdateManyWithoutLeaguesInput>
  }

  export type WeekWinnersUpsertWithWhereUniqueWithoutLeaguesInput = {
    where: WeekWinnersWhereUniqueInput
    update: XOR<WeekWinnersUpdateWithoutLeaguesInput, WeekWinnersUncheckedUpdateWithoutLeaguesInput>
    create: XOR<WeekWinnersCreateWithoutLeaguesInput, WeekWinnersUncheckedCreateWithoutLeaguesInput>
  }

  export type WeekWinnersUpdateWithWhereUniqueWithoutLeaguesInput = {
    where: WeekWinnersWhereUniqueInput
    data: XOR<WeekWinnersUpdateWithoutLeaguesInput, WeekWinnersUncheckedUpdateWithoutLeaguesInput>
  }

  export type WeekWinnersUpdateManyWithWhereWithoutLeaguesInput = {
    where: WeekWinnersScalarWhereInput
    data: XOR<WeekWinnersUpdateManyMutationInput, WeekWinnersUncheckedUpdateManyWithoutLeaguesInput>
  }

  export type leaguemembersUpsertWithWhereUniqueWithoutLeaguesInput = {
    where: leaguemembersWhereUniqueInput
    update: XOR<leaguemembersUpdateWithoutLeaguesInput, leaguemembersUncheckedUpdateWithoutLeaguesInput>
    create: XOR<leaguemembersCreateWithoutLeaguesInput, leaguemembersUncheckedCreateWithoutLeaguesInput>
  }

  export type leaguemembersUpdateWithWhereUniqueWithoutLeaguesInput = {
    where: leaguemembersWhereUniqueInput
    data: XOR<leaguemembersUpdateWithoutLeaguesInput, leaguemembersUncheckedUpdateWithoutLeaguesInput>
  }

  export type leaguemembersUpdateManyWithWhereWithoutLeaguesInput = {
    where: leaguemembersScalarWhereInput
    data: XOR<leaguemembersUpdateManyMutationInput, leaguemembersUncheckedUpdateManyWithoutLeaguesInput>
  }

  export type leaguemembersScalarWhereInput = {
    AND?: leaguemembersScalarWhereInput | leaguemembersScalarWhereInput[]
    OR?: leaguemembersScalarWhereInput[]
    NOT?: leaguemembersScalarWhereInput | leaguemembersScalarWhereInput[]
    membership_id?: IntFilter<"leaguemembers"> | number
    league_id?: IntFilter<"leaguemembers"> | number
    user_id?: IntFilter<"leaguemembers"> | number
    ts?: DateTimeFilter<"leaguemembers"> | Date | string
    role?: EnumMemberRoleNullableFilter<"leaguemembers"> | $Enums.MemberRole | null
    paid?: BoolNullableFilter<"leaguemembers"> | boolean | null
  }

  export type leaguemessagesUpsertWithWhereUniqueWithoutLeaguesInput = {
    where: leaguemessagesWhereUniqueInput
    update: XOR<leaguemessagesUpdateWithoutLeaguesInput, leaguemessagesUncheckedUpdateWithoutLeaguesInput>
    create: XOR<leaguemessagesCreateWithoutLeaguesInput, leaguemessagesUncheckedCreateWithoutLeaguesInput>
  }

  export type leaguemessagesUpdateWithWhereUniqueWithoutLeaguesInput = {
    where: leaguemessagesWhereUniqueInput
    data: XOR<leaguemessagesUpdateWithoutLeaguesInput, leaguemessagesUncheckedUpdateWithoutLeaguesInput>
  }

  export type leaguemessagesUpdateManyWithWhereWithoutLeaguesInput = {
    where: leaguemessagesScalarWhereInput
    data: XOR<leaguemessagesUpdateManyMutationInput, leaguemessagesUncheckedUpdateManyWithoutLeaguesInput>
  }

  export type peopleUpsertWithoutLeaguesInput = {
    update: XOR<peopleUpdateWithoutLeaguesInput, peopleUncheckedUpdateWithoutLeaguesInput>
    create: XOR<peopleCreateWithoutLeaguesInput, peopleUncheckedCreateWithoutLeaguesInput>
    where?: peopleWhereInput
  }

  export type peopleUpdateToOneWithWhereWithoutLeaguesInput = {
    where?: peopleWhereInput
    data: XOR<peopleUpdateWithoutLeaguesInput, peopleUncheckedUpdateWithoutLeaguesInput>
  }

  export type peopleUpdateWithoutLeaguesInput = {
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leaguemembers?: leaguemembersUpdateManyWithoutPeopleNestedInput
    picks?: picksUpdateManyWithoutPeopleNestedInput
  }

  export type peopleUncheckedUpdateWithoutLeaguesInput = {
    uid?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutPeopleNestedInput
    picks?: picksUncheckedUpdateManyWithoutPeopleNestedInput
  }

  export type leaguesUpsertWithoutFuture_leaguesInput = {
    update: XOR<leaguesUpdateWithoutFuture_leaguesInput, leaguesUncheckedUpdateWithoutFuture_leaguesInput>
    create: XOR<leaguesCreateWithoutFuture_leaguesInput, leaguesUncheckedCreateWithoutFuture_leaguesInput>
    where?: leaguesWhereInput
  }

  export type leaguesUpdateToOneWithWhereWithoutFuture_leaguesInput = {
    where?: leaguesWhereInput
    data: XOR<leaguesUpdateWithoutFuture_leaguesInput, leaguesUncheckedUpdateWithoutFuture_leaguesInput>
  }

  export type leaguesUpdateWithoutFuture_leaguesInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
  }

  export type leaguesUncheckedUpdateWithoutFuture_leaguesInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
  }

  export type leaguesUpsertWithWhereUniqueWithoutPrior_leagueInput = {
    where: leaguesWhereUniqueInput
    update: XOR<leaguesUpdateWithoutPrior_leagueInput, leaguesUncheckedUpdateWithoutPrior_leagueInput>
    create: XOR<leaguesCreateWithoutPrior_leagueInput, leaguesUncheckedCreateWithoutPrior_leagueInput>
  }

  export type leaguesUpdateWithWhereUniqueWithoutPrior_leagueInput = {
    where: leaguesWhereUniqueInput
    data: XOR<leaguesUpdateWithoutPrior_leagueInput, leaguesUncheckedUpdateWithoutPrior_leagueInput>
  }

  export type leaguesUpdateManyWithWhereWithoutPrior_leagueInput = {
    where: leaguesScalarWhereInput
    data: XOR<leaguesUpdateManyMutationInput, leaguesUncheckedUpdateManyWithoutPrior_leagueInput>
  }

  export type leaguesScalarWhereInput = {
    AND?: leaguesScalarWhereInput | leaguesScalarWhereInput[]
    OR?: leaguesScalarWhereInput[]
    NOT?: leaguesScalarWhereInput | leaguesScalarWhereInput[]
    league_id?: IntFilter<"leagues"> | number
    created_by_user_id?: IntFilter<"leagues"> | number
    name?: StringFilter<"leagues"> | string
    created_time?: DateTimeFilter<"leagues"> | Date | string
    season?: IntFilter<"leagues"> | number
    late_policy?: EnumLatePolicyNullableFilter<"leagues"> | $Enums.LatePolicy | null
    pick_policy?: EnumPickPolicyNullableFilter<"leagues"> | $Enums.PickPolicy | null
    reminder_policy?: EnumReminderPolicyNullableFilter<"leagues"> | $Enums.ReminderPolicy | null
    scoring_type?: EnumScoringTypeNullableFilter<"leagues"> | $Enums.ScoringType | null
    share_code?: StringNullableFilter<"leagues"> | string | null
    superbowl_competition?: BoolNullableFilter<"leagues"> | boolean | null
    prior_league_id?: IntNullableFilter<"leagues"> | number | null
    status?: EnumLeagueStatusFilter<"leagues"> | $Enums.LeagueStatus
  }

  export type leaguemembersCreateWithoutPeopleInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutPeopleInput = {
    membership_id?: number
    league_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutPeopleInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutPeopleInput, leaguemembersUncheckedCreateWithoutPeopleInput>
  }

  export type leaguemembersCreateManyPeopleInputEnvelope = {
    data: leaguemembersCreateManyPeopleInput | leaguemembersCreateManyPeopleInput[]
    skipDuplicates?: boolean
  }

  export type leaguesCreateWithoutPeopleInput = {
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguesInput
    prior_league?: leaguesCreateNestedOneWithoutFuture_leaguesInput
    future_leagues?: leaguesCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesUncheckedCreateWithoutPeopleInput = {
    league_id?: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguesInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutLeaguesInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguesInput
    future_leagues?: leaguesUncheckedCreateNestedManyWithoutPrior_leagueInput
  }

  export type leaguesCreateOrConnectWithoutPeopleInput = {
    where: leaguesWhereUniqueInput
    create: XOR<leaguesCreateWithoutPeopleInput, leaguesUncheckedCreateWithoutPeopleInput>
  }

  export type leaguesCreateManyPeopleInputEnvelope = {
    data: leaguesCreateManyPeopleInput | leaguesCreateManyPeopleInput[]
    skipDuplicates?: boolean
  }

  export type picksCreateWithoutPeopleInput = {
    season: number
    week: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    games: gamesCreateNestedOneWithoutPicksInput
    leaguemembers?: leaguemembersCreateNestedOneWithoutPicksInput
    teams?: teamsCreateNestedOneWithoutPicksInput
  }

  export type picksUncheckedCreateWithoutPeopleInput = {
    pickid?: number
    season: number
    week: number
    gid: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type picksCreateOrConnectWithoutPeopleInput = {
    where: picksWhereUniqueInput
    create: XOR<picksCreateWithoutPeopleInput, picksUncheckedCreateWithoutPeopleInput>
  }

  export type picksCreateManyPeopleInputEnvelope = {
    data: picksCreateManyPeopleInput | picksCreateManyPeopleInput[]
    skipDuplicates?: boolean
  }

  export type leaguemembersUpsertWithWhereUniqueWithoutPeopleInput = {
    where: leaguemembersWhereUniqueInput
    update: XOR<leaguemembersUpdateWithoutPeopleInput, leaguemembersUncheckedUpdateWithoutPeopleInput>
    create: XOR<leaguemembersCreateWithoutPeopleInput, leaguemembersUncheckedCreateWithoutPeopleInput>
  }

  export type leaguemembersUpdateWithWhereUniqueWithoutPeopleInput = {
    where: leaguemembersWhereUniqueInput
    data: XOR<leaguemembersUpdateWithoutPeopleInput, leaguemembersUncheckedUpdateWithoutPeopleInput>
  }

  export type leaguemembersUpdateManyWithWhereWithoutPeopleInput = {
    where: leaguemembersScalarWhereInput
    data: XOR<leaguemembersUpdateManyMutationInput, leaguemembersUncheckedUpdateManyWithoutPeopleInput>
  }

  export type leaguesUpsertWithWhereUniqueWithoutPeopleInput = {
    where: leaguesWhereUniqueInput
    update: XOR<leaguesUpdateWithoutPeopleInput, leaguesUncheckedUpdateWithoutPeopleInput>
    create: XOR<leaguesCreateWithoutPeopleInput, leaguesUncheckedCreateWithoutPeopleInput>
  }

  export type leaguesUpdateWithWhereUniqueWithoutPeopleInput = {
    where: leaguesWhereUniqueInput
    data: XOR<leaguesUpdateWithoutPeopleInput, leaguesUncheckedUpdateWithoutPeopleInput>
  }

  export type leaguesUpdateManyWithWhereWithoutPeopleInput = {
    where: leaguesScalarWhereInput
    data: XOR<leaguesUpdateManyMutationInput, leaguesUncheckedUpdateManyWithoutPeopleInput>
  }

  export type picksUpsertWithWhereUniqueWithoutPeopleInput = {
    where: picksWhereUniqueInput
    update: XOR<picksUpdateWithoutPeopleInput, picksUncheckedUpdateWithoutPeopleInput>
    create: XOR<picksCreateWithoutPeopleInput, picksUncheckedCreateWithoutPeopleInput>
  }

  export type picksUpdateWithWhereUniqueWithoutPeopleInput = {
    where: picksWhereUniqueInput
    data: XOR<picksUpdateWithoutPeopleInput, picksUncheckedUpdateWithoutPeopleInput>
  }

  export type picksUpdateManyWithWhereWithoutPeopleInput = {
    where: picksScalarWhereInput
    data: XOR<picksUpdateManyMutationInput, picksUncheckedUpdateManyWithoutPeopleInput>
  }

  export type gamesCreateWithoutPicksInput = {
    season: number
    week: number
    ts: Date | string
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    teams_games_homeToteams: teamsCreateNestedOneWithoutGames_games_homeToteamsInput
    teams_games_awayToteams: teamsCreateNestedOneWithoutGames_games_awayToteamsInput
  }

  export type gamesUncheckedCreateWithoutPicksInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    home: number
    away: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
  }

  export type gamesCreateOrConnectWithoutPicksInput = {
    where: gamesWhereUniqueInput
    create: XOR<gamesCreateWithoutPicksInput, gamesUncheckedCreateWithoutPicksInput>
  }

  export type peopleCreateWithoutPicksInput = {
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leaguemembers?: leaguemembersCreateNestedManyWithoutPeopleInput
    leagues?: leaguesCreateNestedManyWithoutPeopleInput
  }

  export type peopleUncheckedCreateWithoutPicksInput = {
    uid?: number
    username: string
    fname: string
    lname: string
    email: string
    season: number
    email2?: string | null
    google_photo_url?: string | null
    google_email?: string | null
    google_userid?: string | null
    supabase_id?: string | null
    leaguemembers?: leaguemembersUncheckedCreateNestedManyWithoutPeopleInput
    leagues?: leaguesUncheckedCreateNestedManyWithoutPeopleInput
  }

  export type peopleCreateOrConnectWithoutPicksInput = {
    where: peopleWhereUniqueInput
    create: XOR<peopleCreateWithoutPicksInput, peopleUncheckedCreateWithoutPicksInput>
  }

  export type leaguemembersCreateWithoutPicksInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutPicksInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    superbowl?: superbowlUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutPicksInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutPicksInput, leaguemembersUncheckedCreateWithoutPicksInput>
  }

  export type teamsCreateWithoutPicksInput = {
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesCreateNestedManyWithoutTeams_games_awayToteamsInput
    superbowl_superbowl_loserToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsUncheckedCreateWithoutPicksInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_awayToteamsInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsCreateOrConnectWithoutPicksInput = {
    where: teamsWhereUniqueInput
    create: XOR<teamsCreateWithoutPicksInput, teamsUncheckedCreateWithoutPicksInput>
  }

  export type gamesUpsertWithoutPicksInput = {
    update: XOR<gamesUpdateWithoutPicksInput, gamesUncheckedUpdateWithoutPicksInput>
    create: XOR<gamesCreateWithoutPicksInput, gamesUncheckedCreateWithoutPicksInput>
    where?: gamesWhereInput
  }

  export type gamesUpdateToOneWithWhereWithoutPicksInput = {
    where?: gamesWhereInput
    data: XOR<gamesUpdateWithoutPicksInput, gamesUncheckedUpdateWithoutPicksInput>
  }

  export type gamesUpdateWithoutPicksInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    teams_games_homeToteams?: teamsUpdateOneRequiredWithoutGames_games_homeToteamsNestedInput
    teams_games_awayToteams?: teamsUpdateOneRequiredWithoutGames_games_awayToteamsNestedInput
  }

  export type gamesUncheckedUpdateWithoutPicksInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    home?: IntFieldUpdateOperationsInput | number
    away?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type peopleUpsertWithoutPicksInput = {
    update: XOR<peopleUpdateWithoutPicksInput, peopleUncheckedUpdateWithoutPicksInput>
    create: XOR<peopleCreateWithoutPicksInput, peopleUncheckedCreateWithoutPicksInput>
    where?: peopleWhereInput
  }

  export type peopleUpdateToOneWithWhereWithoutPicksInput = {
    where?: peopleWhereInput
    data: XOR<peopleUpdateWithoutPicksInput, peopleUncheckedUpdateWithoutPicksInput>
  }

  export type peopleUpdateWithoutPicksInput = {
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leaguemembers?: leaguemembersUpdateManyWithoutPeopleNestedInput
    leagues?: leaguesUpdateManyWithoutPeopleNestedInput
  }

  export type peopleUncheckedUpdateWithoutPicksInput = {
    uid?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fname?: StringFieldUpdateOperationsInput | string
    lname?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    season?: IntFieldUpdateOperationsInput | number
    email2?: NullableStringFieldUpdateOperationsInput | string | null
    google_photo_url?: NullableStringFieldUpdateOperationsInput | string | null
    google_email?: NullableStringFieldUpdateOperationsInput | string | null
    google_userid?: NullableStringFieldUpdateOperationsInput | string | null
    supabase_id?: NullableStringFieldUpdateOperationsInput | string | null
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutPeopleNestedInput
    leagues?: leaguesUncheckedUpdateManyWithoutPeopleNestedInput
  }

  export type leaguemembersUpsertWithoutPicksInput = {
    update: XOR<leaguemembersUpdateWithoutPicksInput, leaguemembersUncheckedUpdateWithoutPicksInput>
    create: XOR<leaguemembersCreateWithoutPicksInput, leaguemembersUncheckedCreateWithoutPicksInput>
    where?: leaguemembersWhereInput
  }

  export type leaguemembersUpdateToOneWithWhereWithoutPicksInput = {
    where?: leaguemembersWhereInput
    data: XOR<leaguemembersUpdateWithoutPicksInput, leaguemembersUncheckedUpdateWithoutPicksInput>
  }

  export type leaguemembersUpdateWithoutPicksInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutPicksInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type teamsUpsertWithoutPicksInput = {
    update: XOR<teamsUpdateWithoutPicksInput, teamsUncheckedUpdateWithoutPicksInput>
    create: XOR<teamsCreateWithoutPicksInput, teamsUncheckedCreateWithoutPicksInput>
    where?: teamsWhereInput
  }

  export type teamsUpdateToOneWithWhereWithoutPicksInput = {
    where?: teamsWhereInput
    data: XOR<teamsUpdateWithoutPicksInput, teamsUncheckedUpdateWithoutPicksInput>
  }

  export type teamsUpdateWithoutPicksInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUpdateManyWithoutTeams_games_awayToteamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsUncheckedUpdateWithoutPicksInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsCreateWithoutSuperbowl_superbowl_loserToteamsInput = {
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_winnerToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsUncheckedCreateWithoutSuperbowl_superbowl_loserToteamsInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksUncheckedCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_winnerToteamsInput
  }

  export type teamsCreateOrConnectWithoutSuperbowl_superbowl_loserToteamsInput = {
    where: teamsWhereUniqueInput
    create: XOR<teamsCreateWithoutSuperbowl_superbowl_loserToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_loserToteamsInput>
  }

  export type leaguemembersCreateWithoutSuperbowlInput = {
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersCreateNestedManyWithoutLeaguemembersInput
    people: peopleCreateNestedOneWithoutLeaguemembersInput
    leagues: leaguesCreateNestedOneWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesCreateNestedManyWithoutLeaguemembersInput
    picks?: picksCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersUncheckedCreateWithoutSuperbowlInput = {
    membership_id?: number
    league_id: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
    EmailLogs?: EmailLogsUncheckedCreateNestedManyWithoutLeaguemembersInput
    WeekWinners?: WeekWinnersUncheckedCreateNestedManyWithoutLeaguemembersInput
    leaguemessages?: leaguemessagesUncheckedCreateNestedManyWithoutLeaguemembersInput
    picks?: picksUncheckedCreateNestedManyWithoutLeaguemembersInput
  }

  export type leaguemembersCreateOrConnectWithoutSuperbowlInput = {
    where: leaguemembersWhereUniqueInput
    create: XOR<leaguemembersCreateWithoutSuperbowlInput, leaguemembersUncheckedCreateWithoutSuperbowlInput>
  }

  export type teamsCreateWithoutSuperbowl_superbowl_winnerToteamsInput = {
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
  }

  export type teamsUncheckedCreateWithoutSuperbowl_superbowl_winnerToteamsInput = {
    teamid?: number
    abbrev?: string | null
    loc: string
    name: string
    conference?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    tertiary_color?: string | null
    games_games_homeToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_homeToteamsInput
    games_games_awayToteams?: gamesUncheckedCreateNestedManyWithoutTeams_games_awayToteamsInput
    picks?: picksUncheckedCreateNestedManyWithoutTeamsInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedCreateNestedManyWithoutTeams_superbowl_loserToteamsInput
  }

  export type teamsCreateOrConnectWithoutSuperbowl_superbowl_winnerToteamsInput = {
    where: teamsWhereUniqueInput
    create: XOR<teamsCreateWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_winnerToteamsInput>
  }

  export type teamsUpsertWithoutSuperbowl_superbowl_loserToteamsInput = {
    update: XOR<teamsUpdateWithoutSuperbowl_superbowl_loserToteamsInput, teamsUncheckedUpdateWithoutSuperbowl_superbowl_loserToteamsInput>
    create: XOR<teamsCreateWithoutSuperbowl_superbowl_loserToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_loserToteamsInput>
    where?: teamsWhereInput
  }

  export type teamsUpdateToOneWithWhereWithoutSuperbowl_superbowl_loserToteamsInput = {
    where?: teamsWhereInput
    data: XOR<teamsUpdateWithoutSuperbowl_superbowl_loserToteamsInput, teamsUncheckedUpdateWithoutSuperbowl_superbowl_loserToteamsInput>
  }

  export type teamsUpdateWithoutSuperbowl_superbowl_loserToteamsInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type teamsUncheckedUpdateWithoutSuperbowl_superbowl_loserToteamsInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUncheckedUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_winnerToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsNestedInput
  }

  export type leaguemembersUpsertWithoutSuperbowlInput = {
    update: XOR<leaguemembersUpdateWithoutSuperbowlInput, leaguemembersUncheckedUpdateWithoutSuperbowlInput>
    create: XOR<leaguemembersCreateWithoutSuperbowlInput, leaguemembersUncheckedCreateWithoutSuperbowlInput>
    where?: leaguemembersWhereInput
  }

  export type leaguemembersUpdateToOneWithWhereWithoutSuperbowlInput = {
    where?: leaguemembersWhereInput
    data: XOR<leaguemembersUpdateWithoutSuperbowlInput, leaguemembersUncheckedUpdateWithoutSuperbowlInput>
  }

  export type leaguemembersUpdateWithoutSuperbowlInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutSuperbowlInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type teamsUpsertWithoutSuperbowl_superbowl_winnerToteamsInput = {
    update: XOR<teamsUpdateWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUncheckedUpdateWithoutSuperbowl_superbowl_winnerToteamsInput>
    create: XOR<teamsCreateWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUncheckedCreateWithoutSuperbowl_superbowl_winnerToteamsInput>
    where?: teamsWhereInput
  }

  export type teamsUpdateToOneWithWhereWithoutSuperbowl_superbowl_winnerToteamsInput = {
    where?: teamsWhereInput
    data: XOR<teamsUpdateWithoutSuperbowl_superbowl_winnerToteamsInput, teamsUncheckedUpdateWithoutSuperbowl_superbowl_winnerToteamsInput>
  }

  export type teamsUpdateWithoutSuperbowl_superbowl_winnerToteamsInput = {
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
  }

  export type teamsUncheckedUpdateWithoutSuperbowl_superbowl_winnerToteamsInput = {
    teamid?: IntFieldUpdateOperationsInput | number
    abbrev?: NullableStringFieldUpdateOperationsInput | string | null
    loc?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    conference?: NullableStringFieldUpdateOperationsInput | string | null
    primary_color?: NullableStringFieldUpdateOperationsInput | string | null
    secondary_color?: NullableStringFieldUpdateOperationsInput | string | null
    tertiary_color?: NullableStringFieldUpdateOperationsInput | string | null
    games_games_homeToteams?: gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsNestedInput
    games_games_awayToteams?: gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsNestedInput
    picks?: picksUncheckedUpdateManyWithoutTeamsNestedInput
    superbowl_superbowl_loserToteams?: superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsNestedInput
  }

  export type gamesCreateWithoutTeams_games_homeToteamsInput = {
    season: number
    week: number
    ts: Date | string
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    teams_games_awayToteams: teamsCreateNestedOneWithoutGames_games_awayToteamsInput
    picks?: picksCreateNestedManyWithoutGamesInput
  }

  export type gamesUncheckedCreateWithoutTeams_games_homeToteamsInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    away: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    picks?: picksUncheckedCreateNestedManyWithoutGamesInput
  }

  export type gamesCreateOrConnectWithoutTeams_games_homeToteamsInput = {
    where: gamesWhereUniqueInput
    create: XOR<gamesCreateWithoutTeams_games_homeToteamsInput, gamesUncheckedCreateWithoutTeams_games_homeToteamsInput>
  }

  export type gamesCreateManyTeams_games_homeToteamsInputEnvelope = {
    data: gamesCreateManyTeams_games_homeToteamsInput | gamesCreateManyTeams_games_homeToteamsInput[]
    skipDuplicates?: boolean
  }

  export type gamesCreateWithoutTeams_games_awayToteamsInput = {
    season: number
    week: number
    ts: Date | string
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    teams_games_homeToteams: teamsCreateNestedOneWithoutGames_games_homeToteamsInput
    picks?: picksCreateNestedManyWithoutGamesInput
  }

  export type gamesUncheckedCreateWithoutTeams_games_awayToteamsInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    home: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
    picks?: picksUncheckedCreateNestedManyWithoutGamesInput
  }

  export type gamesCreateOrConnectWithoutTeams_games_awayToteamsInput = {
    where: gamesWhereUniqueInput
    create: XOR<gamesCreateWithoutTeams_games_awayToteamsInput, gamesUncheckedCreateWithoutTeams_games_awayToteamsInput>
  }

  export type gamesCreateManyTeams_games_awayToteamsInputEnvelope = {
    data: gamesCreateManyTeams_games_awayToteamsInput | gamesCreateManyTeams_games_awayToteamsInput[]
    skipDuplicates?: boolean
  }

  export type picksCreateWithoutTeamsInput = {
    season: number
    week: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    games: gamesCreateNestedOneWithoutPicksInput
    people: peopleCreateNestedOneWithoutPicksInput
    leaguemembers?: leaguemembersCreateNestedOneWithoutPicksInput
  }

  export type picksUncheckedCreateWithoutTeamsInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    gid: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type picksCreateOrConnectWithoutTeamsInput = {
    where: picksWhereUniqueInput
    create: XOR<picksCreateWithoutTeamsInput, picksUncheckedCreateWithoutTeamsInput>
  }

  export type picksCreateManyTeamsInputEnvelope = {
    data: picksCreateManyTeamsInput | picksCreateManyTeamsInput[]
    skipDuplicates?: boolean
  }

  export type superbowlCreateWithoutTeams_superbowl_loserToteamsInput = {
    uid: number
    score: number
    ts?: Date | string | null
    season?: number | null
    leaguemembers?: leaguemembersCreateNestedOneWithoutSuperbowlInput
    teams_superbowl_winnerToteams: teamsCreateNestedOneWithoutSuperbowl_superbowl_winnerToteamsInput
  }

  export type superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput = {
    pickid?: number
    uid: number
    winner: number
    score: number
    ts?: Date | string | null
    season?: number | null
    member_id?: number | null
  }

  export type superbowlCreateOrConnectWithoutTeams_superbowl_loserToteamsInput = {
    where: superbowlWhereUniqueInput
    create: XOR<superbowlCreateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput>
  }

  export type superbowlCreateManyTeams_superbowl_loserToteamsInputEnvelope = {
    data: superbowlCreateManyTeams_superbowl_loserToteamsInput | superbowlCreateManyTeams_superbowl_loserToteamsInput[]
    skipDuplicates?: boolean
  }

  export type superbowlCreateWithoutTeams_superbowl_winnerToteamsInput = {
    uid: number
    score: number
    ts?: Date | string | null
    season?: number | null
    teams_superbowl_loserToteams: teamsCreateNestedOneWithoutSuperbowl_superbowl_loserToteamsInput
    leaguemembers?: leaguemembersCreateNestedOneWithoutSuperbowlInput
  }

  export type superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput = {
    pickid?: number
    uid: number
    loser: number
    score: number
    ts?: Date | string | null
    season?: number | null
    member_id?: number | null
  }

  export type superbowlCreateOrConnectWithoutTeams_superbowl_winnerToteamsInput = {
    where: superbowlWhereUniqueInput
    create: XOR<superbowlCreateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput>
  }

  export type superbowlCreateManyTeams_superbowl_winnerToteamsInputEnvelope = {
    data: superbowlCreateManyTeams_superbowl_winnerToteamsInput | superbowlCreateManyTeams_superbowl_winnerToteamsInput[]
    skipDuplicates?: boolean
  }

  export type gamesUpsertWithWhereUniqueWithoutTeams_games_homeToteamsInput = {
    where: gamesWhereUniqueInput
    update: XOR<gamesUpdateWithoutTeams_games_homeToteamsInput, gamesUncheckedUpdateWithoutTeams_games_homeToteamsInput>
    create: XOR<gamesCreateWithoutTeams_games_homeToteamsInput, gamesUncheckedCreateWithoutTeams_games_homeToteamsInput>
  }

  export type gamesUpdateWithWhereUniqueWithoutTeams_games_homeToteamsInput = {
    where: gamesWhereUniqueInput
    data: XOR<gamesUpdateWithoutTeams_games_homeToteamsInput, gamesUncheckedUpdateWithoutTeams_games_homeToteamsInput>
  }

  export type gamesUpdateManyWithWhereWithoutTeams_games_homeToteamsInput = {
    where: gamesScalarWhereInput
    data: XOR<gamesUpdateManyMutationInput, gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsInput>
  }

  export type gamesScalarWhereInput = {
    AND?: gamesScalarWhereInput | gamesScalarWhereInput[]
    OR?: gamesScalarWhereInput[]
    NOT?: gamesScalarWhereInput | gamesScalarWhereInput[]
    gid?: IntFilter<"games"> | number
    season?: IntFilter<"games"> | number
    week?: IntFilter<"games"> | number
    ts?: DateTimeFilter<"games"> | Date | string
    home?: IntFilter<"games"> | number
    away?: IntFilter<"games"> | number
    homescore?: IntNullableFilter<"games"> | number | null
    awayscore?: IntNullableFilter<"games"> | number | null
    done?: BoolNullableFilter<"games"> | boolean | null
    winner?: IntNullableFilter<"games"> | number | null
    international?: BoolNullableFilter<"games"> | boolean | null
    seconds?: IntNullableFilter<"games"> | number | null
    current_record?: StringNullableFilter<"games"> | string | null
    is_tiebreaker?: BoolNullableFilter<"games"> | boolean | null
    homerecord?: StringNullableFilter<"games"> | string | null
    awayrecord?: StringNullableFilter<"games"> | string | null
    msf_id?: IntNullableFilter<"games"> | number | null
  }

  export type gamesUpsertWithWhereUniqueWithoutTeams_games_awayToteamsInput = {
    where: gamesWhereUniqueInput
    update: XOR<gamesUpdateWithoutTeams_games_awayToteamsInput, gamesUncheckedUpdateWithoutTeams_games_awayToteamsInput>
    create: XOR<gamesCreateWithoutTeams_games_awayToteamsInput, gamesUncheckedCreateWithoutTeams_games_awayToteamsInput>
  }

  export type gamesUpdateWithWhereUniqueWithoutTeams_games_awayToteamsInput = {
    where: gamesWhereUniqueInput
    data: XOR<gamesUpdateWithoutTeams_games_awayToteamsInput, gamesUncheckedUpdateWithoutTeams_games_awayToteamsInput>
  }

  export type gamesUpdateManyWithWhereWithoutTeams_games_awayToteamsInput = {
    where: gamesScalarWhereInput
    data: XOR<gamesUpdateManyMutationInput, gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsInput>
  }

  export type picksUpsertWithWhereUniqueWithoutTeamsInput = {
    where: picksWhereUniqueInput
    update: XOR<picksUpdateWithoutTeamsInput, picksUncheckedUpdateWithoutTeamsInput>
    create: XOR<picksCreateWithoutTeamsInput, picksUncheckedCreateWithoutTeamsInput>
  }

  export type picksUpdateWithWhereUniqueWithoutTeamsInput = {
    where: picksWhereUniqueInput
    data: XOR<picksUpdateWithoutTeamsInput, picksUncheckedUpdateWithoutTeamsInput>
  }

  export type picksUpdateManyWithWhereWithoutTeamsInput = {
    where: picksScalarWhereInput
    data: XOR<picksUpdateManyMutationInput, picksUncheckedUpdateManyWithoutTeamsInput>
  }

  export type superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput = {
    where: superbowlWhereUniqueInput
    update: XOR<superbowlUpdateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedUpdateWithoutTeams_superbowl_loserToteamsInput>
    create: XOR<superbowlCreateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_loserToteamsInput>
  }

  export type superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_loserToteamsInput = {
    where: superbowlWhereUniqueInput
    data: XOR<superbowlUpdateWithoutTeams_superbowl_loserToteamsInput, superbowlUncheckedUpdateWithoutTeams_superbowl_loserToteamsInput>
  }

  export type superbowlUpdateManyWithWhereWithoutTeams_superbowl_loserToteamsInput = {
    where: superbowlScalarWhereInput
    data: XOR<superbowlUpdateManyMutationInput, superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsInput>
  }

  export type superbowlUpsertWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput = {
    where: superbowlWhereUniqueInput
    update: XOR<superbowlUpdateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedUpdateWithoutTeams_superbowl_winnerToteamsInput>
    create: XOR<superbowlCreateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedCreateWithoutTeams_superbowl_winnerToteamsInput>
  }

  export type superbowlUpdateWithWhereUniqueWithoutTeams_superbowl_winnerToteamsInput = {
    where: superbowlWhereUniqueInput
    data: XOR<superbowlUpdateWithoutTeams_superbowl_winnerToteamsInput, superbowlUncheckedUpdateWithoutTeams_superbowl_winnerToteamsInput>
  }

  export type superbowlUpdateManyWithWhereWithoutTeams_superbowl_winnerToteamsInput = {
    where: superbowlScalarWhereInput
    data: XOR<superbowlUpdateManyMutationInput, superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsInput>
  }

  export type picksCreateManyGamesInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type picksUpdateWithoutGamesInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    people?: peopleUpdateOneRequiredWithoutPicksNestedInput
    leaguemembers?: leaguemembersUpdateOneWithoutPicksNestedInput
    teams?: teamsUpdateOneWithoutPicksNestedInput
  }

  export type picksUncheckedUpdateWithoutGamesInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type picksUncheckedUpdateManyWithoutGamesInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type EmailLogsCreateManyLeaguemembersInput = {
    email_log_id?: string
    league_id: number
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
  }

  export type WeekWinnersCreateManyLeaguemembersInput = {
    id?: number
    league_id: number
    week: number
    correct_count: number
    score_diff: number
  }

  export type leaguemessagesCreateManyLeaguemembersInput = {
    message_id?: string
    content: string
    league_id: number
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
  }

  export type picksCreateManyLeaguemembersInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    gid: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
  }

  export type superbowlCreateManyLeaguemembersInput = {
    pickid?: number
    uid: number
    winner: number
    loser: number
    score: number
    ts?: Date | string | null
    season?: number | null
  }

  export type EmailLogsUpdateWithoutLeaguemembersInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
    leagues?: leaguesUpdateOneRequiredWithoutEmailLogsNestedInput
  }

  export type EmailLogsUncheckedUpdateWithoutLeaguemembersInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    league_id?: IntFieldUpdateOperationsInput | number
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type EmailLogsUncheckedUpdateManyWithoutLeaguemembersInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    league_id?: IntFieldUpdateOperationsInput | number
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type WeekWinnersUpdateWithoutLeaguemembersInput = {
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
    leagues?: leaguesUpdateOneRequiredWithoutWeekWinnersNestedInput
  }

  export type WeekWinnersUncheckedUpdateWithoutLeaguemembersInput = {
    id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type WeekWinnersUncheckedUpdateManyWithoutLeaguemembersInput = {
    id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type leaguemessagesUpdateWithoutLeaguemembersInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemessagesNestedInput
  }

  export type leaguemessagesUncheckedUpdateWithoutLeaguemembersInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    league_id?: IntFieldUpdateOperationsInput | number
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type leaguemessagesUncheckedUpdateManyWithoutLeaguemembersInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    league_id?: IntFieldUpdateOperationsInput | number
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type picksUpdateWithoutLeaguemembersInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    games?: gamesUpdateOneRequiredWithoutPicksNestedInput
    people?: peopleUpdateOneRequiredWithoutPicksNestedInput
    teams?: teamsUpdateOneWithoutPicksNestedInput
  }

  export type picksUncheckedUpdateWithoutLeaguemembersInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type picksUncheckedUpdateManyWithoutLeaguemembersInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type superbowlUpdateWithoutLeaguemembersInput = {
    uid?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    teams_superbowl_loserToteams?: teamsUpdateOneRequiredWithoutSuperbowl_superbowl_loserToteamsNestedInput
    teams_superbowl_winnerToteams?: teamsUpdateOneRequiredWithoutSuperbowl_superbowl_winnerToteamsNestedInput
  }

  export type superbowlUncheckedUpdateWithoutLeaguemembersInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    winner?: IntFieldUpdateOperationsInput | number
    loser?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlUncheckedUpdateManyWithoutLeaguemembersInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    winner?: IntFieldUpdateOperationsInput | number
    loser?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type EmailLogsCreateManyLeaguesInput = {
    email_log_id?: string
    member_id: number
    email_type: $Enums.EmailType
    ts?: Date | string
    week?: number | null
    resend_id: string
  }

  export type WeekWinnersCreateManyLeaguesInput = {
    id?: number
    membership_id: number
    week: number
    correct_count: number
    score_diff: number
  }

  export type leaguemembersCreateManyLeaguesInput = {
    membership_id?: number
    user_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
  }

  export type leaguemessagesCreateManyLeaguesInput = {
    message_id?: string
    content: string
    member_id: number
    week?: number | null
    message_type: $Enums.MessageType
    createdAt?: Date | string
    status?: $Enums.MessageStatus
  }

  export type leaguesCreateManyPrior_leagueInput = {
    league_id?: number
    created_by_user_id: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    status?: $Enums.LeagueStatus
  }

  export type EmailLogsUpdateWithoutLeaguesInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
    leaguemembers?: leaguemembersUpdateOneRequiredWithoutEmailLogsNestedInput
  }

  export type EmailLogsUncheckedUpdateWithoutLeaguesInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    member_id?: IntFieldUpdateOperationsInput | number
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type EmailLogsUncheckedUpdateManyWithoutLeaguesInput = {
    email_log_id?: StringFieldUpdateOperationsInput | string
    member_id?: IntFieldUpdateOperationsInput | number
    email_type?: EnumEmailTypeFieldUpdateOperationsInput | $Enums.EmailType
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    resend_id?: StringFieldUpdateOperationsInput | string
  }

  export type WeekWinnersUpdateWithoutLeaguesInput = {
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
    leaguemembers?: leaguemembersUpdateOneRequiredWithoutWeekWinnersNestedInput
  }

  export type WeekWinnersUncheckedUpdateWithoutLeaguesInput = {
    id?: IntFieldUpdateOperationsInput | number
    membership_id?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type WeekWinnersUncheckedUpdateManyWithoutLeaguesInput = {
    id?: IntFieldUpdateOperationsInput | number
    membership_id?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    correct_count?: IntFieldUpdateOperationsInput | number
    score_diff?: IntFieldUpdateOperationsInput | number
  }

  export type leaguemembersUpdateWithoutLeaguesInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutLeaguesInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateManyWithoutLeaguesInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type leaguemessagesUpdateWithoutLeaguesInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    leaguemembers?: leaguemembersUpdateOneRequiredWithoutLeaguemessagesNestedInput
  }

  export type leaguemessagesUncheckedUpdateWithoutLeaguesInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    member_id?: IntFieldUpdateOperationsInput | number
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type leaguemessagesUncheckedUpdateManyWithoutLeaguesInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    member_id?: IntFieldUpdateOperationsInput | number
    week?: NullableIntFieldUpdateOperationsInput | number | null
    message_type?: EnumMessageTypeFieldUpdateOperationsInput | $Enums.MessageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
  }

  export type leaguesUpdateWithoutPrior_leagueInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    people?: peopleUpdateOneRequiredWithoutLeaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateWithoutPrior_leagueInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateManyWithoutPrior_leagueInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    created_by_user_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
  }

  export type leaguemembersCreateManyPeopleInput = {
    membership_id?: number
    league_id: number
    ts?: Date | string
    role?: $Enums.MemberRole | null
    paid?: boolean | null
  }

  export type leaguesCreateManyPeopleInput = {
    league_id?: number
    name: string
    created_time?: Date | string
    season: number
    late_policy?: $Enums.LatePolicy | null
    pick_policy?: $Enums.PickPolicy | null
    reminder_policy?: $Enums.ReminderPolicy | null
    scoring_type?: $Enums.ScoringType | null
    share_code?: string | null
    superbowl_competition?: boolean | null
    prior_league_id?: number | null
    status?: $Enums.LeagueStatus
  }

  export type picksCreateManyPeopleInput = {
    pickid?: number
    season: number
    week: number
    gid: number
    winner?: number | null
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type leaguemembersUpdateWithoutPeopleInput = {
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguemembersNestedInput
    leagues?: leaguesUpdateOneRequiredWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateWithoutPeopleInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguemembersNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguemembersNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguemembersNestedInput
    picks?: picksUncheckedUpdateManyWithoutLeaguemembersNestedInput
    superbowl?: superbowlUncheckedUpdateManyWithoutLeaguemembersNestedInput
  }

  export type leaguemembersUncheckedUpdateManyWithoutPeopleInput = {
    membership_id?: IntFieldUpdateOperationsInput | number
    league_id?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: NullableEnumMemberRoleFieldUpdateOperationsInput | $Enums.MemberRole | null
    paid?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type leaguesUpdateWithoutPeopleInput = {
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUpdateManyWithoutLeaguesNestedInput
    prior_league?: leaguesUpdateOneWithoutFuture_leaguesNestedInput
    future_leagues?: leaguesUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateWithoutPeopleInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
    EmailLogs?: EmailLogsUncheckedUpdateManyWithoutLeaguesNestedInput
    WeekWinners?: WeekWinnersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemembers?: leaguemembersUncheckedUpdateManyWithoutLeaguesNestedInput
    leaguemessages?: leaguemessagesUncheckedUpdateManyWithoutLeaguesNestedInput
    future_leagues?: leaguesUncheckedUpdateManyWithoutPrior_leagueNestedInput
  }

  export type leaguesUncheckedUpdateManyWithoutPeopleInput = {
    league_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    created_time?: DateTimeFieldUpdateOperationsInput | Date | string
    season?: IntFieldUpdateOperationsInput | number
    late_policy?: NullableEnumLatePolicyFieldUpdateOperationsInput | $Enums.LatePolicy | null
    pick_policy?: NullableEnumPickPolicyFieldUpdateOperationsInput | $Enums.PickPolicy | null
    reminder_policy?: NullableEnumReminderPolicyFieldUpdateOperationsInput | $Enums.ReminderPolicy | null
    scoring_type?: NullableEnumScoringTypeFieldUpdateOperationsInput | $Enums.ScoringType | null
    share_code?: NullableStringFieldUpdateOperationsInput | string | null
    superbowl_competition?: NullableBoolFieldUpdateOperationsInput | boolean | null
    prior_league_id?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumLeagueStatusFieldUpdateOperationsInput | $Enums.LeagueStatus
  }

  export type picksUpdateWithoutPeopleInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    games?: gamesUpdateOneRequiredWithoutPicksNestedInput
    leaguemembers?: leaguemembersUpdateOneWithoutPicksNestedInput
    teams?: teamsUpdateOneWithoutPicksNestedInput
  }

  export type picksUncheckedUpdateWithoutPeopleInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type picksUncheckedUpdateManyWithoutPeopleInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type gamesCreateManyTeams_games_homeToteamsInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    away: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
  }

  export type gamesCreateManyTeams_games_awayToteamsInput = {
    gid?: number
    season: number
    week: number
    ts: Date | string
    home: number
    homescore?: number | null
    awayscore?: number | null
    done?: boolean | null
    winner?: number | null
    international?: boolean | null
    seconds?: number | null
    current_record?: string | null
    is_tiebreaker?: boolean | null
    homerecord?: string | null
    awayrecord?: string | null
    msf_id?: number | null
  }

  export type picksCreateManyTeamsInput = {
    pickid?: number
    uid: number
    season: number
    week: number
    gid: number
    loser?: number | null
    score?: number | null
    ts?: Date | string
    correct?: number | null
    done?: number | null
    is_random?: boolean | null
    member_id?: number | null
  }

  export type superbowlCreateManyTeams_superbowl_loserToteamsInput = {
    pickid?: number
    uid: number
    winner: number
    score: number
    ts?: Date | string | null
    season?: number | null
    member_id?: number | null
  }

  export type superbowlCreateManyTeams_superbowl_winnerToteamsInput = {
    pickid?: number
    uid: number
    loser: number
    score: number
    ts?: Date | string | null
    season?: number | null
    member_id?: number | null
  }

  export type gamesUpdateWithoutTeams_games_homeToteamsInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    teams_games_awayToteams?: teamsUpdateOneRequiredWithoutGames_games_awayToteamsNestedInput
    picks?: picksUpdateManyWithoutGamesNestedInput
  }

  export type gamesUncheckedUpdateWithoutTeams_games_homeToteamsInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    away?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    picks?: picksUncheckedUpdateManyWithoutGamesNestedInput
  }

  export type gamesUncheckedUpdateManyWithoutTeams_games_homeToteamsInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    away?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type gamesUpdateWithoutTeams_games_awayToteamsInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    teams_games_homeToteams?: teamsUpdateOneRequiredWithoutGames_games_homeToteamsNestedInput
    picks?: picksUpdateManyWithoutGamesNestedInput
  }

  export type gamesUncheckedUpdateWithoutTeams_games_awayToteamsInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    home?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
    picks?: picksUncheckedUpdateManyWithoutGamesNestedInput
  }

  export type gamesUncheckedUpdateManyWithoutTeams_games_awayToteamsInput = {
    gid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    home?: IntFieldUpdateOperationsInput | number
    homescore?: NullableIntFieldUpdateOperationsInput | number | null
    awayscore?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableBoolFieldUpdateOperationsInput | boolean | null
    winner?: NullableIntFieldUpdateOperationsInput | number | null
    international?: NullableBoolFieldUpdateOperationsInput | boolean | null
    seconds?: NullableIntFieldUpdateOperationsInput | number | null
    current_record?: NullableStringFieldUpdateOperationsInput | string | null
    is_tiebreaker?: NullableBoolFieldUpdateOperationsInput | boolean | null
    homerecord?: NullableStringFieldUpdateOperationsInput | string | null
    awayrecord?: NullableStringFieldUpdateOperationsInput | string | null
    msf_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type picksUpdateWithoutTeamsInput = {
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    games?: gamesUpdateOneRequiredWithoutPicksNestedInput
    people?: peopleUpdateOneRequiredWithoutPicksNestedInput
    leaguemembers?: leaguemembersUpdateOneWithoutPicksNestedInput
  }

  export type picksUncheckedUpdateWithoutTeamsInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type picksUncheckedUpdateManyWithoutTeamsInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    gid?: IntFieldUpdateOperationsInput | number
    loser?: NullableIntFieldUpdateOperationsInput | number | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    ts?: DateTimeFieldUpdateOperationsInput | Date | string
    correct?: NullableIntFieldUpdateOperationsInput | number | null
    done?: NullableIntFieldUpdateOperationsInput | number | null
    is_random?: NullableBoolFieldUpdateOperationsInput | boolean | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlUpdateWithoutTeams_superbowl_loserToteamsInput = {
    uid?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    leaguemembers?: leaguemembersUpdateOneWithoutSuperbowlNestedInput
    teams_superbowl_winnerToteams?: teamsUpdateOneRequiredWithoutSuperbowl_superbowl_winnerToteamsNestedInput
  }

  export type superbowlUncheckedUpdateWithoutTeams_superbowl_loserToteamsInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    winner?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlUncheckedUpdateManyWithoutTeams_superbowl_loserToteamsInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    winner?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlUpdateWithoutTeams_superbowl_winnerToteamsInput = {
    uid?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    teams_superbowl_loserToteams?: teamsUpdateOneRequiredWithoutSuperbowl_superbowl_loserToteamsNestedInput
    leaguemembers?: leaguemembersUpdateOneWithoutSuperbowlNestedInput
  }

  export type superbowlUncheckedUpdateWithoutTeams_superbowl_winnerToteamsInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    loser?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type superbowlUncheckedUpdateManyWithoutTeams_superbowl_winnerToteamsInput = {
    pickid?: IntFieldUpdateOperationsInput | number
    uid?: IntFieldUpdateOperationsInput | number
    loser?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    ts?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    season?: NullableIntFieldUpdateOperationsInput | number | null
    member_id?: NullableIntFieldUpdateOperationsInput | number | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use GamesCountOutputTypeDefaultArgs instead
     */
    export type GamesCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GamesCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LeaguemembersCountOutputTypeDefaultArgs instead
     */
    export type LeaguemembersCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LeaguemembersCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LeaguesCountOutputTypeDefaultArgs instead
     */
    export type LeaguesCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LeaguesCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PeopleCountOutputTypeDefaultArgs instead
     */
    export type PeopleCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PeopleCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamsCountOutputTypeDefaultArgs instead
     */
    export type TeamsCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamsCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmailLogsDefaultArgs instead
     */
    export type EmailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmailLogsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WeekWinnersDefaultArgs instead
     */
    export type WeekWinnersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WeekWinnersDefaultArgs<ExtArgs>
    /**
     * @deprecated Use gamesDefaultArgs instead
     */
    export type gamesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = gamesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use leaguemembersDefaultArgs instead
     */
    export type leaguemembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = leaguemembersDefaultArgs<ExtArgs>
    /**
     * @deprecated Use leaguemessagesDefaultArgs instead
     */
    export type leaguemessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = leaguemessagesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use leaguesDefaultArgs instead
     */
    export type leaguesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = leaguesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use peopleDefaultArgs instead
     */
    export type peopleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = peopleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use picksDefaultArgs instead
     */
    export type picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = picksDefaultArgs<ExtArgs>
    /**
     * @deprecated Use superbowlDefaultArgs instead
     */
    export type superbowlArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = superbowlDefaultArgs<ExtArgs>
    /**
     * @deprecated Use superbowlsquaresDefaultArgs instead
     */
    export type superbowlsquaresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = superbowlsquaresDefaultArgs<ExtArgs>
    /**
     * @deprecated Use teamsDefaultArgs instead
     */
    export type teamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = teamsDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}