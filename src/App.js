import React, {useEffect, createRef} from 'react';
import './App.css';

const handpose = require('@tensorflow-models/handpose');
const keypointsJson = {};

function App() {
    // let video = document.getElementById('webcam');
    const video = createRef();
    const canvas = createRef();
    // const model = handpose.load();
    let model = null;

    async function setupWebcam() {
        return new Promise((resolve, reject) => {
            const navigatorAny = navigator;
            navigator.getUserMedia = navigator.getUserMedia ||
                navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
                navigatorAny.msGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia({video: true},
                    stream => {
                        if (video) {
                            video.current.srcObject = stream;
                            video.current.addEventListener('loadeddata', () => resolve(), false);
                        }
                    },
                    error => reject());
            } else {
                reject();
            }
        });
    }

    function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
        for (let i = 0; i < keypoints.length; i++) {
            const keypoint = keypoints[i];

            if (keypoint.score < minConfidence) {
                continue;
            }

            const {y, x} = keypoint.position;
            drawPoint(ctx, y * scale, x * scale, 3, "#FFFF");
        }
    }

    function drawPoint(ctx, y, x, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 10 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function toTuple({y, x}) {
        return [y, x];
    }

    async function drawImge(){
        console.log(model);
        if (model) {

            var _video = video.current;
            var _canvas = canvas.current;
            var ctx = _canvas.getContext('2d');

            _canvas.width = _video.videoWidth;
            _canvas.height = _video.videoHeight;


            ctx.drawImage(_video, 0, 0, _canvas.width, _canvas.height);
            const predictions = await model.estimateHands(video.current);
            if (predictions.length > 0) {
                /*
                `predictions` is an array of objects describing each detected hand, for example:
                [
                  {
                    handInViewConfidence: 1, // The probability of a hand being present.
                    boundingBox: { // The bounding box surrounding the hand.
                      topLeft: [162.91, -17.42],
                      bottomRight: [548.56, 368.23],
                    },
                    landmarks: [ // The 3D coordinates of each hand landmark.
                      [472.52, 298.59, 0.00],
                      [412.80, 315.64, -6.18],
                      ...
                    ],
                    annotations: { // Semantic groupings of the `landmarks` coordinates.
                      thumb: [
                        [412.80, 315.64, -6.18]
                        [350.02, 298.38, -7.14],
                        ...
                      ],
                      ...
                    }
                  }
                ]
                */

                for (let i = 0; i < predictions.length; i++) {
                    const keypoints = predictions[i].landmarks;

                    // Log hand keypoints.
                    for (let i = 0; i < keypoints.length; i++) {
                        const [x, y, z] = keypoints[i];
                        console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, 10 * Math.PI);
                        ctx.fillStyle = "#FFFF";
                        ctx.fill();
                    }
                }
            }
            // var faceArea = 300;
            // var pX=_canvas.width/2 - faceArea/2;
            // var pY=_canvas.height/2 - faceArea/2;
            //
            // ctx.rect(pX,pY,faceArea,faceArea);
            // ctx.lineWidth = "6";
            // ctx.strokeStyle = "red";
            ctx.stroke();


            setTimeout(drawImge, 10);
        }
    }

    useEffect(async () => {
        console.log(video);
        await setupWebcam();
        if (video && canvas) {
            //Desnehando e convertendo as minensões
            model = await handpose.load();
            if (model){
                drawImge();
            }
        }
    }, [video]);

    useEffect( () => {
        console.log(model);
    }, [model]);
    return (
        <div className="App">
            <video ref={video} autoPlay playsInline className="App-video" style={{width: 500, height: 500}}/>
            <canvas ref={canvas} style={{width: 500, height: 500}}/>
        </div>
    );
}

export default App;
