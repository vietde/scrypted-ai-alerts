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
const DEFAULT_SYSTEM_PROMPT = 'You are a home security camera analyst. You receive several still frames sampled from a camera\'s live stream ' +
    'right after motion was detected, oldest first. Decide whether they show something the homeowner should be ' +
    'alerted about, considering what changes between frames. ' +
    'Reply with ONLY a JSON object, no markdown: ' +
    '{"alert": boolean, "severity": "low" | "medium" | "high", "summary": string, "save": "none" | "snapshot" | "clip" | "both"}. ' +
    'Set "save" by following the evidence rules if they are given, otherwise use "none". ' +
    'The summary is one short sentence describing what is happening (people, what they are doing, vehicles, packages, animals). ' +
    'Never guess identities. Be conservative: routine activity such as pets, passing shadows, ' +
    'headlights, insects, rain, or lighting changes is not an alert unless the homeowner rules below say otherwise.';
const DEFAULT_RULES = 'Alert on any person near a door, window or garage, anyone carrying or taking a package, ' +
    'or anyone behaving suspiciously. Do not alert on people walking by on the street.';
const DEFAULT_EVIDENCE_RULES = 'Save a clip when a person is near a door, window or garage or is carrying or taking something. ' +
    'Save only a snapshot for other alerts. Save nothing for non-alerts.';
