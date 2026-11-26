# Deployment & Submission Checklist

## Before deploy
- [ ] Production build passes locally
- [ ] All env vars set in hosting dashboard (compare with `.env.example`)
- [ ] Database migrated + seeded in the production project
- [ ] Auth redirect URLs / allowed origins configured for the production domain
- [ ] Storage buckets + policies created

## After deploy
- [ ] Smoke test every role's main flow on the deployed URL
- [ ] No console errors; health route OK
- [ ] Tested from another network/device (phone)
- [ ] Lighthouse run on deployed URL

## Demo safety
- [ ] `git tag demo-final` on the deployed commit
- [ ] Local fallback runs (`build` + `start`) with seeded data
- [ ] Demo reset script tested
- [ ] Backup video recorded and stored offline

## Submission
- [ ] Repository clean; README: overview, features, stack, setup, demo accounts, screenshots,
      architecture, team, asset credits/licences
- [ ] Submission form/requirements from the brief satisfied (list each):
- [ ] Links verified in an incognito window
