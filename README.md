# awocards: AWkward Options CARDS

Play here: https://awocards.iio.ie.

awocards is a collection text cards and an online game around them.

Game is written in typescript, the post-commit script ensures that the code is styled properly and compiles.

The game is hosted from the docs subdirectory.
Releases follow the YYR scheme (last two digits of the year + release number).
There's at most 10 releases per year to reduce churn (changes to questions mess up ordering in ongoing games).
index.html always points to the latest release while v0.html points to the latest commit for testing purposes.
If a clients connects to a host with a different version then the client HTTP redirects to the right version and retries the connection.

The networking is peer to peer with WebRTC.
It uses the https://fly.io hosted https://iio.ie/sig to exchange the initial SDP offers, see https://github.com/ypsu/blog/blob/main/sig/sig.go.
There's always one host which contains the canonical game state, clients can send messages to alter the state and then display the game state in a nice way.

No affiliation with the very similar game called "Awkward".
Name is similar because the concept is similar and I'm not creative at naming.
All other names I could come up had also similar games associated with them (e.g. Answer This, Inquisitive).
I have not played any of these games.
awocards was chosen as the name because it's unique enough while simple to pronounce and write down.

This repo is public domain.
Feel free to reuse the cards or code in any manner you desire, no credit is needed.
