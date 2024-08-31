### Chatting application
- This is a chatting application using webRTC.

- The UI has 5 buttons:-</br>
a) Login:- starts socket connection to signalling server.</br>
b) Logout:- ends an ongoing call and ends socket connection to signalling server.</br>
c) Call:- call any one who has joined the signalling server using RTC Peer connection.</br>
d) Answer:- If someone who has joined signalling server calls then use answer to answer the call using RTC Peer connection.</br>
e) Hangup:- To end the call. In this the RTC peer connection and data channel are closed. But the socket connection to signalling server is still intact.</br>

- Free STUN servers by Google are used</br>
<pre>
const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" }
];
</pre>

- This app should work properly in full cone, port and address based NAT. 

- No TURN server is used so this app will fail in case of symmetric NAT.


