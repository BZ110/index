# index
A kind of good screenshare tool.

## What does it scan for?
Mods, only mods. I don't really have a passion to work on it anymore due to recent events.

## How do I use it?
Let the player run the exe file and send the LIGHT diagnostic file. Is there's anything suspicious (for example, a mod that doesn't match a hash), then tell them to send you the HEAVY diagnostic file which contains all base64 encodes of the mods that they have. 👍 

## Technical
### What's your compiler?
I used `pkg` on npm. **download it as a global variable.**
Also, the exe is extremely big because it contains the Nodejs compiler in it and all the libraries I used. If you don't trust it, just recompile the code yourself or even then literally just run it as is with `index.js`.
### Why did you declare `const colours`, but you never used it?
Check the counters. 👍
### Why didn't you use `fetch()` with Nodejs or `axios`?
I didn't want to update my Nodejs and `pkg` version.

## Support?
DM me on Discord Critical#9064
