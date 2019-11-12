1. cleanup garbage from link query params (referrals, google analytics, etc.)
    - if it's an autolink, text is automatically fixed too
2. replace external links to whitelisted domains with a redirector link which hot-fixes them when necessary
    - link text (autolink or user-supplied text) is left as is
    - you can add domains to the list by editing `lib/redirected_domains.js`
