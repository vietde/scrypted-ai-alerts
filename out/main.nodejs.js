//# sourceURL=/plugin/main.nodejs.js
                
Object.defineProperty(exports, '__esModule', { value: true });

var require$$1 = require('fs');
var require$$2 = require('module');
var child_process = require('child_process');
var fs = require('fs/promises');
var os = require('os');
var path = require('path');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var os__namespace = /*#__PURE__*/_interopNamespaceDefault(os);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src = {};

var gen = {};

var hasRequiredGen;

function requireGen () {
	if (hasRequiredGen) return gen;
	hasRequiredGen = 1;
	Object.defineProperty(gen, "__esModule", { value: true });
	gen.ScryptedMimeTypes = gen.ScryptedInterface = gen.MediaPlayerState = gen.SecuritySystemObstruction = gen.SecuritySystemMode = gen.AirQuality = gen.AirPurifierMode = gen.AirPurifierStatus = gen.ChargeState = gen.LockState = gen.PanTiltZoomMovement = gen.ThermostatMode = gen.TemperatureUnit = gen.FanMode = gen.HumidityMode = gen.ScryptedDeviceType = gen.ScryptedInterfaceDescriptors = gen.ScryptedInterfaceMethod = gen.ScryptedInterfaceProperty = gen.DeviceBase = gen.TYPES_VERSION = void 0;
	gen.TYPES_VERSION = "0.5.54";
	class DeviceBase {
	}
	gen.DeviceBase = DeviceBase;
	var ScryptedInterfaceProperty;
	(function (ScryptedInterfaceProperty) {
	    ScryptedInterfaceProperty["id"] = "id";
	    ScryptedInterfaceProperty["info"] = "info";
	    ScryptedInterfaceProperty["interfaces"] = "interfaces";
	    ScryptedInterfaceProperty["mixins"] = "mixins";
	    ScryptedInterfaceProperty["name"] = "name";
	    ScryptedInterfaceProperty["nativeId"] = "nativeId";
	    ScryptedInterfaceProperty["pluginId"] = "pluginId";
	    ScryptedInterfaceProperty["providedInterfaces"] = "providedInterfaces";
	    ScryptedInterfaceProperty["providedName"] = "providedName";
	    ScryptedInterfaceProperty["providedRoom"] = "providedRoom";
	    ScryptedInterfaceProperty["providedType"] = "providedType";
	    ScryptedInterfaceProperty["providerId"] = "providerId";
	    ScryptedInterfaceProperty["room"] = "room";
	    ScryptedInterfaceProperty["type"] = "type";
	    ScryptedInterfaceProperty["scryptedRuntimeArguments"] = "scryptedRuntimeArguments";
	    ScryptedInterfaceProperty["on"] = "on";
	    ScryptedInterfaceProperty["brightness"] = "brightness";
	    ScryptedInterfaceProperty["colorTemperature"] = "colorTemperature";
	    ScryptedInterfaceProperty["rgb"] = "rgb";
	    ScryptedInterfaceProperty["hsv"] = "hsv";
	    ScryptedInterfaceProperty["buttons"] = "buttons";
	    ScryptedInterfaceProperty["sensors"] = "sensors";
	    ScryptedInterfaceProperty["running"] = "running";
	    ScryptedInterfaceProperty["paused"] = "paused";
	    ScryptedInterfaceProperty["docked"] = "docked";
	    ScryptedInterfaceProperty["temperatureSetting"] = "temperatureSetting";
	    ScryptedInterfaceProperty["temperature"] = "temperature";
	    ScryptedInterfaceProperty["temperatureUnit"] = "temperatureUnit";
	    ScryptedInterfaceProperty["humidity"] = "humidity";
	    ScryptedInterfaceProperty["resolution"] = "resolution";
	    ScryptedInterfaceProperty["audioVolumes"] = "audioVolumes";
	    ScryptedInterfaceProperty["recordingActive"] = "recordingActive";
	    ScryptedInterfaceProperty["ptzCapabilities"] = "ptzCapabilities";
	    ScryptedInterfaceProperty["lockState"] = "lockState";
	    ScryptedInterfaceProperty["entryOpen"] = "entryOpen";
	    ScryptedInterfaceProperty["batteryLevel"] = "batteryLevel";
	    ScryptedInterfaceProperty["chargeState"] = "chargeState";
	    ScryptedInterfaceProperty["online"] = "online";
	    ScryptedInterfaceProperty["fromMimeType"] = "fromMimeType";
	    ScryptedInterfaceProperty["toMimeType"] = "toMimeType";
	    ScryptedInterfaceProperty["converters"] = "converters";
	    ScryptedInterfaceProperty["binaryState"] = "binaryState";
	    ScryptedInterfaceProperty["tampered"] = "tampered";
	    ScryptedInterfaceProperty["sleeping"] = "sleeping";
	    ScryptedInterfaceProperty["powerDetected"] = "powerDetected";
	    ScryptedInterfaceProperty["audioDetected"] = "audioDetected";
	    ScryptedInterfaceProperty["motionDetected"] = "motionDetected";
	    ScryptedInterfaceProperty["ambientLight"] = "ambientLight";
	    ScryptedInterfaceProperty["occupied"] = "occupied";
	    ScryptedInterfaceProperty["flooded"] = "flooded";
	    ScryptedInterfaceProperty["ultraviolet"] = "ultraviolet";
	    ScryptedInterfaceProperty["luminance"] = "luminance";
	    ScryptedInterfaceProperty["position"] = "position";
	    ScryptedInterfaceProperty["securitySystemState"] = "securitySystemState";
	    ScryptedInterfaceProperty["pm10Density"] = "pm10Density";
	    ScryptedInterfaceProperty["pm25Density"] = "pm25Density";
	    ScryptedInterfaceProperty["vocDensity"] = "vocDensity";
	    ScryptedInterfaceProperty["noxDensity"] = "noxDensity";
	    ScryptedInterfaceProperty["co2ppm"] = "co2ppm";
	    ScryptedInterfaceProperty["airQuality"] = "airQuality";
	    ScryptedInterfaceProperty["airPurifierState"] = "airPurifierState";
	    ScryptedInterfaceProperty["filterChangeIndication"] = "filterChangeIndication";
	    ScryptedInterfaceProperty["filterLifeLevel"] = "filterLifeLevel";
	    ScryptedInterfaceProperty["humiditySetting"] = "humiditySetting";
	    ScryptedInterfaceProperty["fan"] = "fan";
	    ScryptedInterfaceProperty["applicationInfo"] = "applicationInfo";
	    ScryptedInterfaceProperty["chatCompletionCapabilities"] = "chatCompletionCapabilities";
	    ScryptedInterfaceProperty["systemDevice"] = "systemDevice";
	})(ScryptedInterfaceProperty || (gen.ScryptedInterfaceProperty = ScryptedInterfaceProperty = {}));
	var ScryptedInterfaceMethod;
	(function (ScryptedInterfaceMethod) {
	    ScryptedInterfaceMethod["listen"] = "listen";
	    ScryptedInterfaceMethod["probe"] = "probe";
	    ScryptedInterfaceMethod["setMixins"] = "setMixins";
	    ScryptedInterfaceMethod["setName"] = "setName";
	    ScryptedInterfaceMethod["setRoom"] = "setRoom";
	    ScryptedInterfaceMethod["setType"] = "setType";
	    ScryptedInterfaceMethod["getPluginJson"] = "getPluginJson";
	    ScryptedInterfaceMethod["turnOff"] = "turnOff";
	    ScryptedInterfaceMethod["turnOn"] = "turnOn";
	    ScryptedInterfaceMethod["setBrightness"] = "setBrightness";
	    ScryptedInterfaceMethod["getTemperatureMaxK"] = "getTemperatureMaxK";
	    ScryptedInterfaceMethod["getTemperatureMinK"] = "getTemperatureMinK";
	    ScryptedInterfaceMethod["setColorTemperature"] = "setColorTemperature";
	    ScryptedInterfaceMethod["setRgb"] = "setRgb";
	    ScryptedInterfaceMethod["setHsv"] = "setHsv";
	    ScryptedInterfaceMethod["pressButton"] = "pressButton";
	    ScryptedInterfaceMethod["sendNotification"] = "sendNotification";
	    ScryptedInterfaceMethod["start"] = "start";
	    ScryptedInterfaceMethod["stop"] = "stop";
	    ScryptedInterfaceMethod["pause"] = "pause";
	    ScryptedInterfaceMethod["resume"] = "resume";
	    ScryptedInterfaceMethod["dock"] = "dock";
	    ScryptedInterfaceMethod["setTemperature"] = "setTemperature";
	    ScryptedInterfaceMethod["setTemperatureUnit"] = "setTemperatureUnit";
	    ScryptedInterfaceMethod["getPictureOptions"] = "getPictureOptions";
	    ScryptedInterfaceMethod["takePicture"] = "takePicture";
	    ScryptedInterfaceMethod["getAudioStream"] = "getAudioStream";
	    ScryptedInterfaceMethod["setAudioVolumes"] = "setAudioVolumes";
	    ScryptedInterfaceMethod["startDisplay"] = "startDisplay";
	    ScryptedInterfaceMethod["stopDisplay"] = "stopDisplay";
	    ScryptedInterfaceMethod["getVideoStream"] = "getVideoStream";
	    ScryptedInterfaceMethod["getVideoStreamOptions"] = "getVideoStreamOptions";
	    ScryptedInterfaceMethod["getPrivacyMasks"] = "getPrivacyMasks";
	    ScryptedInterfaceMethod["setPrivacyMasks"] = "setPrivacyMasks";
	    ScryptedInterfaceMethod["getVideoTextOverlays"] = "getVideoTextOverlays";
	    ScryptedInterfaceMethod["setVideoTextOverlay"] = "setVideoTextOverlay";
	    ScryptedInterfaceMethod["getRecordingStream"] = "getRecordingStream";
	    ScryptedInterfaceMethod["getRecordingStreamCurrentTime"] = "getRecordingStreamCurrentTime";
	    ScryptedInterfaceMethod["getRecordingStreamOptions"] = "getRecordingStreamOptions";
	    ScryptedInterfaceMethod["getRecordingStreamThumbnail"] = "getRecordingStreamThumbnail";
	    ScryptedInterfaceMethod["deleteRecordingStream"] = "deleteRecordingStream";
	    ScryptedInterfaceMethod["setRecordingActive"] = "setRecordingActive";
	    ScryptedInterfaceMethod["ptzCommand"] = "ptzCommand";
	    ScryptedInterfaceMethod["getRecordedEvents"] = "getRecordedEvents";
	    ScryptedInterfaceMethod["getVideoClip"] = "getVideoClip";
	    ScryptedInterfaceMethod["getVideoClips"] = "getVideoClips";
	    ScryptedInterfaceMethod["getVideoClipThumbnail"] = "getVideoClipThumbnail";
	    ScryptedInterfaceMethod["removeVideoClips"] = "removeVideoClips";
	    ScryptedInterfaceMethod["setVideoStreamOptions"] = "setVideoStreamOptions";
	    ScryptedInterfaceMethod["startIntercom"] = "startIntercom";
	    ScryptedInterfaceMethod["stopIntercom"] = "stopIntercom";
	    ScryptedInterfaceMethod["lock"] = "lock";
	    ScryptedInterfaceMethod["unlock"] = "unlock";
	    ScryptedInterfaceMethod["addPassword"] = "addPassword";
	    ScryptedInterfaceMethod["getPasswords"] = "getPasswords";
	    ScryptedInterfaceMethod["removePassword"] = "removePassword";
	    ScryptedInterfaceMethod["activate"] = "activate";
	    ScryptedInterfaceMethod["deactivate"] = "deactivate";
	    ScryptedInterfaceMethod["isReversible"] = "isReversible";
	    ScryptedInterfaceMethod["closeEntry"] = "closeEntry";
	    ScryptedInterfaceMethod["openEntry"] = "openEntry";
	    ScryptedInterfaceMethod["getDevice"] = "getDevice";
	    ScryptedInterfaceMethod["releaseDevice"] = "releaseDevice";
	    ScryptedInterfaceMethod["adoptDevice"] = "adoptDevice";
	    ScryptedInterfaceMethod["discoverDevices"] = "discoverDevices";
	    ScryptedInterfaceMethod["createDevice"] = "createDevice";
	    ScryptedInterfaceMethod["getCreateDeviceSettings"] = "getCreateDeviceSettings";
	    ScryptedInterfaceMethod["reboot"] = "reboot";
	    ScryptedInterfaceMethod["getRefreshFrequency"] = "getRefreshFrequency";
	    ScryptedInterfaceMethod["refresh"] = "refresh";
	    ScryptedInterfaceMethod["getMediaStatus"] = "getMediaStatus";
	    ScryptedInterfaceMethod["load"] = "load";
	    ScryptedInterfaceMethod["seek"] = "seek";
	    ScryptedInterfaceMethod["skipNext"] = "skipNext";
	    ScryptedInterfaceMethod["skipPrevious"] = "skipPrevious";
	    ScryptedInterfaceMethod["convert"] = "convert";
	    ScryptedInterfaceMethod["convertMedia"] = "convertMedia";
	    ScryptedInterfaceMethod["getSettings"] = "getSettings";
	    ScryptedInterfaceMethod["putSetting"] = "putSetting";
	    ScryptedInterfaceMethod["armSecuritySystem"] = "armSecuritySystem";
	    ScryptedInterfaceMethod["disarmSecuritySystem"] = "disarmSecuritySystem";
	    ScryptedInterfaceMethod["setAirPurifierState"] = "setAirPurifierState";
	    ScryptedInterfaceMethod["getReadmeMarkdown"] = "getReadmeMarkdown";
	    ScryptedInterfaceMethod["getOauthUrl"] = "getOauthUrl";
	    ScryptedInterfaceMethod["onOauthCallback"] = "onOauthCallback";
	    ScryptedInterfaceMethod["canMixin"] = "canMixin";
	    ScryptedInterfaceMethod["getMixin"] = "getMixin";
	    ScryptedInterfaceMethod["releaseMixin"] = "releaseMixin";
	    ScryptedInterfaceMethod["onRequest"] = "onRequest";
	    ScryptedInterfaceMethod["onConnection"] = "onConnection";
	    ScryptedInterfaceMethod["onPush"] = "onPush";
	    ScryptedInterfaceMethod["run"] = "run";
	    ScryptedInterfaceMethod["eval"] = "eval";
	    ScryptedInterfaceMethod["loadScripts"] = "loadScripts";
	    ScryptedInterfaceMethod["saveScript"] = "saveScript";
	    ScryptedInterfaceMethod["forkInterface"] = "forkInterface";
	    ScryptedInterfaceMethod["getDetectionInput"] = "getDetectionInput";
	    ScryptedInterfaceMethod["getObjectTypes"] = "getObjectTypes";
	    ScryptedInterfaceMethod["detectObjects"] = "detectObjects";
	    ScryptedInterfaceMethod["generateObjectDetections"] = "generateObjectDetections";
	    ScryptedInterfaceMethod["getDetectionModel"] = "getDetectionModel";
	    ScryptedInterfaceMethod["setHumidity"] = "setHumidity";
	    ScryptedInterfaceMethod["setFan"] = "setFan";
	    ScryptedInterfaceMethod["startRTCSignalingSession"] = "startRTCSignalingSession";
	    ScryptedInterfaceMethod["createRTCSignalingSession"] = "createRTCSignalingSession";
	    ScryptedInterfaceMethod["getScryptedUserAccessControl"] = "getScryptedUserAccessControl";
	    ScryptedInterfaceMethod["generateVideoFrames"] = "generateVideoFrames";
	    ScryptedInterfaceMethod["connectStream"] = "connectStream";
	    ScryptedInterfaceMethod["getTTYSettings"] = "getTTYSettings";
	    ScryptedInterfaceMethod["getChatCompletion"] = "getChatCompletion";
	    ScryptedInterfaceMethod["streamChatCompletion"] = "streamChatCompletion";
	    ScryptedInterfaceMethod["getTextEmbedding"] = "getTextEmbedding";
	    ScryptedInterfaceMethod["getImageEmbedding"] = "getImageEmbedding";
	    ScryptedInterfaceMethod["callLLMTool"] = "callLLMTool";
	    ScryptedInterfaceMethod["getLLMTools"] = "getLLMTools";
	})(ScryptedInterfaceMethod || (gen.ScryptedInterfaceMethod = ScryptedInterfaceMethod = {}));
	gen.ScryptedInterfaceDescriptors = {
	    "ScryptedDevice": {
	        "name": "ScryptedDevice",
	        "methods": [
	            "listen",
	            "probe",
	            "setMixins",
	            "setName",
	            "setRoom",
	            "setType"
	        ],
	        "properties": [
	            "id",
	            "info",
	            "interfaces",
	            "mixins",
	            "name",
	            "nativeId",
	            "pluginId",
	            "providedInterfaces",
	            "providedName",
	            "providedRoom",
	            "providedType",
	            "providerId",
	            "room",
	            "type"
	        ]
	    },
	    "ScryptedPlugin": {
	        "name": "ScryptedPlugin",
	        "methods": [
	            "getPluginJson"
	        ],
	        "properties": []
	    },
	    "ScryptedPluginRuntime": {
	        "name": "ScryptedPluginRuntime",
	        "methods": [],
	        "properties": [
	            "scryptedRuntimeArguments"
	        ]
	    },
	    "OnOff": {
	        "name": "OnOff",
	        "methods": [
	            "turnOff",
	            "turnOn"
	        ],
	        "properties": [
	            "on"
	        ]
	    },
	    "Brightness": {
	        "name": "Brightness",
	        "methods": [
	            "setBrightness"
	        ],
	        "properties": [
	            "brightness"
	        ]
	    },
	    "ColorSettingTemperature": {
	        "name": "ColorSettingTemperature",
	        "methods": [
	            "getTemperatureMaxK",
	            "getTemperatureMinK",
	            "setColorTemperature"
	        ],
	        "properties": [
	            "colorTemperature"
	        ]
	    },
	    "ColorSettingRgb": {
	        "name": "ColorSettingRgb",
	        "methods": [
	            "setRgb"
	        ],
	        "properties": [
	            "rgb"
	        ]
	    },
	    "ColorSettingHsv": {
	        "name": "ColorSettingHsv",
	        "methods": [
	            "setHsv"
	        ],
	        "properties": [
	            "hsv"
	        ]
	    },
	    "Buttons": {
	        "name": "Buttons",
	        "methods": [],
	        "properties": [
	            "buttons"
	        ]
	    },
	    "PressButtons": {
	        "name": "PressButtons",
	        "methods": [
	            "pressButton"
	        ],
	        "properties": []
	    },
	    "Sensors": {
	        "name": "Sensors",
	        "methods": [],
	        "properties": [
	            "sensors"
	        ]
	    },
	    "Notifier": {
	        "name": "Notifier",
	        "methods": [
	            "sendNotification"
	        ],
	        "properties": []
	    },
	    "StartStop": {
	        "name": "StartStop",
	        "methods": [
	            "start",
	            "stop"
	        ],
	        "properties": [
	            "running"
	        ]
	    },
	    "Pause": {
	        "name": "Pause",
	        "methods": [
	            "pause",
	            "resume"
	        ],
	        "properties": [
	            "paused"
	        ]
	    },
	    "Dock": {
	        "name": "Dock",
	        "methods": [
	            "dock"
	        ],
	        "properties": [
	            "docked"
	        ]
	    },
	    "TemperatureSetting": {
	        "name": "TemperatureSetting",
	        "methods": [
	            "setTemperature"
	        ],
	        "properties": [
	            "temperatureSetting"
	        ]
	    },
	    "Thermometer": {
	        "name": "Thermometer",
	        "methods": [
	            "setTemperatureUnit"
	        ],
	        "properties": [
	            "temperature",
	            "temperatureUnit"
	        ]
	    },
	    "HumiditySensor": {
	        "name": "HumiditySensor",
	        "methods": [],
	        "properties": [
	            "humidity"
	        ]
	    },
	    "Camera": {
	        "name": "Camera",
	        "methods": [
	            "getPictureOptions",
	            "takePicture"
	        ],
	        "properties": []
	    },
	    "Resolution": {
	        "name": "Resolution",
	        "methods": [],
	        "properties": [
	            "resolution"
	        ]
	    },
	    "Microphone": {
	        "name": "Microphone",
	        "methods": [
	            "getAudioStream"
	        ],
	        "properties": []
	    },
	    "AudioVolumeControl": {
	        "name": "AudioVolumeControl",
	        "methods": [
	            "setAudioVolumes"
	        ],
	        "properties": [
	            "audioVolumes"
	        ]
	    },
	    "Display": {
	        "name": "Display",
	        "methods": [
	            "startDisplay",
	            "stopDisplay"
	        ],
	        "properties": []
	    },
	    "VideoCamera": {
	        "name": "VideoCamera",
	        "methods": [
	            "getVideoStream",
	            "getVideoStreamOptions"
	        ],
	        "properties": []
	    },
	    "VideoCameraMask": {
	        "name": "VideoCameraMask",
	        "methods": [
	            "getPrivacyMasks",
	            "setPrivacyMasks"
	        ],
	        "properties": []
	    },
	    "VideoTextOverlays": {
	        "name": "VideoTextOverlays",
	        "methods": [
	            "getVideoTextOverlays",
	            "setVideoTextOverlay"
	        ],
	        "properties": []
	    },
	    "VideoRecorder": {
	        "name": "VideoRecorder",
	        "methods": [
	            "getRecordingStream",
	            "getRecordingStreamCurrentTime",
	            "getRecordingStreamOptions",
	            "getRecordingStreamThumbnail"
	        ],
	        "properties": [
	            "recordingActive"
	        ]
	    },
	    "VideoRecorderManagement": {
	        "name": "VideoRecorderManagement",
	        "methods": [
	            "deleteRecordingStream",
	            "setRecordingActive"
	        ],
	        "properties": []
	    },
	    "PanTiltZoom": {
	        "name": "PanTiltZoom",
	        "methods": [
	            "ptzCommand"
	        ],
	        "properties": [
	            "ptzCapabilities"
	        ]
	    },
	    "EventRecorder": {
	        "name": "EventRecorder",
	        "methods": [
	            "getRecordedEvents"
	        ],
	        "properties": []
	    },
	    "VideoClips": {
	        "name": "VideoClips",
	        "methods": [
	            "getVideoClip",
	            "getVideoClips",
	            "getVideoClipThumbnail",
	            "removeVideoClips"
	        ],
	        "properties": []
	    },
	    "VideoCameraConfiguration": {
	        "name": "VideoCameraConfiguration",
	        "methods": [
	            "setVideoStreamOptions"
	        ],
	        "properties": []
	    },
	    "Intercom": {
	        "name": "Intercom",
	        "methods": [
	            "startIntercom",
	            "stopIntercom"
	        ],
	        "properties": []
	    },
	    "Lock": {
	        "name": "Lock",
	        "methods": [
	            "lock",
	            "unlock"
	        ],
	        "properties": [
	            "lockState"
	        ]
	    },
	    "PasswordStore": {
	        "name": "PasswordStore",
	        "methods": [
	            "addPassword",
	            "getPasswords",
	            "removePassword"
	        ],
	        "properties": []
	    },
	    "Scene": {
	        "name": "Scene",
	        "methods": [
	            "activate",
	            "deactivate",
	            "isReversible"
	        ],
	        "properties": []
	    },
	    "Entry": {
	        "name": "Entry",
	        "methods": [
	            "closeEntry",
	            "openEntry"
	        ],
	        "properties": []
	    },
	    "EntrySensor": {
	        "name": "EntrySensor",
	        "methods": [],
	        "properties": [
	            "entryOpen"
	        ]
	    },
	    "DeviceProvider": {
	        "name": "DeviceProvider",
	        "methods": [
	            "getDevice",
	            "releaseDevice"
	        ],
	        "properties": []
	    },
	    "DeviceDiscovery": {
	        "name": "DeviceDiscovery",
	        "methods": [
	            "adoptDevice",
	            "discoverDevices"
	        ],
	        "properties": []
	    },
	    "DeviceCreator": {
	        "name": "DeviceCreator",
	        "methods": [
	            "createDevice",
	            "getCreateDeviceSettings"
	        ],
	        "properties": []
	    },
	    "Battery": {
	        "name": "Battery",
	        "methods": [],
	        "properties": [
	            "batteryLevel"
	        ]
	    },
	    "Charger": {
	        "name": "Charger",
	        "methods": [],
	        "properties": [
	            "chargeState"
	        ]
	    },
	    "Reboot": {
	        "name": "Reboot",
	        "methods": [
	            "reboot"
	        ],
	        "properties": []
	    },
	    "Refresh": {
	        "name": "Refresh",
	        "methods": [
	            "getRefreshFrequency",
	            "refresh"
	        ],
	        "properties": []
	    },
	    "MediaPlayer": {
	        "name": "MediaPlayer",
	        "methods": [
	            "getMediaStatus",
	            "load",
	            "seek",
	            "skipNext",
	            "skipPrevious"
	        ],
	        "properties": []
	    },
	    "Online": {
	        "name": "Online",
	        "methods": [],
	        "properties": [
	            "online"
	        ]
	    },
	    "BufferConverter": {
	        "name": "BufferConverter",
	        "methods": [
	            "convert"
	        ],
	        "properties": [
	            "fromMimeType",
	            "toMimeType"
	        ]
	    },
	    "MediaConverter": {
	        "name": "MediaConverter",
	        "methods": [
	            "convertMedia"
	        ],
	        "properties": [
	            "converters"
	        ]
	    },
	    "Settings": {
	        "name": "Settings",
	        "methods": [
	            "getSettings",
	            "putSetting"
	        ],
	        "properties": []
	    },
	    "BinarySensor": {
	        "name": "BinarySensor",
	        "methods": [],
	        "properties": [
	            "binaryState"
	        ]
	    },
	    "TamperSensor": {
	        "name": "TamperSensor",
	        "methods": [],
	        "properties": [
	            "tampered"
	        ]
	    },
	    "Sleep": {
	        "name": "Sleep",
	        "methods": [],
	        "properties": [
	            "sleeping"
	        ]
	    },
	    "PowerSensor": {
	        "name": "PowerSensor",
	        "methods": [],
	        "properties": [
	            "powerDetected"
	        ]
	    },
	    "AudioSensor": {
	        "name": "AudioSensor",
	        "methods": [],
	        "properties": [
	            "audioDetected"
	        ]
	    },
	    "MotionSensor": {
	        "name": "MotionSensor",
	        "methods": [],
	        "properties": [
	            "motionDetected"
	        ]
	    },
	    "AmbientLightSensor": {
	        "name": "AmbientLightSensor",
	        "methods": [],
	        "properties": [
	            "ambientLight"
	        ]
	    },
	    "OccupancySensor": {
	        "name": "OccupancySensor",
	        "methods": [],
	        "properties": [
	            "occupied"
	        ]
	    },
	    "FloodSensor": {
	        "name": "FloodSensor",
	        "methods": [],
	        "properties": [
	            "flooded"
	        ]
	    },
	    "UltravioletSensor": {
	        "name": "UltravioletSensor",
	        "methods": [],
	        "properties": [
	            "ultraviolet"
	        ]
	    },
	    "LuminanceSensor": {
	        "name": "LuminanceSensor",
	        "methods": [],
	        "properties": [
	            "luminance"
	        ]
	    },
	    "PositionSensor": {
	        "name": "PositionSensor",
	        "methods": [],
	        "properties": [
	            "position"
	        ]
	    },
	    "SecuritySystem": {
	        "name": "SecuritySystem",
	        "methods": [
	            "armSecuritySystem",
	            "disarmSecuritySystem"
	        ],
	        "properties": [
	            "securitySystemState"
	        ]
	    },
	    "PM10Sensor": {
	        "name": "PM10Sensor",
	        "methods": [],
	        "properties": [
	            "pm10Density"
	        ]
	    },
	    "PM25Sensor": {
	        "name": "PM25Sensor",
	        "methods": [],
	        "properties": [
	            "pm25Density"
	        ]
	    },
	    "VOCSensor": {
	        "name": "VOCSensor",
	        "methods": [],
	        "properties": [
	            "vocDensity"
	        ]
	    },
	    "NOXSensor": {
	        "name": "NOXSensor",
	        "methods": [],
	        "properties": [
	            "noxDensity"
	        ]
	    },
	    "CO2Sensor": {
	        "name": "CO2Sensor",
	        "methods": [],
	        "properties": [
	            "co2ppm"
	        ]
	    },
	    "AirQualitySensor": {
	        "name": "AirQualitySensor",
	        "methods": [],
	        "properties": [
	            "airQuality"
	        ]
	    },
	    "AirPurifier": {
	        "name": "AirPurifier",
	        "methods": [
	            "setAirPurifierState"
	        ],
	        "properties": [
	            "airPurifierState"
	        ]
	    },
	    "FilterMaintenance": {
	        "name": "FilterMaintenance",
	        "methods": [],
	        "properties": [
	            "filterChangeIndication",
	            "filterLifeLevel"
	        ]
	    },
	    "Readme": {
	        "name": "Readme",
	        "methods": [
	            "getReadmeMarkdown"
	        ],
	        "properties": []
	    },
	    "OauthClient": {
	        "name": "OauthClient",
	        "methods": [
	            "getOauthUrl",
	            "onOauthCallback"
	        ],
	        "properties": []
	    },
	    "MixinProvider": {
	        "name": "MixinProvider",
	        "methods": [
	            "canMixin",
	            "getMixin",
	            "releaseMixin"
	        ],
	        "properties": []
	    },
	    "HttpRequestHandler": {
	        "name": "HttpRequestHandler",
	        "methods": [
	            "onRequest"
	        ],
	        "properties": []
	    },
	    "EngineIOHandler": {
	        "name": "EngineIOHandler",
	        "methods": [
	            "onConnection"
	        ],
	        "properties": []
	    },
	    "PushHandler": {
	        "name": "PushHandler",
	        "methods": [
	            "onPush"
	        ],
	        "properties": []
	    },
	    "Program": {
	        "name": "Program",
	        "methods": [
	            "run"
	        ],
	        "properties": []
	    },
	    "Scriptable": {
	        "name": "Scriptable",
	        "methods": [
	            "eval",
	            "loadScripts",
	            "saveScript"
	        ],
	        "properties": []
	    },
	    "ClusterForkInterface": {
	        "name": "ClusterForkInterface",
	        "methods": [
	            "forkInterface"
	        ],
	        "properties": []
	    },
	    "ObjectDetector": {
	        "name": "ObjectDetector",
	        "methods": [
	            "getDetectionInput",
	            "getObjectTypes"
	        ],
	        "properties": []
	    },
	    "ObjectDetection": {
	        "name": "ObjectDetection",
	        "methods": [
	            "detectObjects",
	            "generateObjectDetections",
	            "getDetectionModel"
	        ],
	        "properties": []
	    },
	    "ObjectDetectionPreview": {
	        "name": "ObjectDetectionPreview",
	        "methods": [],
	        "properties": []
	    },
	    "ObjectDetectionGenerator": {
	        "name": "ObjectDetectionGenerator",
	        "methods": [],
	        "properties": []
	    },
	    "HumiditySetting": {
	        "name": "HumiditySetting",
	        "methods": [
	            "setHumidity"
	        ],
	        "properties": [
	            "humiditySetting"
	        ]
	    },
	    "Fan": {
	        "name": "Fan",
	        "methods": [
	            "setFan"
	        ],
	        "properties": [
	            "fan"
	        ]
	    },
	    "RTCSignalingChannel": {
	        "name": "RTCSignalingChannel",
	        "methods": [
	            "startRTCSignalingSession"
	        ],
	        "properties": []
	    },
	    "RTCSignalingClient": {
	        "name": "RTCSignalingClient",
	        "methods": [
	            "createRTCSignalingSession"
	        ],
	        "properties": []
	    },
	    "LauncherApplication": {
	        "name": "LauncherApplication",
	        "methods": [],
	        "properties": [
	            "applicationInfo"
	        ]
	    },
	    "ScryptedUser": {
	        "name": "ScryptedUser",
	        "methods": [
	            "getScryptedUserAccessControl"
	        ],
	        "properties": []
	    },
	    "VideoFrameGenerator": {
	        "name": "VideoFrameGenerator",
	        "methods": [
	            "generateVideoFrames"
	        ],
	        "properties": []
	    },
	    "StreamService": {
	        "name": "StreamService",
	        "methods": [
	            "connectStream"
	        ],
	        "properties": []
	    },
	    "TTY": {
	        "name": "TTY",
	        "methods": [],
	        "properties": []
	    },
	    "TTYSettings": {
	        "name": "TTYSettings",
	        "methods": [
	            "getTTYSettings"
	        ],
	        "properties": []
	    },
	    "ChatCompletion": {
	        "name": "ChatCompletion",
	        "methods": [
	            "getChatCompletion",
	            "streamChatCompletion"
	        ],
	        "properties": [
	            "chatCompletionCapabilities"
	        ]
	    },
	    "TextEmbedding": {
	        "name": "TextEmbedding",
	        "methods": [
	            "getTextEmbedding"
	        ],
	        "properties": []
	    },
	    "ImageEmbedding": {
	        "name": "ImageEmbedding",
	        "methods": [
	            "getImageEmbedding"
	        ],
	        "properties": []
	    },
	    "LLMTools": {
	        "name": "LLMTools",
	        "methods": [
	            "callLLMTool",
	            "getLLMTools"
	        ],
	        "properties": []
	    },
	    "ScryptedSystemDevice": {
	        "name": "ScryptedSystemDevice",
	        "methods": [],
	        "properties": [
	            "systemDevice"
	        ]
	    },
	    "ScryptedDeviceCreator": {
	        "name": "ScryptedDeviceCreator",
	        "methods": [],
	        "properties": []
	    },
	    "ScryptedSettings": {
	        "name": "ScryptedSettings",
	        "methods": [],
	        "properties": []
	    }
	};
	/**
	 * @category Core Reference
	 */
	var ScryptedDeviceType;
	(function (ScryptedDeviceType) {
	    /**
	     * @deprecated
	     */
	    ScryptedDeviceType["Builtin"] = "Builtin";
	    /**
	     * Internal devices will not show up in device lists unless explicitly searched.
	     */
	    ScryptedDeviceType["Internal"] = "Internal";
	    ScryptedDeviceType["Camera"] = "Camera";
	    ScryptedDeviceType["Fan"] = "Fan";
	    ScryptedDeviceType["Light"] = "Light";
	    ScryptedDeviceType["Switch"] = "Switch";
	    ScryptedDeviceType["Outlet"] = "Outlet";
	    ScryptedDeviceType["Sensor"] = "Sensor";
	    ScryptedDeviceType["Scene"] = "Scene";
	    ScryptedDeviceType["Program"] = "Program";
	    ScryptedDeviceType["Automation"] = "Automation";
	    ScryptedDeviceType["Vacuum"] = "Vacuum";
	    ScryptedDeviceType["Notifier"] = "Notifier";
	    ScryptedDeviceType["Thermostat"] = "Thermostat";
	    ScryptedDeviceType["Lock"] = "Lock";
	    ScryptedDeviceType["PasswordControl"] = "PasswordControl";
	    /**
	     * Displays have audio and video output.
	     */
	    ScryptedDeviceType["Display"] = "Display";
	    /**
	     * Smart Displays have two way audio and video.
	     */
	    ScryptedDeviceType["SmartDisplay"] = "SmartDisplay";
	    ScryptedDeviceType["Speaker"] = "Speaker";
	    /**
	     * Smart Speakers have two way audio.
	     */
	    ScryptedDeviceType["SmartSpeaker"] = "SmartSpeaker";
	    ScryptedDeviceType["RemoteDesktop"] = "RemoteDesktop";
	    ScryptedDeviceType["Event"] = "Event";
	    ScryptedDeviceType["Entry"] = "Entry";
	    ScryptedDeviceType["Garage"] = "Garage";
	    ScryptedDeviceType["DeviceProvider"] = "DeviceProvider";
	    ScryptedDeviceType["DataSource"] = "DataSource";
	    ScryptedDeviceType["API"] = "API";
	    ScryptedDeviceType["Buttons"] = "Buttons";
	    ScryptedDeviceType["Doorbell"] = "Doorbell";
	    ScryptedDeviceType["Irrigation"] = "Irrigation";
	    ScryptedDeviceType["Valve"] = "Valve";
	    ScryptedDeviceType["Person"] = "Person";
	    ScryptedDeviceType["SecuritySystem"] = "SecuritySystem";
	    ScryptedDeviceType["WindowCovering"] = "WindowCovering";
	    ScryptedDeviceType["Siren"] = "Siren";
	    ScryptedDeviceType["AirPurifier"] = "AirPurifier";
	    ScryptedDeviceType["Internet"] = "Internet";
	    ScryptedDeviceType["Network"] = "Network";
	    ScryptedDeviceType["Bridge"] = "Bridge";
	    ScryptedDeviceType["LLM"] = "LLM";
	    ScryptedDeviceType["Unknown"] = "Unknown";
	})(ScryptedDeviceType || (gen.ScryptedDeviceType = ScryptedDeviceType = {}));
	var HumidityMode;
	(function (HumidityMode) {
	    HumidityMode["Humidify"] = "Humidify";
	    HumidityMode["Dehumidify"] = "Dehumidify";
	    HumidityMode["Auto"] = "Auto";
	    HumidityMode["Off"] = "Off";
	})(HumidityMode || (gen.HumidityMode = HumidityMode = {}));
	var FanMode;
	(function (FanMode) {
	    FanMode["Auto"] = "Auto";
	    FanMode["Manual"] = "Manual";
	})(FanMode || (gen.FanMode = FanMode = {}));
	var TemperatureUnit;
	(function (TemperatureUnit) {
	    TemperatureUnit["C"] = "C";
	    TemperatureUnit["F"] = "F";
	})(TemperatureUnit || (gen.TemperatureUnit = TemperatureUnit = {}));
	var ThermostatMode;
	(function (ThermostatMode) {
	    ThermostatMode["Off"] = "Off";
	    ThermostatMode["Cool"] = "Cool";
	    ThermostatMode["Heat"] = "Heat";
	    ThermostatMode["HeatCool"] = "HeatCool";
	    ThermostatMode["Auto"] = "Auto";
	    ThermostatMode["FanOnly"] = "FanOnly";
	    ThermostatMode["Purifier"] = "Purifier";
	    ThermostatMode["Eco"] = "Eco";
	    ThermostatMode["Dry"] = "Dry";
	    ThermostatMode["On"] = "On";
	})(ThermostatMode || (gen.ThermostatMode = ThermostatMode = {}));
	var PanTiltZoomMovement;
	(function (PanTiltZoomMovement) {
	    PanTiltZoomMovement["Absolute"] = "Absolute";
	    PanTiltZoomMovement["Relative"] = "Relative";
	    PanTiltZoomMovement["Continuous"] = "Continuous";
	    PanTiltZoomMovement["Preset"] = "Preset";
	    PanTiltZoomMovement["Home"] = "Home";
	})(PanTiltZoomMovement || (gen.PanTiltZoomMovement = PanTiltZoomMovement = {}));
	var LockState;
	(function (LockState) {
	    LockState["Locked"] = "Locked";
	    LockState["Unlocked"] = "Unlocked";
	    LockState["Jammed"] = "Jammed";
	})(LockState || (gen.LockState = LockState = {}));
	var ChargeState;
	(function (ChargeState) {
	    ChargeState["Trickle"] = "trickle";
	    ChargeState["Charging"] = "charging";
	    ChargeState["NotCharging"] = "not-charging";
	})(ChargeState || (gen.ChargeState = ChargeState = {}));
	var AirPurifierStatus;
	(function (AirPurifierStatus) {
	    AirPurifierStatus["Inactive"] = "Inactive";
	    AirPurifierStatus["Idle"] = "Idle";
	    AirPurifierStatus["Active"] = "Active";
	    AirPurifierStatus["ActiveNightMode"] = "ActiveNightMode";
	})(AirPurifierStatus || (gen.AirPurifierStatus = AirPurifierStatus = {}));
	var AirPurifierMode;
	(function (AirPurifierMode) {
	    AirPurifierMode["Manual"] = "Manual";
	    AirPurifierMode["Automatic"] = "Automatic";
	})(AirPurifierMode || (gen.AirPurifierMode = AirPurifierMode = {}));
	var AirQuality;
	(function (AirQuality) {
	    AirQuality["Unknown"] = "Unknown";
	    AirQuality["Excellent"] = "Excellent";
	    AirQuality["Good"] = "Good";
	    AirQuality["Fair"] = "Fair";
	    AirQuality["Inferior"] = "Inferior";
	    AirQuality["Poor"] = "Poor";
	})(AirQuality || (gen.AirQuality = AirQuality = {}));
	var SecuritySystemMode;
	(function (SecuritySystemMode) {
	    SecuritySystemMode["Disarmed"] = "Disarmed";
	    SecuritySystemMode["HomeArmed"] = "HomeArmed";
	    SecuritySystemMode["AwayArmed"] = "AwayArmed";
	    SecuritySystemMode["NightArmed"] = "NightArmed";
	})(SecuritySystemMode || (gen.SecuritySystemMode = SecuritySystemMode = {}));
	var SecuritySystemObstruction;
	(function (SecuritySystemObstruction) {
	    SecuritySystemObstruction["Sensor"] = "Sensor";
	    SecuritySystemObstruction["Occupied"] = "Occupied";
	    SecuritySystemObstruction["Time"] = "Time";
	    SecuritySystemObstruction["Error"] = "Error";
	})(SecuritySystemObstruction || (gen.SecuritySystemObstruction = SecuritySystemObstruction = {}));
	var MediaPlayerState;
	(function (MediaPlayerState) {
	    MediaPlayerState["Idle"] = "Idle";
	    MediaPlayerState["Playing"] = "Playing";
	    MediaPlayerState["Paused"] = "Paused";
	    MediaPlayerState["Buffering"] = "Buffering";
	})(MediaPlayerState || (gen.MediaPlayerState = MediaPlayerState = {}));
	var ScryptedInterface;
	(function (ScryptedInterface) {
	    ScryptedInterface["ScryptedDevice"] = "ScryptedDevice";
	    ScryptedInterface["ScryptedPlugin"] = "ScryptedPlugin";
	    ScryptedInterface["ScryptedPluginRuntime"] = "ScryptedPluginRuntime";
	    ScryptedInterface["OnOff"] = "OnOff";
	    ScryptedInterface["Brightness"] = "Brightness";
	    ScryptedInterface["ColorSettingTemperature"] = "ColorSettingTemperature";
	    ScryptedInterface["ColorSettingRgb"] = "ColorSettingRgb";
	    ScryptedInterface["ColorSettingHsv"] = "ColorSettingHsv";
	    ScryptedInterface["Buttons"] = "Buttons";
	    ScryptedInterface["PressButtons"] = "PressButtons";
	    ScryptedInterface["Sensors"] = "Sensors";
	    ScryptedInterface["Notifier"] = "Notifier";
	    ScryptedInterface["StartStop"] = "StartStop";
	    ScryptedInterface["Pause"] = "Pause";
	    ScryptedInterface["Dock"] = "Dock";
	    ScryptedInterface["TemperatureSetting"] = "TemperatureSetting";
	    ScryptedInterface["Thermometer"] = "Thermometer";
	    ScryptedInterface["HumiditySensor"] = "HumiditySensor";
	    ScryptedInterface["Camera"] = "Camera";
	    ScryptedInterface["Resolution"] = "Resolution";
	    ScryptedInterface["Microphone"] = "Microphone";
	    ScryptedInterface["AudioVolumeControl"] = "AudioVolumeControl";
	    ScryptedInterface["Display"] = "Display";
	    ScryptedInterface["VideoCamera"] = "VideoCamera";
	    ScryptedInterface["VideoCameraMask"] = "VideoCameraMask";
	    ScryptedInterface["VideoTextOverlays"] = "VideoTextOverlays";
	    ScryptedInterface["VideoRecorder"] = "VideoRecorder";
	    ScryptedInterface["VideoRecorderManagement"] = "VideoRecorderManagement";
	    ScryptedInterface["PanTiltZoom"] = "PanTiltZoom";
	    ScryptedInterface["EventRecorder"] = "EventRecorder";
	    ScryptedInterface["VideoClips"] = "VideoClips";
	    ScryptedInterface["VideoCameraConfiguration"] = "VideoCameraConfiguration";
	    ScryptedInterface["Intercom"] = "Intercom";
	    ScryptedInterface["Lock"] = "Lock";
	    ScryptedInterface["PasswordStore"] = "PasswordStore";
	    ScryptedInterface["Scene"] = "Scene";
	    ScryptedInterface["Entry"] = "Entry";
	    ScryptedInterface["EntrySensor"] = "EntrySensor";
	    ScryptedInterface["DeviceProvider"] = "DeviceProvider";
	    ScryptedInterface["DeviceDiscovery"] = "DeviceDiscovery";
	    ScryptedInterface["DeviceCreator"] = "DeviceCreator";
	    ScryptedInterface["Battery"] = "Battery";
	    ScryptedInterface["Charger"] = "Charger";
	    ScryptedInterface["Reboot"] = "Reboot";
	    ScryptedInterface["Refresh"] = "Refresh";
	    ScryptedInterface["MediaPlayer"] = "MediaPlayer";
	    ScryptedInterface["Online"] = "Online";
	    ScryptedInterface["BufferConverter"] = "BufferConverter";
	    ScryptedInterface["MediaConverter"] = "MediaConverter";
	    ScryptedInterface["Settings"] = "Settings";
	    ScryptedInterface["BinarySensor"] = "BinarySensor";
	    ScryptedInterface["TamperSensor"] = "TamperSensor";
	    ScryptedInterface["Sleep"] = "Sleep";
	    ScryptedInterface["PowerSensor"] = "PowerSensor";
	    ScryptedInterface["AudioSensor"] = "AudioSensor";
	    ScryptedInterface["MotionSensor"] = "MotionSensor";
	    ScryptedInterface["AmbientLightSensor"] = "AmbientLightSensor";
	    ScryptedInterface["OccupancySensor"] = "OccupancySensor";
	    ScryptedInterface["FloodSensor"] = "FloodSensor";
	    ScryptedInterface["UltravioletSensor"] = "UltravioletSensor";
	    ScryptedInterface["LuminanceSensor"] = "LuminanceSensor";
	    ScryptedInterface["PositionSensor"] = "PositionSensor";
	    ScryptedInterface["SecuritySystem"] = "SecuritySystem";
	    ScryptedInterface["PM10Sensor"] = "PM10Sensor";
	    ScryptedInterface["PM25Sensor"] = "PM25Sensor";
	    ScryptedInterface["VOCSensor"] = "VOCSensor";
	    ScryptedInterface["NOXSensor"] = "NOXSensor";
	    ScryptedInterface["CO2Sensor"] = "CO2Sensor";
	    ScryptedInterface["AirQualitySensor"] = "AirQualitySensor";
	    ScryptedInterface["AirPurifier"] = "AirPurifier";
	    ScryptedInterface["FilterMaintenance"] = "FilterMaintenance";
	    ScryptedInterface["Readme"] = "Readme";
	    ScryptedInterface["OauthClient"] = "OauthClient";
	    ScryptedInterface["MixinProvider"] = "MixinProvider";
	    ScryptedInterface["HttpRequestHandler"] = "HttpRequestHandler";
	    ScryptedInterface["EngineIOHandler"] = "EngineIOHandler";
	    ScryptedInterface["PushHandler"] = "PushHandler";
	    ScryptedInterface["Program"] = "Program";
	    ScryptedInterface["Scriptable"] = "Scriptable";
	    ScryptedInterface["ClusterForkInterface"] = "ClusterForkInterface";
	    ScryptedInterface["ObjectDetector"] = "ObjectDetector";
	    ScryptedInterface["ObjectDetection"] = "ObjectDetection";
	    ScryptedInterface["ObjectDetectionPreview"] = "ObjectDetectionPreview";
	    ScryptedInterface["ObjectDetectionGenerator"] = "ObjectDetectionGenerator";
	    ScryptedInterface["HumiditySetting"] = "HumiditySetting";
	    ScryptedInterface["Fan"] = "Fan";
	    ScryptedInterface["RTCSignalingChannel"] = "RTCSignalingChannel";
	    ScryptedInterface["RTCSignalingClient"] = "RTCSignalingClient";
	    ScryptedInterface["LauncherApplication"] = "LauncherApplication";
	    ScryptedInterface["ScryptedUser"] = "ScryptedUser";
	    ScryptedInterface["VideoFrameGenerator"] = "VideoFrameGenerator";
	    ScryptedInterface["StreamService"] = "StreamService";
	    ScryptedInterface["TTY"] = "TTY";
	    ScryptedInterface["TTYSettings"] = "TTYSettings";
	    ScryptedInterface["ChatCompletion"] = "ChatCompletion";
	    ScryptedInterface["TextEmbedding"] = "TextEmbedding";
	    ScryptedInterface["ImageEmbedding"] = "ImageEmbedding";
	    ScryptedInterface["LLMTools"] = "LLMTools";
	    ScryptedInterface["ScryptedSystemDevice"] = "ScryptedSystemDevice";
	    ScryptedInterface["ScryptedDeviceCreator"] = "ScryptedDeviceCreator";
	    ScryptedInterface["ScryptedSettings"] = "ScryptedSettings";
	})(ScryptedInterface || (gen.ScryptedInterface = ScryptedInterface = {}));
	var ScryptedMimeTypes;
	(function (ScryptedMimeTypes) {
	    ScryptedMimeTypes["Url"] = "text/x-uri";
	    ScryptedMimeTypes["InsecureLocalUrl"] = "text/x-insecure-local-uri";
	    ScryptedMimeTypes["LocalUrl"] = "text/x-local-uri";
	    ScryptedMimeTypes["ServerId"] = "text/x-server-id";
	    ScryptedMimeTypes["PushEndpoint"] = "text/x-push-endpoint";
	    ScryptedMimeTypes["SchemePrefix"] = "x-scrypted/x-scrypted-scheme-";
	    ScryptedMimeTypes["MediaStreamUrl"] = "text/x-media-url";
	    ScryptedMimeTypes["MediaObject"] = "x-scrypted/x-scrypted-media-object";
	    ScryptedMimeTypes["RequestMediaObject"] = "x-scrypted/x-scrypted-request-media-object";
	    ScryptedMimeTypes["RequestMediaStream"] = "x-scrypted/x-scrypted-request-stream";
	    ScryptedMimeTypes["MediaStreamFeedback"] = "x-scrypted/x-media-stream-feedback";
	    ScryptedMimeTypes["FFmpegInput"] = "x-scrypted/x-ffmpeg-input";
	    ScryptedMimeTypes["FFmpegTranscodeStream"] = "x-scrypted/x-ffmpeg-transcode-stream";
	    ScryptedMimeTypes["RTCSignalingChannel"] = "x-scrypted/x-scrypted-rtc-signaling-channel";
	    ScryptedMimeTypes["RTCSignalingSession"] = "x-scrypted/x-scrypted-rtc-signaling-session";
	    ScryptedMimeTypes["RTCConnectionManagement"] = "x-scrypted/x-scrypted-rtc-connection-management";
	    ScryptedMimeTypes["Image"] = "x-scrypted/x-scrypted-image";
	})(ScryptedMimeTypes || (gen.ScryptedMimeTypes = ScryptedMimeTypes = {}));
	
	return gen;
}

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;
	(function (exports) {
		var __createBinding = (src && src.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (src && src.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		var __importDefault = (src && src.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.sdk = exports.MixinDeviceBase = exports.ScryptedDeviceBase = void 0;
		__exportStar(requireGen(), exports);
		const fs_1 = __importDefault(require$$1);
		const index_1 = requireGen();
		const module_1 = require$$2;
		/**
		 * @category Core Reference
		 */
		class ScryptedDeviceBase extends index_1.DeviceBase {
		    constructor(nativeId) {
		        super();
		        this.nativeId = nativeId;
		    }
		    get storage() {
		        if (!this._storage) {
		            this._storage = exports.sdk.deviceManager.getDeviceStorage(this.nativeId);
		        }
		        return this._storage;
		    }
		    get log() {
		        if (!this._log) {
		            this._log = exports.sdk.deviceManager.getDeviceLogger(this.nativeId);
		        }
		        return this._log;
		    }
		    get console() {
		        if (!this._console) {
		            this._console = exports.sdk.deviceManager.getDeviceConsole(this.nativeId);
		        }
		        return this._console;
		    }
		    async createMediaObject(data, mimeType) {
		        return exports.sdk.mediaManager.createMediaObject(data, mimeType, {
		            sourceId: this.id,
		        });
		    }
		    getMediaObjectConsole(mediaObject) {
		        if (typeof mediaObject.sourceId !== 'string')
		            return this.console;
		        return exports.sdk.deviceManager.getMixinConsole(mediaObject.sourceId, this.nativeId);
		    }
		    _lazyLoadDeviceState() {
		        if (!this._deviceState) {
		            if (this.nativeId) {
		                this._deviceState = exports.sdk.deviceManager.getDeviceState(this.nativeId);
		            }
		            else {
		                this._deviceState = exports.sdk.deviceManager.getDeviceState();
		            }
		        }
		    }
		    /**
		     * Fire an event for this device.
		     */
		    onDeviceEvent(eventInterface, eventData) {
		        return exports.sdk.deviceManager.onDeviceEvent(this.nativeId, eventInterface, eventData);
		    }
		}
		exports.ScryptedDeviceBase = ScryptedDeviceBase;
		/**
		 * @category Mixin Reference
		 */
		class MixinDeviceBase extends index_1.DeviceBase {
		    constructor(options) {
		        super();
		        this._listeners = new Set();
		        this.mixinDevice = options.mixinDevice;
		        this.mixinDeviceInterfaces = options.mixinDeviceInterfaces;
		        this.mixinStorageSuffix = options.mixinStorageSuffix;
		        this._deviceState = options.mixinDeviceState;
		        this.nativeId = exports.sdk.systemManager.getDeviceById(this.id).nativeId;
		        this.mixinProviderNativeId = options.mixinProviderNativeId;
		        // RpcProxy will trap all properties, and the following check/hack will determine
		        // if the device state came from another node worker thread.
		        // This should ultimately be discouraged and warned at some point in the future.
		        if (this._deviceState.__rpcproxy_traps_all_properties && typeof this._deviceState.id === 'string') {
		            this._deviceState = exports.sdk.deviceManager.createDeviceState(this._deviceState.id, this._deviceState.setState);
		        }
		    }
		    get storage() {
		        if (!this._storage) {
		            const mixinStorageSuffix = this.mixinStorageSuffix;
		            const mixinStorageKey = this.id + (mixinStorageSuffix ? ':' + mixinStorageSuffix : '');
		            this._storage = exports.sdk.deviceManager.getMixinStorage(mixinStorageKey, this.mixinProviderNativeId);
		        }
		        return this._storage;
		    }
		    get console() {
		        if (!this._console) {
		            if (exports.sdk.deviceManager.getMixinConsole)
		                this._console = exports.sdk.deviceManager.getMixinConsole(this.id, this.mixinProviderNativeId);
		            else
		                this._console = exports.sdk.deviceManager.getDeviceConsole(this.mixinProviderNativeId);
		        }
		        return this._console;
		    }
		    async createMediaObject(data, mimeType) {
		        return exports.sdk.mediaManager.createMediaObject(data, mimeType, {
		            sourceId: this.id,
		        });
		    }
		    getMediaObjectConsole(mediaObject) {
		        if (typeof mediaObject.sourceId !== 'string')
		            return this.console;
		        return exports.sdk.deviceManager.getMixinConsole(mediaObject.sourceId, this.mixinProviderNativeId);
		    }
		    /**
		     * Fire an event for this device.
		     */
		    onDeviceEvent(eventInterface, eventData) {
		        return exports.sdk.deviceManager.onMixinEvent(this.id, this, eventInterface, eventData);
		    }
		    _lazyLoadDeviceState() {
		    }
		    manageListener(listener) {
		        this._listeners.add(listener);
		    }
		    release() {
		        for (const l of this._listeners) {
		            l.removeListener();
		        }
		    }
		}
		exports.MixinDeviceBase = MixinDeviceBase;
		(function () {
		    function _createGetState(state) {
		        return function () {
		            this._lazyLoadDeviceState();
		            // @ts-ignore: accessing private property
		            return this._deviceState?.[state];
		        };
		    }
		    function _createSetState(state) {
		        return function (value) {
		            this._lazyLoadDeviceState();
		            // @ts-ignore: accessing private property
		            if (!this._deviceState) {
		                console.warn('device state is unavailable. the device must be discovered with deviceManager.onDeviceDiscovered or deviceManager.onDevicesChanged before the state can be set.');
		            }
		            else {
		                // @ts-ignore: accessing private property
		                this._deviceState[state] = value;
		            }
		        };
		    }
		    for (const field of Object.values(index_1.ScryptedInterfaceProperty)) {
		        if (field === index_1.ScryptedInterfaceProperty.nativeId)
		            continue;
		        Object.defineProperty(ScryptedDeviceBase.prototype, field, {
		            set: _createSetState(field),
		            get: _createGetState(field),
		        });
		        Object.defineProperty(MixinDeviceBase.prototype, field, {
		            set: _createSetState(field),
		            get: _createGetState(field),
		        });
		    }
		})();
		exports.sdk = {};
		try {
		    let loaded = false;
		    try {
		        // todo: remove usage of process.env.SCRYPTED_SDK_MODULE, only existed in prerelease builds.
		        // import.meta is not a reliable way to detect es module support in webpack since webpack
		        // evaluates that to true at runtime.
		        const esModule = process.env.SCRYPTED_SDK_ES_MODULE || process.env.SCRYPTED_SDK_MODULE;
		        const cjsModule = process.env.SCRYPTED_SDK_CJS_MODULE || process.env.SCRYPTED_SDK_MODULE;
		        // @ts-expect-error
		        if (esModule && typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('main.nodejs.js', document.baseURI).href)) }) !== 'undefined') {
		            // @ts-expect-error
		            const require$1 = (0, module_1.createRequire)((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('main.nodejs.js', document.baseURI).href)));
		            const sdkModule = require$1(esModule);
		            Object.assign(exports.sdk, sdkModule.getScryptedStatic());
		            loaded = true;
		        }
		        else if (cjsModule) {
		            // @ts-expect-error
		            if (typeof __non_webpack_require__ !== 'undefined') {
		                // @ts-expect-error
		                const sdkModule = __non_webpack_require__(process.env.SCRYPTED_SDK_MODULE);
		                Object.assign(exports.sdk, sdkModule.getScryptedStatic());
		                loaded = true;
		            }
		            else {
		                const sdkModule = require(cjsModule);
		                Object.assign(exports.sdk, sdkModule.getScryptedStatic());
		                loaded = true;
		            }
		        }
		    }
		    catch (e) {
		        console.warn("failed to load sdk module", e);
		        throw e;
		    }
		    if (!loaded) {
		        let runtimeAPI;
		        try {
		            runtimeAPI = pluginRuntimeAPI;
		        }
		        catch (e) {
		        }
		        Object.assign(exports.sdk, {
		            log: deviceManager.getDeviceLogger(undefined),
		            deviceManager,
		            endpointManager,
		            mediaManager,
		            systemManager,
		            pluginHostAPI,
		            ...runtimeAPI,
		        });
		    }
		    try {
		        let descriptors = {
		            ...index_1.ScryptedInterfaceDescriptors,
		        };
		        try {
		            const sdkJson = JSON.parse(fs_1.default.readFileSync('../sdk.json').toString());
		            const customDescriptors = sdkJson.interfaceDescriptors;
		            if (customDescriptors) {
		                descriptors = {
		                    ...descriptors,
		                    ...customDescriptors,
		                };
		            }
		        }
		        catch (e) {
		            console.warn('failed to load custom interface descriptors', e);
		        }
		        exports.sdk.systemManager.setScryptedInterfaceDescriptors?.(index_1.TYPES_VERSION, descriptors)?.catch(() => { });
		    }
		    catch (e) {
		    }
		}
		catch (e) {
		    console.error('sdk initialization error, import @scrypted/types or use @scrypted/client instead', e);
		}
		exports.default = exports.sdk;
		
	} (src));
	return src;
}

