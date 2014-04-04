var when = module.exports = require('when');
when.sequence = require('when/sequence');
when.pipeline = require('when/pipeline');
when.parallel = require('when/parallel');
when.poll = require('when/poll');
when.fn = require('when/function');
when.node = require('when/node');
when.callbacks = require('when/callbacks');
when.guard = require('when/guard');

var proto = when.Promise.prototype;

proto.cb = P_cb;
when.cb = ((pv, cb) => when(pv).cb(cb));

var transforms = {};
transforms.get = P_get;
transforms.call = P_call;
transforms.apply = P_apply;
transforms.ifTrue = P_ifTrue;
transforms.ifFalse = P_ifFalse;
transforms.ifNull = P_ifNull;
transforms.ifNotNull = P_ifNotNull;

var lodash = require('lodash');
for (var k in lodash) {
  if (typeof(lodash[k]) === 'function') {
    if (!(k in transforms)) {
      transforms[k] = createLodashTransform(lodash[k]);
    }
  }
}

when.transform = P_transform;

for (let name in transforms) {
  if (!(name in proto))
    proto[name] = createProtoMethod(transforms[name]);
  if (!(name in when))
    when[name] = createStaticMethod(transforms[name]);
}



// transforms

function P_get(key) {
  return (value) => (isNonNullObject(value) ? value[key] : undefined);
}

function P_call(methodName, ...args) {
  return P_apply(methodName, args);
}

function P_apply(methodName, args) {
  return (value) => {
    if (isNonNullObject(value)) {
      var method = value.methodName;
      if (isCallable(method)) {
        return method.apply(value, args);
      }
    }
    return undefined;
  }
}

function P_ifTrue(trueFunc, falseFunc) {
  return (value) => (value ? callOrUse(trueFunc, value) : callOrUse(falseFunc, value));
}

function P_ifFalse(falseFunc, trueFunc) {
  return (value) => (value ? callOrUse(trueFunc, value) : callOrUse(falseFunc, value));
}

function P_ifNull(nullFunc, notNullFunc) {
  return (value) => (value == null ? callOrUse(nullFunc, value) : callOrUse(notNullFunc, value));
}

function P_ifNotNull(notNullFunc, nullFunc) {
  return (value) => (value == null ? callOrUse(nullFunc, value) : callOrUse(notNullFunc, value));
}


// helpers

function P_cb(cb) {
  this.catch((e) => process.nextTick(cb.bind(null, e))).then((value) => process.nextTick(cb.bind(null, null, value)));
}

function isNonNullObject(value) {
  return (value != null) && (typeof(value) === 'object' || typeof(value) === 'function');
}

function isCallable(value) {
  return typeof(value) === 'function';
}

function P_transform(pv, func) {
  if (when.isPromiseLike(pv))
    return when(pv).then(func);
  else
    return func(pv);
}

function nop() {
}

function identity(value) {
  return value;
}

function callOrUse(fv, value) {
  switch(typeof(fv)) {
    case 'undefined':
      return undefined;
    case 'function':
      return fv(value);
    default:
      return fv;
  }
}

function createProtoMethod(transform) {
  return function() {
    return this.then(transform.apply(null, arguments));
  };
}

function createStaticMethod(transform) {
  return function(pv, ...args) {
    return P_transform(pv, transform.apply(null, args));
  };
}

function createLodashTransform(func) {
  return function(...args) {
    return (value) => func.apply(null, [value].concat(args))
  }
}
