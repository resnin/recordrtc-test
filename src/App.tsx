import React, {useRef} from "react";
import {MultiStreamRecorder} from "recordrtc";

interface iCamera extends MediaStream {
    width: number,
    height: number,
    top: number,
    left: number
    stop: () => void
}

interface iScreen extends MediaStream {
    width: number,
    height: number,
    fullcanvas: boolean
    stop: () => void
}

interface iRecorder extends MultiStreamRecorder {
    camera?: iCamera,
    screen?: iScreen
    blob?: Blob
}

function App() {
    const video = useRef<HTMLVideoElement | null>(null)
    let recorder: iRecorder | null;


    const startRecord = () => {
        captureCamera(function (camera: iCamera) {
            captureScreen(function (screen: iScreen) {
                screen.width = window.screen.width;
                screen.height = window.screen.height;
                screen.fullcanvas = true;

                camera.width = 320;
                camera.height = 240;
                camera.top = screen.height - camera.height;
                camera.left = screen.width - camera.width;

                recorder = new MultiStreamRecorder([camera, screen], {
                    type: "video"
                });
                recorder.camera = camera;
                recorder.screen = screen
                recorder.record();
            });
        })
    };

    const stopRecord = () => {
        recorder?.stop?.(stopRecordingCallback);
    };

    const stopRecordingCallback = () => {
        if (recorder?.blob && video.current) {
            video.current.src = URL.createObjectURL(recorder.blob);
        }
        recorder?.camera?.stop();
        recorder?.screen?.stop();
        console.log(video)

        recorder = null;
    };


    const captureCamera = (callback: any) => {
        navigator.mediaDevices
            .getUserMedia({audio: true, video: true})
            .then(function (camera) {
                callback(camera);
            })
            .catch(function (error) {
                console.error(error);
            });
    };

    const captureScreen = (callback: any) => {
        navigator.mediaDevices
            .getDisplayMedia({audio: false, video: true})
            .then(function (screen) {
                callback(screen);
            })
            .catch(function (error) {
                console.error(error);
            });
    };

    return (
        <div className="App">
            <video ref={video} controls style={{width: 600}}></video>
            <div>
                <button onClick={startRecord}> Start</button>
                <button onClick={stopRecord}>Stop</button>
            </div>
        </div>
    );
}

export default App;
