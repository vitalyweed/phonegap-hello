/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/*var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};*/

var API_AGE = 2;

var kendoapp = null;
var eventDataSource = null;

var token = null;
var instanceUrl = null;
var apiUrl = null;
var services = null;

var app = {
    initialize: function () {
        this.initKendo();
        this.initConnection();
    },
    initKendo: function () {
        kendoapp = new kendo.mobile.Application(document.body);
    },
    initConnection: function () {
        initConnection();
    }
}

//

initViewHello = function (e) {
    console.log("initViewHello");
    initEventDataSource();
    $("#scheduler").kendoScheduler({
        mobile: "phone",
        height: window.innerHeight,
        dataSource: getEventDataSource()
    });
}

//

initConnection = function () {
    console.log("init connection");
    getSalesforceApis(function (data) {
        setApiUrl(data[data.length-API_AGE].url);
        getSalesforceToken(function (data) {
            setToken(data.access_token);
            setInstanceUrl(data.instance_url);
            getSalesforceServices(getInstanceUrl(), getApiUrl(), getToken(), initData);
        });
    });
}

initData = function () {
    console.log("init data");
    querySalesforceEvents(function (data) {
        setEventDataSource(data.records);
    });
}

//

getSalesforceApis = function (callback) {
    console.log("get APIs");
    $.ajax({
        type: "GET",
        url: "https://na1.salesforce.com/services/data/",
        dataType: "json",
        success: function (response) {
            console.log("success", response);
            if (callback) { callback(response); }
        },
        error: function (response) {
          console.log("error", response);
        }
    });
}

getSalesforceToken = function (callback) {
    console.log("get token");
    $.post("https://login.salesforce.com/services/oauth2/token",
        {
            "grant_type": "password",
            "client_id": "3MVG9A2kN3Bn17htQoJPG8gZv26_hSm8n.iXxJwxNt2rRcJxDdNvFgutSJauwgh3WwQ_5_rf4cjLGfRv2I1sq",
            "client_secret": "1577604407378633977",
            "username": "vdolgov@example.com",
            "password": "8symbols2NtM6oOXtkdr3mSgCcHiuxQSN"
        },
        function (response) {
            console.log("data", JSON.stringify(response));
            if (callback) { callback(response); }
        }
    );
}

getSalesforceServices = function (instanceUrl, apiUrl, token, callback) {
    console.log("get services");
    $.ajax({
        type: "GET",
        url: instanceUrl + apiUrl,
        dataType: "json",
        headers: {
          "Authorization": "Bearer " + token
        },
        success: function (response) {
            console.log("success", response);
            setServices(response);
            if (callback) { callback(response) };
        },
        error: function (response) {
            console.log("error", response);
        }
    });
}

//

querySalesforce = function (query, callback) {
    console.log("query: " + query);
    $.ajax({
        type: "GET",
        url: getInstanceUrl() + getServiceByName("query") + "?q=" + query,
        dataType: "json",
        headers: {
          "Authorization": "Bearer " + getToken()
        },
        success: function (response) {
            console.log("success", response);
            if (callback) { callback(response); }
        },
        error: function (response) {
            console.log("error", response);
        }
    });
}

//

querySalesforceEvents = function (callback) {
    querySalesforce("SELECT Id,Name,Start__c,End__c FROM Event__c", callback);
}

//

setToken = function (data) {
    token = data;
    console.log("new token", token);
}
getToken = function () {
    return token;
}

//

setInstanceUrl = function (data) {
    instanceUrl = data;
    console.log("new instance URL", instanceUrl);
}
getInstanceUrl = function () {
    return instanceUrl;
}

//

setApiUrl = function (data) {
    apiUrl = data;
    console.log("new API URL", apiUrl);
}
getApiUrl = function () {
    return apiUrl;
}

//

setServices = function (data) {
    services = data;
    console.log("new services", JSON.stringify(services));
}
getServices = function () {
    return services;
}
getServiceByName = function (name) {
    return services[name];
}

//

initEventDataSource = function () {
    eventDataSource = new kendo.data.SchedulerDataSource();
}
setEventDataSource = function (data) {
    for (var i=0; i<data.length; i++) {
        data[i].title = data[i].Name;
        data[i].start = new Date(data[i].Start__c);
        data[i].end = new Date(data[i].End__c);
    }
    eventDataSource.data(data);
    console.log("new event data source", JSON.stringify(data));
}
getEventDataSource = function () {
    return eventDataSource;
}
