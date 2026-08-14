test(alerts, users): add comprehensive test coverage for alertSolved and restorePassword

Backend:
- AlertSolvedRepository: findAllAlertsSolved (returnAll, dev account filtering, cache), create
- AlertSolvedService: getSolvedAlerts (field mapping, returnAll passthrough), createSolvedAlert
- AlertSolvedController: GET/POST delegation, Zod validation

Frontend:
- alertSolvedService: fetchAll, create (URL correctness, error handling)
- userService.restorePassword: URL correctness, error handling
- useAlertSolved: query hook returns data via useSuspenseQuery
- useAlertSolvedMutation: creates solved alert, invalidates queries, shows toast
- useRestorePassword: restores password, invalidates queries, shows toast
- AlertSolvedButton: renders, opens dialog, confirms with correct data, cancels
- RestorePasswordButton: renders, opens dialog, confirms, handles error, cancels
