import { vec3, quat, mat4 } from 'gl-matrix';

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageCroppingWidget from '@kitware/vtk.js/Widgets/Widgets3D/ImageCroppingWidget';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';

// Force the loading of HttpDataAccessHelper to support gzip decompression
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

// import controlPanel from '../dist/controlPanel.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------
const controlPanel = `
<table style="color:black">
        <tr>
            <td>pickable</td>
            <td>
                <input class='flag' data-name="pickable" type="checkbox" checked />
            </td>
        </tr>
        <tr>
            <td>visibility</td>
            <td>
                <input class='flag' data-name="visibility" type="checkbox" checked />
            </td>
        </tr>
        <tr>
            <td>contextVisibility</td>
            <td>
                <input class='flag' data-name="contextVisibility" type="checkbox" checked />
            </td>
        </tr>
        <tr>
            <td>handleVisibility</td>
            <td>
                <input class='flag' data-name="handleVisibility" type="checkbox" checked />
            </td>
        </tr>
        <tr>
        <td>faceHandlesEnabled</td>
        <td>
            <input class='flag' data-name="faceHandlesEnabled" type="checkbox" checked />
        </td>
    </tr>
    <tr>
    <td>edgeHandlesEnabled</td>
    <td>
        <input class='flag' data-name="edgeHandlesEnabled" type="checkbox" checked />
    </td>
</tr>
<tr>
<td>cornerHandlesEnabled</td>
<td>
    <input class='flag' data-name="cornerHandlesEnabled" type="checkbox" checked />
</td>
</tr>
    </table>
`;
const rootContainer_1 = document.createElement('div');
document.body.appendChild(rootContainer_1);
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0],
    rootContainer: rootContainer_1
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const apiRenderWindow = fullScreenRenderer.getApiSpecificRenderWindow();

global.renderer = renderer;
global.renderWindow = renderWindow;

// ----------------------------------------------------------------------------
// 2D overlay rendering
// ----------------------------------------------------------------------------

const overlaySize = 15;
const overlayBorder = 2;
const overlay = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.width = `${overlaySize}px`;
overlay.style.height = `${overlaySize}px`;
overlay.style.border = `solid ${overlayBorder}px red`;
overlay.style.borderRadius = '50%';
overlay.style.left = '-100px';
overlay.style.pointerEvents = 'none';
document.querySelector('body').appendChild(overlay);

// ----------------------------------------------------------------------------
// Widget manager
// ----------------------------------------------------------------------------

const widgetManager = vtkWidgetManager.newInstance();
widgetManager.setRenderer(renderer);

const widget_1 = vtkImageCroppingWidget.newInstance();

function widgetRegistration(e) {
    const action = e ? e.currentTarget.dataset.action : 'addWidget';
    const viewWidget = widgetManager[action](widget_1);
    if (viewWidget) {
        viewWidget.setDisplayCallback((coords) => {
            overlay.style.left = '-100px';
            if (coords) {
                const [w, h] = apiRenderWindow.getSize();
                overlay.style.left = `${Math.round(
                    (coords[0][0] / w) * window.innerWidth -
                    overlaySize * 0.5 -
                    overlayBorder
                )}px`;
                overlay.style.top = `${Math.round(
                    ((h - coords[0][1]) / h) * window.innerHeight -
                    overlaySize * 0.5 -
                    overlayBorder
                )}px`;
            }
        });

        renderer.resetCamera();
        renderer.resetCameraClippingRange();
    }
    widgetManager.enablePicking();
    renderWindow.render();
}

// Initial widget register
widgetRegistration();

// ----------------------------------------------------------------------------
// Volume rendering
// ----------------------------------------------------------------------------

const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });

const actor = vtkVolume.newInstance();
const mapper = vtkVolumeMapper.newInstance();
mapper.setSampleDistance(1.1);
actor.setMapper(mapper);

