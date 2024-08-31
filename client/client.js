// UI 
const textInput = document.querySelector('.text-input-container').children[0];
const sendBtn = document.querySelector('.text-input-container').children[1];
const textDisplayContainer = document.querySelector('.text-display-container');
const loginBtn = document.querySelector('.control-btn-container').children[0];
const callBtn = document.querySelector('.control-btn-container').children[1];
const answerBtn = document.querySelector('.control-btn-container').children[2];
const hangupBtn = document.querySelector('.control-btn-container').children[3];
const logoutBtn = document.querySelector('.control-btn-container').children[4];

function manageBtnState(iScenario) {
    if (iScenario === 'app-start') {
        loginBtn.disabled = false;
        callBtn.disabled = true;
        answerBtn.disabled = true;
        hangupBtn.disabled = true;
        logoutBtn.disabled = true;
        sendBtn.disabled = true;
    } else if (iScenario === 'app-login') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
        answerBtn.disabled = true;
        hangupBtn.disabled = true;
        logoutBtn.disabled = false;
        sendBtn.disabled = true;
    } else if (iScenario === 'app-incoming-call') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
        answerBtn.disabled = false;
        hangupBtn.disabled = true;
        logoutBtn.disabled = false;
        sendBtn.disabled = true;
    } else if (iScenario === 'app-call-setup') {
        loginBtn.disabled = true;
        callBtn.disabled = true;
        answerBtn.disabled = true;
        hangupBtn.disabled = false;
        logoutBtn.disabled = false;
        sendBtn.disabled = false;
    } else if (iScenario === 'app-call-hangup') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
        answerBtn.disabled = true;
        hangupBtn.disabled = true;
        logoutBtn.disabled = false;
        sendBtn.disabled = true;
    }
}

function subscribeEvents() {
    loginBtn.addEventListener('click', handleLogin);
    callBtn.addEventListener('click', handleCall);
    answerBtn.addEventListener('click', handleAnswer);
    hangupBtn.addEventListener('click', handleHangup);
    logoutBtn.addEventListener('click', handleLogout);
    sendBtn.addEventListener('click', handleSendMessage);
}

// SIGNAL SERVER CONNECTION
let socket = null;

function setUpSocketConnection() {
    socket = io();

    socket.on('iceCandidate', (data) => {
        const iceCandidate = JSON.parse(data);
        webrtc.localConnection && webrtc.localConnection.addIceCandidate(iceCandidate);
    });

    socket.on('offer', (data) => {
        webrtc.incomingOffer = JSON.parse(data);
        manageBtnState('app-incoming-call');
    });

    socket.on('answer', async (data) => {
        webrtc.incomingAnswer = JSON.parse(data);
        await webrtc.localConnection.setRemoteDescription(webrtc.incomingAnswer);
        socket.emit('call-set-up');
    });

    socket.on('call-hang-up', () => {
        webrtc = {};
        manageBtnState('app-call-hangup');
    });

    socket.on('call-set-up', () => {
        manageBtnState('app-call-setup');
    });

    socket.on('logout', () => {
        webrtc = {};
        socket = null;
        manageBtnState('app-start');
        clearMessageInDOM();
    });
}

// CALLBACKS
let webrtc = {};

function handleLogin() {
    setUpSocketConnection();
    manageBtnState('app-login');
}

async function handleCall() {
    const lc = new RTCPeerConnection({
        iceServers: [
            { "urls": "stun:stun.l.google.com:19302" },
            { "urls": "stun:stun.l.google.com:5349" },
            { "urls": "stun:stun1.l.google.com:3478" },
            { "urls": "stun:stun1.l.google.com:5349" },
            { "urls": "stun:stun2.l.google.com:19302" },
            { "urls": "stun:stun2.l.google.com:5349" },
            { "urls": "stun:stun3.l.google.com:3478" },
            { "urls": "stun:stun3.l.google.com:5349" },
            { "urls": "stun:stun4.l.google.com:19302" },
            { "urls": "stun:stun4.l.google.com:5349" }
        ]
    });
    const dc = lc.createDataChannel('data-channel-1');
    webrtc.localConnection = lc;
    webrtc.dataChannel = dc;

    lc.onicecandidate = (e) => {
        const iceCandidate = e.candidate;
        socket.emit('iceCandidate', JSON.stringify(iceCandidate));
    }
    dc.onmessage = (e) => {
        showMessageInDOM(e.data);
    }
    dc.onerror = (error) => {
        console.log('oops!', error);
    }

    const offer = await lc.createOffer();
    await lc.setLocalDescription(offer);
    socket.emit('offer', JSON.stringify(offer));
}

async function handleAnswer() {
    const lc = new RTCPeerConnection({
        iceServers: [
            { "urls": "stun:stun.l.google.com:19302" },
            { "urls": "stun:stun.l.google.com:5349" },
            { "urls": "stun:stun1.l.google.com:3478" },
            { "urls": "stun:stun1.l.google.com:5349" },
            { "urls": "stun:stun2.l.google.com:19302" },
            { "urls": "stun:stun2.l.google.com:5349" },
            { "urls": "stun:stun3.l.google.com:3478" },
            { "urls": "stun:stun3.l.google.com:5349" },
            { "urls": "stun:stun4.l.google.com:19302" },
            { "urls": "stun:stun4.l.google.com:5349" }
        ]
    });
    webrtc.localConnection = lc;

    lc.ondatachannel = (e) => {
        webrtc.dataChannel = e.channel;
        webrtc.dataChannel.onmessage = (e) => {
            showMessageInDOM(e.data);
        }
        webrtc.dataChannel.onerror = (error) => {
            console.log('oops!', error);
        }
    }
    lc.onicecandidate = (e) => {
        const iceCandidate = e.candidate;
        socket.emit('iceCandidate', JSON.stringify(iceCandidate));
    }

    await lc.setRemoteDescription(webrtc.incomingOffer);
    const answer = await lc.createAnswer();
    await lc.setLocalDescription(answer);
    socket.emit('answer', JSON.stringify(answer));
}

function handleHangup() {
    webrtc.localConnection && webrtc.localConnection.close();
    webrtc.dataChannel && webrtc.dataChannel.close();
    socket.emit('call-hang-up');
}

function handleLogout() {
    webrtc.localConnection && webrtc.localConnection.close();
    webrtc.dataChannel && webrtc.dataChannel.close();
    socket.emit('logout');
}

function handleSendMessage() {
    if (textInput.value.trim()) {
        showMessageInDOM(textInput.value.trim(), 'you');
        webrtc.dataChannel.send(textInput.value.trim());
        textInput.value = '';
    }
}

function showMessageInDOM(iMessage, who) {
    const div = document.createElement('div');
    if (who === 'you') {
        div.innerText = 'you: ';
    } else {
        div.innerText = 'friend: ';
    }
    div.innerText += iMessage;
    textDisplayContainer.append(div);
}

function clearMessageInDOM() {
    textDisplayContainer.innerText = "";
}

//APP START
manageBtnState('app-start');
subscribeEvents();



