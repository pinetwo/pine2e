const SPECIAL_NAMES = /^on_/;

function includeMixin(klass, mixin) {
  if (typeof(mixin) !== 'function')
    throw new Error("Mixin must be a constructor function, got " + typeof(mixin));

  var mixins = klass.mixins || (klass.mixins = []);
  if (~mixins.indexOf(mixin))
    return;

  mixins.push(mixin);

  var src = mixin.prototype, dst = klass.prototype;
  for (var k in src) {
    dst[k] = src[k];
  }
}

function applyMixins(instance, klass) {
  if (klass.mixins == null)
    return;

  for (var mixin of klass.mixins) {
    mixin.call(instance);
  }
}

exports.include = includeMixin;
exports.apply = applyMixins;
