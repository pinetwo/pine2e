function whenHttpRequestFinished(req, res, callback) {
  if (callback) {
    res.on('finish', callback);
    res.on('close', callback);
  } else {
    // TODO: promise
  }
}

module.exports = whenHttpRequestFinished;
