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
    const fingerLookupIndices = {
        thumb: [0, 1, 2, 3, 4],
        indexFinger: [0, 5, 6, 7, 8],
        middleFinger: [0, 9, 10, 11, 12],
        ringFinger: [0, 13, 14, 15, 16],
        pinky: [0, 17, 18, 19, 20]
    };

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

    function drawKeypoints(ctx, keypoints) {

        const fingers = Object.keys(fingerLookupIndices);
        for (let i = 0; i < fingers.length; i++) {
            const finger = fingers[i];
            const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
            drawPath(ctx, points, false);
        }
    }

    function drawPath(ctx, points, closePath) {
        const region = new Path2D();
        region.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            region.lineTo(point[0], point[1]);
        }

        if (closePath) {
            region.closePath();
        }
        ctx.stroke(region);
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
                    drawKeypoints(ctx, keypoints)
                }
            }
            console.log(predictions.length);


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
