describe('Assets', function () {
	'use strict';

	var Assets,Client, mockedAuthorizedRequest, mockedGuestAuthorizedRequest,mockedAccessTokenObj,mockedAccessTokenIsValid,
		fakeAssetGetResponse, fakeAssetsGetResponse, fakeAssetCreateResponse, fakeAssetUpdateResponse,fakeAssetThumbnailsGetResponse,
		fakeAssetSourcesGetResponse,fakeAssetThumbnailsCreateResponse,fakeAssetSourcesCreateResponse,fakeAssetGetCommentsResponse,
		fakeAssetLikeToggle,fakeAssetCommentCreateResponse,fakeAssetCommentUpdateResponse;

	before(function () {
		Assets = ADSKSpark.Assets;
		Client = ADSKSpark.Client;
		mockedAuthorizedRequest = sinon.stub(Client, 'authorizedApiRequest');
		mockedGuestAuthorizedRequest = sinon.stub(Client, 'authorizedAsGuestApiRequest');
		mockedAccessTokenIsValid = sinon.stub(Client,'isAccessTokenValid');
		mockedAccessTokenObj = {spark_member_id: 123456};

	});

	after(function () {
		mockedAuthorizedRequest.restore();
		mockedGuestAuthorizedRequest.restore();
	});

	beforeEach(function () {

		var getAssetJSON = __html__['test/mocks/getAsset.json'],
			getAssetsJSON = __html__['test/mocks/getAssets.json'],
			getAssetThumbnailsJSON = __html__['test/mocks/getAssetThumbnails.json'],
			getAssetSourcesJSON = __html__['test/mocks/getAssetSources.json'],
			getAssetCommentsJSON = __html__['test/mocks/getAssetComments.json'];

		fakeAssetGetResponse = JSON.parse(getAssetJSON);
		fakeAssetsGetResponse = JSON.parse(getAssetsJSON);
		fakeAssetGetCommentsResponse = JSON.parse(getAssetCommentsJSON);
		fakeAssetCreateResponse = {"_link":"/assets/1478543","asset_id":1478543};
		fakeAssetUpdateResponse = {"_link":"/assets/1478543"};
		fakeAssetThumbnailsGetResponse = JSON.parse(getAssetThumbnailsJSON);
		fakeAssetSourcesGetResponse = JSON.parse(getAssetSourcesJSON);
		fakeAssetThumbnailsCreateResponse = {"_link": "/assets/1450326/thumbnails"};
		fakeAssetSourcesCreateResponse = {"_link": "/assets/1450326/sources"};
		fakeAssetLikeToggle = {"count":1,"is_member_like":true,"_link":"/assets/1474847/likes"};
		fakeAssetCommentCreateResponse = {"comment_id":"CP2NAA9IBSXJTNI","_link":"/assets/1474847/comments"};
		fakeAssetCommentUpdateResponse = {"_link":"/assets/1474847/comments"};

	});

	it('should exist', function () {
		expect(Assets).to.exist;
		expect(Assets).to.have.property('getPublicAssetsByConditions');
		expect(Assets).to.have.property('getPublicAsset');
		expect(Assets).to.have.property('getAsset');
		expect(Assets).to.have.property('getMyAssets');
		expect(Assets).to.have.property('createAsset');
		expect(Assets).to.have.property('updateAsset');
		expect(Assets).to.have.property('removeAsset');
		expect(Assets).to.have.property('retrieveAssetThumbnails');
		expect(Assets).to.have.property('retrieveAssetSources');
		expect(Assets).to.have.property('createAssetThumbnails');
		expect(Assets).to.have.property('createAssetSources');
		expect(Assets).to.have.property('deleteAssetSources');
		expect(Assets).to.have.property('deleteAssetThumbnails');
	});

	it('should retrieve public assets successfully', function () {
		//mock
		mockedGuestAuthorizedRequest.withArgs('/assets').returns({
			get: function () {
				return Promise.resolve(fakeAssetsGetResponse);
			}
		});

		return Assets.getPublicAssetsByConditions().then(function (response) {
			expect(response).to.have.property('count', 23);
			expect(response).to.have.property('assets');
			expect(response.assets).to.have.length(23);
		});

	});

	it('should get a public asset successfully', function () {
		var assetId = 1474495;
		//mock
		mockedGuestAuthorizedRequest.withArgs('/assets/' + assetId).returns({
			get: function () {
				return Promise.resolve(fakeAssetGetResponse);
			}
		});

		return Assets.getPublicAsset(assetId).then(function (response) {
			expect(response).to.have.property('asset_id', assetId);
			expect(response).to.have.deep.property('artist.artist_id', fakeAssetGetResponse.artist.artist_id);
			expect(response).to.have.property('thumbnails');
			expect(response.thumbnails).to.have.length(6);
		});
	});

	it('should reject getPublicAsset by assetId for an assetId that is not a number', function () {
		return Assets
			.getPublicAsset('a string')
			.then(function (response) {
			})
			.catch(function (error) {
				expect(error).to.be.an.instanceof(Object);
				expect(error).to.have.property('message');
			});

	});

	it('should get public asset comments successfully', function () {
		var assetId = 1474847;
		//mock
		mockedGuestAuthorizedRequest.withArgs('/assets/' + assetId + '/comments').returns({
			get: function () {
				return Promise.resolve(fakeAssetGetCommentsResponse);
			}
		});
		return Assets.getPublicAssetComments(assetId).then(function (response) {
			expect(response).to.have.property('count', 3);
			expect(response).to.have.property('_link', '/assets/' + assetId + '/comments?limit=20&offset=0');
			expect(response).to.have.property('comments');
			expect(response.comments).to.have.length(3);
		});
	});

	it('should get a user\'s asset successfully', function () {
		var assetId = 1474495;
		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId).returns({
			get: function () {
				return Promise.resolve(fakeAssetGetResponse);
			}
		});
		
		return Assets.getAsset(assetId).then(function (response) {
			expect(response).to.have.property('asset_id', assetId);
			expect(response).to.have.deep.property('artist.artist_id', fakeAssetGetResponse.artist.artist_id);
			expect(response).to.have.property('thumbnails');
			expect(response.thumbnails).to.have.length(6);
		});

	});

	it('should reject getAsset by assetId for an assetId that is not a number', function () {
		return Assets
			.getAsset('a string')
			.then(function (response) {
			})
			.catch(function (error) {
				expect(error).to.be.an.instanceof(Object);
				expect(error).to.have.property('message');
			});
	});

	it('should get a user\'s assets successfully', function () {

		sinon.stub(Client,'getAccessTokenObject').returns({spark_member_id: mockedAccessTokenObj.spark_member_id});
		mockedAccessTokenIsValid.returns(true);
		mockedAuthorizedRequest.withArgs('/members/' + mockedAccessTokenObj.spark_member_id + '/assets').returns({
			get: function () {
				return Promise.resolve(fakeAssetsGetResponse);
			}
		});

		return Assets.getMyAssets().then(function (response) {
			expect(response).to.have.property('assets', fakeAssetsGetResponse.assets);
			expect(response).to.have.property('count', fakeAssetsGetResponse.count);
			expect(response.assets).to.have.length(fakeAssetsGetResponse.count);
		});

	});

	it('should be able to create an asset', function () {
		var assetData = {
			title: 'Test asset',
			description: 'test description',
			tags: 'tag1,tag2'
		};

		//mock
		mockedAuthorizedRequest.withArgs('/assets').returns({
			post: function (headers, params) {
				return Promise.resolve(fakeAssetCreateResponse);
			}
		});

		return Assets.createAsset(assetData).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetCreateResponse._link);
			expect(response).to.have.property('asset_id',fakeAssetCreateResponse.asset_id);
		});
	});

	it('should be able to update an asset', function () {
		var assetData = {
			assetId: 1221321,
			title: 'Test asset',
			description: 'test description',
			tags: 'tag1,tag2'
		};

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetData.assetId).returns({
			put: function (headers, params) {
				return Promise.resolve(fakeAssetUpdateResponse);
			}
		});

		return Assets.updateAsset(assetData).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetUpdateResponse._link);
		});
	});

	it('should be able to remove an asset', function () {
		var assetId = 123131;

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId).returns({
			delete: function (headers, params) {
				return Promise.resolve('');
			}
		});

		return Assets.removeAsset(assetId).then(function (response) {
			expect(response).to.equal('');
		});
	});

	it('should be able to retrieve asset thumbnails', function () {
		var assetId = 123131;

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/thumbnails').returns({
			get: function (headers, params) {
				return Promise.resolve(fakeAssetThumbnailsGetResponse);
			}
		});

		return Assets.retrieveAssetThumbnails(assetId).then(function (response) {
			expect(response).to.have.property('thumbnails',fakeAssetThumbnailsGetResponse.thumbnails);
			expect(response.thumbnails).to.have.length(fakeAssetThumbnailsGetResponse.thumbnails.length);
		});
	});

	it('should be able to retrieve asset sources', function () {
		var assetId = 123131;

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/sources').returns({
			get: function (headers, params) {
				return Promise.resolve(fakeAssetSourcesGetResponse);
			}
		});

		return Assets.retrieveAssetSources(assetId).then(function (response) {
			expect(response).to.have.property('sources',fakeAssetSourcesGetResponse.sources);
			expect(response.sources).to.have.length(fakeAssetSourcesGetResponse.sources.length);
		});
	});

	it('should be able to create asset thumbnails', function () {
		var assetId = 123131,
			assetThumbnailData = [{"id": "17140904","caption": "Chrysanthemum","description": "Chrysanthemum flower","is_primary": true},
									{"id": "17140902","caption": "SL","description": "Statue of Liberty","is_primary": false}];
		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/thumbnails').returns({
			post: function (headers, params) {
				return Promise.resolve(fakeAssetThumbnailsCreateResponse);
			}
		});

		return Assets.createAssetThumbnails(assetId,assetThumbnailData).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetThumbnailsCreateResponse._link);
		});
	});

	it('should be able to create asset sources', function () {
		var assetId = 123131,
			fileIds = '121121,676567';
		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/sources').returns({
			post: function (headers, params) {
				return Promise.resolve(fakeAssetSourcesCreateResponse);
			}
		});

		return Assets.createAssetSources(assetId,fileIds).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetSourcesCreateResponse._link);
		});
	});

	it('should be able to delete asset thumbnails', function () {
		var assetId = 123131,
			fileIds = '121121,676567';

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/thumbnails?thumbnail_ids=' + fileIds).returns({
			delete: function (headers, params) {
				return Promise.resolve('');
			}
		});

		return Assets.deleteAssetThumbnails(assetId,fileIds).then(function (response) {
			expect(response).to.equal('');
		});
	});

	it('should be able to delete asset sources', function () {
		var assetId = 123131,
			fileIds = '121121,676567';

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/sources?file_ids=' + fileIds).returns({
			delete: function (headers, params) {
				return Promise.resolve('');
			}
		});

		return Assets.deleteAssetSources(assetId,fileIds).then(function (response) {
			expect(response).to.equal('');
		});
	});

	it('should be able to toggle like on an asset', function () {

		var assetId = 1474847;

		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/likes').returns({
			put: function (headers, params) {
				return Promise.resolve(fakeAssetLikeToggle);
			}
		});

		return Assets.updateLikeStatusForMember(assetId).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetLikeToggle._link);
		});
	});

	it('should be able to create asset comment', function () {
		var assetId = 123131,
			commentText = 'Hello there friend!';
		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/comments').returns({
			post: function (headers, params) {
				return Promise.resolve(fakeAssetCommentCreateResponse);
			}
		});

		return Assets.createAssetComment(assetId,commentText).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetCommentCreateResponse._link);
		});
	});

	it('should be able to update a comment of an asset', function () {
		var assetId = 1474847,
			commentId = 'CP2NAA9IBSXJTNI',
			commentText = 'I think I was impolite in the previous comment';


		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/comments').returns({
			put: function (headers, params) {
				return Promise.resolve(fakeAssetCommentUpdateResponse);
			}
		});

		return Assets.updateAssetComment(assetId, commentId, commentText).then(function (response) {
			expect(response).to.have.property('_link',fakeAssetCommentUpdateResponse._link);
		});
	});

	it('should be able to remove a comment from an asset', function () {
		var assetId = 1474847,
			commentId = 'CP2NAA9IBSXJTNI';

		var params = '?comment_id=' + commentId;
		//mock
		mockedAuthorizedRequest.withArgs('/assets/' + assetId + '/comments' + params).returns({
			delete: function (headers, params) {
				return Promise.resolve('');
			}
		});

		return Assets.deleteAssetComment(assetId,commentId).then(function (response) {
			expect(response).to.equal('');
		});
	});


});
