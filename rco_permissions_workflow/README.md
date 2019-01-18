Every time user logs in, or every 10 minutes for all users:

 - move new users who filled their profile to `just_registered`
 - validate profile and move new users who filled it incorrectly to `che`
 - move users from `just_registered` to `novices` after 1 day
 - move users from `novices` to `members` after 30 days
 - check registration ip and email against banlists, move registered user to `banned` if it matches (after 1 day)
