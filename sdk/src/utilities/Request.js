var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    ADSKSpark._injectMemberID = null;

    /**
     * @description // A wrapper for XHR requests that returns a promise.
     // Usage: ADSKSpark.Request('http://alpha.spark.autodesk.com/api/v1/print/printers').get([headers[, data]]).then(...);
     // Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise#Example_using_new_XMLHttpRequest()
     * @memberOf ADSKSpark
     * @param {String} url - The url for the request.
     * @param {String|function} [authorization] - If specified, the Authorization header will be set with this value by default.
     * @param {Object} [options] - May have the following options:
     *                              {
     *                                  notJsonResponse
     *                                  withCredentials
     *                              }
     */
    ADSKSpark.Request = function (url, authorization, options) {
        options = options || {};

        // This function returns a Promise that resolves to the authorization header
        // value. If the 'authorization' parameter is a function, then we call that
        // function and expect the return value will be a Promise that resolves to the
        // authorization header; otherwise we resolve to the value of the parameter.
        //
        var prepareRequest = function (method, headers, data, authorization) {
            var promise = new Promise(function (resolve) {
                if (authorization && typeof authorization === 'function') {
                    authorization().then(function (data) {
                        resolve(data);
                    });
                } else {
                    resolve(authorization);
                }
            });

            return promise.then(function (authorization) {
                return makeRequest(method, headers, data, authorization);
            });
        };

        var makeRequest = function (method, headers, data, authorization) {
            headers = headers || {};

            var payload = '';

            if (data && method === 'GET') {
                var argcount = 0;
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (argcount++) {
                            payload += '&';
                        }
                        payload += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
                    }
                }
                url += '?' + payload;
                payload = '';
            } else {
                payload = data;
            }

            var promise = new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();

                // console.log(method + ' -> ' + url + ' (' + payload + ')');
                xhr.open(method, url);

                // Set the headers
                for (var header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header, headers[header]);
                    }
                }

                if (authorization && !headers.hasOwnProperty('Authorization')) {
                    xhr.setRequestHeader('Authorization', authorization);
                }

                if (options.notJsonResponse) {
                    xhr.responseType = 'arraybuffer';
                }

                if (options.withCredentials) {
                    xhr.withCredentials = true;
                }

                if (ADSKSpark._injectMemberID)
                    xhr.setRequestHeader('X-Member-ID', ADSKSpark._injectMemberID);

                xhr.onload = function () {
                    if (xhr.status === 200 || xhr.status === 201 || xhr.status === 202 || xhr.status === 204) {

                        var response;

                        //Successful with an empty body - xhr.status 204 in the API means that the response is empty
                        if (xhr.status !== 204 && !options.notJsonResponse) {
                            response = JSON.parse(xhr.responseText);
                        } else {
                            response = {};
                            if (xhr.response) {
                                response.arraybuffer = new Uint8Array(xhr.response);
                            }
                        }
                        response.httpStatus = xhr.status;
                        response.httpStatusText = xhr.statusText;

                        resolve(response);

                    } else {
                        var error = new Error(xhr.statusText);
                        error.status = xhr.status;
                        error.statusText = xhr.statusText;
                        if (xhr.responseType === 'arraybuffer') {
                            var response = new Uint8Array(xhr.response);
                            error.responseText = String.fromCharCode.apply(null, response);
                            try {
                                var err = JSON.parse(error.responseText);
                                error = err;
                            } catch(ex) {
                            }
                        }
                        else {
                            error.responseText = xhr.responseText;
                        }
                        reject(error);
                    }
                };
                xhr.onerror = function () {
                    // Why can we not get more info about what the error was?
                    // See: https://xhr.spec.whatwg.org/#suggested-names-for-events-using-the-progressevent-interface
                    // console.log('XHR error type: ' + e.type);

                    // If the request failed, it's probably due to a 404.
                    reject(new Error('Error: ' + url + ' failed. Response:' + xhr.responseText));
                };

                xhr.send(payload);
            });

            return promise;
        };

        return {
            'get': function (headers, data) {
                return prepareRequest('GET', headers, data, authorization);
            },
            'post': function (headers, data) {
                return prepareRequest('POST', headers, data, authorization);
            },
            'put': function (headers, data) {
                return prepareRequest('PUT', headers, data, authorization);
            },
            'delete': function (headers, data) {
                return prepareRequest('DELETE', headers, data, authorization);
            }
        };
    };

}());
