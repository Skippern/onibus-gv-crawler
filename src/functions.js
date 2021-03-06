const retry = require('retry');
const request = require('request');

const sequentialPromise = (array, fn) => {
  return array.reduce((sequence, next) => {
    return sequence.then(() => {
      return fn(next);
    });
  }, Promise.resolve());
};

// Split it in chunks too many registers to insert at once
const chunk = (arr, n) => {
  return arr.reduce((p, cur, i) => {
    (p[i/n|0] = p[i/n|0] || []).push(cur);
    return p;
  }, []);
};

const customRequest = (method, opts) => {
  return new Promise((resolve, reject) => {

    const operation = retry.operation({
      retries: 3,
      factor: 1,
      minTimeout: 100
    });

    operation.attempt(function() {
      request[method](opts, (error, response, body) => {
        const err = error || response.statusCode !== 200;

        if (operation.retry(err)) {
          return;
        }

        if (err) {
          reject(operation);
        }

        resolve(body);
      });
    });
  });
};

exports = module.exports = {
  sequentialPromise,
  chunk,
  customRequest
};