function buildPrompt(cameraName, rules, frames, intervalSec, evidenceRules) {
    return (`Camera: ${cameraName}\n` +
        `Trigger: motion detected\n` +
        `${frames} frame(s), about ${intervalSec}s apart, oldest first.\n` +
        `Homeowner rules: ${rules}\n` +
        (evidenceRules ? `Evidence rules (for the "save" field): ${evidenceRules}\n` : '') +
        'Respond with the JSON object only.');
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
            const user = { role: 'user', content: req.prompt };
            if (b64s.length)
                user.images = b64s;
            const json = await postJson(`${base}/api/chat`, headers, {
                model,
                stream: false,
                format: 'json',
                messages: [{ role: 'system', content: req.system }, user],
                options: { num_predict: req.maxTokens },
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
/** Pulls the JSON verdict out of a model reply, tolerating code fences and chatter. */
function parseVerdict(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        throw new Error(`Model did not return JSON: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);
    return {
        alert: parsed.alert === true || parsed.alert === 'true',
        severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'medium',
        summary: String(parsed.summary ?? '').trim() || 'Activity detected.',
        save: ['none', 'snapshot', 'clip', 'both'].includes(parsed.save) ? parsed.save : 'none',
    };
}
/* ------------------------------------------------------------------ */
/* Live stream frame sampling (uses Scrypted's built-in ffmpeg)         */
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
    listener;
    busy = false;
    lastRun = 0;
    storageSettings = new storageSettingsExports.StorageSettings(this, {
        enabled: {
            title: 'Enable AI alerts',
            type: 'boolean',
            defaultValue: false,
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
            title: 'Cooldown (seconds)',
            description: 'Minimum time between AI analyses for this camera.',
            type: 'number',
            defaultValue: 60,
        },
        rules: {
            title: 'What should trigger an alert?',
            description: 'Plain-English rules the AI uses to decide.',
            type: 'textarea',
            defaultValue: DEFAULT_RULES,
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
                await this.analyze(true);
            },
        },
    });
    constructor(options, provider) {
        super(options);
        this.provider = provider;
        this.listener = systemManager$1.listenDevice(this.id, srcExports.ScryptedInterface.MotionSensor, (_source, _details, data) => {
            if (data === true)
                this.analyze(false).catch(e => this.console.error('analyze failed', e));
        });
    }
    dispose() {
        this.listener?.removeListener();
        this.listener = undefined;
    }
    getMixinSettings() {
        return this.storageSettings.getSettings();
    }
    putMixinSetting(key, value) {
        return this.storageSettings.putSetting(key, value);
    }
    /** Grabs frames from the live stream; falls back to a single snapshot if that fails. */
    async captureFrames(count, intervalSec) {
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
            return await sampleFrames(ffmpegPath, inputArgs, count, intervalSec, m => this.console.warn(m));
        }
        catch (e) {
            this.console.warn('Live stream sampling failed, trying a snapshot instead:', e);
            if (!this.mixinDevice.takePicture)
                throw e;
            const picture = await this.mixinDevice.takePicture({ reason: 'event' });
            return [await mediaManager$1.convertMediaObjectToBuffer(picture, 'image/jpeg')];
        }
    }
    async analyze(force) {
        const s = this.storageSettings.values;
        if (!s.enabled && !force)
            return;
        if (this.busy)
            return;
        const now = Date.now();
        if (!force && now - this.lastRun < Number(s.cooldownSeconds ?? 60) * 1000)
            return;
        const { chain, problems } = this.provider.getProviderChain();
        for (const p of problems)
            this.console.warn(`Skipping provider - ${p}`);
        if (!chain.length) {
            this.console.error('No usable AI provider. Fill in the provider settings on the AI Vision Alerts plugin page.');
            return;
        }
        if (!this.provider.tryConsumeQuota()) {
            this.console.warn('Daily AI call limit reached, skipping analysis.');
            return;
        }
        this.busy = true;
        this.lastRun = now;
        try {
            const cameraName = systemManager$1.getDeviceById(this.id)?.name ?? 'Camera';
            const count = Math.min(8, Math.max(1, Math.round(Number(s.frameCount ?? 3))));
            const interval = Math.min(10, Math.max(1, Math.round(Number(s.frameIntervalSeconds ?? 2))));
            const jpegs = await this.captureFrames(count, interval);
            const started = Date.now();
            const request = {
                system: DEFAULT_SYSTEM_PROMPT,
                prompt: buildPrompt(cameraName, s.rules || DEFAULT_RULES, jpegs.length, interval, String(s.saveEvidence ?? '').startsWith('Let the AI')
                    ? s.evidenceRules || DEFAULT_EVIDENCE_RULES
                    : undefined),
                jpegs,
                maxTokens: 300,
                timeoutMs: this.provider.timeoutMs(),
            };
            let text = '';
            let used = chain[0].provider;
            let lastError;
            for (const cfg of chain) {
                try {
                    text = await callModel(cfg, request);
                    used = cfg.provider;
                    lastError = undefined;
                    break;
                }
                catch (e) {
                    lastError = e;
                    this.console.warn(`${cfg.provider} failed: ${errMsg(e)}`);
                }
            }
            if (lastError)
                throw lastError;
            const verdict = parseVerdict(text);
            this.console.log(`${used} analyzed ${jpegs.length} frame(s) in ${Date.now() - started}ms:`, JSON.stringify(verdict));
            const order = ['low', 'medium', 'high'];
            const meetsSeverity = order.indexOf(verdict.severity) >= order.indexOf(s.minSeverity || 'low');
            if (!force && !(verdict.alert && meetsSeverity))
                return;
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
            const needsFrame = plan === 'snapshot' || plan === 'both';
            const media = s.attachSnapshot || needsFrame
                ? await mediaManager$1.createMediaObject(jpegs[Math.floor(jpegs.length / 2)], 'image/jpeg')
                : undefined;
            const alert = await this.provider.sendAlert({
                title: `${cameraName}: ${verdict.severity.toUpperCase()}`,
                message: verdict.summary,
                severity: verdict.severity,
                channels: asList(s.channels),
                jpeg: s.attachSnapshot ? jpegs[Math.floor(jpegs.length / 2)] : undefined,
                haCameraEntity: String(s.haCameraEntity ?? '').trim() || undefined,
                tag: `ai-alert-${this.id}`,
            });
            if (alert.sent.length)
                this.console.log(`Alert sent via: ${alert.sent.join(', ')}`);
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
                    await notifier.sendNotification(`${cameraName}: ${verdict.severity.toUpperCase()}`, {
                        body: verdict.summary,
                        tag: 'ai-vision-alerts',
                        data: {
                            source: 'ai-vision-alerts',
                            cameraId: this.id,
                            cameraName,
                            severity: verdict.severity,
                            summary: verdict.summary,
                            save: plan,
                        },
                    }, media);
                }
                catch (e) {
                    this.console.error(`Notification to ${id} failed`, e);
                }
            }
        }
        catch (e) {
            this.console.error('AI analysis failed', e);
        }
        finally {
            this.busy = false;
        }
    }
}
/* ------------------------------------------------------------------ */
/* Plugin (provider settings + mixin registration)                      */
/* ------------------------------------------------------------------ */
class AIAlertsPlugin extends srcExports.ScryptedDeviceBase {
    callsToday = 0;
    callsDay = new Date().toDateString();
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
            title: 'Daily AI call limit (all cameras)',
            description: 'Safety cap so a noisy camera cannot run up a bill or keep your GPU busy.',
            type: 'number',
            defaultValue: 200,
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
                            prompt: 'Reply with exactly: {"alert": false, "severity": "low", "summary": "ok"}',
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
            description: 'Must support images, e.g. llama3.2-vision, qwen2.5vl, gemma3. Blank uses llama3.2-vision.',
            placeholder: 'llama3.2-vision',
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
    putSetting(key, value) {
        return this.storageSettings.putSetting(key, value);
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
    tryConsumeQuota() {
        const today = new Date().toDateString();
        if (today !== this.callsDay) {
            this.callsDay = today;
            this.callsToday = 0;
        }
        if (this.callsToday >= Number(this.storageSettings.values.dailyLimit ?? 200))
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
            jobs.push(['Home Assistant', () => this.sendHomeAssistantNotification(req.title, req.message, req.haCameraEntity, req.tag)]);
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
    async sendHomeAssistantNotification(title, message, cameraEntity, tag) {
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
        if (!interfaces.includes(srcExports.ScryptedInterface.VideoCamera) || !interfaces.includes(srcExports.ScryptedInterface.MotionSensor))
            return;
        return [srcExports.ScryptedInterface.Settings];
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