var srcExports = requireSrc();
var sdk = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

var settingsMixin = {};

var hasRequiredSettingsMixin;

function requireSettingsMixin () {
	if (hasRequiredSettingsMixin) return settingsMixin;
	hasRequiredSettingsMixin = 1;
	var __createBinding = (settingsMixin && settingsMixin.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (settingsMixin && settingsMixin.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (settingsMixin && settingsMixin.__importStar) || (function () {
	    var ownKeys = function(o) {
	        ownKeys = Object.getOwnPropertyNames || function (o) {
	            var ar = [];
	            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	            return ar;
	        };
	        return ownKeys(o);
	    };
	    return function (mod) {
	        if (mod && mod.__esModule) return mod;
	        var result = {};
	        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	        __setModuleDefault(result, mod);
	        return result;
	    };
	})();
	Object.defineProperty(settingsMixin, "__esModule", { value: true });
	settingsMixin.SettingsMixinDeviceBase = void 0;
	const _1 = __importStar(requireSrc());
	const { deviceManager } = _1.default;
	class SettingsMixinDeviceBase extends _1.MixinDeviceBase {
	    constructor(options) {
	        super(options);
	        this.settingsGroup = options.group;
	        this.settingsGroupKey = options.groupKey;
	        process.nextTick(() => deviceManager.onMixinEvent(this.id, this, _1.ScryptedInterface.Settings, null));
	    }
	    async getSettings() {
	        const settingsPromise = this.mixinDeviceInterfaces.includes(_1.ScryptedInterface.Settings) ? this.mixinDevice.getSettings() : undefined;
	        const mixinSettingsPromise = this.getMixinSettings();
	        const allSettings = [];
	        try {
	            const settings = (await settingsPromise) || [];
	            allSettings.push(...settings);
	        }
	        catch (e) {
	            const name = this.name;
	            const description = `${name} Extension settings failed to load.`;
	            this.console.error(description, e);
	            allSettings.push({
	                key: Math.random().toString(),
	                title: name,
	                value: 'Settings Error',
	                group: 'Errors',
	                description,
	                readonly: true,
	            });
	        }
	        try {
	            const mixinSettings = (await mixinSettingsPromise) || [];
	            for (const setting of mixinSettings) {
	                setting.group = setting.group || this.settingsGroup;
	                setting.key = this.settingsGroupKey + ':' + setting.key;
	            }
	            allSettings.push(...mixinSettings);
	        }
	        catch (e) {
	            const name = deviceManager.getDeviceState(this.mixinProviderNativeId).name;
	            const description = `${name} Extension settings failed to load.`;
	            this.console.error(description, e);
	            allSettings.push({
	                key: Math.random().toString(),
	                title: name,
	                value: 'Settings Error',
	                group: 'Errors',
	                description,
	                readonly: true,
	            });
	        }
	        return allSettings;
	    }
	    async putSetting(key, value) {
	        const prefix = this.settingsGroupKey + ':';
	        if (!key?.startsWith(prefix)) {
	            return this.mixinDevice.putSetting(key, value);
	        }
	        if (!await this.putMixinSetting(key.substring(prefix.length), value))
	            deviceManager.onMixinEvent(this.id, this, _1.ScryptedInterface.Settings, null);
	    }
	    async release() {
	        await deviceManager.onMixinEvent(this.id, this, _1.ScryptedInterface.Settings, null);
	    }
	}
	settingsMixin.SettingsMixinDeviceBase = SettingsMixinDeviceBase;
	
	return settingsMixin;
}

var settingsMixinExports = requireSettingsMixin();

var storageSettings = {};

var hasRequiredStorageSettings;

function requireStorageSettings () {
	if (hasRequiredStorageSettings) return storageSettings;
	hasRequiredStorageSettings = 1;
	var __createBinding = (storageSettings && storageSettings.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (storageSettings && storageSettings.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (storageSettings && storageSettings.__importStar) || (function () {
	    var ownKeys = function(o) {
	        ownKeys = Object.getOwnPropertyNames || function (o) {
	            var ar = [];
	            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	            return ar;
	        };
	        return ownKeys(o);
	    };
	    return function (mod) {
	        if (mod && mod.__esModule) return mod;
	        var result = {};
	        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	        __setModuleDefault(result, mod);
	        return result;
	    };
	})();
	Object.defineProperty(storageSettings, "__esModule", { value: true });
	storageSettings.StorageSettings = void 0;
	const _1 = __importStar(requireSrc());
	const { systemManager } = _1.default;
	function parseValue(value, setting, readDefaultValue, rawDevice) {
	    if (value === null || value === undefined) {
	        return readDefaultValue();
	    }
	    const type = setting.multiple ? 'array' : setting.type;
	    if (type === 'boolean') {
	        if (value === 'true')
	            return true;
	        if (value === 'false')
	            return false;
	        return readDefaultValue() || false;
	    }
	    if (type === 'number') {
	        const n = parseFloat(value);
	        if (!isNaN(n))
	            return n;
	        return readDefaultValue() || 0;
	    }
	    if (type === 'integer') {
	        const n = parseInt(value);
	        if (!isNaN(n))
	            return n;
	        return readDefaultValue() || 0;
	    }
	    if (type === 'array') {
	        if (!value)
	            return readDefaultValue() || [];
	        try {
	            const ret = JSON.parse(value);
	            if (setting.type !== 'device')
	                return ret;
	            // ensure the devices have not been deleted
	            return ret?.filter((id) => !!systemManager.getDeviceById(id));
	        }
	        catch (e) {
	            return readDefaultValue() || [];
	        }
	    }
	    if (type === 'device') {
	        if (rawDevice)
	            return value;
	        return systemManager.getDeviceById(value) || systemManager.getDeviceById(readDefaultValue());
	    }
	    // string type, so check if it is json.
	    if (value && setting.json) {
	        try {
	            return JSON.parse(value);
	        }
	        catch (e) {
	            return readDefaultValue();
	        }
	    }
	    return value || readDefaultValue();
	}
	class StorageSettings {
	    constructor(device, settings) {
	        this.device = device;
	        this.settings = settings;
	        this.values = {};
	        this.hasValue = {};
	        for (const key of Object.keys(settings)) {
	            const setting = settings[key];
	            const rawGet = () => this.getItem(key);
	            let get;
	            if (setting.type !== 'clippath') {
	                get = rawGet;
	            }
	            else {
	                // maybe need a mapPut. clippath is the only complex type at the moment.
	                get = () => {
	                    try {
	                        return JSON.parse(rawGet());
	                    }
	                    catch (e) {
	                    }
	                };
	            }
	            Object.defineProperty(this.values, key, {
	                get,
	                set: value => this.putSetting(key, value),
	                enumerable: true,
	            });
	            Object.defineProperty(this.hasValue, key, {
	                get: () => this.device.storage.getItem(key) != null,
	                enumerable: true,
	            });
	        }
	    }
	    get keys() {
	        const ret = {};
	        for (const key of Object.keys(this.settings)) {
	            ret[key] = key;
	        }
	        return ret;
	    }
	    async getSettings() {
	        const onGet = await this.options?.onGet?.();
	        const ret = [];
	        for (const [key, setting] of Object.entries(this.settings)) {
	            let s = Object.assign({}, setting);
	            if (onGet?.[key])
	                s = Object.assign(s, onGet[key]);
	            if (s.onGet)
	                s = Object.assign(s, await s.onGet());
	            if (s.hide || await this.options?.hide?.[key]?.())
	                continue;
	            s.key = key;
	            s.value = this.getItemInternal(key, s, true);
	            if (typeof s.deviceFilter === 'function')
	                s.deviceFilter = s.deviceFilter.toString();
	            ret.push(s);
	            delete s.onPut;
	            delete s.onGet;
	            delete s.mapPut;
	            delete s.mapGet;
	        }
	        return ret;
	    }
	    async putSetting(key, value) {
	        const setting = this.settings[key];
	        let oldValue;
	        if (setting)
	            oldValue = this.getItemInternal(key, setting);
	        return this.putSettingInternal(setting, oldValue, key, value);
	    }
	    putSettingInternal(setting, oldValue, key, value) {
	        if (!setting?.noStore) {
	            if (setting?.mapPut)
	                value = setting.mapPut(oldValue, value);
	            // nullish values should be removed, since Storage can't persist them correctly.
	            if (value == null)
	                this.device.storage.removeItem(key);
	            else if (typeof value === 'object')
	                this.device.storage.setItem(key, JSON.stringify(value));
	            else
	                this.device.storage.setItem(key, value?.toString());
	        }
	        setting?.onPut?.(oldValue, value);
	        if (!setting?.hide)
	            this.device.onDeviceEvent(_1.ScryptedInterface.Settings, undefined);
	    }
	    getItemInternal(key, setting, rawDevice) {
	        if (!setting)
	            return this.device.storage.getItem(key);
	        const readDefaultValue = () => {
	            if (setting.persistedDefaultValue != null) {
	                this.putSettingInternal(setting, undefined, key, setting.persistedDefaultValue);
	                return setting.persistedDefaultValue;
	            }
	            return setting.defaultValue;
	        };
	        const ret = parseValue(this.device.storage.getItem(key), setting, readDefaultValue, rawDevice);
	        return setting.mapGet ? setting.mapGet(ret) : ret;
	    }
	    getItem(key) {
	        return this.getItemInternal(key, this.settings[key]);
	    }
	}
	storageSettings.StorageSettings = StorageSettings;
	
	return storageSettings;
}

var storageSettingsExports = requireStorageSettings();

const { systemManager: systemManager$1, mediaManager: mediaManager$1 } = sdk;
const PROVIDER_CHOICES = [
    'Anthropic (Claude)',
    'OpenAI',
    'Google Gemini',
    'Ollama (local)',
    'Custom endpoint (OpenAI-compatible)',
];
function providerId(choice) {
    const c = (choice ?? '').toLowerCase();
    if (c.includes('gemini') || c.includes('google'))
        return 'gemini';
    if (c.includes('ollama'))
        return 'ollama';
    if (c.includes('custom'))
        return 'custom';
    if (c.includes('openai'))
        return 'openai';
    return 'anthropic';
}
const PROVIDER_DEFAULTS = {
    anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-haiku-4-5' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-flash' },
    ollama: { baseUrl: 'http://localhost:11434', model: 'llama3.2-vision' },
    custom: { baseUrl: '', model: '' },
};
/** Returns true if the provider is local Ollama or points to a local/LAN server (never subject to daily quota limits). */
function isLocalProvider(cfg) {
    if (cfg.provider === 'ollama')
        return true;
    const url = (cfg.baseUrl ?? '').trim().toLowerCase();
    if (!url)
        return false;
    return (url.includes('localhost') ||
        url.includes('127.0.0.1') ||
        url.includes(':11434') ||
        url.includes('.local') ||
        /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url));
}
/** Returns a message if the provider is missing required settings, otherwise undefined. */
function validateConfig(cfg) {
    switch (cfg.provider) {
        case 'anthropic':
        case 'openai':
        case 'gemini':
            return cfg.apiKey?.trim() ? undefined : 'API key is missing.';
        case 'ollama':
            return cfg.baseUrl?.trim()
                ? undefined
                : 'Ollama URL is missing (use the LAN IP of the machine running Ollama, e.g. http://192.168.100.20:11434).';
        case 'custom':
            return cfg.baseUrl?.trim() && cfg.model?.trim() ? undefined : 'Base URL and model are both required.';
    }
}
/* ------------------------------------------------------------------ */
/* Object & Face Recognition types, quality gates & similarity math     */
/* ------------------------------------------------------------------ */
const OBJECT_FILTER_CHOICES = ['person', 'face', 'vehicle', 'package', 'animal'];
const TRIGGER_CHOICES = [
    'Smart Object/Face Detection (fallback to Motion if unsupported)',
    'Smart Object/Face Detection only',
    'Motion sensor only',
    'Both Motion and Smart Object/Face Detection',
];
const FACE_ALERT_MODES = [
    'Arrival alerts + identify in security alerts',
    'Suppress security alerts when only known faces are seen',
    'Only alert when a known face is recognized',
];
/** Reads pixel dimensions [width, height] directly from a JPEG buffer's SOF marker. */
function getJpegDimensions(buf) {
    if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8)
        return [1024, 576];
    let offset = 2;
    while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) {
            offset++;
            continue;
        }
        const marker = buf[offset + 1];
        if (marker === 0xff) {
            offset++;
            continue;
        }
        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
            offset += 2;
            continue;
        }
        const len = buf.readUInt16BE(offset + 2);
        if (len < 2 || offset + 2 + len > buf.length)
            break;
        // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
        if ((marker >= 0xc0 && marker <= 0xc3) ||
            (marker >= 0xc5 && marker <= 0xc7) ||
            (marker >= 0xc9 && marker <= 0xcb) ||
            (marker >= 0xcd && marker <= 0xcf)) {
            const height = buf.readUInt16BE(offset + 5);
            const width = buf.readUInt16BE(offset + 7);
            if (width > 0 && height > 0)
                return [width, height];
        }
        offset += 2 + len;
    }
    return [1024, 576];
}
/** Decodes base64 float32 embedding from Scrypted ObjectDetectionResult if present. */
function decodeBase64Float32(b64) {
    if (!b64)
        return undefined;
    try {
        const buf = Buffer.from(b64, 'base64');
        if (buf.byteLength < 16 || buf.byteLength % 4 !== 0)
            return undefined;
        const count = buf.byteLength / 4;
        const out = new Array(count);
        for (let i = 0; i < count; i++)
            out[i] = buf.readFloatLE(i * 4);
        return l2Normalize(out);
    }
    catch {
        return undefined;
    }
}
function l2Normalize(vec) {
    let sum = 0;
    for (const v of vec)
        sum += v * v;
    const norm = Math.sqrt(sum);
    if (norm < 1e-8)
        return vec;
    return vec.map(v => v / norm);
}
function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length || a.length === 0)
        return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++)
        dot += a[i] * b[i];
    return Math.max(0, Math.min(1, dot));
}
/**
 * Extracts a 48x48 RGB face patch with ffmpeg, computes a real Laplacian sharpness score,
 * and builds a normalized visual descriptor vector for appearance/stranger grouping and similarity fallback.
 */
