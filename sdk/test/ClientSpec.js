describe('Client', function () {
    'use strict';

    var ASC, Request, mockedRequest, fakeGuestToken, fakeAccessToken, fakeRefreshToken;
    var testGuestUrl, testAccessUrl, testRefreshUrl, testApiUrl, testRedirectURI, testClientId;
    var ACCESS_TOKEN_KEY = 'spark-access-token',
        GUEST_TOKEN_KEY = 'spark-guest-token';


    before(function () {
        ASC = ADSKSpark.Client;
        Request = ADSKSpark.Request;

        testGuestUrl = 'http://localhost/guest';
        testAccessUrl = 'http://localhost/access';
        testRefreshUrl = 'http://localhost/refresh';
        testApiUrl = 'https://sandbox.localhost/test-api-url';
        testRedirectURI = 'https://localhost/callbackURI';
        testClientId = 'fake-client-id';

        fakeGuestToken = {
            access_token: 'this is a fake guest token',
            expires_in: 10000,
            expires_at: Date.now() + 3600,
            issued_at: Date.now()
        };

        fakeAccessToken = {
            access_token: 'this is a fake access token',
            expires_in: 10000,
            expires_at: Date.now() + 3600,
            issued_at: Date.now(),
            refresh_token: 'this is a fake refresh token',
            refresh_token_expires_in: 100000,
            refresh_token_issued_at: Date.now()
        };

        fakeRefreshToken = fakeAccessToken;

        mockedRequest = sinon.stub(ADSKSpark, 'Request');


        var options = {
            apiRoot: testApiUrl,
            redirectUri: testRedirectURI,
            guestTokenUrl: testGuestUrl,
            accessTokenUrl: testAccessUrl,
            refreshTokenUrl: testRefreshUrl
        };
        ASC.initialize(testClientId, options);

    });

    after(function(){
        mockedRequest.restore();
    });

    beforeEach(function () {
        localStorage.clear(); // Clear any tokens that were stored by the client
    });


    it('should exist', function () {
        Should.exist(ASC);

        ASC.should.be.Object.with.properties(
            [
                'initialize',
                'getApiName',
                'getLoginRedirectUrl',
                'logout',
                'isAccessTokenValid',
                'getAccessTokenObject',
                'getAccessToken',
                'getGuestToken',
                'refreshAccessToken',
                'authorizedApiRequest',
                'authorizedAsGuestApiRequest',
                'openLoginWindow',
                'completeLogin'
            ]
        );
    });

    it('should return correct api name', function () {
        expect(ASC.getApiName()).to.equal('sandbox');
    });

    it('should return correct login redirect url', function () {
        var expectedUrlImplicit = testApiUrl + '/oauth/authorize?response_type=token&client_id=' +
            testClientId + '&redirect_uri=' + testRedirectURI;

        var expectedUrlExplicit = testApiUrl + '/oauth/authorize?response_type=code&client_id=' +
            testClientId + '&redirect_uri=' + testRedirectURI;

        expect(ASC.getLoginRedirectUrl()).to.equal(expectedUrlImplicit);
        expect(ASC.getLoginRedirectUrl(false, false)).to.equal(expectedUrlImplicit);
        expect(ASC.getLoginRedirectUrl(true, false)).to.equal(expectedUrlImplicit + '&register=true');
        expect(ASC.getLoginRedirectUrl(false, true)).to.equal(expectedUrlExplicit);
        expect(ASC.getLoginRedirectUrl(true, true)).to.equal(expectedUrlExplicit + '&register=true')
    });


    it('should be able to logout', function () {
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(fakeAccessToken));
        expect(ASC.getAccessTokenObject()).to.have.property('access_token', fakeAccessToken.access_token);
        ASC.logout();
        expect(ASC.getAccessTokenObject()).to.equal(null);
    });

    it('should be able to return the correct status of the access token', function () {
        expect(ASC.isAccessTokenValid()).to.not.be.ok
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(fakeAccessToken));
        expect(ASC.isAccessTokenValid()).to.be.ok;
        ASC.logout();
        expect(ASC.isAccessTokenValid()).to.not.be.ok;
    });

    it('should be able to return the access token object', function () {
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(fakeAccessToken));
        expect(ASC.getAccessTokenObject()).to.have.property('access_token', fakeAccessToken.access_token);
    });

    it('should be able to return the access token', function () {
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(fakeAccessToken));
        expect(ASC.getAccessToken()).to.equal(fakeAccessToken.access_token);
    });

    it('should be able to return the guest token from local storage', function () {
        localStorage.setItem(GUEST_TOKEN_KEY, JSON.stringify(fakeGuestToken));

        var promise = ASC.getGuestToken();

        // Check promise
        return promise.then(function (guestToken) {
            expect(guestToken).to.be.ok;
            expect(guestToken).to.equal(fakeGuestToken.access_token);
        });

    });

    it('should be able to return the access token when asking for a non existing guest token', function () {
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(fakeAccessToken));
        var promise = ASC.getGuestToken();

        // Check promise
        return promise.then(function (accessToken) {
            expect(accessToken).to.be.ok;
            expect(accessToken).to.equal(fakeAccessToken.access_token);
        });
    });

    it('should be able to refresh the access token', function () {

        mockedRequest.returns({
            get: function () {
                return Promise.resolve(fakeRefreshToken);
            }
        });

        var promise = ASC.refreshAccessToken();

        // Check promise
        return promise.then(function (token) {
            expect(token).to.have.property('access_token', fakeRefreshToken.access_token);
            expect(token).to.have.property('refresh_token');
            expect(ASC.isAccessTokenValid()).to.be.ok;
            expect(ASC.getAccessTokenObject()).to.have.property('access_token', fakeRefreshToken.access_token);
            expect(ASC.getAccessTokenObject()).to.not.have.property('refresh_token');
        });
    });

    it('should be able to perform authorized api request', function () {

        //get my assets mock data
        var getAssetsJSON = __html__['test/mocks/getAssets.json'],
            fakeAssetsGetResponse = JSON.parse(getAssetsJSON);

        mockedRequest.returns(Promise.resolve(fakeAssetsGetResponse));

        var promise = ASC.authorizedApiRequest('/members/member-id/assets');

        // Check promise
        return promise.then(function (response) {
            expect(response).to.have.property('assets', fakeAssetsGetResponse.assets);
            expect(response).to.have.property('count', fakeAssetsGetResponse.count);
            expect(response.assets).to.have.length(fakeAssetsGetResponse.count);
        });
    });

    it('should be able to perform guest authorized api request', function () {

        //get my assets mock data
        var getAssetsJSON = __html__['test/mocks/getAssets.json'],
            fakeAssetsGetResponse = JSON.parse(getAssetsJSON);

        mockedRequest.returns(Promise.resolve(fakeAssetsGetResponse));

        var promise = ASC.authorizedAsGuestApiRequest('/assets');

        // Check promise
        return promise.then(function (response) {
            expect(response).to.have.property('assets', fakeAssetsGetResponse.assets);
            expect(response).to.have.property('count', fakeAssetsGetResponse.count);
            expect(response.assets).to.have.length(fakeAssetsGetResponse.count);
        });
    });

    it('should be able to open a login window', function () {
        var Helpers = ADSKSpark.Helpers;
        sinon.spy(Helpers, 'popupWindow');
        ASC.openLoginWindow();
        expect(Helpers.popupWindow.calledOnce).to.be.ok;

        var expectedUrlImplicit = testApiUrl + '/oauth/authorize?response_type=token&client_id=' +
            testClientId + '&redirect_uri=' + testRedirectURI;

        expect(Helpers.popupWindow.getCall(0).args[0]).to.equal(expectedUrlImplicit);
    });

    it('should be able to complete login for an explicit flow', function () {
        window.history.replaceState({}, 'test title', 'http://localhost:9876/?code=foobar');

        mockedRequest.returns({
            get: function () {
                return Promise.resolve(fakeAccessToken);
            }
        });

        var promise = ASC.completeLogin(true);

        // Check promise
        return promise.then(function (response) {
            expect(response).to.equal(fakeAccessToken.access_token);
            expect(ASC.isAccessTokenValid()).to.be.ok;
        });

    });

    it('should be able to complete login for an implicit flow', function () {
        window.history.replaceState({}, 'test title', 'http://localhost:9876/#access_token=' + fakeAccessToken.access_token + '&expires_in=' + 10000);

        mockedRequest.returns({
            get: function () {
                return Promise.resolve(fakeAccessToken);
            }
        });

        var promise = ASC.completeLogin();

        // Check promise
        return promise.then(function (response) {
            expect(response).to.equal(fakeAccessToken.access_token);
            expect(ASC.isAccessTokenValid()).to.be.ok;
        });

    });
});
