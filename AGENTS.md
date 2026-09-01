# Repository Instructions

## Pull request CI monitoring

- Be usage-minded whenever the user asks to watch or monitor CI for a pull request.
- Poll CI no more frequently than once every five minutes unless the user explicitly requests a different cadence or CI reports a terminal result.
- Prefer one compact status query per poll. Fetch detailed logs only after a check fails or when the user explicitly requests them.
- Do not report unchanged intermediate status. Stop polling as soon as CI reaches a terminal success or failure state.
- Never merge while required checks are pending or failing. When the user has authorized a merge, merge only after all required checks pass and the pull request is mergeable.
