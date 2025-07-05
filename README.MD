# Rum-Rum backend



This is a backend for the rum-rum project which is a platform that makes a room that hosts 2 ppl at a time to engage in a video and voice calls.


you can run the whole project using 

```bash
node index.js
```

# please note that the project does not store the user data nor does it relay messages,videos or calls. it basically helps with rooms management, lobby and exchanging WebRTC packets like offers, answers and ice candidates. and in case the users lost connection to the user while in call the connection between them won't be interrupted.