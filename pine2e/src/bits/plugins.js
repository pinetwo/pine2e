var debug = require('debug')('p2e:config');

var _plugins = [];

exports.all = _plugins;

exports.install = installPlugin;
exports.call = callPluginFuncs;
exports.apply = applyPluginFuncs;


function installPlugin(plugin) {
  if (~_plugins.indexOf(plugin))
    return;

  if (!plugin.name)
    throw new Error("plugins.install(): plugin must have a name");

  _plugins.push(plugin);

  debug("installed plugin %s", plugin.name);
}


function callPluginFuncs(name, ...args) {
  applyPluginFuncs(name, args);
}


function applyPluginFuncs(name, args) {
  for (var plugin of _plugins) {
    let func = plugin[name];
    if (typeof(func) === 'function') {
      func.apply(plugin, args);
    }
  }
}
