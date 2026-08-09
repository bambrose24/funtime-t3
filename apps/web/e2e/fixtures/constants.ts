export const E2E_PASSWORD = "Password123!";

export const E2E_USERS = {
  admin: { email: "web.e2e.admin@example.com", password: E2E_PASSWORD },
  player: { email: "web.e2e.player@example.com", password: E2E_PASSWORD },
  outsider: { email: "web.e2e.outsider@example.com", password: E2E_PASSWORD },
  superAdmin: { email: "bambrose24@gmail.com", password: E2E_PASSWORD },
} as const;

export const E2E_LEAGUES = {
  adminOps: { shareCode: "E2EADMINOPS", name: "E2E Admin Ops League" },
  active: { shareCode: "E2EACTIVE", name: "E2E Active League" },
  bracket: { shareCode: "E2EBRACKET", name: "E2E Bracket League" },
  completed: { shareCode: "E2ECOMPLETE", name: "E2E Completed League" },
  completedRegression: {
    shareCode: "E2EREGRESSION",
    name: "E2E Completed Regression League",
  },
  competition: { shareCode: "E2ECOMPETE", name: "E2E Competition League" },
  integrity: { shareCode: "E2EINTEGRITY", name: "E2E Integrity League" },
  lateJoin: {
    shareCode: "E2ELATEJOIN",
    name: "E2E Late Registration League",
  },
  override: { shareCode: "E2EOVERRIDE", name: "E2E Override League" },
  results: { shareCode: "E2ERESULTS", name: "E2E Results League" },
  waiting: { shareCode: "E2EWAITING", name: "E2E Waiting League" },
} as const;