async function analyzeFacePatch(ffmpegPath, jpeg, box) {
    const [imgW, imgH] = getJpegDimensions(jpeg);
    const x = Math.max(0, Math.min(imgW - 16, Math.round(box[0] * imgW)));
    const y = Math.max(0, Math.min(imgH - 16, Math.round(box[1] * imgH)));
    const w = Math.max(16, Math.min(imgW - x, Math.round(box[2] * imgW)));
    const h = Math.max(16, Math.min(imgH - y, Math.round(box[3] * imgH)));
    const dir = await fs__namespace.mkdtemp(path__namespace.join(os__namespace.tmpdir(), 'ai-patch-'));
    try {
        const inFile = path__namespace.join(dir, 'in.jpg');
        await fs__namespace.writeFile(inFile, jpeg);
        const SIZE = 48;
        const raw = await new Promise((resolve, reject) => {
            const chunks = [];
            const p = child_process.spawn(ffmpegPath, [
                '-nostdin',
                '-hide_banner',
                '-loglevel', 'error',
                '-i', inFile,
                '-vf', `crop=${w}:${h}:${x}:${y},scale=${SIZE}:${SIZE}`,
                '-frames:v', '1',
                '-f', 'rawvideo',
                '-pix_fmt', 'rgb24',
                'pipe:1',
            ], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
            p.stdout.on('data', d => chunks.push(Buffer.from(d)));
            const timer = setTimeout(() => p.kill('SIGKILL'), 6000);
            p.on('error', e => {
                clearTimeout(timer);
                reject(e);
            });
            p.on('close', () => {
                clearTimeout(timer);
                resolve(Buffer.concat(chunks));
            });
        });
        if (raw.length < SIZE * SIZE * 3)
            return undefined;
        // Convert to grayscale and compute 2D Laplacian variance for sharpness
        const gray = new Float32Array(SIZE * SIZE);
        for (let i = 0; i < SIZE * SIZE; i++) {
            const r = raw[i * 3];
            const g = raw[i * 3 + 1];
            const b = raw[i * 3 + 2];
            gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        }
        let lapSum = 0;
        let lapSqSum = 0;
        let count = 0;
        for (let r = 1; r < SIZE - 1; r++) {
            for (let c = 1; c < SIZE - 1; c++) {
                const idx = r * SIZE + c;
                const lap = -4 * gray[idx] +
                    gray[idx - 1] +
                    gray[idx + 1] +
                    gray[idx - SIZE] +
                    gray[idx + SIZE];
                lapSum += lap;
                lapSqSum += lap * lap;
                count++;
            }
        }
        const mean = lapSum / count;
        const variance = lapSqSum / count - mean * mean;
        // Normalize variance into a 0..100+ sharpness score (sharp faces typically >= 18)
        const sharpnessScore = Math.round((variance / 12) * 10) / 10;
        // Build a 12x12x3 spatial color + gradient descriptor (432-dim L2-normalized vector)
        const GRID = 12;
        const cell = SIZE / GRID;
        const desc = [];
        for (let gr = 0; gr < GRID; gr++) {
            for (let gc = 0; gc < GRID; gc++) {
                let rSum = 0;
                let gSum = 0;
                let bSum = 0;
                let n = 0;
                for (let py = gr * cell; py < (gr + 1) * cell; py++) {
                    for (let px = gc * cell; px < (gc + 1) * cell; px++) {
                        const base = (py * SIZE + px) * 3;
                        rSum += raw[base] / 255;
                        gSum += raw[base + 1] / 255;
                        bSum += raw[base + 2] / 255;
                        n++;
                    }
                }
                desc.push(rSum / n - 0.5, gSum / n - 0.5, bSum / n - 0.5);
            }
        }
        return {
            sharpnessScore,
            embedding: l2Normalize(desc),
        };
    }
    catch {
        return undefined;
    }
    finally {
        await fs__namespace.rm(dir, { recursive: true, force: true });
    }
}
/** Maps raw object labels (e.g. 'car', 'dog', 'parcel') into both specific labels and canonical categories. */
function normalizeObjects(rawObjects, hasFace = false) {
    const out = new Set();
    for (const item of rawObjects) {
        const s = String(item ?? '').trim().toLowerCase();
        if (!s || s === 'none' || s === 'motion' || s === 'unknown')
            continue;
        out.add(s);
        if (['person', 'people', 'human', 'pedestrian', 'man', 'woman', 'child', 'adult', 'delivery person'].includes(s))
            out.add('person');
        if (['face', 'human face'].includes(s)) {
            out.add('face');
            out.add('person');
        }
        if (['vehicle', 'car', 'truck', 'van', 'suv', 'bus', 'motorcycle', 'motorbike', 'bicycle', 'bike', 'scooter'].includes(s))
            out.add('vehicle');
        if (['package', 'parcel', 'box', 'delivery', 'mail'].includes(s))
            out.add('package');
        if (['animal', 'dog', 'cat', 'pet', 'bird', 'deer', 'wildlife', 'raccoon', 'fox', 'coyote', 'bear', 'squirrel'].includes(s))
            out.add('animal');
    }
    if (hasFace) {
        out.add('face');
        out.add('person');
    }
    return Array.from(out);
}
const DEFAULT_SYSTEM_PROMPT = 'You are a home security camera analyst. ' +
    'You receive still frames sampled from a camera\'s live stream right after activity was detected, oldest first. ' +
    'Decide whether the camera frames show something the homeowner should be alerted about, considering what changes between frames. ' +
    'Identify notable objects clearly visible in the frames (such as "person", "vehicle", "car", "truck", "bicycle", "motorcycle", "package", "animal", "dog", "cat"). ' +
    'Also locate any clearly visible human faces across the frames in "detectedFaces": ' +
    'for each face, provide {"frame": 1-based frame number, "box": [x, y, width, height] as normalized 0..1 coordinates of the head/face, "sharp": boolean}. ' +
    'Set "sharp": true ONLY if the face is in focus, front/three-quarter facing, unobstructed, and facial features (eyes, nose, mouth) are clearly distinguishable. ' +
    'Set "sharp": false if the face is blurry, motion-blurred, in shadow/silhouette, tiny, or turned away. ' +
    'Set "bestFrame" to the 1-based index of the frame with the clearest view. ' +
    'Reply with ONLY a JSON object, no markdown: ' +
    '{"alert": boolean, "severity": "low" | "medium" | "high", "summary": string, "save": "none" | "snapshot" | "clip" | "both", ' +
    '"objects": string[], "detectedFaces": [{"frame": number, "box": [number, number, number, number], "sharp": boolean}], "bestFrame": number}. ' +
    'Set "save" by following the evidence rules if they are given, otherwise use "none". ' +
    'The summary is one short sentence describing what is happening (people, what they are doing, vehicles, packages, animals). ' +
    'Never guess identities. Be conservative: routine activity such as pets, passing traffic on the street, passing shadows, ' +
    'headlights, trees/wind, insects, rain, or lighting changes is NOT an alert unless the homeowner rules below say otherwise.';
const FACE_SIMILARITY_SYSTEM_PROMPT = 'You are a precise facial recognition scoring model. ' +
    'You receive labeled reference face photos of enrolled people followed by 1 cropped/live camera image containing a face. ' +
    'For EACH enrolled person name, estimate a visual facial similarity score between 0.00 and 1.00 comparing the target face in the last image against that person\'s reference photo(s): ' +
    '- 0.75 to 1.00: Unmistakably the same person (clear match of facial structure, eyes, nose, hair/features).\n' +
    '- 0.50 to 0.74: Likely match, strong resemblance.\n' +
    '- 0.25 to 0.49: Different person with some superficial similarity.\n' +
    '- 0.00 to 0.24: Clearly a different person.\n' +
    'Also set "sharp": true only if the target face in the last image has clear, non-blurry facial features. ' +
    'Reply with ONLY a JSON object, no markdown: {"scores": {"<Name>": number}, "sharp": boolean}.';
const DEFAULT_RULES = 'Alert on any person near a door, window or garage, anyone carrying or taking a package, ' +
    'or anyone behaving suspiciously. Do not alert on people walking by on the street.';
const DEFAULT_EVIDENCE_RULES = 'Save a clip when a person is near a door, window or garage or is carrying or taking something. ' +
    'Save only a snapshot for other alerts. Save nothing for non-alerts.';
function buildPrompt(cameraName, rules, frames, intervalSec, evidenceRules, detectorHint) {
    let hintLine = '';
    if (detectorHint && (detectorHint.objects.length || detectorHint.faces.length)) {
        const parts = [];
        if (detectorHint.objects.length)
            parts.push(`objects=[${detectorHint.objects.join(', ')}]`);
        const named = detectorHint.faces.map(f => f.upstreamLabel).filter(Boolean);
        if (named.length)
            parts.push(`detector_faces=[${named.join(', ')}]`);
        hintLine = `Camera smart detector reported: ${parts.join(' ')}.\n`;
    }
    return (`Camera: ${cameraName}\n` +
        `Trigger: ${detectorHint ? 'smart object detection' : 'motion detected'}\n` +
        `${frames} live camera frame(s), about ${intervalSec}s apart, oldest first.\n` +
        hintLine +
        `Homeowner rules: ${rules}\n` +
        (evidenceRules ? `Evidence rules (for the "save" field): ${evidenceRules}\n` : '') +
        'Respond with the JSON object only.');
}
function buildFaceSimilarityPrompt(faceRefs) {
    const refLabels = faceRefs.map((r, i) => `Image #${i + 1} = "${r.name}"`).join(', ');
    const targetIdx = faceRefs.length + 1;
    const uniqueNames = Array.from(new Set(faceRefs.map(r => r.name)));
    return (`Enrolled reference face photo(s): ${refLabels}.\n` +
        `Target camera image to score: Image #${targetIdx}.\n` +
        `Return the JSON object {"scores": {${uniqueNames.map(n => `"${n}": 0.0`).join(', ')}}, "sharp": true} with your real 0.00-1.00 similarity score for each enrolled person.`);
}
async function postJson(url, headers, body, timeoutMs) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok)
        throw new Error(`${url} returned ${res.status}: ${(await res.text()).slice(0, 500)}`);
    return res.json();
}
/** Calls the selected provider and returns the model's raw text reply. */
async function callModel(cfg, req) {
    const defaults = PROVIDER_DEFAULTS[cfg.provider];
    const base = (cfg.baseUrl?.trim() || defaults.baseUrl).replace(/\/+$/, '');
    const model = cfg.model?.trim() || defaults.model;
    if (!base || !model)
        throw new Error(`${cfg.provider}: base URL and model are required.`);
    const b64s = req.jpegs.map(j => j.toString('base64'));
    switch (cfg.provider) {
        case 'anthropic': {
            const content = b64s.map(data => ({
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data },
            }));
            content.push({ type: 'text', text: req.prompt });
            const json = await postJson(`${base}/v1/messages`, { 'x-api-key': cfg.apiKey ?? '', 'anthropic-version': '2023-06-01' }, { model, max_tokens: req.maxTokens, system: req.system, messages: [{ role: 'user', content }] }, req.timeoutMs);
            return (json.content ?? [])
                .filter((b) => b.type === 'text')
                .map((b) => b.text)
                .join('');
        }
        case 'gemini': {
            const parts = b64s.map(data => ({ inline_data: { mime_type: 'image/jpeg', data } }));
            parts.push({ text: req.prompt });
            const json = await postJson(`${base}/models/${model}:generateContent`, { 'x-goog-api-key': cfg.apiKey ?? '' }, {
                systemInstruction: { parts: [{ text: req.system }] },
                contents: [{ role: 'user', parts }],
                generationConfig: { maxOutputTokens: req.maxTokens, responseMimeType: 'application/json' },
            }, req.timeoutMs);
            const text = (json.candidates?.[0]?.content?.parts ?? [])
                .map((p) => p.text)
                .filter(Boolean)
                .join('');
            if (!text)
                throw new Error(`Gemini returned no text: ${JSON.stringify(json.promptFeedback ?? json).slice(0, 300)}`);
            return text;
        }
        case 'ollama': {
            const headers = {};
            if (cfg.apiKey)
                headers.authorization = `Bearer ${cfg.apiKey}`;
            // Stitch multi-frame / reference+target images into a single JPEG for all Ollama vision models
            // (llava, llama3.2-vision, qwen2.5vl, gemma3, minicpm-v, etc.) to avoid multi-image context/token limits.
            let ollamaImages = b64s;
            if (req.jpegs.length > 1) {
                const stitched = await stitchJpegsHorizontal(req.jpegs);
                if (stitched)
                    ollamaImages = [stitched.toString('base64')];
            }
            const user = { role: 'user', content: req.prompt };
            if (ollamaImages.length)
                user.images = ollamaImages;
            const json = await postJson(`${base}/api/chat`, headers, {
                model,
                stream: false,
                format: 'json',
                messages: [{ role: 'system', content: req.system }, user],
                options: {
                    num_predict: Math.max(req.maxTokens, 1024),
                    num_ctx: 8192,
                    temperature: 0.1,
                },
            }, req.timeoutMs);
            return json.message?.content ?? '';
        }
        case 'openai':
        case 'custom': {
            const headers = {};
            if (cfg.apiKey)
                headers.authorization = `Bearer ${cfg.apiKey}`;
            const content = [{ type: 'text', text: req.prompt }];
            for (const data of b64s)
                content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${data}` } });
            const json = await postJson(`${base}/chat/completions`, headers, {
                model,
                max_tokens: req.maxTokens,
                messages: [{ role: 'system', content: req.system }, { role: 'user', content }],
            }, req.timeoutMs);
            return json.choices?.[0]?.message?.content ?? '';
        }
    }
}
/** Pulls the Stage 1 JSON verdict and face bounding boxes out of a model reply. */
function parseStage1(text, cameraJpegs, upstreamObjects = []) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        throw new Error(`Model did not return JSON: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);
    const frameCount = cameraJpegs.length;
    const aiFaces = [];
    if (Array.isArray(parsed.detectedFaces)) {
        for (const df of parsed.detectedFaces) {
            if (!df || !Array.isArray(df.box) || df.box.length !== 4)
                continue;
            const fIdx = Math.max(0, Math.min(frameCount - 1, (Number(df.frame) || 1) - 1));
            const [imgW, imgH] = getJpegDimensions(cameraJpegs[fIdx]);
            let [bx, by, bw, bh] = df.box.map((n) => Number(n) || 0);
            // Handle models that return 0..1000 or pixel coords instead of 0..1
            if (bw > 1.5 || bh > 1.5) {
                if (bw <= imgW && bh <= imgH && (bx + bw <= imgW * 1.05)) {
                    bx /= imgW;
                    by /= imgH;
                    bw /= imgW;
                    bh /= imgH;
                }
                else {
                    bx /= 1000;
                    by /= 1000;
                    bw /= 1000;
                    bh /= 1000;
                }
            }
            bw = Math.max(0, Math.min(1, bw));
            bh = Math.max(0, Math.min(1, bh));
            bx = Math.max(0, Math.min(1 - bw, bx));
            by = Math.max(0, Math.min(1 - bh, by));
            const widthPx = Math.round(bw * imgW);
            const heightPx = Math.round(bh * imgH);
            if (widthPx <= 0 || heightPx <= 0)
                continue;
            aiFaces.push({
                frameIndex: fIdx,
                box: [bx, by, bw, bh],
                widthPx,
                heightPx,
                sharp: df.sharp === true || df.sharp === 'true',
                sharpnessScore: df.sharp ? 25 : 8,
            });
        }
    }
    const rawObjects = Array.isArray(parsed.objects) ? [...parsed.objects, ...upstreamObjects] : upstreamObjects;
    const objects = normalizeObjects(rawObjects, aiFaces.length > 0);
    const rawBest = Number(parsed.bestFrame);
    const bestFrameIndex = Number.isFinite(rawBest) && rawBest >= 1 && rawBest <= frameCount
        ? Math.round(rawBest) - 1
        : Math.floor(frameCount / 2);
    // Fallback for vision models like llava that report a person/face without returning bounding box coordinates
    if (aiFaces.length === 0 && (objects.includes('person') || objects.includes('face') || parsed.sharp === true)) {
        const [imgW, imgH] = getJpegDimensions(cameraJpegs[bestFrameIndex] ?? cameraJpegs[0]);
        aiFaces.push({
            frameIndex: bestFrameIndex,
            box: [0.25, 0.08, 0.5, 0.55],
            widthPx: Math.round(imgW * 0.25),
            heightPx: Math.round(imgH * 0.35),
            sharp: parsed.sharp !== false,
            sharpnessScore: 20,
        });
    }
    return {
        alert: parsed.alert === true || parsed.alert === 'true',
        severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'medium',
        summary: String(parsed.summary ?? '').trim() || 'Activity detected.',
        save: ['none', 'snapshot', 'clip', 'both'].includes(parsed.save) ? parsed.save : 'none',
        objects,
        aiFaces,
        bestFrameIndex,
    };
}
function parseFaceSimilarityReply(text) {
    const scores = new Map();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        return { scores };
    try {
        const parsed = JSON.parse(match[0]);
        if (parsed.scores && typeof parsed.scores === 'object') {
            for (const [k, v] of Object.entries(parsed.scores)) {
                const num = Number(v);
                if (Number.isFinite(num))
                    scores.set(k.trim(), Math.max(0, Math.min(1, num)));
            }
        }
        const sharp = typeof parsed.sharp === 'boolean' ? parsed.sharp : undefined;
        return { scores, sharp };
    }
    catch {
        return { scores };
    }
}
/* ------------------------------------------------------------------ */
/* Live stream frame sampling & image normalization (built-in ffmpeg)   */
/* ------------------------------------------------------------------ */
async function sampleFrames(ffmpegPath, inputArgs, count, intervalSec, log) {
    const dir = await fs__namespace.mkdtemp(path__namespace.join(os__namespace.tmpdir(), 'ai-alerts-'));
    try {
        const args = [
            '-nostdin',
            '-hide_banner',
            '-loglevel', 'error',
            ...inputArgs,
            '-an',
            '-vf', `fps=1/${intervalSec},scale=min(1024\\,iw):-2`,
            '-frames:v', String(count),
            '-q:v', '5',
            path__namespace.join(dir, 'frame_%02d.jpg'),
        ];
        const killAfterMs = (count * intervalSec + 20) * 1000;
        let stderr = '';
        await new Promise((resolve, reject) => {
            const p = child_process.spawn(ffmpegPath, args, {
                stdio: ['ignore', 'ignore', 'pipe'],
                windowsHide: true,
            });
            p.stderr.on('data', d => (stderr += d.toString()));
            const timer = setTimeout(() => p.kill('SIGKILL'), killAfterMs);
            p.on('error', e => {
                clearTimeout(timer);
                reject(e);
            });
            p.on('close', () => {
                clearTimeout(timer);
                resolve();
            });
        });
        const files = (await fs__namespace.readdir(dir)).filter(f => f.endsWith('.jpg')).sort();
        if (!files.length)
            throw new Error(`ffmpeg produced no frames. ${stderr.slice(0, 300)}`);
        if (stderr)
            log(`ffmpeg: ${stderr.slice(0, 200)}`);
        return Promise.all(files.map(f => fs__namespace.readFile(path__namespace.join(dir, f))));
    }
    finally {
        await fs__namespace.rm(dir, { recursive: true, force: true });
    }
}
/** Converts/resizes a reference face image buffer to a compact JPEG (<= 512px wide) using Scrypted's ffmpeg. */
async function normalizeReferenceJpeg(raw, extHint = '.jpg') {
    const isJpeg = raw.length >= 3 && raw[0] === 0xff && raw[1] === 0xd8 && raw[2] === 0xff;
    if (isJpeg && raw.length <= 150 * 1024)
        return raw;
    try {
        const ffmpegPath = await mediaManager$1.getFFmpegPath();
        const dir = await fs__namespace.mkdtemp(path__namespace.join(os__namespace.tmpdir(), 'ai-face-'));
        try {
            const safeExt = /^\.[a-z0-9]+$/i.test(extHint) ? extHint : '.img';
            const inFile = path__namespace.join(dir, `in${safeExt}`);
            const outFile = path__namespace.join(dir, 'out.jpg');
            await fs__namespace.writeFile(inFile, raw);
            await new Promise((resolve, reject) => {
                const p = child_process.spawn(ffmpegPath, [
                    '-nostdin',
                    '-hide_banner',
                    '-loglevel', 'error',
                    '-i', inFile,
                    '-frames:v', '1',
                    '-vf', 'scale=min(512\\,iw):-2',
                    '-q:v', '5',
                    outFile,
                ], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
                const timer = setTimeout(() => p.kill('SIGKILL'), 10000);
                p.on('error', e => {
                    clearTimeout(timer);
                    reject(e);
                });
                p.on('close', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });
            return await fs__namespace.readFile(outFile);
        }
        finally {
            await fs__namespace.rm(dir, { recursive: true, force: true });
        }
    }
    catch {
        if (isJpeg)
            return raw;
        throw new Error('Could not convert reference image to JPEG with ffmpeg.');
    }
}
/** Extracts a clean person name from a filename like "Alice_1.jpg" or "John-Smith-2.png" -> "Alice" / "John Smith". */
function personNameFromFilename(file) {
    const base = path__namespace.basename(file, path__namespace.extname(file));
    return base
        .replace(/[_\-\s]+\d+$/, '')
        .replace(/[_]+/g, ' ')
        .trim();
}
/**
 * Stitches multiple JPEGs side-by-side into a single composite JPEG using Scrypted's ffmpeg.
 * Used for Ollama models like `llava` that only support a single image per request and to minimize vision tokens.
 */
async function stitchJpegsHorizontal(jpegs) {
    if (jpegs.length <= 1)
        return jpegs[0];
    try {
        const ffmpegPath = await mediaManager$1.getFFmpegPath();
        const dir = await fs__namespace.mkdtemp(path__namespace.join(os__namespace.tmpdir(), 'ai-stitch-'));
        try {
            const inputArgs = [];
            for (let i = 0; i < jpegs.length; i++) {
                const p = path__namespace.join(dir, `in_${i}.jpg`);
                await fs__namespace.writeFile(p, jpegs[i]);
                inputArgs.push('-i', p);
            }
            const n = jpegs.length;
            const scaleParts = jpegs.map((_, i) => `[${i}:v]scale=-2:384[v${i}]`).join(';');
            const stackInputs = jpegs.map((_, i) => `[v${i}]`).join('');
            const filterComplex = `${scaleParts};${stackInputs}hstack=inputs=${n}[out]`;
            const outFile = path__namespace.join(dir, 'stitched.jpg');
            await new Promise((resolve, reject) => {
                const proc = child_process.spawn(ffmpegPath, [
                    '-nostdin',
                    '-hide_banner',
                    '-loglevel', 'error',
                    ...inputArgs,
                    '-filter_complex', filterComplex,
                    '-map', '[out]',
                    '-frames:v', '1',
                    '-q:v', '5',
                    outFile,
                ], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
                const timer = setTimeout(() => proc.kill('SIGKILL'), 10000);
                proc.on('error', e => {
                    clearTimeout(timer);
                    reject(e);
                });
                proc.on('close', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });
            return await fs__namespace.readFile(outFile);
        }
        finally {
            await fs__namespace.rm(dir, { recursive: true, force: true });
        }
    }
    catch {
        return undefined;
    }
}
/* ------------------------------------------------------------------ */
/* Notification helpers                                                 */
/* ------------------------------------------------------------------ */
const CHANNELS = ['Home Assistant', 'ntfy', 'Pushover', 'Telegram'];
function errMsg(e) {
    return e instanceof Error ? e.message : String(e);
}
function asList(v) {
    if (Array.isArray(v))
        return v.map(String);
    return v ? [String(v)] : [];
}
/** fetch that throws a readable error on non-2xx responses. */
async function fetchOk(url, init, timeoutMs = 20000) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    return text;
}
/** HTTP header values must be ASCII; encode anything else as an RFC 2047 word. */
function mimeHeader(s) {
    const oneLine = s.replace(/[\r\n]+/g, ' ');
    return /^[\x20-\x7e]*$/.test(oneLine) ? oneLine : `=?UTF-8?B?${Buffer.from(oneLine).toString('base64')}?=`;
}
/* ------------------------------------------------------------------ */
/* Per-camera mixin                                                     */
/* ------------------------------------------------------------------ */
class AIAlertsMixin extends settingsMixinExports.SettingsMixinDeviceBase {
    provider;
    motionListener;
    objectListener;
    motionTimer;
    recheckTimer;
    busy = false;
    lastRun = 0;
    lastDetectionId;
    lastDetectionJpeg;
    pendingHint;
    /** Multi-frame confirmation state within 30s window, keyed by person name or 'stranger:<id>' */
    pendingConfirmations = new Map();
    /** Cooldown timestamps per known person name (lowercase) */
    knownLastAlerted = new Map();
    /** Grouped stranger clusters for deduplication across frames and 15-min cooldown */
    strangerClusters = [];
    nextStrangerId = 1;
    storageSettings = new storageSettingsExports.StorageSettings(this, {
        enabled: {
            title: 'Enable AI alerts',
            type: 'boolean',
            defaultValue: false,
        },
        triggerSource: {
            title: 'Trigger source',
            description: 'Smart Object/Face Detection avoids false motion triggers (trees, shadows, headlights). ' +
                'Automatically falls back to Motion if this camera does not have a smart detector.',
            type: 'string',
            choices: TRIGGER_CHOICES,
            defaultValue: TRIGGER_CHOICES[0],
        },
        minDetectorScore: {
            title: 'Minimum smart detector confidence (0.1 - 0.95)',
            description: 'Ignores low-confidence Scrypted ObjectDetector triggers to save AI tokens.',
            type: 'number',
            defaultValue: 0.6,
        },
        motionDelaySeconds: {
            title: 'Motion settle delay (seconds)',
            description: 'When triggered by a raw motion sensor, waits briefly before sampling so the person/object is fully in frame.',
            type: 'number',
            defaultValue: 1.5,
        },
        frameCount: {
            title: 'Frames to analyze',
            description: 'Frames sampled from the live stream after motion starts. More frames give better context but cost more.',
            type: 'number',
            defaultValue: 3,
        },
        frameIntervalSeconds: {
            title: 'Seconds between frames',
            type: 'number',
            defaultValue: 2,
        },
        cooldownSeconds: {
            title: 'Scene cooldown (seconds)',
            description: 'Minimum time between general scene AI analyses for this camera (face confirmation re-checks still run).',
            type: 'number',
            defaultValue: 30,
        },
        rules: {
            title: 'What should trigger an alert?',
            description: 'Plain-English rules the AI uses to decide.',
            type: 'textarea',
            defaultValue: DEFAULT_RULES,
        },
        objectFilter: {
            title: 'Required object types (optional)',
            description: 'Only send an alert if at least one of these object categories is detected. Leave empty to allow any alert.',
            type: 'string',
            multiple: true,
            choices: OBJECT_FILTER_CHOICES,
            defaultValue: [],
        },
        faceAlertMode: {
            title: 'Face recognition behavior',
            description: 'Sends "<Name> arrived" alerts for confirmed known people (unless listed in "Never notify for these names" on the plugin page) ' +
                'and tracks strangers across frames with quality gates.',
            type: 'string',
            choices: FACE_ALERT_MODES,
            defaultValue: FACE_ALERT_MODES[0],
        },
        emitObjectDetections: {
            title: 'Emit Scrypted ObjectDetector events',
            description: 'Publishes AI-detected objects (person, vehicle, package, animal) and confirmed face labels back to Scrypted.',
            type: 'boolean',
            defaultValue: true,
        },
        minSeverity: {
            title: 'Minimum severity to notify',
            type: 'string',
            choices: ['low', 'medium', 'high'],
            defaultValue: 'low',
        },
        channels: {
            title: 'Send alerts to',
            description: 'Phone/app channels configured on the AI Vision Alerts plugin page. ' +
                'Leave empty to use every channel that is configured.',
            type: 'string',
            multiple: true,
            choices: CHANNELS,
            defaultValue: [],
        },
        haCameraEntity: {
            title: 'Home Assistant camera entity (optional)',
            description: 'e.g. camera.front_door. If this camera also exists in Home Assistant, the phone notification ' +
                'will include a camera snapshot. Leave blank for text only.',
        },
        notifiers: {
            title: 'Also send to Scrypted notifiers (optional)',
            type: 'device',
            multiple: true,
            deviceFilter: `interfaces.includes('${srcExports.ScryptedInterface.Notifier}')`,
        },
        attachSnapshot: {
            title: 'Attach a frame to notifications',
            description: 'Applies to ntfy, Pushover, Telegram and Scrypted notifiers. Home Assistant uses the camera entity above.',
            type: 'boolean',
            defaultValue: true,
        },
        saveEvidence: {
            title: 'Save evidence (needs the NVR Storage plugin)',
            description: 'What to save when an alert fires. Add the NVR Storage plugin under "Also send to Scrypted notifiers" ' +
                'so it receives the request.',
            type: 'string',
            choices: ['Off', 'Snapshot', 'Clip', 'Snapshot + clip', 'Let the AI decide'],
            defaultValue: 'Off',
        },
        evidenceRules: {
            title: 'Evidence rules (used by "Let the AI decide")',
            description: 'Plain-English rules for when to save a snapshot, a clip, both or nothing.',
            type: 'textarea',
            defaultValue: DEFAULT_EVIDENCE_RULES,
        },
        analyzeNow: {
            title: 'Analyze now (test)',
            description: 'Samples the live stream, asks the AI, and sends a notification regardless of the verdict.',
            type: 'button',
            onPut: async () => {
                await this.analyze(true, undefined, false);
            },
        },
    });
    constructor(options, provider) {
        super(options);
        this.provider = provider;
        const hasObjectDetector = this.mixinDeviceInterfaces.includes(srcExports.ScryptedInterface.ObjectDetector);
        if (this.mixinDeviceInterfaces.includes(srcExports.ScryptedInterface.MotionSensor)) {
            this.motionListener = systemManager$1.listenDevice(this.id, srcExports.ScryptedInterface.MotionSensor, (_source, _details, data) => {
                if (data !== true)
                    return;
                const trig = String(this.storageSettings.values.triggerSource ?? TRIGGER_CHOICES[0]);
                if (trig === 'Smart Object/Face Detection only')
                    return;
                if (trig.startsWith('Smart Object/Face Detection (fallback') && hasObjectDetector)
                    return;
                const delayMs = Math.min(10, Math.max(0, Number(this.storageSettings.values.motionDelaySeconds ?? 1.5))) * 1000;
                if (this.motionTimer)
                    return;
                this.motionTimer = setTimeout(() => {
                    this.motionTimer = undefined;
                    this.analyze(false).catch(e => this.console.error('analyze failed', e));
                }, delayMs);
            });
        }
        if (hasObjectDetector) {
            this.objectListener = systemManager$1.listenDevice(this.id, srcExports.ScryptedInterface.ObjectDetector, (_source, _details, data) => {
                this.onObjectsDetected(data);
            });
        }
    }
    dispose() {
        if (this.motionTimer) {
            clearTimeout(this.motionTimer);
            this.motionTimer = undefined;
        }
        if (this.recheckTimer) {
            clearTimeout(this.recheckTimer);
            this.recheckTimer = undefined;
        }
        this.motionListener?.removeListener();
        this.motionListener = undefined;
        this.objectListener?.removeListener();
        this.objectListener = undefined;
    }
    onObjectsDetected(data) {
        if (!data || data.sourceId === 'ai-vision-alerts' || data.detectionId?.startsWith('ai-vision-alerts-'))
            return;
        const minScore = Math.min(0.95, Math.max(0.1, Number(this.storageSettings.values.minDetectorScore ?? 0.6)));
        const detections = data.detections ?? [];
        const rawClasses = [];
        const faceCandidates = [];
        const [dimW, dimH] = data.inputDimensions ?? [1024, 576];
        for (const d of detections) {
            if (!d.className || d.className === 'motion')
                continue;
            if (typeof d.score === 'number' && d.score < minScore)
                continue;
            let normBox = [0.25, 0.15, 0.25, 0.35];
            let widthPx = 96;
            let heightPx = 96;
            if (d.boundingBox && d.boundingBox.length === 4) {
                const [bx, by, bw, bh] = d.boundingBox;
                const normX = dimW > 1.5 ? bx / dimW : bx;
                const normY = dimH > 1.5 ? by / dimH : by;
                const normW = dimW > 1.5 ? bw / dimW : bw;
                const normH = dimH > 1.5 ? bh / dimH : bh;
                if (normW > 0 && normH > 0 && normW * normH < 0.01)
                    continue;
                normBox = [
                    Math.max(0, Math.min(1, normX)),
                    Math.max(0, Math.min(1, normY)),
                    Math.max(0, Math.min(1, normW)),
                    Math.max(0, Math.min(1, normH)),
                ];
                widthPx = Math.round(normW * (dimW > 1.5 ? dimW : 1024));
                heightPx = Math.round(normH * (dimH > 1.5 ? dimH : 576));
            }
            rawClasses.push(d.className);
            if (d.className === 'face' || (d.label && d.label.trim())) {
                faceCandidates.push({
                    frameIndex: 0,
                    box: normBox,
                    widthPx,
                    heightPx,
                    sharp: true,
                    sharpnessScore: 22,
                    embedding: decodeBase64Float32(d.embedding),
                    upstreamLabel: d.label?.trim() || undefined,
                    upstreamScore: d.labelScore ?? d.score,
                });
            }
        }
        const objects = normalizeObjects(rawClasses, faceCandidates.length > 0);
        if (!objects.length && !faceCandidates.length)
            return;
        this.pendingHint = {
            objects,
            faces: faceCandidates,
            detectionId: data.detectionId,
            timestamp: Date.now(),
        };
        const trig = String(this.storageSettings.values.triggerSource ?? TRIGGER_CHOICES[0]);
        if (trig === 'Motion sensor only')
            return;
        this.analyze(false, this.pendingHint).catch(e => this.console.error('analyze failed', e));
    }
    getMixinSettings() {
        return this.storageSettings.getSettings();
    }
    putMixinSetting(key, value) {
        return this.storageSettings.putSetting(key, value);
    }
    /* ---------------- Scrypted ObjectDetector interface ---------------- */
    async getObjectTypes() {
        const classes = new Set(['person', 'face', 'vehicle', 'car', 'truck', 'bicycle', 'motorcycle', 'package', 'animal', 'dog', 'cat']);
        if (this.mixinDeviceInterfaces.includes(srcExports.ScryptedInterface.ObjectDetector) && this.mixinDevice.getObjectTypes) {
            try {
                const upstream = await this.mixinDevice.getObjectTypes();
                for (const c of upstream?.classes ?? [])
                    classes.add(c);
            }
            catch {
                // ignore upstream errors
            }
        }
        const knownNames = await this.provider.getKnownFaceNames();
        for (const name of knownNames)
            classes.add(name);
        return { classes: Array.from(classes) };
    }
    async getDetectionInput(detectionId, eventId) {
        if (detectionId === this.lastDetectionId && this.lastDetectionJpeg)
            return this.createMediaObject(this.lastDetectionJpeg, 'image/jpeg');
        if (this.mixinDeviceInterfaces.includes(srcExports.ScryptedInterface.ObjectDetector) && this.mixinDevice.getDetectionInput)
            return this.mixinDevice.getDetectionInput(detectionId, eventId);
        throw new Error(`Detection input ${detectionId} is no longer available.`);
    }
    /** Emits an ObjectsDetected event onto Scrypted for automations, HomeKit, or NVR. */
    async emitDetections(verdict, representativeJpeg) {
        if (!this.storageSettings.values.emitObjectDetections)
            return;
        if (!verdict.objects.length && !verdict.faces.length)
            return;
        const detectionId = `ai-vision-alerts-${Date.now()}`;
        this.lastDetectionId = detectionId;
        this.lastDetectionJpeg = representativeJpeg;
        const detections = [];
        for (const obj of verdict.objects) {
            if (obj === 'face' && !verdict.faces.length)
                continue;
            detections.push({
                className: obj,
                score: 0.9,
                boundingBox: [0, 0, 1, 1],
            });
        }
        for (const face of verdict.faces) {
            if (face.toLowerCase() === 'unknown')
                continue;
            detections.push({
                className: 'face',
                label: face,
                score: 0.9,
                labelScore: 0.9,
                boundingBox: [0, 0, 1, 1],
            });
        }
        if (!detections.length)
            return;
        const event = {
            timestamp: Date.now(),
            detectionId,
            sourceId: 'ai-vision-alerts',
            detections,
        };
        try {
            await this.onDeviceEvent(srcExports.ScryptedInterface.ObjectDetector, event);
        }
        catch (e) {
            this.console.warn('Failed to emit ObjectDetector event:', errMsg(e));
        }
    }
    /** Grabs frames from the live stream (and optional detector frame); falls back to a snapshot if that fails. */
    async captureFrames(count, intervalSec, detectionId) {
        let detectorFrame;
        if (detectionId &&
            this.mixinDeviceInterfaces.includes(srcExports.ScryptedInterface.ObjectDetector) &&
            this.mixinDevice.getDetectionInput) {
            try {
                const mo = await this.mixinDevice.getDetectionInput(detectionId);
                detectorFrame = await mediaManager$1.convertMediaObjectToBuffer(mo, 'image/jpeg');
            }
            catch {
                // fall back to live stream sampling
            }
        }
        try {
            let mo;
            try {
                mo = await this.mixinDevice.getVideoStream({ destination: 'low-resolution' });
            }
            catch {
                mo = await this.mixinDevice.getVideoStream();
            }
            const input = await mediaManager$1.convertMediaObjectToJSON(mo, srcExports.ScryptedMimeTypes.FFmpegInput);
            const inputArgs = input.inputArguments?.length
                ? input.inputArguments
                : input.url
                    ? ['-i', input.url]
                    : [];
            if (!inputArgs.length)
                throw new Error('Camera stream did not provide FFmpeg input arguments or URL.');
            const ffmpegPath = await mediaManager$1.getFFmpegPath();
            const sampled = await sampleFrames(ffmpegPath, inputArgs, count, intervalSec, m => this.console.warn(m));
            if (detectorFrame)
                return [detectorFrame, ...sampled.slice(0, Math.max(0, count - 1))];
            return sampled;
        }
        catch (e) {
            if (detectorFrame)
                return [detectorFrame];
            this.console.warn('Live stream sampling failed, trying a snapshot instead:', e);
            if (!this.mixinDevice.takePicture)
                throw e;
            const picture = await this.mixinDevice.takePicture({ reason: 'event' });
            return [await mediaManager$1.convertMediaObjectToBuffer(picture, 'image/jpeg')];
        }
    }
    /** Calls the first working provider in the chain, enforcing daily quota only on paid cloud providers. */
    async runWithProviderChain(chain, request) {
        let lastError;
        for (const cfg of chain) {
            if (!isLocalProvider(cfg) && !this.provider.tryConsumeQuota(cfg)) {
                lastError = new Error(`${cfg.provider}: Daily cloud AI call limit reached (raise or set Daily AI call limit to 0 for unlimited).`);
                this.console.warn(errMsg(lastError));
                continue;
            }
            try {
                const text = await callModel(cfg, request);
                return { text, used: cfg.provider };
            }
            catch (e) {
                lastError = e;
                this.console.warn(`${cfg.provider} failed: ${errMsg(e)}`);
            }
        }
        throw lastError;
    }
    /** Assigns or reuses a stranger cluster so the same stranger counts as one person across frames. */
    matchOrCreateStrangerCluster(embedding) {
        const now = Date.now();
        const cooldownMs = this.provider.strangerCooldownMs();
        // Prune expired stranger clusters older than max(cooldownMs, 30 min)
        this.strangerClusters = this.strangerClusters.filter(c => now - c.lastSeen < Math.max(cooldownMs, 30 * 60 * 1000));
        let bestCluster;
        let bestSim = 0;
        for (const cluster of this.strangerClusters) {
            if (embedding && cluster.embedding) {
                const sim = cosineSimilarity(embedding, cluster.embedding);
                // Same stranger appearance within session or recent frames
                const threshold = now - cluster.lastSeen < 45000 ? 0.62 : 0.74;
                if (sim >= threshold && sim > bestSim) {
                    bestSim = sim;
                    bestCluster = cluster;
                }
            }
            else if (now - cluster.lastSeen < 35000) {
                // Within the active 30s confirmation window on the same camera without embedding
                bestCluster = cluster;
                break;
            }
        }
        if (bestCluster) {
            bestCluster.lastSeen = now;
            if (embedding && bestCluster.embedding) {
                // Exponential moving average of appearance embedding
                const blended = bestCluster.embedding.map((v, i) => 0.7 * v + 0.3 * embedding[i]);
                bestCluster.embedding = l2Normalize(blended);
            }
            else if (embedding) {
                bestCluster.embedding = embedding;
            }
            return bestCluster;
        }
        const created = {
            id: this.nextStrangerId++,
            embedding,
            firstSeen: now,
            lastSeen: now,
            lastAlerted: 0,
            framesSeen: 0,
        };
        this.strangerClusters.push(created);
        return created;
    }
    /** Evaluates detected face candidates against quality gates, match threshold, and look-alike margin. */
    async evaluateFaces(candidates, cameraJpegs, chain) {
        if (!candidates.length || !this.provider.isFaceRecognitionEnabled())
            return [];
        const ffmpegPath = await mediaManager$1.getFFmpegPath();
        const faceRefs = await this.provider.getKnownFaces();
        const minKnownWidth = this.provider.minFaceWidthPx(); // default 64 px
        const minUnknownWidth = this.provider.minUnknownFaceWidthPx(); // default 80 px
        const matchThreshold = this.provider.matchThreshold(); // default 0.5
        const lookAlikeMargin = this.provider.lookAlikeMargin(); // default 0.06
        // Enrich candidates with real pixel sharpness & patch embedding via ffmpeg
        for (const c of candidates) {
            const frame = cameraJpegs[c.frameIndex] ?? cameraJpegs[0];
            const patch = await analyzeFacePatch(ffmpegPath, frame, c.box);
            if (patch) {
                c.sharpnessScore = patch.sharpnessScore;
                // Must pass both AI sharpness check and Laplacian pixel sharpness (>= 14)
                c.sharp = c.sharp && patch.sharpnessScore >= 14;
                if (!c.embedding)
                    c.embedding = patch.embedding;
            }
        }
        // Group candidates by frame or pick best candidate per frame so we know how many frames saw each face
        const results = [];
        // If we have at least one candidate >= minKnownWidth and faceRefs exist, query AI similarity once for the sharpest/largest frame
        let aiScoresByPerson = new Map();
        let aiSharpOverride;
        const viableForAi = candidates
            .filter(c => c.widthPx >= minKnownWidth)
            .sort((a, b) => (Number(b.sharp) - Number(a.sharp)) || (b.widthPx - a.widthPx));
        if (viableForAi.length > 0 && faceRefs.length > 0) {
            try {
                const bestCand = viableForAi[0];
                const bestJpeg = cameraJpegs[bestCand.frameIndex] ?? cameraJpegs[0];
                const simReq = {
                    system: FACE_SIMILARITY_SYSTEM_PROMPT,
                    prompt: buildFaceSimilarityPrompt(faceRefs),
                    jpegs: [...faceRefs.map(r => r.jpeg), bestJpeg],
                    maxTokens: 150,
                    timeoutMs: this.provider.timeoutMs(),
                };
                const { text: simText } = await this.runWithProviderChain(chain, simReq);
                const parsedSim = parseFaceSimilarityReply(simText);
                aiScoresByPerson = parsedSim.scores;
                aiSharpOverride = parsedSim.sharp;
            }
            catch (e) {
                this.console.warn('Face similarity scoring failed:', errMsg(e));
            }
        }
        // Group enrolled references by person name
        const refsByPerson = new Map();
        for (const r of faceRefs) {
            const list = refsByPerson.get(r.name) ?? [];
            list.push(r);
            refsByPerson.set(r.name, list);
        }
        for (const cand of candidates) {
            const effectiveSharp = aiSharpOverride === false ? false : cand.sharp;
            // Compute similarity score for each enrolled person (combining AI score, upstream detector score, and patch cosine similarity)
            const personScores = [];
            for (const [personName, refs] of refsByPerson.entries()) {
                let aiScore = 0;
                for (const [k, v] of aiScoresByPerson.entries()) {
                    if (k.toLowerCase() === personName.toLowerCase()) {
                        aiScore = v;
                        break;
                    }
                }
                let patchSim = 0;
                for (const ref of refs) {
                    if (cand.embedding && ref.embedding)
                        patchSim = Math.max(patchSim, cosineSimilarity(cand.embedding, ref.embedding));
                }
                let upstreamSim = 0;
                if (cand.upstreamLabel && cand.upstreamLabel.toLowerCase() === personName.toLowerCase())
                    upstreamSim = cand.upstreamScore ?? 0.75;
                // Combine available signals into a calibrated 0.00..1.00 similarity score
                let combined = aiScore;
                if (upstreamSim > 0 && aiScore > 0)
                    combined = 0.65 * aiScore + 0.35 * upstreamSim;
                else if (upstreamSim > 0)
                    combined = upstreamSim;
                else if (aiScore > 0 && patchSim > 0)
                    combined = 0.85 * aiScore + 0.15 * patchSim;
                else if (patchSim > 0 && aiScoresByPerson.size === 0)
                    combined = patchSim * 0.75;
                personScores.push({ name: personName, score: Math.round(combined * 100) / 100 });
            }
            personScores.sort((a, b) => b.score - a.score);
            const best = personScores[0];
            const runnerUp = personScores[1];
            const bestSimilarity = best?.score ?? 0;
            const bestMatchName = best?.name;
            const runnerUpSimilarity = runnerUp?.score ?? 0;
            const runnerUpName = runnerUp?.name;
            const margin = Math.round((bestSimilarity - runnerUpSimilarity) * 100) / 100;
            // 1. Minimum face width gate for any face (default 64 px)
            if (cand.widthPx < minKnownWidth) {
                results.push({
                    status: 'rejected',
                    name: 'ignored',
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: effectiveSharp,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                    rejectReason: `${cand.widthPx}px < ${minKnownWidth}px min width`,
                });
                continue;
            }
            // 2. Check if it meets known match threshold (default 0.5) and look-alike margin (default 0.06)
            if (bestMatchName && bestSimilarity >= matchThreshold) {
                if (runnerUp && margin < lookAlikeMargin) {
                    results.push({
                        status: 'ambiguous',
                        name: 'ambiguous',
                        bestMatchName,
                        bestSimilarity,
                        runnerUpName,
                        runnerUpSimilarity,
                        widthPx: cand.widthPx,
                        sharp: effectiveSharp,
                        sharpnessScore: cand.sharpnessScore,
                        frameIndex: cand.frameIndex,
                        embedding: cand.embedding,
                        rejectReason: `margin ${margin.toFixed(2)} < ${lookAlikeMargin} (${bestMatchName} ${bestSimilarity.toFixed(2)} vs ${runnerUpName} ${runnerUpSimilarity.toFixed(2)})`,
                    });
                    continue;
                }
                if (!effectiveSharp) {
                    results.push({
                        status: 'rejected',
                        name: 'ignored',
                        bestMatchName,
                        bestSimilarity,
                        runnerUpName,
                        runnerUpSimilarity,
                        widthPx: cand.widthPx,
                        sharp: false,
                        sharpnessScore: cand.sharpnessScore,
                        frameIndex: cand.frameIndex,
                        embedding: cand.embedding,
                        rejectReason: `blurry (sharpness ${cand.sharpnessScore})`,
                    });
                    continue;
                }
                results.push({
                    status: 'known',
                    name: bestMatchName,
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: true,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                });
                continue;
            }
            // 3. Unmatched face quality gates: must be at least 80 px wide AND sharp before it counts as "unknown"
            if (cand.widthPx < minUnknownWidth) {
                results.push({
                    status: 'rejected',
                    name: 'ignored',
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: effectiveSharp,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                    rejectReason: `unmatched face ${cand.widthPx}px < ${minUnknownWidth}px unknown gate`,
                });
                continue;
            }
            if (!effectiveSharp) {
                results.push({
                    status: 'rejected',
                    name: 'ignored',
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: false,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                    rejectReason: `unmatched face blurry (sharpness ${cand.sharpnessScore})`,
                });
                continue;
            }
            results.push({
                status: 'unknown',
                name: 'unknown',
                bestMatchName,
                bestSimilarity,
                runnerUpName,
                runnerUpSimilarity,
                widthPx: cand.widthPx,
                sharp: true,
                sharpnessScore: cand.sharpnessScore,
                frameIndex: cand.frameIndex,
                embedding: cand.embedding,
            });
        }
        return results;
    }
    /** Schedules a ~3s confirmation re-check if there are pending multi-frame face confirmations within the 30s window. */
    scheduleConfirmationRecheckIfNeeded() {
        if (this.recheckTimer)
            return;
        const now = Date.now();
        const windowMs = this.provider.confirmationWindowMs(); // 30s
        let hasActivePending = false;
        for (const [k, p] of this.pendingConfirmations.entries()) {
            if (now - p.firstSeen > windowMs) {
                this.pendingConfirmations.delete(k);
                continue;
            }
            if (p.framesSeen < p.requiredFrames)
                hasActivePending = true;
        }
        if (!hasActivePending)
            return;
        this.recheckTimer = setTimeout(() => {
            this.recheckTimer = undefined;
            this.analyze(false, undefined, true).catch(e => this.console.error('confirmation re-check failed', e));
        }, 3000);
    }
    async analyze(force, triggerHint, isConfirmationRecheck = false) {
        const s = this.storageSettings.values;
        if (!s.enabled && !force)
            return;
        if (this.busy)
            return;
        const now = Date.now();
        if (!force && !isConfirmationRecheck && now - this.lastRun < Number(s.cooldownSeconds ?? 30) * 1000)
            return;
        const { chain, problems } = this.provider.getProviderChain();
        for (const p of problems)
            this.console.warn(`Skipping provider - ${p}`);
        if (!chain.length) {
            this.console.error('No usable AI provider. Fill in the provider settings on the AI Vision Alerts plugin page.');
            return;
        }
        this.busy = true;
        if (!isConfirmationRecheck)
            this.lastRun = now;
        try {
            const cameraName = systemManager$1.getDeviceById(this.id)?.name ?? 'Camera';
            // During a 3-second confirmation re-check, sample 1 quick frame to confirm the face fast and save tokens
            const count = isConfirmationRecheck
                ? 1
                : Math.min(8, Math.max(1, Math.round(Number(s.frameCount ?? 3))));
            const interval = Math.min(10, Math.max(1, Math.round(Number(s.frameIntervalSeconds ?? 2))));
            const activeHint = triggerHint ??
                (this.pendingHint && Date.now() - this.pendingHint.timestamp < 15000 ? this.pendingHint : undefined);
            this.pendingHint = undefined;
            const cameraJpegs = await this.captureFrames(count, interval, activeHint?.detectionId);
            // Stage 1: Analyze scene & locate faces
            const started = Date.now();
            const stage1Req = {
                system: DEFAULT_SYSTEM_PROMPT,
                prompt: buildPrompt(cameraName, s.rules || DEFAULT_RULES, cameraJpegs.length, interval, String(s.saveEvidence ?? '').startsWith('Let the AI')
                    ? s.evidenceRules || DEFAULT_EVIDENCE_RULES
                    : undefined, activeHint),
                jpegs: cameraJpegs,
                maxTokens: 350,
                timeoutMs: this.provider.timeoutMs(),
            };
            const { text, used } = await this.runWithProviderChain(chain, stage1Req);
            const stage1 = parseStage1(text, cameraJpegs, activeHint?.objects ?? []);
            // Combine upstream Scrypted detector face candidates with AI-located face boxes
            const allCandidates = [...(activeHint?.faces ?? []), ...stage1.aiFaces];
            const evaluatedFaces = await this.evaluateFaces(allCandidates, cameraJpegs, chain);
            // Process multi-frame confirmations (2 frames in 30s for known, 3 frames in 30s for stranger)
            const windowMs = this.provider.confirmationWindowMs(); // 30s
            const knownReqFrames = this.provider.knownConfirmFrames(); // default 2
            const strangerReqFrames = this.provider.strangerConfirmFrames(); // default 3
            const knownCooldownMs = this.provider.knownCooldownMs(); // default 2 min
            const strangerCooldownMs = this.provider.strangerCooldownMs(); // default 15 min
            // Prune expired pending confirmations (> 30s old)
            for (const [k, p] of this.pendingConfirmations.entries()) {
                if (now - p.firstSeen > windowMs)
                    this.pendingConfirmations.delete(k);
            }
            // Deduplicate evaluations per frame so 1 frame = at most +1 confirmation count per person/stranger
            const seenInFramesByKey = new Map();
            for (const ef of evaluatedFaces) {
                if (ef.status === 'known') {
                    const key = `known:${ef.name.toLowerCase()}`;
                    const existing = seenInFramesByKey.get(key);
                    if (existing) {
                        existing.frames.add(ef.frameIndex);
                        if (ef.bestSimilarity > existing.evalFace.bestSimilarity)
                            existing.evalFace = ef;
                    }
                    else {
                        seenInFramesByKey.set(key, { evalFace: ef, frames: new Set([ef.frameIndex]) });
                    }
                }
                else if (ef.status === 'unknown') {
                    // Group the same stranger across frames into one cluster
                    const cluster = this.matchOrCreateStrangerCluster(ef.embedding);
                    const key = `stranger:${cluster.id}`;
                    const existing = seenInFramesByKey.get(key);
                    if (existing) {
                        existing.frames.add(ef.frameIndex);
                        if (ef.widthPx > existing.evalFace.widthPx)
                            existing.evalFace = ef;
                    }
                    else {
                        seenInFramesByKey.set(key, { evalFace: ef, frames: new Set([ef.frameIndex]), cluster });
                    }
                }
                else {
                    // Record rejected / ambiguous faces in the Recent recognitions panel for tuning!
                    this.provider.recordRecognition(cameraName, ef, 0, 0, ef.rejectReason ?? ef.status);
                }
            }
            const confirmedKnownNames = [];
            const newlyConfirmedKnown = [];
            const newlyConfirmedStrangers = [];
            for (const [key, item] of seenInFramesByKey.entries()) {
                const { evalFace, frames, cluster } = item;
                const isStranger = evalFace.status === 'unknown';
                const reqFrames = isStranger ? strangerReqFrames : knownReqFrames;
                const frameDelta = frames.size;
                const bestJpeg = cameraJpegs[evalFace.frameIndex] ?? cameraJpegs[stage1.bestFrameIndex] ?? cameraJpegs[0];
                let pending = this.pendingConfirmations.get(key);
                if (!pending || now - pending.firstSeen > windowMs) {
                    pending = {
                        key,
                        isStranger,
                        displayName: isStranger ? `unknown (stranger #${cluster.id})` : evalFace.name,
                        framesSeen: frameDelta,
                        requiredFrames: reqFrames,
                        firstSeen: now,
                        lastSeen: now,
                        bestSimilarity: evalFace.bestSimilarity,
                        closestName: evalFace.bestMatchName,
                        widthPx: evalFace.widthPx,
                        bestJpeg,
                        summary: stage1.summary,
                        severity: stage1.severity,
                        objects: stage1.objects,
                        save: stage1.save,
                        embedding: evalFace.embedding,
                    };
                    this.pendingConfirmations.set(key, pending);
                }
                else {
                    pending.framesSeen += frameDelta;
                    pending.lastSeen = now;
                    if (evalFace.bestSimilarity > pending.bestSimilarity) {
                        pending.bestSimilarity = evalFace.bestSimilarity;
                        pending.closestName = evalFace.bestMatchName;
                    }
                    if (evalFace.widthPx > pending.widthPx) {
                        pending.widthPx = evalFace.widthPx;
                        pending.bestJpeg = bestJpeg;
                    }
                }
                if (cluster)
                    cluster.framesSeen = pending.framesSeen;
                const isConfirmed = pending.framesSeen >= pending.requiredFrames;
                let note = `confirming ${Math.min(pending.framesSeen, pending.requiredFrames)}/${pending.requiredFrames}`;
                if (isConfirmed) {
                    this.pendingConfirmations.delete(key);
                    if (isStranger && cluster) {
                        if (!force && cluster.lastAlerted > 0 && now - cluster.lastAlerted < strangerCooldownMs) {
                            const minsLeft = Math.ceil((strangerCooldownMs - (now - cluster.lastAlerted)) / 60000);
                            note = `confirmed (${minsLeft}m stranger cooldown active)`;
                        }
                        else {
                            cluster.lastAlerted = now;
                            newlyConfirmedStrangers.push({ pending, cluster });
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (stranger #${cluster.id} alert)`;
                        }
                    }
                    else {
                        confirmedKnownNames.push(evalFace.name);
                        const lastAlert = this.knownLastAlerted.get(evalFace.name.toLowerCase()) ?? 0;
                        if (this.provider.isNameSuppressed(evalFace.name)) {
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (muted by Never notify list)`;
                        }
                        else if (!force && lastAlert > 0 && now - lastAlert < knownCooldownMs) {
                            const secsLeft = Math.ceil((knownCooldownMs - (now - lastAlert)) / 1000);
                            note = `confirmed (${secsLeft}s cooldown active)`;
                        }
                        else {
                            this.knownLastAlerted.set(evalFace.name.toLowerCase(), now);
                            newlyConfirmedKnown.push(pending);
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (${evalFace.name} arrived)`;
                        }
                    }
                }
                this.provider.recordRecognition(cameraName, evalFace, pending.framesSeen, pending.requiredFrames, note);
            }
            // If any faces are still waiting for confirmation within the 30s window, schedule a 3s re-check
            this.scheduleConfirmationRecheckIfNeeded();
            const verdict = {
                alert: stage1.alert,
                severity: stage1.severity,
                summary: stage1.summary,
                save: stage1.save,
                objects: stage1.objects,
                faces: confirmedKnownNames,
                evaluatedFaces,
                bestFrameIndex: stage1.bestFrameIndex,
            };
            const bestFrame = cameraJpegs[verdict.bestFrameIndex] ?? cameraJpegs[Math.floor(cameraJpegs.length / 2)];
            this.console.log(`${used} analyzed ${cameraJpegs.length} frame(s)${isConfirmationRecheck ? ' [re-check]' : ''} in ${Date.now() - started}ms:`, JSON.stringify({
                alert: verdict.alert,
                severity: verdict.severity,
                summary: verdict.summary,
                objects: verdict.objects,
                confirmedFaces: verdict.faces,
                facesEvaluated: evaluatedFaces.map(f => ({
                    status: f.status,
                    name: f.name,
                    sim: f.bestSimilarity,
                    closest: f.bestMatchName,
                    px: f.widthPx,
                    sharp: f.sharp,
                })),
            }));
            await this.emitDetections(verdict, bestFrame);
            // 1. Send "<Name> arrived" notifications for newly confirmed known people (not on the Never Notify list)
            for (const known of newlyConfirmedKnown) {
                await this.sendArrivalOrFaceAlert(`${cameraName}: ${known.displayName} arrived`, `${known.displayName} recognized at ${cameraName}. ${known.summary}`, 'low', known.bestJpeg, ['person', 'face'], [known.displayName], 'none', `ai-arrival-${this.id}-${known.displayName.toLowerCase()}`);
            }
            // 2. Send confirmed Stranger alerts (seen in 3 frames within 30s, >= 80px wide & sharp, 15m cooldown)
            const faceMode = String(s.faceAlertMode ?? FACE_ALERT_MODES[0]);
            if (faceMode !== 'Only alert when a known face is recognized') {
                for (const { pending, cluster } of newlyConfirmedStrangers) {
                    const closestInfo = pending.closestName
                        ? ` (similarity ${pending.bestSimilarity.toFixed(2)}, closest ${pending.closestName})`
                        : '';
                    await this.sendArrivalOrFaceAlert(`${cameraName}: Unrecognized person`, `${pending.summary} [Confirmed in ${pending.framesSeen} frames, ${pending.widthPx}px${closestInfo}]`, pending.severity, pending.bestJpeg, pending.objects, ['unknown'], pending.save, `ai-stranger-${this.id}-${cluster.id}`);
                }
            }
            // If this run was solely a 3s face confirmation re-check or we already sent a face/stranger alert, skip duplicate scene alert
            if (isConfirmationRecheck || newlyConfirmedKnown.length > 0 || newlyConfirmedStrangers.length > 0)
                return;
            // If a face is currently mid-confirmation (e.g. 1/2 known or 1/3 stranger), wait for the 3s re-check before firing a person alert!
            if (!force && this.pendingConfirmations.size > 0) {
                this.console.log(`Holding alert while confirming face across frames (${Array.from(this.pendingConfirmations.values())
                    .map(p => `${p.displayName} ${p.framesSeen}/${p.requiredFrames}`)
                    .join(', ')})...`);
                return;
            }
            // If all detected people in this scene are on the "Never notify for these names" list (or suppressed household members), skip scene alert
            if (!force && confirmedKnownNames.length > 0) {
                const allMuted = confirmedKnownNames.every(n => this.provider.isNameSuppressed(n));
                if (allMuted || faceMode === 'Suppress security alerts when only known faces are seen') {
                    this.console.log(`Alert suppressed for known household member(s): ${confirmedKnownNames.join(', ')}`);
                    return;
                }
            }
            if (!force && faceMode === 'Only alert when a known face is recognized' && confirmedKnownNames.length === 0)
                return;
            // If a person was seen and already alerted inside theirknown/stranger cooldown window, do not re-announce
            if (!force && evaluatedFaces.some(f => f.status === 'known' || f.status === 'unknown'))
                return;
            const order = ['low', 'medium', 'high'];
            const meetsSeverity = order.indexOf(verdict.severity) >= order.indexOf(s.minSeverity || 'low');
            if (!force && !(verdict.alert && meetsSeverity))
                return;
            // Object filter check
            const requiredObjects = asList(s.objectFilter).map(x => x.toLowerCase());
            if (!force && requiredObjects.length > 0) {
                const hasRequired = requiredObjects.some(reqObj => verdict.objects.includes(reqObj));
                if (!hasRequired) {
                    this.console.log(`Alert skipped: detected objects [${verdict.objects.join(', ')}] did not match filter [${requiredObjects.join(', ')}].`);
                    return;
                }
            }
            const choice = String(s.saveEvidence ?? 'Off');
            let plan = 'none';
            if (choice === 'Snapshot')
                plan = 'snapshot';
            else if (choice === 'Clip')
                plan = 'clip';
            else if (choice === 'Snapshot + clip')
                plan = 'both';
            else if (choice.startsWith('Let the AI'))
                plan = verdict.save;
            const metaTags = [];
            if (verdict.faces.length)
                metaTags.push(`Recognized: ${verdict.faces.join(', ')}`);
            const notableObjects = verdict.objects.filter(o => OBJECT_FILTER_CHOICES.includes(o) && o !== 'face');
            if (notableObjects.length)
                metaTags.push(`Objects: ${notableObjects.join(', ')}`);
            const enrichedMessage = metaTags.length
                ? `${verdict.summary} [${metaTags.join(' | ')}]`
                : verdict.summary;
            await this.sendArrivalOrFaceAlert(`${cameraName}: ${verdict.severity.toUpperCase()}`, enrichedMessage, verdict.severity, bestFrame, verdict.objects, verdict.faces, plan, `ai-alert-${this.id}`);
        }
        catch (e) {
            this.console.error('AI analysis failed', e);
        }
        finally {
            this.busy = false;
        }
    }
    async sendArrivalOrFaceAlert(title, message, severity, frameJpeg, objects, faces, plan, tag) {
        const s = this.storageSettings.values;
        const cameraName = systemManager$1.getDeviceById(this.id)?.name ?? 'Camera';
        const needsFrame = plan === 'snapshot' || plan === 'both';
        const media = s.attachSnapshot || needsFrame
            ? await mediaManager$1.createMediaObject(frameJpeg, 'image/jpeg')
            : undefined;
        const alert = await this.provider.sendAlert({
            title,
            message,
            severity,
            channels: asList(s.channels),
            jpeg: s.attachSnapshot ? frameJpeg : undefined,
            haCameraEntity: String(s.haCameraEntity ?? '').trim() || undefined,
            tag,
            objects,
            faces,
        });
        if (alert.sent.length)
            this.console.log(`Alert sent (${title}) via: ${alert.sent.join(', ')}`);
        for (const e of alert.errors)
            this.console.error(`Notification failed - ${e}`);
        if (!alert.configured)
            this.console.warn('No phone/app notification channel is configured on the AI Vision Alerts plugin page.');
        const notifierIds = Array.isArray(s.notifiers) ? s.notifiers : s.notifiers ? [s.notifiers] : [];
        for (const id of notifierIds) {
            const notifier = systemManager$1.getDeviceById(id);
            if (!notifier)
                continue;
            try {
                await notifier.sendNotification(title, {
                    body: message,
                    tag: 'ai-vision-alerts',
                    data: {
                        source: 'ai-vision-alerts',
                        cameraId: this.id,
                        cameraName,
                        severity,
                        summary: message,
                        objects,
                        faces,
                        save: plan,
                    },
                }, media);
            }
            catch (e) {
                this.console.error(`Notification to ${id} failed`, e);
            }
        }
    }
}
/* ------------------------------------------------------------------ */
/* Plugin (provider settings + face recognition + recent recognitions)  */
/* ------------------------------------------------------------------ */
class AIAlertsPlugin extends srcExports.ScryptedDeviceBase {
    callsToday = 0;
    callsDay = new Date().toDateString();
    faceCacheKey = '';
    faceCache = [];
    recentLines = [];
    storageSettings = new storageSettingsExports.StorageSettings(this, {
        /* ---------------- AI provider selection ---------------- */
        aiProvider: {
            group: 'AI provider',
            title: 'AI provider',
            description: 'The service that analyzes frames. Fill in that provider\'s section below.',
            type: 'string',
            choices: PROVIDER_CHOICES,
            defaultValue: PROVIDER_CHOICES[0],
        },
        fallbackProvider: {
            group: 'AI provider',
            title: 'Fallback provider (optional)',
            description: 'Used if the main provider fails or times out, e.g. local Ollama first, then a cloud model.',
            type: 'string',
            choices: ['None', ...PROVIDER_CHOICES],
            defaultValue: 'None',
        },
        timeoutSeconds: {
            group: 'AI provider',
            title: 'Request timeout (seconds)',
            description: 'Local models on CPU can be slow, so raise this for Ollama.',
            type: 'number',
            defaultValue: 60,
        },
        dailyLimit: {
            group: 'AI provider',
            title: 'Daily AI call limit (cloud providers only, 0 = unlimited)',
            description: 'Optional safety cap for paid cloud providers. Local Ollama and LAN endpoints are ALWAYS unlimited and ignore this setting. Set to 0 for unlimited.',
            type: 'number',
            defaultValue: 0,
        },
        resetDailyQuota: {
            group: 'AI provider',
            title: 'Reset daily call counter',
            description: 'Resets today\'s cloud API call counter to 0 without restarting Scrypted.',
            type: 'button',
            onPut: async () => {
                this.callsToday = 0;
                this.callsDay = new Date().toDateString();
                this.console.log('Daily AI call counter reset to 0.');
            },
        },
        testProvider: {
            group: 'AI provider',
            title: 'Test provider connection',
            description: 'Sends a text-only request to the main (and fallback) provider and logs the result in this plugin\'s ' +
                'console. Checks URL, key and model, but not image support.',
            type: 'button',
            onPut: async () => {
                const { chain, problems } = this.getProviderChain();
                for (const p of problems)
                    this.console.warn(`Not testing - ${p}`);
                for (const cfg of chain) {
                    try {
                        const text = await callModel(cfg, {
                            system: 'You reply with JSON only.',
                            prompt: 'Reply with exactly: {"alert": false, "severity": "low", "summary": "ok", "objects": [], "detectedFaces": [], "bestFrame": 1}',
                            jpegs: [],
                            maxTokens: 60,
                            timeoutMs: this.timeoutMs(),
                        });
                        this.console.log(`${cfg.provider} test OK:`, text);
                    }
                    catch (e) {
                        this.console.error(`${cfg.provider} test failed:`, errMsg(e));
                    }
                }
            },
        },
        /* ---------------- Face & Object Recognition ---------------- */
        enableFaceRecognition: {
            group: 'Face & Object Recognition',
            title: 'Enable AI face recognition',
            description: 'Enables quality gates, similarity scoring, multi-frame confirmation, and "<Name> arrived" / stranger alerts.',
            type: 'boolean',
            defaultValue: true,
        },
        knownFacesDir: {
            group: 'Face & Object Recognition',
            title: 'Known faces directory (optional)',
            description: 'Folder path containing reference photos (.jpg, .png, .webp). On Home Assistant OS add-on, use /media/faces (mapped to HA\'s Media folder). ' +
                'Name files after the person (e.g. Alex.jpg, Alex_2.jpg) or place them in subfolders (e.g. /media/faces/Alex/1.jpg).',
            placeholder: '/media/faces',
        },
        knownFacesEntries: {
            group: 'Face & Object Recognition',
            title: 'Known faces list (optional)',
            description: 'One person per line as "Name = <file path, http(s) URL, or data:image/... URI>". ' +
                'Example for Home Assistant add-on: Alex = /media/faces/Alex.jpg',
            type: 'textarea',
            placeholder: 'Alex = /media/faces/Alex.jpg\nBob = /media/faces/Bob.jpg',
        },
        neverNotifyNames: {
            group: 'Face & Object Recognition',
            title: 'Never notify for these names',
            description: 'Comma-separated names to silence (e.g. "Sam, Taylor" or add "family" to silence all enrolled household members). ' +
                'Enrolled people NOT listed here trigger "<Name> arrived" alerts next to your normal alerts.',
            placeholder: 'family',
            defaultValue: '',
        },
        matchThreshold: {
            group: 'Face & Object Recognition',
            title: 'Match threshold (0.1 - 0.95)',
            description: 'Minimum similarity score (default 0.5) required to recognize a known person. Use the "Recent recognitions" panel below to tune.',
            type: 'number',
            defaultValue: 0.5,
        },
        lookAlikeMargin: {
            group: 'Face & Object Recognition',
            title: 'Look-alike margin (0.0 - 0.3)',
            description: 'How much higher the best match similarity must be over the second-closest person (default 0.06) to prevent look-alike mixups.',
            type: 'number',
            defaultValue: 0.06,
        },
        minFaceWidthPx: {
            group: 'Face & Object Recognition',
            title: 'Minimum face width for known matches (px)',
            description: 'Faces narrower than this (default 64 px) are ignored completely.',
            type: 'number',
            defaultValue: 64,
        },
        minUnknownFaceWidthPx: {
            group: 'Face & Object Recognition',
            title: 'Minimum face width for unknown strangers (px)',
            description: 'Quality gate: a face that matches nobody must be at least this wide (default 80 px) and sharp before it counts as "unknown".',
            type: 'number',
            defaultValue: 80,
        },
        knownConfirmFrames: {
            group: 'Face & Object Recognition',
            title: 'Confirmation frames for known person (within 30s)',
            description: 'A known person must be seen in this many frames within 30 seconds before "<Name> arrived" fires (default 2).',
            type: 'number',
            defaultValue: 2,
        },
        strangerConfirmFrames: {
            group: 'Face & Object Recognition',
            title: 'Confirmation frames for stranger (within 30s)',
            description: 'A stranger must be seen sharp and >= 80 px in this many frames within 30 seconds before an alert fires (default 3). Re-checks every ~3s while waiting.',
            type: 'number',
            defaultValue: 3,
        },
        knownCooldownMinutes: {
            group: 'Face & Object Recognition',
            title: 'Known person cooldown (minutes)',
            description: 'A confirmed known person will not re-alert for this many minutes (default 2).',
            type: 'number',
            defaultValue: 2,
        },
        strangerCooldownMinutes: {
            group: 'Face & Object Recognition',
            title: 'Stranger cooldown (minutes)',
            description: 'The same stranger is grouped across frames and will not re-alert for this many minutes (default 15).',
            type: 'number',
            defaultValue: 15,
        },
        maxFaceReferences: {
            group: 'Face & Object Recognition',
            title: 'Max reference face photos per AI call',
            description: 'Caps how many reference photos are sent when scoring a face.',
            type: 'number',
            defaultValue: 6,
        },
        testKnownFaces: {
            group: 'Face & Object Recognition',
            title: 'Load & verify enrolled faces',
            description: 'Reloads reference face photos from the directory and list above and logs the results in the console.',
            type: 'button',
            onPut: async () => {
                this.faceCacheKey = '';
                const refs = await this.getKnownFaces(true);
                if (!refs.length) {
                    this.console.warn('No reference face photos loaded. Set "Known faces directory" (e.g. /media/faces) or "Known faces list" above.');
                    return;
                }
                const byPerson = new Map();
                for (const r of refs)
                    byPerson.set(r.name, (byPerson.get(r.name) ?? 0) + 1);
                const summary = Array.from(byPerson.entries())
                    .map(([name, cnt]) => `${name} (${cnt} photo${cnt > 1 ? 's' : ''})`)
                    .join(', ');
                this.console.log(`Loaded ${refs.length} reference face photo(s): ${summary}`);
            },
        },
        /* ---------------- Recent recognitions panel ---------------- */
        recentRecognitions: {
            group: 'Recent recognitions',
            title: 'Recent face recognitions & similarity scores',
            description: 'Shows each recent face with its real similarity score, closest match, runner-up, pixel width, sharpness, and confirmation state ' +
                '(e.g. "unknown (similarity 0.42, closest Alex, 88px, sharp)"). Use this data to tune your thresholds.',
            type: 'textarea',
            readonly: true,
            defaultValue: 'No face recognitions recorded yet.',
        },
        clearRecentRecognitions: {
            group: 'Recent recognitions',
            title: 'Clear recent recognitions',
            type: 'button',
            onPut: async () => {
                this.recentLines = [];
                await this.storageSettings.putSetting('recentRecognitions', 'No face recognitions recorded yet.');
                this.console.log('Cleared recent recognitions history.');
            },
        },
        /* ---------------- Per-provider settings ---------------- */
        anthropicKey: { group: 'Anthropic (Claude)', title: 'API key', type: 'password' },
        anthropicModel: {
            group: 'Anthropic (Claude)',
            title: 'Model (optional)',
            description: 'Blank uses claude-haiku-4-5.',
            placeholder: 'claude-haiku-4-5',
        },
        openaiKey: { group: 'OpenAI', title: 'API key', type: 'password' },
        openaiModel: {
            group: 'OpenAI',
            title: 'Model (optional)',
            description: 'Must support image input. Blank uses gpt-4o-mini.',
            placeholder: 'gpt-4o-mini',
        },
        openaiBaseUrl: {
            group: 'OpenAI',
            title: 'Base URL (optional)',
            description: 'Blank uses https://api.openai.com/v1. Only change this to route through a proxy.',
        },
        geminiKey: { group: 'Google Gemini', title: 'API key', type: 'password' },
        geminiModel: {
            group: 'Google Gemini',
            title: 'Model (optional)',
            description: 'Blank uses gemini-2.5-flash.',
            placeholder: 'gemini-2.5-flash',
        },
        ollamaUrl: {
            group: 'Ollama (local)',
            title: 'Ollama URL',
            description: 'e.g. http://192.168.100.20:11434. Use the LAN IP of the machine running Ollama, not localhost, ' +
                'and set OLLAMA_HOST=0.0.0.0 on that machine.',
            placeholder: 'http://192.168.100.20:11434',
        },
        ollamaModel: {
            group: 'Ollama (local)',
            title: 'Model (optional)',
            description: 'Must support images, e.g. llava, llama3.2-vision, qwen2.5vl, gemma3. Blank uses llava.',
            placeholder: 'llava',
        },
        ollamaKey: {
            group: 'Ollama (local)',
            title: 'API key (optional)',
            description: 'Only if your Ollama sits behind a proxy that needs a bearer token.',
            type: 'password',
        },
        customUrl: {
            group: 'Custom endpoint (OpenAI-compatible)',
            title: 'Base URL',
            description: 'Any server with an OpenAI-style /chat/completions endpoint, including the /v1 part. ' +
                'Examples: LM Studio http://host:1234/v1, vLLM, LiteLLM, OpenRouter https://openrouter.ai/api/v1.',
        },
        customModel: {
            group: 'Custom endpoint (OpenAI-compatible)',
            title: 'Model',
            description: 'Required. The model must accept images.',
        },
        customKey: {
            group: 'Custom endpoint (OpenAI-compatible)',
            title: 'API key (optional)',
            type: 'password',
        },
        /* ---------------- Notification channels ---------------- */
        haUrl: {
            group: 'Notify: Home Assistant',
            title: 'Home Assistant URL',
            description: 'e.g. http://192.168.100.2:8123 (plain http is fine on your local network).',
            placeholder: 'http://192.168.100.2:8123',
        },
        haToken: {
            group: 'Notify: Home Assistant',
            title: 'Long-lived access token',
            description: 'Home Assistant > your profile > Security > Long-lived access tokens > Create token.',
            type: 'password',
        },
        haNotifyServices: {
            group: 'Notify: Home Assistant',
            title: 'Notify service(s)',
            description: 'Comma-separated, without the "notify." prefix, e.g. mobile_app_pixel_9, mobile_app_iphone. ' +
                'Find yours in Home Assistant > Developer tools > Actions by searching "notify.mobile_app".',
        },
        ntfyUrl: {
            group: 'Notify: ntfy',
            title: 'Server URL',
            description: 'Blank uses https://ntfy.sh. Set this if you self-host ntfy (works fully locally).',
            placeholder: 'https://ntfy.sh',
        },
        ntfyTopic: {
            group: 'Notify: ntfy',
            title: 'Topic',
            description: 'Subscribe to the same topic in the ntfy phone app. Use a long, hard-to-guess name on ntfy.sh.',
        },
        ntfyToken: {
            group: 'Notify: ntfy',
            title: 'Access token (optional)',
            description: 'For protected topics on your own server.',
            type: 'password',
        },
        pushoverToken: {
            group: 'Notify: Pushover',
            title: 'Application token',
            description: 'Create an application at pushover.net/apps/build.',
            type: 'password',
        },
        pushoverUser: {
            group: 'Notify: Pushover',
            title: 'User key',
            description: 'Shown on your Pushover dashboard.',
            type: 'password',
        },
        pushoverDevice: {
            group: 'Notify: Pushover',
            title: 'Device name (optional)',
            description: 'Blank sends to all your devices.',
        },
        telegramToken: {
            group: 'Notify: Telegram',
            title: 'Bot token',
            description: 'Create a bot with @BotFather in Telegram.',
            type: 'password',
        },
        telegramChatId: {
            group: 'Notify: Telegram',
            title: 'Chat ID',
            description: 'Message your bot once, then find your chat ID (for example via @userinfobot).',
        },
        testNotifications: {
            group: 'Notify: test',
            title: 'Send test notification to all configured channels',
            description: 'Text only. Check this plugin\'s console for the result of each channel.',
            type: 'button',
            onPut: async () => {
                const result = await this.sendAlert({
                    title: 'AI Vision Alerts',
                    message: 'Test notification from Scrypted.',
                    severity: 'low',
                    channels: [],
                });
                if (!result.configured)
                    this.console.warn('No notification channel is configured yet.');
                if (result.sent.length)
                    this.console.log(`Test sent via: ${result.sent.join(', ')}`);
                for (const e of result.errors)
                    this.console.error(`Test failed - ${e}`);
            },
        },
    });
    /* ---------------- Settings plumbing ---------------- */
    getSettings() {
        return this.storageSettings.getSettings();
    }
    async putSetting(key, value) {
        await this.storageSettings.putSetting(key, value);
        if (['enableFaceRecognition', 'knownFacesDir', 'knownFacesEntries', 'maxFaceReferences'].includes(key))
            this.faceCacheKey = '';
    }
    /* ---------------- Face recognition parameters & Recent Recognitions panel ---------------- */
    isFaceRecognitionEnabled() {
        return Boolean(this.storageSettings.values.enableFaceRecognition ?? true);
    }
    matchThreshold() {
        return Math.min(0.95, Math.max(0.1, Number(this.storageSettings.values.matchThreshold ?? 0.5)));
    }
    lookAlikeMargin() {
        return Math.min(0.3, Math.max(0, Number(this.storageSettings.values.lookAlikeMargin ?? 0.06)));
    }
    minFaceWidthPx() {
        return Math.max(24, Math.round(Number(this.storageSettings.values.minFaceWidthPx ?? 64)));
    }
    minUnknownFaceWidthPx() {
        return Math.max(this.minFaceWidthPx(), Math.round(Number(this.storageSettings.values.minUnknownFaceWidthPx ?? 80)));
    }
    knownConfirmFrames() {
        return Math.min(6, Math.max(1, Math.round(Number(this.storageSettings.values.knownConfirmFrames ?? 2))));
    }
    strangerConfirmFrames() {
        return Math.min(8, Math.max(1, Math.round(Number(this.storageSettings.values.strangerConfirmFrames ?? 3))));
    }
    confirmationWindowMs() {
        return 30 * 1000; // 30 seconds
    }
    knownCooldownMs() {
        return Math.max(0.5, Number(this.storageSettings.values.knownCooldownMinutes ?? 2)) * 60 * 1000;
    }
    strangerCooldownMs() {
        return Math.max(1, Number(this.storageSettings.values.strangerCooldownMinutes ?? 15)) * 60 * 1000;
    }
    /** Returns true if `personName` is listed in "Never notify for these names" (or if "family"/"all" is listed). */
    isNameSuppressed(personName) {
        const raw = String(this.storageSettings.values.neverNotifyNames ?? '').trim();
        if (!raw)
            return false;
        const entries = raw
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);
        if (entries.includes('family') || entries.includes('all') || entries.includes('*'))
            return true;
        return entries.includes(personName.trim().toLowerCase());
    }
    /** Appends a formatted line to the "Recent recognitions" panel on the plugin settings page. */
    recordRecognition(cameraName, ef, framesSeen, requiredFrames, statusNote) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const simPart = ef.bestMatchName
            ? `similarity ${ef.bestSimilarity.toFixed(2)}, closest ${ef.bestMatchName}${ef.runnerUpName ? `, 2nd ${ef.runnerUpName} ${ef.runnerUpSimilarity.toFixed(2)}` : ''}`
            : `similarity ${ef.bestSimilarity.toFixed(2)}`;
        const qualityPart = `${ef.widthPx}px, ${ef.sharp ? 'sharp' : 'blurry'}`;
        const label = ef.status === 'known' ? ef.name : ef.status === 'unknown' ? 'unknown' : ef.status;
        const line = `${ts} [${cameraName}] ${label} (${simPart}, ${qualityPart}) — ${statusNote}`;
        if (!this.recentLines.length) {
            const existing = String(this.storageSettings.values.recentRecognitions ?? '');
            if (existing && !existing.startsWith('No face recognitions'))
                this.recentLines = existing.split('\n').filter(Boolean);
        }
        this.recentLines.unshift(line);
        if (this.recentLines.length > 25)
            this.recentLines.length = 25;
        const text = this.recentLines.join('\n');
        this.storageSettings.putSetting('recentRecognitions', text).catch(() => { });
        this.console.log(`Face recognition: ${line}`);
    }
    /* ---------------- Known faces loading & caching ---------------- */
    async getKnownFaceNames() {
        const refs = await this.getKnownFaces(false);
        return Array.from(new Set(refs.map(r => r.name)));
    }
    async getKnownFaces(forceReload = false) {
        const v = this.storageSettings.values;
        if (!v.enableFaceRecognition)
            return [];
        const dir = String(v.knownFacesDir ?? '').trim();
        const entriesText = String(v.knownFacesEntries ?? '').trim();
        const maxRefs = Math.min(20, Math.max(1, Math.round(Number(v.maxFaceReferences ?? 6))));
        const cacheKey = `${dir}|${entriesText}|${maxRefs}`;
        if (!forceReload && cacheKey === this.faceCacheKey)
            return this.faceCache;
        const loaded = [];
        const validExts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
        let ffmpegPath;
        try {
            ffmpegPath = await mediaManager$1.getFFmpegPath();
        }
        catch {
            // optional
        }
        const buildRef = async (name, raw, ext, source) => {
            const jpeg = await normalizeReferenceJpeg(raw, ext);
            let embedding;
            if (ffmpegPath) {
                const patch = await analyzeFacePatch(ffmpegPath, jpeg, [0.15, 0.1, 0.7, 0.8]);
                embedding = patch?.embedding;
            }
            return { name, jpeg, source, embedding };
        };
        // 1. Scan directory if configured
        if (dir) {
            try {
                const resolvedDir = path__namespace.resolve(dir);
                const dirEntries = await fs__namespace.readdir(resolvedDir, { withFileTypes: true });
                for (const entry of dirEntries) {
                    if (loaded.length >= maxRefs)
                        break;
                    const fullPath = path__namespace.join(resolvedDir, entry.name);
                    if (entry.isFile()) {
                        const ext = path__namespace.extname(entry.name).toLowerCase();
                        if (!validExts.has(ext))
                            continue;
                        const person = personNameFromFilename(entry.name);
                        if (!person)
                            continue;
                        try {
                            const raw = await fs__namespace.readFile(fullPath);
                            loaded.push(await buildRef(person, raw, ext, fullPath));
                        }
                        catch (e) {
                            this.console.warn(`Could not load face image ${fullPath}: ${errMsg(e)}`);
                        }
                    }
                    else if (entry.isDirectory()) {
                        const person = entry.name.trim();
                        if (!person || person.startsWith('.'))
                            continue;
                        try {
                            const subFiles = await fs__namespace.readdir(fullPath);
                            for (const sf of subFiles.sort()) {
                                if (loaded.length >= maxRefs)
                                    break;
                                const ext = path__namespace.extname(sf).toLowerCase();
                                if (!validExts.has(ext))
                                    continue;
                                const subPath = path__namespace.join(fullPath, sf);
                                try {
                                    const raw = await fs__namespace.readFile(subPath);
                                    loaded.push(await buildRef(person, raw, ext, subPath));
                                }
                                catch (e) {
                                    this.console.warn(`Could not load face image ${subPath}: ${errMsg(e)}`);
                                }
                            }
                        }
                        catch (e) {
                            this.console.warn(`Could not read face subfolder ${fullPath}: ${errMsg(e)}`);
                        }
                    }
                }
            }
            catch (e) {
                this.console.warn(`Could not read known faces directory "${dir}": ${errMsg(e)}`);
            }
        }
        // 2. Parse inline entries ("Name = URL / file path / data URI")
        if (entriesText && loaded.length < maxRefs) {
            const lines = entriesText.split(/\r?\n/);
            for (const line of lines) {
                if (loaded.length >= maxRefs)
                    break;
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#'))
                    continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx <= 0) {
                    this.console.warn(`Skipping invalid known face entry (expected "Name = path or URL"): ${trimmed}`);
                    continue;
                }
                const name = trimmed.slice(0, eqIdx).trim();
                const target = trimmed.slice(eqIdx + 1).trim();
                if (!name || !target)
                    continue;
                try {
                    let raw;
                    let ext = '.jpg';
                    if (target.startsWith('data:image/')) {
                        const comma = target.indexOf(',');
                        if (comma < 0)
                            throw new Error('Invalid data URI');
                        raw = Buffer.from(target.slice(comma + 1), 'base64');
                    }
                    else if (/^https?:\/\//i.test(target)) {
                        const res = await fetch(target, { signal: AbortSignal.timeout(15000) });
                        if (!res.ok)
                            throw new Error(`HTTP ${res.status}`);
                        raw = Buffer.from(await res.arrayBuffer());
                        const urlPath = new URL(target).pathname;
                        ext = path__namespace.extname(urlPath).toLowerCase() || '.jpg';
                    }
                    else {
                        const filePath = path__namespace.resolve(target);
                        ext = path__namespace.extname(filePath).toLowerCase() || '.jpg';
                        raw = await fs__namespace.readFile(filePath);
                    }
                    loaded.push(await buildRef(name, raw, ext, target));
                }
                catch (e) {
                    this.console.warn(`Could not load known face for "${name}" from "${target}": ${errMsg(e)}`);
                }
            }
        }
        this.faceCacheKey = cacheKey;
        this.faceCache = loaded;
        return loaded;
    }
    /* ---------------- AI providers ---------------- */
    getConfigFor(id) {
        const v = this.storageSettings.values;
        switch (id) {
            case 'anthropic':
                return { provider: id, apiKey: v.anthropicKey, model: v.anthropicModel };
            case 'openai':
                return { provider: id, apiKey: v.openaiKey, model: v.openaiModel, baseUrl: v.openaiBaseUrl };
            case 'gemini':
                return { provider: id, apiKey: v.geminiKey, model: v.geminiModel };
            case 'ollama':
                return { provider: id, apiKey: v.ollamaKey, model: v.ollamaModel, baseUrl: v.ollamaUrl };
            case 'custom':
                return { provider: id, apiKey: v.customKey, model: v.customModel, baseUrl: v.customUrl };
        }
    }
    /** Main provider first, then the optional fallback. Unusable providers are reported in `problems`. */
    getProviderChain() {
        const v = this.storageSettings.values;
        const ids = [providerId(v.aiProvider)];
        if (v.fallbackProvider && v.fallbackProvider !== 'None') {
            const fallback = providerId(v.fallbackProvider);
            if (fallback !== ids[0])
                ids.push(fallback);
        }
        const chain = [];
        const problems = [];
        for (const id of ids) {
            const cfg = this.getConfigFor(id);
            const problem = validateConfig(cfg);
            if (problem)
                problems.push(`${id}: ${problem}`);
            else
                chain.push(cfg);
        }
        return { chain, problems };
    }
    timeoutMs() {
        return Math.max(5, Number(this.storageSettings.values.timeoutSeconds ?? 60)) * 1000;
    }
    tryConsumeQuota(cfg) {
        const targetCfg = cfg ?? this.getConfigFor(providerId(this.storageSettings.values.aiProvider));
        // Local Ollama (any model) and local LAN endpoints have no cloud billing quota—never block them
        if (isLocalProvider(targetCfg))
            return true;
        const limit = Number(this.storageSettings.values.dailyLimit ?? 0);
        if (limit <= 0)
            return true; // 0 = unlimited
        const today = new Date().toDateString();
        if (today !== this.callsDay) {
            this.callsDay = today;
            this.callsToday = 0;
        }
        if (this.callsToday >= limit)
            return false;
        this.callsToday++;
        return true;
    }
    /* ---------------- Notifications ---------------- */
    haConfigured() {
        const v = this.storageSettings.values;
        return !!(String(v.haUrl ?? '').trim() && String(v.haToken ?? '').trim() && String(v.haNotifyServices ?? '').trim());
    }
    ntfyConfigured() {
        return !!String(this.storageSettings.values.ntfyTopic ?? '').trim();
    }
    pushoverConfigured() {
        const v = this.storageSettings.values;
        return !!(String(v.pushoverToken ?? '').trim() && String(v.pushoverUser ?? '').trim());
    }
    telegramConfigured() {
        const v = this.storageSettings.values;
        return !!(String(v.telegramToken ?? '').trim() && String(v.telegramChatId ?? '').trim());
    }
    /** Sends to every selected channel that is configured (all of them if none are selected). */
    async sendAlert(req) {
        const selected = req.channels.length ? req.channels : CHANNELS;
        const jobs = [];
        if (selected.includes('Home Assistant') && this.haConfigured())
            jobs.push([
                'Home Assistant',
                () => this.sendHomeAssistantNotification(req.title, req.message, req.haCameraEntity, req.tag, req.objects, req.faces),
            ]);
        if (selected.includes('ntfy') && this.ntfyConfigured())
            jobs.push(['ntfy', () => this.sendNtfy(req)]);
        if (selected.includes('Pushover') && this.pushoverConfigured())
            jobs.push(['Pushover', () => this.sendPushover(req)]);
        if (selected.includes('Telegram') && this.telegramConfigured())
            jobs.push(['Telegram', () => this.sendTelegram(req)]);
        const result = { sent: [], errors: [], configured: jobs.length };
        await Promise.all(jobs.map(async ([name, job]) => {
            try {
                await job();
                result.sent.push(name);
            }
            catch (e) {
                result.errors.push(`${name}: ${errMsg(e)}`);
            }
        }));
        return result;
    }
    /** Pushes a notification through Home Assistant's notify service (phone Companion app). */
    async sendHomeAssistantNotification(title, message, cameraEntity, tag, objects, faces) {
        const v = this.storageSettings.values;
        const base = String(v.haUrl ?? '').trim().replace(/\/+$/, '');
        const token = String(v.haToken ?? '').trim();
        const services = String(v.haNotifyServices ?? '')
            .split(',')
            .map(x => x.trim().replace(/^notify\./, ''))
            .filter(Boolean);
        if (!base || !token || !services.length)
            return false;
        // Keys for both Android and iOS Companion apps; each app ignores the other's.
        const data = {
            channel: 'AI Vision Alerts',
            importance: 'high',
            priority: 'high',
            ttl: 0,
        };
        if (tag)
            data.tag = tag;
        if (objects?.length)
            data.objects = objects;
        if (faces?.length)
            data.faces = faces;
        if (cameraEntity) {
            data.image = `/api/camera_proxy/${cameraEntity}`; // Android
            data.entity_id = cameraEntity; // iOS
        }
        const errors = [];
        for (const service of services) {
            try {
                await postJson(`${base}/api/services/notify/${service}`, { authorization: `Bearer ${token}` }, { title, message, data }, 15000);
            }
            catch (e) {
                errors.push(`${service}: ${errMsg(e)}`);
            }
        }
        if (errors.length)
            throw new Error(errors.join('; '));
        return true;
    }
    async sendNtfy(req) {
        const v = this.storageSettings.values;
        const base = String(v.ntfyUrl ?? '').trim().replace(/\/+$/, '') || 'https://ntfy.sh';
        const topic = String(v.ntfyTopic ?? '').trim();
        const priority = { low: 3, medium: 4, high: 5 }[req.severity];
        const auth = {};
        if (v.ntfyToken)
            auth.authorization = `Bearer ${String(v.ntfyToken).trim()}`;
        if (req.jpeg) {
            // Publishing a file: the message travels in headers.
            await fetchOk(`${base}/${encodeURIComponent(topic)}`, {
                method: 'PUT',
                headers: {
                    ...auth,
                    filename: 'frame.jpg',
                    title: mimeHeader(req.title),
                    message: mimeHeader(req.message),
                    priority: String(priority),
                    tags: 'rotating_light',
                },
                body: new Uint8Array(req.jpeg),
            });
        }
        else {
            await postJson(base, auth, { topic, title: req.title, message: req.message, priority, tags: ['rotating_light'] }, 15000);
        }
    }
    async sendPushover(req) {
        const v = this.storageSettings.values;
        const form = new FormData();
        form.append('token', String(v.pushoverToken).trim());
        form.append('user', String(v.pushoverUser).trim());
        form.append('title', req.title);
        form.append('message', req.message);
        form.append('priority', String({ low: -1, medium: 0, high: 1 }[req.severity]));
        if (String(v.pushoverDevice ?? '').trim())
            form.append('device', String(v.pushoverDevice).trim());
        if (req.jpeg)
            form.append('attachment', new Blob([new Uint8Array(req.jpeg)], { type: 'image/jpeg' }), 'frame.jpg');
        await fetchOk('https://api.pushover.net/1/messages.json', { method: 'POST', body: form });
    }
    async sendTelegram(req) {
        const v = this.storageSettings.values;
        const token = String(v.telegramToken).trim();
        const chatId = String(v.telegramChatId).trim();
        const silent = req.severity === 'low' ? 'true' : 'false';
        try {
            if (req.jpeg) {
                const form = new FormData();
                form.append('chat_id', chatId);
                form.append('caption', `${req.title}\n${req.message}`.slice(0, 1000));
                form.append('disable_notification', silent);
                form.append('photo', new Blob([new Uint8Array(req.jpeg)], { type: 'image/jpeg' }), 'frame.jpg');
                await fetchOk(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: form });
            }
            else {
                await fetchOk(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `${req.title}\n${req.message}`,
                        disable_notification: silent === 'true',
                    }),
                });
            }
        }
        catch (e) {
            throw new Error(errMsg(e).split(token).join('***')); // never leak the bot token into logs
        }
    }
    /* ---------------- Mixin registration ---------------- */
    async canMixin(type, interfaces) {
        if (type !== srcExports.ScryptedDeviceType.Camera && type !== srcExports.ScryptedDeviceType.Doorbell)
            return;
        if (!interfaces.includes(srcExports.ScryptedInterface.VideoCamera) ||
            (!interfaces.includes(srcExports.ScryptedInterface.MotionSensor) && !interfaces.includes(srcExports.ScryptedInterface.ObjectDetector)))
            return;
        return [srcExports.ScryptedInterface.Settings, srcExports.ScryptedInterface.ObjectDetector];
    }
    async getMixin(mixinDevice, mixinDeviceInterfaces, mixinDeviceState) {
        return new AIAlertsMixin({
            mixinDevice,
            mixinDeviceInterfaces,
            mixinDeviceState,
            mixinProviderNativeId: this.nativeId,
            group: 'AI Vision Alerts',
            groupKey: 'ai-vision-alerts',
        }, this);
    }
    async releaseMixin(id, mixinDevice) {
        mixinDevice.dispose();
    }
}

exports.default = AIAlertsPlugin;
//# sourceMappingURL=main.nodejs.js.map
