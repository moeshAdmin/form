cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "cordova-sqlite-evcore-extbuild-free.SQLitePlugin",
    "file": "plugins/cordova-sqlite-evcore-extbuild-free/www/SQLitePlugin.js",
    "pluginId": "cordova-sqlite-evcore-extbuild-free",
    "clobbers": [
      "SQLitePlugin"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-device": "2.0.2",
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-sqlite-evcore-extbuild-free": "0.9.10",
  "cordova-plugin-ios-camera-permissions": "1.2.0"
};
// BOTTOM OF METADATA
});