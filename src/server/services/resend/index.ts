import LeagueWelcome from "emails/league-welcome";
import { Resend } from "resend";
import { db } from "~/server/db";
import { getLogger } from "~/utils/logging";
const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = "Funtime System <no-reply@play-funtime.com>";

const LOG_PREFIX = "[resend-api]";

export const resendApi = {
  sendLeagueRegistrationEmail: async (memberId: number) => {
    const member = await db.leaguemembers.findFirstOrThrow({
      where: {
        membership_id: memberId,
      },
      include: {
        leagues: {
          include: {
            leaguemembers: {
              include: {
                people: true,
              },
            },
          },
        },
        people: true,
      },
    });

    const admin = member.leagues.leaguemembers.find((m) => m.role === "admin");

    if (!member.people.email || !member.leagues) {
      throw new Error(
        "Member does not have an email or league to send registration to",
      );
    }

    const league = member.leagues;
    const email = member.people.email;

    getLogger().info(
      `${LOG_PREFIX} Going to send league registration email for league ${league.league_id} for member ${memberId}`,
    );
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: `Welcome to ${league.name}!`,
      react: LeagueWelcome({
        admin: {
          email: admin?.people.email ?? "",
          username: admin?.people.username ?? "",
        },
        leagueHomeHref: `https://www.play-funtime.com/league/${league.league_id}`,
        leagueName: league.name,
        season: league.season,
        username: member.people.username,
      }),
    });

    if (error) {
      getLogger().error(
        `${LOG_PREFIX} Error sending registration email for league ${league.league_id} member ${memberId}: ${error.message}`,
        { error },
      );
    } else {
      getLogger().info(
        `${LOG_PREFIX} Sent registration email for league ${league.league_id} member ${memberId}`,
        { data },
      );
    }

    if (data?.id) {
      await db.emailLogs.create({
        data: {
          email_type: "league_registration",
          resend_id: data.id,
          league_id: league.league_id,
          member_id: member.membership_id,
        },
      });
    }
  },
};