// create color and opacity transfer functions
const ctfun = vtkColorTransferFunction.newInstance();
ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
const ofun = vtkPiecewiseFunction.newInstance();
ofun.addPoint(0.0, 0.0);
ofun.addPoint(255.0, 1.0);
actor.getProperty().setRGBTransferFunction(0, ctfun);
actor.getProperty().setScalarOpacity(0, ofun);
actor.getProperty().setScalarOpacityUnitDistance(0, 3.0);
actor.getProperty().setInterpolationTypeToLinear();
actor.getProperty().setUseGradientOpacity(0, true);
actor.getProperty().setGradientOpacityMinimumValue(0, 2);
actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
actor.getProperty().setGradientOpacityMaximumValue(0, 20);
actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
actor.getProperty().setShade(true);
actor.getProperty().setAmbient(0.2);
actor.getProperty().setDiffuse(0.7);
actor.getProperty().setSpecular(0.3);
actor.getProperty().setSpecularPower(8.0);
// actor.setVisibility(false)
mapper.setInputConnection(reader.getOutputPort());
// mapper.setVisibility(false)
// -----------------------------------------------------------
// Get data
// -----------------------------------------------------------

function getCroppingPlanes(imageData, ijkPlanes) {
    const rotation = quat.create();
    mat4.getRotation(rotation, imageData.getIndexToWorld());

    const rotateVec = (vec) => {
        const out = [0, 0, 0];
        vec3.transformQuat(out, vec, rotation);
        return out;
    };

    const [iMin, iMax, jMin, jMax, kMin, kMax] = ijkPlanes;
    const origin = imageData.indexToWorld([iMin, jMin, kMin]);
    // opposite corner from origin
    const corner = imageData.indexToWorld([iMax, jMax, kMax]);
    return [
        // X min/max
        vtkPlane.newInstance({ normal: rotateVec([1, 0, 0]), origin }),
        vtkPlane.newInstance({ normal: rotateVec([-1, 0, 0]), origin: corner }),
        // Y min/max
        vtkPlane.newInstance({ normal: rotateVec([0, 1, 0]), origin }),
        vtkPlane.newInstance({ normal: rotateVec([0, -1, 0]), origin: corner }),
        // X min/max
        vtkPlane.newInstance({ normal: rotateVec([0, 0, 1]), origin }),
        vtkPlane.newInstance({ normal: rotateVec([0, 0, -1]), origin: corner }),
    ];
}

reader.setUrl(`https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`).then(() => {
    reader.loadData().then(() => {
        const image = reader.getOutputData();

        // update crop widget
        widget_1.copyImageDataDescription(image);
        const cropState = widget_1.getWidgetState().getCroppingPlanes();
        cropState.onModified(() => {
            const planes = getCroppingPlanes(image, cropState.getPlanes());
            mapper.removeAllClippingPlanes();
            planes.forEach((plane) => {
                mapper.addClippingPlane(plane);
            });
            mapper.modified();
        });

        // add volume to renderer
        renderer.addVolume(actor);
        renderer.resetCamera();
        renderer.resetCameraClippingRange();
        renderWindow.render();
    });
});

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

function updateFlag(e) {
    const value = !!e.target.checked;
    const name = e.currentTarget.dataset.name;
    widget_1.set({
        [name]: value
    }); // can be called on either viewWidget or parentWidget

    widgetManager.enablePicking();
    renderWindow.render();
}

const elems = document.querySelectorAll('.flag');
for (let i = 0; i < elems.length; i++) {
    elems[i].addEventListener('change', updateFlag);
}

const buttons = document.querySelectorAll('button');
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', widgetRegistration);
}

// *******************************************************************************
const controlPanel2 = `
<table >
<label style="color:black">ISOvalue</label>
  <tr>
    <td>
      <input class="resolution" type="range" min="4" max="80" value="6" />
    </td>
  </tr>
</table>
`;
const rootContainer_2 = document.createElement('div');
document.body.appendChild(rootContainer_2);
const fullScreenRenderWindow_2 = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0],
    rootContainer: rootContainer_2
});
const renderWindow_2 = fullScreenRenderWindow_2.getRenderWindow();
const renderer_2 = fullScreenRenderWindow_2.getRenderer();

fullScreenRenderWindow_2.addController(controlPanel2);
const actor_2 = vtkActor.newInstance();
const mapper_2 = vtkMapper.newInstance();
const marchingCube = vtkImageMarchingCubes.newInstance({
    contourValue: 0.0,
    computeNormals: true,
    mergePoints: true,
});

