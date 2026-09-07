import { getPickSubmissionConfirmation } from "@/lib/picks/getPickSubmissionConfirmation";

describe("getPickSubmissionConfirmation", () => {
  it("names every saved league after a full apply-to-all submission", () => {
    expect(
      getPickSubmissionConfirmation({
        week: 1,
        outcomes: [
          { leagueName: "Office League", status: "saved" },
          { leagueName: "Family League", status: "saved" },
        ],
      }),
    ).toEqual({
      title: "Success!",
      message:
        "Your picks are in for week 1!\n\nYou can come back to update them until the applicable league deadline or game kickoff.\n\nThese picks apply to Office League, Family League.",
    });
  });

  it("identifies closed leagues as skipped after a partial submission", () => {
    expect(
      getPickSubmissionConfirmation({
        week: 4,
        outcomes: [
          { leagueName: "Office League", status: "saved" },
          {
            leagueName: "Family League",
            status: "skipped",
            reason: "first_kickoff",
          },
        ],
      }),
    ).toEqual({
      title: "Some picks saved",
      message:
        "Your picks are in for week 4!\n\nSaved to Office League. Skipped Family League because its weekly picks closed at the first kickoff.",
    });
  });
});
