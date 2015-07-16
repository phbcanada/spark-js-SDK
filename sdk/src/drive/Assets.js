/**
 * @namespace
 */
var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Client = ADSKSpark.Client,
        Helpers = ADSKSpark.Helpers,
        listDefaultLimit = 48;

    /**
     * @class
     * @type {{getAsset: Function, getMyAssets: Function, createAsset: Function, updateAsset: Function, removeAsset: Function, retrieveAssetThumbnails: Function, retrieveAssetSources: Function, createAssetThumbnails: Function, createAssetSources: Function, deleteAssetSources: Function, deleteAssetThumbnails: Function}}
     * @description - The Assets API singleton.
     * See reference - https://spark.autodesk.com/developers/reference/drive?deeplink=%2Freference%2Fassets
     */
    ADSKSpark.Assets = {

        /**
         * @description - Get public assets - requires only a guest token
         * @memberOf ADSKSpark.Assets
         * @param {Object} conditions - Various conditions for the query
         * @returns {Promise} - A promise that will resolve to all public assets
         */
        getPublicAssetsByConditions: function (conditions) {
            conditions = conditions || {};

            //default limit/offset
            conditions.limit = conditions.limit && conditions.limit > 0 ? conditions.limit : listDefaultLimit;
            conditions.offset = conditions.offset && conditions.offset >= 0 ? conditions.offset : 0;

            return Client.authorizedAsGuestApiRequest('/assets').get(null, conditions);
        },

        /**
         * @description - Get a specific asset
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @returns {Promise} - A promise that will resolve to an asset
         */
        getPublicAsset: function (assetId) {
            if (Helpers.isValidId(assetId)) {
                return Client.authorizedAsGuestApiRequest('/assets/' + assetId).get();
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Get asset comments
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @returns {Promise} - A promise that will resolve to asset's comments
         */
        getPublicAssetComments: function(assetId){
            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                return Client.authorizedAsGuestApiRequest('/assets/' + assetId + '/comments').get();
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },


        /**
         * @description - Get a specific asset
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @returns {Promise} - A promise that will resolve to an asset
         */
        getAsset: function (assetId) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                return Client.authorizedApiRequest('/assets/' + assetId).get();
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Get logged in user assets
         * @memberOf ADSKSpark.Assets
         * @param {Object} params - limit/offset/sort/filter options.
         * @returns {Promise} - A promise that will resolve to an object that contains a property "assets"
         * that holds an array of assets.
         */
        getMyAssets: function (params) {

            if (Client.isAccessTokenValid()) {
                var accessTokenObj = Client.getAccessTokenObject();

                var memberId = accessTokenObj.spark_member_id;

                //default limit/offset
                var defaultParams = {
                    limit: listDefaultLimit,
                    offset: 0
                };

                if (params && params.limit && params.limit <= 0) {
                    delete(params.limit);
                }

                if (params && params.offset && params.offset < 0) {
                    delete(params.offset);
                }

                var passedParams = Helpers.mergeObjects(defaultParams, params);

                //Make sure memberId is defined and that it is valid
                if (Helpers.isValidId(memberId)) {
                    return Client.authorizedApiRequest('/members/' + memberId + '/assets').get(null, passedParams);
                }
            }

            return Promise.reject(new Error('Access token is invalid'));
        },

        /**
         * @description - Create a new asset for a logged in user
         * @memberOf ADSKSpark.Assets
         * @param {Object} asset - Asset data - title, description, tags etc
         * @returns {Promise} - A promise that will resolve to a success/failure asset
         */
        createAsset: function (asset) {

            //construct the full params
            var params = ADSKSpark.Helpers.jsonToParameters(asset);

            var headers = {'Content-type': 'application/x-www-form-urlencoded'};
            return Client.authorizedApiRequest('/assets').post(headers, params);
        },

        /**
         * @description - Update an asset for a logged in user
         * @memberOf ADSKSpark.Assets
         * @param {Object} asset - The asset we want to update, make sure that this object has an assetId property
         * @returns {Promise} - A promise that will resolve to a success/failure asset
         */
        updateAsset: function (asset) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(asset.assetId)) {

                var assetId = asset.assetId;

                //construct the full params, omit assetId in the request
                var params = ADSKSpark.Helpers.jsonToParameters(asset, 'assetId');

                return Client.authorizedApiRequest('/assets/' + assetId).put(null, params);
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Remove an asset for a logged in user
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @returns {Promise} - A promise that will resolve to an empty body with a proper success/failure response
         */
        removeAsset: function (assetId) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                return Client.authorizedApiRequest('/assets/' + assetId).delete();
            }
            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Retrieve all thumbnails for an asset
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @returns {Promise} - A promise that will resolve to an object that has a "thumbnails" property that is an array of asset thumbnails
         */
        retrieveAssetThumbnails: function (assetId) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                return Client.authorizedApiRequest('/assets/' + assetId + '/thumbnails').get();
            }
            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Retrieve all sources (3d model files) for an asset
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @returns {Promise} - A promise that will resolve to an object that has a "sources" property that is an array of asset sources
         */
        retrieveAssetSources: function (assetId) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                return Client.authorizedApiRequest('/assets/' + assetId + '/sources').get();
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Create asset thumbnail(s)
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The asset ID for which the thumbnails are created
         * @param {Array} filesArray - The files that are attached to this asset, they come in the form of [{id:"id",caption:"caption",description,"description",is_primary:true/false}]
         * @param {Boolean} async - Whether thumbnails should be generated asynchronously to save system resources.
         * @returns {Promise} - A promise that will resolve to an asset thumbnails object
         */
        createAssetThumbnails: function (assetId, filesArray, async) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {

                var thumbnails = filesArray.map(function (file) {
                    return {
                        id: file.id,
                        caption: file.caption || '',
                        description: file.description || '',
                        is_primary: file.is_primary || false
                    };
                });
                async = async || false;
                var params = 'thumbnails=' + JSON.stringify(thumbnails) + '&async=' + async;

                var headers = {'Content-type': 'application/x-www-form-urlencoded'};
                return Client.authorizedApiRequest('/assets/' + assetId + '/thumbnails').post(headers, params);
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Create asset source(s)
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The asset ID for which the thumbnails are created
         * @param {String} fileIds - The file ids that are attached to this asset, separated by comma i.e. 123456,258242
         * @returns {Promise} - A promise that will resolve to an asset sources object
         */
        createAssetSources: function (assetId, fileIds) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                var params = 'file_ids=' + fileIds;
                var headers = {'Content-type': 'application/x-www-form-urlencoded'};
                return Client.authorizedApiRequest('/assets/' + assetId + '/sources').post(headers, params);
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Remove sources from an asset for a logged in user
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @param {String} fileIds - String of file ids to delete from asset
         * @returns {Promise} - A promise that will resolve to an empty body with a proper success/failure response
         */
        deleteAssetSources: function (assetId, fileIds) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                var params = '?file_ids=' + fileIds;
                return Client.authorizedApiRequest('/assets/' + assetId + '/sources' + params).delete();
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        },

        /**
         * @description - Remove thumbnails from an asset for a logged in user
         * @memberOf ADSKSpark.Assets
         * @param {Number} assetId - The ID of the asset
         * @param {String} fileIds - Array of file ids to delete from asset
         * @returns {Promise} - A promise that will resolve to an empty body with a proper success/failure response
         */
        deleteAssetThumbnails: function (assetId, fileIds) {

            //Make sure assetId is defined and that it is valid
            if (Helpers.isValidId(assetId)) {
                var params = '?thumbnail_ids=' + fileIds;
                return Client.authorizedApiRequest('/assets/' + assetId + '/thumbnails' + params).delete();
            }

            return Promise.reject(new Error('Proper assetId was not supplied'));
        }
    };

}());