actor_2.setMapper(mapper_2);
mapper_2.setInputConnection(marchingCube.getOutputPort());

function updateIsoValue(e) {
    const isoValue = Number(e.target.value);
    marchingCube.setContourValue(isoValue);
    renderWindow_2.render();
}

const reader_2 = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
marchingCube.setInputConnection(reader_2.getOutputPort());

reader_2
    .setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`, { loadData: true })
    .then(() => {
        const data = reader_2.getOutputData();
        const dataRange = data.getPointData().getScalars().getRange();
        const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

        const el = document.querySelector('.resolution');
        el.setAttribute('min', dataRange[0]);
        el.setAttribute('max', dataRange[1]);
        el.setAttribute('value', firstIsoValue);
        el.addEventListener('input', updateIsoValue);

        marchingCube.setContourValue(firstIsoValue);
        renderer_2.addActor(actor_2);
        renderer_2.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
        renderer_2.resetCamera();
        renderWindow_2.render();
    });
// rootContainer_2.style.display = "none"
global.fullScreen = fullScreenRenderWindow_2;
global.actor = actor_2;
global.mapper = mapper_2;
global.marchingCube = marchingCube;
const rootContainer_3 = document.createElement('div');
document.body.appendChild(rootContainer_3);

const rootContainer = document.querySelector(
    '.vtk-js-example-piecewise-gaussian-widget'
);
const containerStyle = rootContainer ? { height: '100%' } : null;
const urlToLoad = rootContainer ?
    rootContainer.dataset.url ||
    'https://kitware.github.io/vtk-js/data/volume/LIDC2.vti' :
    `https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`;

const fullScreenRenderer_3 = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0],
    rootContainer: rootContainer_3,
    containerStyle,
});
// fullScreenRenderer_3.addController(controlPanel3)
const renderer_3 = fullScreenRenderer_3.getRenderer();
const renderWindow_3 = fullScreenRenderer_3.getRenderWindow();

renderWindow_3.getInteractor().setDesiredUpdateRate(15.0);

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const body = rootContainer || document.querySelector('body');

// Create Widget container
const widgetContainer = document.createElement('div');
widgetContainer.style.position = 'absolute';
widgetContainer.style.top = 'calc(10px + 1em)';
widgetContainer.style.left = '5px';
widgetContainer.style.background = 'rgba(255, 255, 255, 0.3)';
body.appendChild(widgetContainer);

// Create Label for preset
const labelContainer = document.createElement('div');
labelContainer.style.position = 'absolute';
labelContainer.style.top = '5px';
labelContainer.style.left = '5px';
labelContainer.style.width = '100%';
labelContainer.style.color = 'white';
labelContainer.style.textAlign = 'center';
labelContainer.style.userSelect = 'none';
labelContainer.style.cursor = 'pointer';
body.appendChild(labelContainer);

let presetIndex = 1;
const globalDataRange = [0, 255];
const lookupTable = vtkColorTransferFunction.newInstance();

function changePreset(delta = 1) {
    presetIndex =
        (presetIndex + delta + vtkColorMaps.rgbPresetNames.length) %
        vtkColorMaps.rgbPresetNames.length;
    lookupTable.applyColorMap(
        vtkColorMaps.getPresetByName(vtkColorMaps.rgbPresetNames[presetIndex])
    );
    lookupTable.setMappingRange(...globalDataRange);
    lookupTable.updateRange();
    labelContainer.innerHTML = vtkColorMaps.rgbPresetNames[presetIndex];
}

let intervalID = null;

function stopInterval() {
    if (intervalID !== null) {
        clearInterval(intervalID);
        intervalID = null;
    }
}

labelContainer.addEventListener('click', (event) => {
    if (event.pageX < 200) {
        stopInterval();
        changePreset(-1);
    } else {
        stopInterval();
        changePreset(1);
    }
});

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const widget = vtkPiecewiseGaussianWidget.newInstance({
    numberOfBins: 256,
    size: [400, 150],
});
widget.updateStyle({
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    histogramColor: 'rgba(100, 100, 100, 0.5)',
    strokeColor: 'rgb(0, 0, 0)',
    activeColor: 'rgb(255, 255, 255)',
    handleColor: 'rgb(50, 150, 50)',
    buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
    buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
    buttonStrokeColor: 'rgba(0, 0, 0, 1)',
    buttonFillColor: 'rgba(255, 255, 255, 1)',
    strokeWidth: 2,
    activeStrokeWidth: 3,
    buttonStrokeWidth: 1.5,
    handleWidth: 3,
    iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
    padding: 10,
});

fullScreenRenderer_3.setResizeCallback(({ width, height }) => {
    widget.setSize(Math.min(450, width - 10), 150);
});

const piecewiseFunction = vtkPiecewiseFunction.newInstance();

const actor_3 = vtkVolume.newInstance();
const mapper_3 = vtkVolumeMapper.newInstance({ sampleDistance: 1.1 });
const reader_3 = vtkHttpDataSetReader.newInstance({ fetchGzip: true });

reader_3.setUrl(urlToLoad).then(() => {
    reader_3.loadData().then(() => {
        const imageData = reader_3.getOutputData();
        const dataArray = imageData.getPointData().getScalars();
        const dataRange = dataArray.getRange();
        globalDataRange[0] = dataRange[0];
        globalDataRange[1] = dataRange[1];

        // Update Lookup table
        changePreset();

        // Automatic switch to next preset every 5s
        if (!rootContainer) {
            intervalID = setInterval(changePreset, 5000);
        }

        widget.setDataArray(dataArray.getData());
        widget.applyOpacity(piecewiseFunction);

        widget.setColorTransferFunction(lookupTable);
        lookupTable.onModified(() => {
            widget.render();
            renderWindow_3.render();
        });

        renderer_3.addVolume(actor_3);
        renderer_3.resetCamera();
        renderer_3.getActiveCamera().elevation(70);
        renderWindow_3.render();
    });
});

actor_3.setMapper(mapper_3);
mapper_3.setInputConnection(reader_3.getOutputPort());

actor_3.getProperty().setRGBTransferFunction(0, lookupTable);
actor_3.getProperty().setScalarOpacity(0, piecewiseFunction);
actor_3.getProperty().setInterpolationTypeToFastLinear();

// ----------------------------------------------------------------------------
// Default setting Piecewise function widget
// ----------------------------------------------------------------------------

widget.addGaussian(0.425, 0.5, 0.2, 0.3, 0.2);
widget.addGaussian(0.75, 1, 0.3, 0, 0);

widget.setContainer(widgetContainer);
widget.bindMouseListeners();

widget.onAnimation((start) => {
    if (start) {
        renderWindow_3.getInteractor().requestAnimation(widget);
    } else {
        renderWindow_3.getInteractor().cancelAnimation(widget);
    }
});

widget.onOpacityChange(() => {
    widget.applyOpacity(piecewiseFunction);
    if (!renderWindow_3.getInteractor().isAnimating()) {
        renderWindow_3.render();
    }
});
rootContainer_1.style.display = "none"
rootContainer_3.style.display = "none"
widgetContainer.style.display = "none"
rootContainer_2.style.display = "none"
    // ----------------------------------------------------------------------------
    // Expose variable to global namespace
    // ----------------------------------------------------------------------------
global.widget = widget;
document.getElementById("clickMeIso").addEventListener("click", function() {
    rootContainer_2.style.display = "inline-table";
    rootContainer_1.style.display = "none";
    rootContainer_3.style.display = "none";
    widgetContainer.style.display = "none";
});

document.getElementById("clickMeClip").addEventListener("click", function() {
    rootContainer_1.style.display = "inline-table";
    rootContainer_2.style.display = "none";
    rootContainer_3.style.display = "none";
    widgetContainer.style.display = "none";
});

document.getElementById("clickMeRayCasting").addEventListener("click", function() {
    rootContainer_3.style.display = "flex";
    rootContainer_2.style.display = "none";
    rootContainer_1.style.display = "none";
    widgetContainer.style.display = "block";
});
document.getElementById("Back_button").addEventListener("click", function() {
    rootContainer_3.style.display = "none";
    rootContainer_2.style.display = "none";
    rootContainer_1.style.display = "none";
    widgetContainer.style.display = "none";
});