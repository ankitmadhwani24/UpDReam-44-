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

var app = {
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
        window.addEventListener('load', this.onPageReady, false);
    },
    onPageReady:    function() {

        // app.apiEvents();
        // app.loginForm();
        var getToken = localStorage.getItem('LS_Auth');
        console.log(getToken);
        if( typeof getToken != undefined && getToken != null ) {
            $('.login-page').hide();
            // localStorage.setItem('LS_Auth',userNameDB);
            $('.first-selection').show();
            $('.username').text(getToken);
        } else {
            app.db = openDatabase("Dream_App", "1.0", "Dream App", 5 * 1024 * 1024) //Create database
            var createUserTabel     = 'CREATE TABLE IF NOT EXISTS USERTABLE (user_id INTEGER PRIMARY KEY, user_name unique, password, first_name, family_name, user_work_number)'
            ,   createQuickMarker   = 'CREATE TABLE IF NOT EXISTS DAMAGETABLE(damage_id INTEGER PRIMARY KEY, user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3)'
            ,   createRouteTable    = 'CREATE TABLE IF NOT EXISTS ROUTETABLE (route_id INTEGER PRIMARY KEY, route_N, route_description )'
            ,   createActivityTable = 'CREATE TABLE IF NOT EXISTS ACTIVITYTABLE (activity_id INTEGER PRIMARY KEY, user_id, route_id, date_time_start, date_time_stop, km_travelled, number_of_marker)'
            ,   insert              = 'INSERT INTO USERTABLE (user_name, password, first_name, family_name, user_work_number) VALUES ("iftakhar","123456789","ifty","alam","9829055")';

            app.db.transaction(function (tx) {
                tx.executeSql(createUserTabel);
                tx.executeSql(createQuickMarker);
                tx.executeSql(createRouteTable);
                tx.executeSql(createActivityTable);
                tx.executeSql(insert);
            });
        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        cordova.plugins.locationAccuracy.request(onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        function onRequestSuccess(){}
        function onRequestFailure(){}
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        app.apiEvents();
    },
    openCamera: function() {
        var pictureSource   = navigator.camera.PictureSourceType // picture source
        ,   destinationType = navigator.camera.DestinationType; // sets the format of returned value

        function cameraSuccess(imageData) {
            // alert(imageData);``

            // $('.first-selection').hide();
            $('.first-selection, .route').hide();
            $('.status li a').removeClass('active')
            $('.confirm').show();
            // localStorage.setItem('imageData',imageData);
            $('.damg-img img').attr('src',imageData);

            // var a = "10";
            // function getDataURL(url) { // image url to base64
            //     var image = new Image();
            //     image.onload = function () {
            //         var canvas = document.createElement('canvas');
            //         canvas.width = this.naturalWidth;
            //         canvas.height = this.naturalHeight;
            //         canvas.getContext('2d').drawImage(this, 0, 0);
            //         var base64Image    = "data:image/jpeg;base64," + canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')
            //         // alert(base64Image)
            //         // document.write('<img src="'+base64Image+'">')
            //
            //         // callback(base64Image)
            //     };
            //     image.src = url;
            // }
            // getDataURL(imageData);
        }
        function cameraError(message) {
            alert(errorMsg);
        }
        navigator.camera.getPicture(cameraSuccess, cameraError,{
                quality: 30,
                destinationType: destinationType.FILE_URI,
                saveToPhotoAlbum: false,
                correctOrientation: true,
                targetWidth: 1200,
                targetHeight:1200
             });
    },
    gpsCurrent: function() {
         var options = {
                enableHighAccuracy: true
        }
        var watchId     = navigator.geolocation.getCurrentPosition(onSuccess,onError,options)
        ,   latitude    = ''
        ,   longitude   = ''
        ,   accuracy    = ''
        ,   address     =  '';

        function onSuccess(position) {
            latitude  = position.coords.latitude
            longitude = position.coords.longitude
            accuracy  = position.coords.accuracy

            $('.lat span').text(latitude);
            $('.long span').text(longitude);
            $('.accu span').text(accuracy);
            getAddressFromLatLang(latitude,longitude);
        }
        function onError(error) {
            alert(error.message)
        }
        function getAddressFromLatLang(lat,lng) {
            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(lat, lng);
            geocoder.geocode( { 'latLng': latLng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        $('.metadata address').text(results[1].formatted_address);
                    }
                }else{
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
            // console.log("Entering getAddressFromLatLang()");
        }
    },

    apiEvents: function() {
        $('.modal').modal();
        var count = 0;

        // quick marker button
        $('.quick-maker').on('click', function() {
            app.openCamera();
            // $('.confirm').show()
            app.gpsCurrent();
            app.confirmMetadata();
            $('.mark-damage').attr('data-markbtn','outerBtn');
        })
        $('.inner-quick-maker').on('click', function() {
            app.openCamera();
            app.gpsCurrent();
            // $('.confirm').show()
            app.confirmMetadata();
            $('.mark-damage').attr('data-markbtn','innerBtn');
        })
        //
        $('.submit').on('click', function() {
            app.loginForm();
        });
        $('.status li a').on('click', function(e) {
            e.preventDefault();
            var _this     = $(this)
            $('.status li a').removeClass('active');
            _this.addClass('active');
        });
        // $('#next').on('click', function() {
        //     var selectQuery = 'SELECT * from DAMAGETABLE';
        //
        //     app.db.transaction(function(tx) {
        //         tx.executeSql( selectQuery, [], function(transaction, results) {
        //             // console.log(results);
        //             if( results.rows.length > 0 ) {
        //                 for (var i = 0; i < results.rows.length; i++) {
        //                     var row         =  results.rows.item(i)
        //                     ,   user        =  row.img_name
        //
        //                     document.write(user);
        //                 }
        //             }
        //         })
        //     })
        // });

        //mark damage with addition in table
        $('.mark-damage').on('click', function(e) {
            var itsDataMarkBtn  =   $(this).attr('data-markbtn');

            e.preventDefault();

            var userID      = $('.userid').text()
            ,   date        = $('.date').text()
            ,   time        = $('.time').text()
            ,   latitide    = $('.lat span').text()
            ,   longitude   = $('.long span').text()
            ,   accuracy    = $('.accu span').text()
            ,   address     = $('address').text()
            ,   note        = $('#textarea1').val()
            ,   status      = $('.status li a.active').attr('data-status')
            ,   img         = $('.damg-img img').attr('src')
            ,   base64Image = ''
            ,   dataTime    = date + '|' + time
            ,   gps_find    = latitide + ',' + longitude + ',' + accuracy
            ,   selectQuery = 'SELECT * FROM DAMAGETABLE'

            function getDataURL(url,callback) { // image url to base64
                var image = new Image();
                image.onload = function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = this.naturalWidth;
                    canvas.height = this.naturalHeight;
                    canvas.getContext('2d').drawImage(this, 0, 0);
                    base64Image    = "data:image/jpeg;base64," + canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')
                    callback(base64Image)
                };
                image.src = url;
            }
            getDataURL(img, function(base64URL) {
                if (userID != null && userID != undefined && userID != '') {
                    var insertQuery     = 'INSERT INTO DAMAGETABLE (user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3) VALUES(?,?,?,?,?,?,?,?,?,?,?)';

                    // 'INSERT INTO USERTABLE (user_name, password, first_name, family_name, user_work_number) VALUES ("iftakhar","123456789","ifty","alam","9829055")';
                    app.db.transaction(function(tx){
                        tx.executeSql( insertQuery ,[userID,'null',dataTime,gps_find,address,note,base64URL,status,'null','null','null'], function() {
                            if(itsDataMarkBtn == 'outerBtn') {
                                $('.confirm').hide();
                                $('.first-selection').show();
                            } else if (itsDataMarkBtn == 'innerBtn') {
                                app.db.transaction(function(tx){
                                    tx.executeSql( selectQuery, [], function(transaction, results) {
                                        if( results.rows.length > 0 ) {
                                            var markedDamages = results.rows.length;
                                            $('.damages p').text(markedDamages);
                                        } else {
                                            // $('.damages p').text('0');
                                        }
                                    });
                                });
                                $('.confirm').hide();
                                $('.route').show();
                            } else {
                                // do nothing
                            }
                        });
                    });
                    // document.write(base64URL);
                }
            });
        })

        //ordinary button route selection page shown
        $('.ordinary-btn').on('click', function() {
            $('.first-selection').hide();
            $('.route-selection').show();
        });
        $('.route-container .selections-btn').on('click', function() {
            var _this           = $(this)
            ,   routeId        = _this.attr('data-id')
            // console.log(_this);
            $('.start-activity').attr('data-routeid',routeId);
        });
        // function display_c(){
        //
        // }
        //
        // function display_ct() {
        //
        // }
        $('.start-activity').on('click', function() {
            var routeNumber     = $(this).attr('data-routeid')
            ,   insertQuery     = 'INSERT INTO ROUTETABLE (route_N, route_description) VALUES(?,?)'
            ,   date            = new Date()
            ,   dates           = date.getDate()
            ,   month           = date.getMonth() + 1
            ,   year            = date.getFullYear()
            ,   formatedDate    = dates + "/" + month + "/" + year
            ,   hours           = date.getHours()
            ,   min             = date.getMinutes()
            ,   formatedTime    = hours + ":" + min
            ,   currentDate     = formatedDate
            ,   currentTime     = formatedTime
            ,   selectQuery     = 'SELECT * FROM DAMAGETABLE'
            // console.log(routeId);

            // insert query for selected route
            app.db.transaction(function(tx){
                tx.executeSql( insertQuery ,[routeNumber,null]);
                tx.executeSql( selectQuery, [], function(transaction, results) {
                    if( results.rows.length > 0 ) {
                        var markedDamages = results.rows.length;
                        console.log(markedDamages);
                        $('.damages p').text(markedDamages);
                    } else {
                        // do nothing
                        $('.damages p').text('0');
                    }
                });
            });
            $('.route-selection').hide();
            $('#modal1').modal('close');
            $('.route').show();
            $('.route-number').text(routeNumber);
            $('.route-time .date-routen').text(formatedDate);
            $('.route-time time').text(formatedTime)

            app.runningClock();
            app.travelledDistance();
        });

    },
    loginForm: function() {
        var username = $('#username').val()
        ,   pass     = $('#pass').val();

        $('.error').hide();
        // console.log(username + pass);
        if (username != null && username != '' && pass != null && pass != '') {
            // console.log("hi");
            var selectQuery = 'SELECT * FROM USERTABLE WHERE user_name = "'+username+'"'
            // console.log(selectQuery);
            app.db.transaction(function(tx) {
                tx.executeSql( selectQuery, [], function(transaction, results) {
                    // console.log(results);
                    if( results.rows.length > 0 ) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var row         =  results.rows.item(i)
                            ,   userNameDB  =  row.user_name
                            ,   passDB      =  row.password
                            ,   userId      = row.user_id

                            // console.log(userId);
                            if (userId != null && userId != undefined && userId != '') {
                                localStorage.setItem('LS_userId',userId)
                                // alert(userId)
                            }

                            if (userNameDB == username && passDB == pass) {
                                // console.log('succes');
                                $('.login-page').hide();
                                localStorage.setItem('LS_Auth',userNameDB);
                                // alert(userNameDB);
                                $('.first-selection').show();
                                $('.username').text(userNameDB);
                            } else {
                                $('.login-page .error').text('Username or password doesn'+'t'+' match. Please provide correct credentials').show();
                            }
                        }
                    } else {
                        $('.login-page .error').text('Username or password doesn'+'t'+' match. Please provide correct credentials').show();
                    }
                })
            })
        } else {
            $('.error').text('Please enter your details').show();
        }
    },
    runningClock : function() {
        var strcount
        var date           =  new Date()
        ,   currentDate    =  date.getDate() + "/"  + date.getMonth() + "/" + date.getYear()
        ,   currentTime    =  date.getHours( )+ ":" + date.getMinutes() + ":" + date.getSeconds();
        $('.date-routen').text(currentDate);
        $('.route-time time').text(currentTime)
        tt= app.display_c();
    },
    display_c: function() {
        var refresh=1000; // Refresh rate in milli seconds
        mytime=setTimeout('app.runningClock()',refresh)
    },
    confirmMetadata: function () {
        var date         = new Date()
        ,   dates        = date.getDate()
        ,   month        =  date.getMonth() + 1
        ,   year         =  date.getFullYear()
        ,   formatedDate = dates + "/" + month + "/" + year
        ,   hours        = date.getHours()
        ,   min          = date.getMinutes()
        ,   formatedTime = hours + ":" + min

        $('.metadata .date').text(formatedDate);
        $('.metadata .time').text(formatedTime);
        var localUserId     =   localStorage.getItem('LS_userId');
        // alert(localUserId);
        $('.userid').text(localUserId);
    },
    travelledDistance: function() {
        var options = {
               enableHighAccuracy: true
       }
       // get startPostion
        var currentId     = navigator.geolocation.getCurrentPosition(onSuccess,onError,options)

        function onSuccess(position) {
            // startPostion = position
            var startLat    = position.coords.latitude
            ,   startLong     = position.coords.longitude

            localStorage.setItem('LS_startLat',startLat);
            localStorage.setItem('LS_startLong',startLong);
        }

        function onError(error) {
            alert(error.message)
        }

        // watch position
        var clearInterval = setInterval(function(){
            navigator.geolocation.getCurrentPosition(watchSuccess,watchError,{enableHighAccuracy: true })

            function watchSuccess(position) {

                // alert(position.coords.latitude)
                var lat1    = localStorage.getItem('LS_startLat')
                ,   long1   = localStorage.getItem('LS_startLong')
                // console.log(lat1,long1);

                var distance = app.distanceCalculator(lat1,long1,position.coords.latitude, position.coords.longitude, 'K');
                //var distance = distance(26.796665,75.813835,25.223317, 75.880711, 'K');
                //round to 3 decimal places
                var calcutedDistance    =   Math.round(distance*1000)/1000
                $('.traveled .distance').text(calcutedDistance);
            }
            function watchError(error) {
                alert(error.message)
            }
        }, 3000);
        //distance calculator

    },
    distanceCalculator: function(lat1, lon1, lat2, lon2, unit) {
        // function distance() {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var radlon1 = Math.PI * lon1/180
        var radlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist
// }
    }
};
