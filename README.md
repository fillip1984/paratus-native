# Paratus

This is a react native implementation of another application I've built, [ex-nihilo](https://github.com/fillip1984/ex-nihilo). I'm attempting to convert to a mobile application that can send notifications to get better adoption. Right now, I seldom open ex-nihilo. I'm thinking that if I have an app that sends push notifications I'll actually stick to the habits I'm attempting to adopt.

## How to use

You create routines using the Planner tab. Routines generate activities on the Home (timeline). Each week you can check how you did. How many activities you skipped or completed.

## TODO

- [ ] Generate interactions when completing activities
  - [X] Blood pressure interaction
  - [ ] Weigh in interaction
  - [ ] Run interaction
  - [ ] Notes interaction
- [ ] Add profile image in top right on home that launches user preferences modal
  - [ ] show outcomes inside of the preferences page?
  - [X] Add ability to rebuild all activities
  - [X] Add ability to delete all routines, useful for testing but may not be useful for prod
- [X] Automatically generate activities when routine is created or updated.
- [ ] Create custom nature event cards (dawn, dusk, seasonal changes, etc...)
- [ ] Finish local push notifications
- [ ] Hook up backend to track outcomes
- [ ] Add faceId login/security
- [X] create sample routines import option
- [X] Add sunrise service to track sunlight
- [ ] Add 'seeking' repeat mode where you are prompted if you did something. Eventually an appropriate repeat schedule is generated.
- [ ] Resolve TODOs
