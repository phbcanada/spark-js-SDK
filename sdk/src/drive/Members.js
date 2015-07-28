/**
 * @namespace
 */
var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    var Constants = ADSKSpark.Constants,
        Client = ADSKSpark.Client,
        Helpers = ADSKSpark.Helpers;


    /**
     * Gets an member object for the current user and stores it in localStorage,
     * afterwards returns a promise that resolves to the member.
     *
     * @returns {Promise} - A promise that resolves to the current member.
     */
    var getCurrentMemberFromServer = function () {
        if (Client.isAccessTokenValid()) {
            return Client.authorizedApiRequest('/members').get().then(function (memberObj) {
                localStorage.setItem(Constants.MEMBER_KEY, JSON.stringify(memberObj));
                return memberObj;
            });
        }
        return Promise.reject(new Error('No Valid Access Token'));
    };


    /**
     * @class
     * @type {{retrieveMemberDetails: Function, getMyProfile: Function}}
     * @description The Members API singleton.
     * See reference - https://spark.autodesk.com/developers/reference/drive?deeplink=%2Freference%2Fmembers
     */
    ADSKSpark.Members = {

        /**
         * @description - Gets member profile by memberId
         * @memberOf ADSKSpark.Members
         * @returns {Promise} - A promise that will resolve to a member object
         */
        getMemberProfile: function (memberId) {

            //Make sure memberId is defined and that it is a number
            if (Helpers.isValidId(memberId)) {
                return Client.authorizedApiRequest('/members/' + memberId).get();
            }
            return Promise.reject(new Error('Proper memberId was not supplied'));
        },

        /**
         * @description - Gets logged in member profile
         * @memberOf ADSKSpark.Members
         * @returns {Promise} - A promise that will resolve to current logged in member object
         */
        getMyProfile: function () {
            var memberObj = JSON.parse(localStorage.getItem(Constants.MEMBER_KEY));

            if (memberObj) {
                return Promise.resolve(memberObj);
            }
            return getCurrentMemberFromServer();
        },

        /**
         * @description - Gets memberId of the logged in member
         * @memberOf ADSKSpark.Members
         * @returns {Promise} - A promise that will resolve to the memberId of the current logged in member
         */
        getLoggedInMemberId: function () {
            return this.getMyProfile().then(function(memberObj){
                return memberObj.member.id;
            });
        }
    };

}());
