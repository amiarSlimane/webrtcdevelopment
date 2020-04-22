/************************************
 webrtc get media
 ***********************************/

/**
 * get Video and micrpphone stream media
 * @method
 * @name getCamMedia
 * @param {json} rtcConn
 * @param {booolean} outgoingVideo
 * @param {booolean} outgoingAudio
 */
function getCamMedia(rtcConn , outgoingVideo , outgoingAudio) {
    rtcConn.dontAttachStream = false,
        rtcConn.dontGetRemoteStream = false;

    webrtcdev.log("[startJS] getCamMedia - role :", role);
    webrtcdev.log("[startJS] getCamMedia   - outgoingVideo " + outgoingVideo + " outgoingAudio " + outgoingAudio);

    return new Promise(function (resolve, reject) {
        if (role == "inspector") {
            rtcConn.dontCaptureUserMedia = true;
            webrtcdev.log("[_mediacontrol.js] getCamMedia  - Joining as inspector without camera Video");

        } else if (outgoingVideo && outgoingAudio) {
            rtcConn.dontCaptureUserMedia = false;
            webrtcdev.log("[_mediacontrol.js] getCamMedia  - Capture Media ");
            rtcConn.getUserMedia();  // not wait for the rtc conn on media stream or on error

        } else if (!outgoingVideo && outgoingAudio) {
            rtcConn.dontCaptureUserMedia = false;
            // alert(" start  getCamMedia  - Dont Capture Webcam, only Mic");
            webrtcdev.warn("[_mediacontrol.js] getCamMedia  - Dont Capture Webcam only Mic ");
            rtcConn.getUserMedia();  // not wait for the rtc conn on media stream or on error

        } else {
            rtcConn.dontCaptureUserMedia = true;
            webrtcdev.error(" [_mediacontrol.js] getCamMedia - dont Capture outgoing video ", outgoingVideo);
            window.dispatchEvent(new CustomEvent('webrtcdev', {
                detail: {
                    servicetype: "session",
                    action: "onNoCameraCard"
                }
            }));
        }
        resolve("success");
    }).catch(
        (reason) => {
            webrtcdev.error('[_mediacontrol.js] getCamMedia  - rejected promise (' + reason + ')');
        });
}

/**
 * get Video and micrpphone stream media
 * @method
 * @name getCamMedia
 * @param {json} rtcConn
 */
function waitForRemoteVideo(_remoteStream, _remoteVideo, _localVideo, _miniVideo) {
    var videoTracks = _remoteStream.getVideoTracks();
    if (videoTracks.length === 0 || _remoteVideo.currentTime > 0) {
        transitionToActive(_remoteVideo, _localVideo, _miniVideo);
    } else {
        setTimeout(function () {
            waitForRemoteVideo(_remoteStream, _remoteVideo, _localVideo, _miniVideo)
        }, 100);
    }
}

/**
 * transition To Active
 * @method
 * @name transitionToActive
 */
function transitionToActive(_remoteVideo, _localVideo, _miniVideo) {
    _remoteVideo.style.opacity = 1;
    if (localVideo != null) {
        setTimeout(function () {
            _localVideo.src = '';
        }, 500);
    }
    if (miniVideo != null) {
        setTimeout(function () {
            _miniVideo.style.opacity = 1;
        }, 1000);
    }
}

/**
 * transition To Waiting
 * @method
 * @name transitionToWaiting
 */
function transitionToWaiting(localVideo , miniVideo) {
    setTimeout(function () {
        localVideo.srcObject = miniVideo.srcObject;
        localVideo.muted = true;
        miniVideo.srcObject = null;
        remoteVideo.srcObject = null;
    }, 500);
}

/**
 * attach media stream to dom element
 * @method
 * @name attachMediaStream
 * @param {string} remvid
 * @param {stream} stream
 */
function attachMediaStream(remvid, stream) {
    try {
        var element = "";
        webrtcdev.log("[ Mediacontrol - attachMediaStream ] element ", remvid);
        if ((document.getElementsByName(remvid)).length > 0) {
            element = document.getElementsByName(remvid)[0];
        } else if (remvid.video) {
            element = remvid.video;
        } else if (remvid.nodeName == "VIDEO") {
            element = remvid;
        } else {
            return new Promise(function (resolve, reject) {
                reject(1);
            });
        }

        webrtcdev.log("[ Mediacontrol - attachMediaStream ] stream ", stream);

        // If stream is present , attach teh streama dn give play
        if (stream) {
            let pr = new Promise(function (resolve, reject) {
                element.srcObject = stream;
                webrtcdev.log("[  Mediacontrol - attachMediaStream  ] added src object for valid stream ", element, stream);
                var playPromise = element.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        resolve(1);
                    })
                        .catch(error => {
                            webrtcdev.error("[  Mediacontrol - attachMediaStream  ] error ", error);
                            reject(1);
                        });
                }
            });
            return pr;
        }

        // If no stream , just attach the src as null
        element.srcObject = null;
        webrtcdev.warn("[ Mediacontrol - attachMediaStream ] Media Stream empty '' attached to ", element, " as stream is not valid ", stream);

    } catch (err) {
        webrtcdev.error(" [ Mediacontrol - attachMediaStream ]  error", err);
    }
}

/**
 * Re attach media stream from one dom to another dom element
 * @method
 * @name reattachMediaStream
 * @param {dom} to
 * @param {dom} from
 */
function reattachMediaStream(to, from) {
    try {
        let pr = new Promise(function (resolve, reject) {
            to.srcObject = from.srcObject;
            webrtcdev.log(' [  Mediacontrol] reattachMediaStream - added src object for valid stream ', to);
            to.play().then(
                resolve(1)
            );
        });
        return pr;
    } catch (err) {
        webrtcdev.error("[media control] reattachMediaStream err ", err)
    }
}