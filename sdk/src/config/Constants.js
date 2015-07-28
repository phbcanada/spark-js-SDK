var ADSKSpark = ADSKSpark || {};

(function () {
    'use strict';

    /**
     * @constant
     * @description - Various Spark constants
     */
    ADSKSpark.Constants = {
        //api endpoints
        API_HOST_PROD: 'https://api.spark.autodesk.com/api/v1',
        API_HOST_SANDBOX: 'https://sandbox.spark.autodesk.com/api/v1',
        MEMBER_KEY: 'spark-member',

        //print properties
        EXPORT_TASK_TYPE: 'export',
        ERROR_TASK_STATUS: 'error',
        RUNNING_TASK_STATUS: 'running'
    };

}());
