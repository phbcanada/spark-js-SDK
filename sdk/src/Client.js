var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Helpers = ADSKSpark.Helpers;

    var GUEST_TOKEN_KEY = 'spark-guest-token';
    var ACCESS_TOKEN_KEY = 'spark-access-token';

    var _clientId = '';
    var _apiUrl = '';
    var _guestTokenUrl = '';
    var _accessTokenUrl = '';
    var _refreshTokenUrl = '';
    var _redirectUri = '';

    /**
     * Gets an access_token and stores it in localStorage, afterwards returns a promise that resolves to the guest token.
     *
     * @returns {Promise} - A promise that resolves to the guest token.
     */
    var getGuestTokenFromServer = function () {
        if (_guestTokenUrl) {
            return ADSKSpark.Request(_guestTokenUrl).get().then(function (data) {
                var now = Date.now();
                data.expires_at = now + parseInt(data.expires_in) * 1000;
                localStorage.setItem(GUEST_TOKEN_KEY, JSON.stringify(data));
                return data.access_token;
            });
        }
        return Promise.reject(new Error('No Server Implementation'));
    };

    /**
     * @description - Completes the implicit login process, gets an access_token and expiresIn parameters and stores it in localStorage. For more
     * information about implicit login see here - https://tools.ietf.org/html/rfc6749#section-4.2
     * @memberOf ADSKSpark.Client
     * @param {String} accessToken - The accessToken that was returned after the user signed in.
     * @param {Number} expiresIn - The time in milliseconds when the access token will be expired.
     * @returns {String} - The access token.
     */
    var completeImplicitLogin = function (accessToken, expiresIn) {
        var data = {};
        data.access_token = accessToken;
        var now = Date.now();
        data.expires_at = now + parseInt(expiresIn) * 1000;
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));

        return data.access_token;
    };

    /**
     * @description - Completes the login process, gets an access_token and stores it in localStorage.
     * @memberOf ADSKSpark.Client
     * @param {String} code - The code that was returned after the user signed in. {@see ADSKSpark.Client#login}
     * @returns {Promise} - A promise that resolves to the access token.
     */
    var completeServerLogin = function (code) {
        var params = {code: code};

        if (_redirectUri) {
            params.redirect_uri = _redirectUri;
        } else {
            params.redirect_uri = Helpers.calculateRedirectUri();
        }
        if (_accessTokenUrl) {
            return ADSKSpark.Request(_accessTokenUrl, null, {withCredentials: true}).get(undefined, params).then(function (data) {
                if (data && data.expires_in && data.access_token) {
                    var now = Date.now();
                    data.expires_at = now + parseInt(data.expires_in) * 1000;
                    delete(data.refresh_token);
                    localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));

                    return data.access_token;
                }
                return Promise.reject(new Error(data.Error));
            });
        }
        return Promise.reject(new Error('No Server Implementation'));
    };

    /**
     * @class Represents a Client
     * @description - The Client API singleton that allows to call various api methods
     * See reference - https://spark.autodesk.com/developers/reference/authentication
     */
    ADSKSpark.Client = {

        /**
         * @description - Initializes the client.
         * @memberOf ADSKSpark.Client
         * @param {String} appKey - The app key provided when you registered your app.
         * @param {Object} [options]:
         *                    isProduction - Flag to indicate if we use Production environment or Sandbox environment
         *                    redirectUri - The URI that the Spark OAuth service will return the browser to
         *                    guestTokenUrl - The URL of your authentication server used for guest tokens. This server should
         *                                 handle exchanging the client secret for a guest token.
         *                    accessTokenUrl - The URL of your authentication server used for access tokens. This server should
         *                                 handle exchanging a provided code for an access token.
         *                    refreshTokenUrl - The URL of your authentication server used to refresh access tokens. This server
         *                                  should call the refresh token api (extend the expiry time) and return a new valid
         *                                  access token.
         */
        initialize: function (appKey, options) {
            _clientId = appKey;
            _apiUrl = (options && options.apiRoot) ? options.apiRoot :
                      (options && options.isProduction) ? ADSKSpark.Constants.API_HOST_PROD : ADSKSpark.Constants.API_HOST_SANDBOX;
            _redirectUri = options && options.redirectUri ? options.redirectUri : null;
            _guestTokenUrl = options && options.guestTokenUrl ? options.guestTokenUrl : null;
            _accessTokenUrl = options && options.accessTokenUrl ? options.accessTokenUrl : null;
            _refreshTokenUrl = options && options.refreshTokenUrl ? options.refreshTokenUrl : null;
        },

        /**
         * @description - Returns the name of the Api currently being used. Must be called after initialize.
         * @memberOf ADSKSpark.Client
         * @returns {String} - The Api Name (normally either "sandbox" or "production").
         */
        getApiName: function () {
            var name = '';
            if( _apiUrl) {
                var split = _apiUrl.split('//');
                if( split.length > 1 ) {
                    name = split[1].split('.')[0];
                }
                if( name === 'api' ) {
                    name = 'production';
                }
            }
            return name;
        },

        /**
         * @description - Returns the URL to redirect to for logging in.
         * @memberOf ADSKSpark.Client
         * @param {Boolean} [showRegisterScreen] - Whether to show the register screen as the default
         * @param {Boolean} [isServerLogin] - is it server login - if not supplied defaults to false (meaning we use implicit login)
         * @returns {String} - The URL.
         */
        getLoginRedirectUrl: function (showRegisterScreen, isServerLogin) {

            var responseType = isServerLogin ? 'code' : 'token';
            var redirectUri = _redirectUri || Helpers.calculateRedirectUri();

            var apiRedirectUrl = _apiUrl + '/oauth/authorize?response_type=' + responseType +
                '&client_id=' + _clientId +
                '&redirect_uri=' + redirectUri;

            if (showRegisterScreen) {
                apiRedirectUrl += '&register=true';
            }

            return apiRedirectUrl;
        },

        /**
         * @description - Clears access token that had been stored in localStorage
         * @memberOf ADSKSpark.Client
         */
        logout: function () {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        },

        /**
         * @description - Checks if the access token exists and has not expired.
         * @memberOf ADSKSpark.Client
         * @returns {Boolean} - True if the access token exists and has not expired. Otherwise, false.
         */
        isAccessTokenValid: function () {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            var now = Date.now();

            //if access token is not valid, remove it from localStorage
            if (accessToken && accessToken.expires_at && accessToken.expires_at < now){
                this.logout();
            }

            return !!(accessToken && accessToken.expires_at && accessToken.expires_at > now);
        },

        /**
         * @description - Returns the full access token object if one is currently in local storage. Null otherwise.
         * @memberOf ADSKSpark.Client
         * @returns {?String} - The access token or null if not found.
         */
        getAccessTokenObject: function () {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            return (accessToken && accessToken.access_token) ? accessToken : null;
        },

        /**
         * @description - Returns the access_token if one is currently in local storage. Null otherwise.
         * @memberOf ADSKSpark.Client
         * @returns {?String} - The access token or null if not found.
         */
        getAccessToken: function () {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            return (accessToken && accessToken.access_token) ? accessToken.access_token : null;
        },

        /**
         * @description - Return a promise that resolves to the guest token.
         * This will attempt to retrieve the token from local storage. If it's missing, a call will be made to
         * the authentication server.
         * @memberOf ADSKSpark.Client
         * @returns {Promise} - A promise that resolves to the guest token.
         */
        getGuestToken: function () {
            var token = JSON.parse(localStorage.getItem(GUEST_TOKEN_KEY));
            var now = Date.now();

            //if guest token is not implemented try to use access token
            if (!token){
                token = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            }

            if (token && token.expires_at && token.expires_at > now) {
                return Promise.resolve(token.access_token);
            }

            return getGuestTokenFromServer();
        },

        /**
         * @description - Refreshes the access token to extend its expiry and returns a promise that resolves to the access token object
         * @memberOf ADSKSpark.Client
         * @returns {Promise} - A promise that resolves to the access token object.
         */
        refreshAccessToken: function () {
            if (_refreshTokenUrl) {

                return ADSKSpark.Request(_refreshTokenUrl, null, {withCredentials: true})
                    .get()
                    .then(function (data) {
                        if (!data.Error) {
                            var now = Date.now();
                            data.expires_at = now + parseInt(data.expires_in) * 1000;
                            var clonedData = JSON.parse(JSON.stringify(data));
                            delete(clonedData.refresh_token);
                            localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(clonedData));
                        }
                        return data;
                    });
            }
            return Promise.reject(new Error('No Server Implementation'));
        },

        /**
         * @description - Request the API with an access token (if exists)
         * @memberOf ADSKSpark.Client
         * @param {String} endpoint - The API endpoint to query
         * @param {Object} [options] - Additional options that are supported by Request
         * @returns {ADSKSpark.Request} - The request object that abstracts REST APIs
         */
        authorizedApiRequest: function (endpoint, options) {
            var _this = this;
            options = options || {};

            function formatAuthHeader(token) {
                return token ? ('Bearer ' + token.access_token) : null;
            }

            return ADSKSpark.Request(_apiUrl + endpoint, function () {
                return new Promise(function (resolve) {
                    var token = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
                    if (token) {
                        // If the token has an expires_at property and the token
                        // has expired, then refresh it.
                        //
                        var now = Date.now();

                        if (_refreshTokenUrl && token.expires_at && now > token.expires_at) {
                            _this.refreshAccessToken()
                                .then(function (refreshedToken) {
                                    resolve(formatAuthHeader(refreshedToken));
                                });
                        } else {
                            resolve(formatAuthHeader(token));
                        }

                    } else {
                        resolve(null);
                    }
                });
            }, options);
        },

        /**
         * @description - Request the API with a guest token (if exists)
         * @memberOf ADSKSpark.Client
         * @param {String} endpoint - The API endpoint to query
         * @param {Object} [options] - Additional options that are supported by Request
         * @returns {ADSKSpark.Request} - The request object that abstracts REST APIs
         */
        authorizedAsGuestApiRequest: function (endpoint, options) {
            var _this = this;
            options = options || {};
            return ADSKSpark.Request(_apiUrl + endpoint, function () {
                return new Promise(function (resolve) {
                    _this.getGuestToken().then(function (token) {
                        resolve(token ? ('Bearer ' + token) : null);
                    });
                });
            }, options);
        },

        /**
         * @description - Open an auth window
         * @memberOf ADSKSpark.Client
         * @param {Boolean} [showRegisterScreen] - Whether to show the register screen as the default
         * @param {Boolean} [isServerLogin] - is it server login or implicit login - if not supplied defaults to false
         */
        openLoginWindow: function (showRegisterScreen, isServerLogin) {
            Helpers.popupWindow(this.getLoginRedirectUrl(showRegisterScreen, isServerLogin), 350, 600);
        },

        /**
         * @description - Completes the login process and stores it in localStorage.
         * @param {Boolean} [isServer] - flag to indicate if this is server login or not, defaults to false.
         * @returns {Promise}
         */
        completeLogin: function (isServer) {
            if (isServer) {
                var code = Helpers.extractRedirectionCode();
                if (code) {
                    code = code.replace(/[\/\\]+$/, '');
                    return completeServerLogin(code);
                }
                return Promise.reject(new Error('No code supplied'));

            } else {
                var data = Helpers.extractRedirectionTokenData();
                if (data && data.access_token) {
                    return Promise.resolve(completeImplicitLogin(data.access_token, data.expires_in));
                }
                return Promise.reject(new Error('No access_token supplied'));
            }
        },

        _switchApiURL: function (url) {
            _apiUrl = url;
        }
    };

}());
