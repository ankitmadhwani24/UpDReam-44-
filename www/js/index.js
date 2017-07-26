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
var activityFormField = {}
,   postActivityData
,   trackerInterval

var app = {
    // baseURL: 'http://dream123.herokuapp.com/api/',
    baseURL: 'http://151.1.140.232:3388/api/',

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

        // var onlineStatus = navigator.onLine ?  'online' : 'offline'
        // if (onlineStatus == 'online') {
            app.apiEvents();
            // app.gpsTracker();
        // } else {
        //     alert("It's seems that you are not connected with internet. Please make sure that you have an active internet");
        // }
        // app.loginForm();

        var getToken = localStorage.getItem('LS_Auth');
        console.log(getToken);
        // alert(getToken);
        if( typeof getToken != undefined && getToken != null ) {
            $('.login-page').hide();
            // alert(getToken);
            // localStorage.setItem('LS_Auth',userNameDB);
            $('.first-selection').show();
            $('.username').text(getToken);

            app.db = openDatabase("Dream_App", "1.0", "Dream App", 5 * 1024 * 1024) //Create database
            var createUserTabel     = 'CREATE TABLE IF NOT EXISTS USERTABLE (user_id INTEGER PRIMARY KEY, user_name unique, password, first_name, family_name, user_work_number)'
            ,   createQuickMarker   = 'CREATE TABLE IF NOT EXISTS DAMAGETABLE(damage_id INTEGER PRIMARY KEY, user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3,mark_km,mark_ellapsed_time, is_posted)'
            ,   createRouteTable    = 'CREATE TABLE IF NOT EXISTS ROUTETABLE (route_id INTEGER PRIMARY KEY, route_N, route_description, is_posted )'
            ,   createActivityTable = 'CREATE TABLE IF NOT EXISTS ACTIVITYTABLE (activity_id INTEGER PRIMARY KEY, user_id, route_id, date_time_start, date_time_stop ,ellased_time, km_travelled, number_of_marker, is_posted)'
            ,   createGPSTable      = 'CREATE TABLE IF NOT EXISTS GPSTABLE (gps_activity INTEGER PRIMARY KEY, activity_id, date, gps_lat, gps_long, is_posted)'
            ,   insert              = 'INSERT INTO USERTABLE (user_name, password, first_name, family_name, user_work_number) VALUES ("testuser","testuser","ifty","alam","9829055")';

            // app.ajaxCall('GET','getUsers',null, function(userdataAPI) {
            //     console.log(userdataAPI.users);
            //     if (userdataAPI != null && userdataAPI.users !=undefined && userdataAPI != 'ajaxError') {
            //         console.log("hi");
            //     }
            // })

            app.db.transaction(function (tx) {
                tx.executeSql(createUserTabel);
                tx.executeSql(createQuickMarker);
                tx.executeSql(createRouteTable);
                tx.executeSql(createActivityTable);
                tx.executeSql(createGPSTable);
                //tx.executeSql(insert);
            });

        } else {
            app.db = openDatabase("Dream_App", "1.0", "Dream App", 5 * 1024 * 1024) //Create database
            var createUserTabel     = 'CREATE TABLE IF NOT EXISTS USERTABLE (user_id INTEGER PRIMARY KEY, user_name unique, password, first_name, family_name, user_work_number)'
            ,   createQuickMarker   = 'CREATE TABLE IF NOT EXISTS DAMAGETABLE(damage_id INTEGER PRIMARY KEY, user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3,mark_km,mark_ellapsed_time,is_posted)'
            ,   createRouteTable    = 'CREATE TABLE IF NOT EXISTS ROUTETABLE (route_id INTEGER PRIMARY KEY, route_N, route_description, is_posted )'
            ,   createActivityTable = 'CREATE TABLE IF NOT EXISTS ACTIVITYTABLE (activity_id INTEGER PRIMARY KEY, user_id, route_id, date_time_start, date_time_stop ,ellased_time, km_travelled, number_of_marker, is_posted)'
            ,   createGPSTable      = 'CREATE TABLE IF NOT EXISTS GPSTABLE (gps_activity INTEGER PRIMARY KEY, activity_id, date, gps_lat, gps_long, is_posted)'

            app.showLoadingFx();
            app.db.transaction(function (tx) {
                tx.executeSql(createUserTabel);
                tx.executeSql(createQuickMarker);
                tx.executeSql(createRouteTable);
                tx.executeSql(createGPSTable);
                tx.executeSql(createActivityTable);
            });
            // get user data from ajax call
            app.ajaxCall('GET','getUsers',null, function(userdataAPI) {
                console.log(userdataAPI);
                if (userdataAPI != null && userdataAPI.users !=undefined && userdataAPI != 'ajaxError') {
                    var userLength = userdataAPI.users.length
                    for (var i = 0; i < userLength; i++) {
                        var userName    = userdataAPI.users[i].user_name
                        ,   password    = userdataAPI.users[i].password
                        ,   firstName   = userdataAPI.users[i].first_name
                        ,   familyName  = userdataAPI.users[i].family_name
                        ,   number      = userdataAPI.users[i].user_work_number

                        app.insertUserdata(userName,password,firstName,familyName,number,i)
                    }
                }
            })

        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var onlineStatus = navigator.onLine ?  'online' : 'offline'
        if (onlineStatus == 'online') {
            cordova.plugins.locationAccuracy.request(onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
            function onRequestSuccess(){}
            function onRequestFailure(){}
            $('#username, #pass, .submit').removeAttr('disabled')
            app.receivedEvent('deviceready');
        } else {
            alert("It's seems that you are not connected with internet. Please make sure that you have an active internet");
            $('#username, #pass, .submit').attr('disabled',true)
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        app.apiEvents();
        // app.gpsTracker();
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
            quality: 10,
            destinationType: destinationType.FILE_URI,
            saveToPhotoAlbum: false,
            correctOrientation: true,
            targetWidth: 1200,
            targetHeight:1200
        });
    },
    addMorePic: function(count) {
        var pictureSource   = navigator.camera.PictureSourceType // picture source
        ,   destinationType = navigator.camera.DestinationType; // sets the format of returned value

        function cameraSuccess(imageData) {
            $('.show-more').append('<img src=data:image/jpeg;base64,'+imageData+' class="countimg-'+count+'" width="100px" height="100px">');
        }
        function cameraError(message) {
            alert(errorMsg);
        }
        navigator.camera.getPicture(cameraSuccess, cameraError,{
            quality: 10,
            destinationType: destinationType.DATA_URL,
            saveToPhotoAlbum: false,
            correctOrientation: true,
            targetWidth: 500,
            targetHeight:500
        });
    },
    gpsCurrent: function(tracker) {
        var options = {
            enableHighAccuracy: true
        }
        var watchId     = navigator.geolocation.getCurrentPosition(onSuccess,onError,options)
        var   latitude    = ''
        ,   longitude   = ''
        ,   accuracy    = ''
        ,   address     =  '';

        function onSuccess(position) {
            latitude  = position.coords.latitude
            longitude = position.coords.longitude
            accuracy  = position.coords.accuracy

            if (tracker == true) {
                localStorage.setItem("LS_Tracker_Lat", latitude)
                localStorage.setItem("LS_Tracker_Long", longitude)
            }

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
                        $('.metadata address').text(results[0].formatted_address);
                    }
                }else{
                    //alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }
    },

    apiEvents: function() {
        $('.modal').modal();
        var count = 0;

        // quick marker button
        $('.quick-maker').on('click', function() {
            // reset confirm page
            $('.close-screen').attr('data-close','outerClose');
            $('.lat span, .long span, .accu span, address').text('');
            $('.status a').removeClass('active');
            $('.show-more').find('img').remove();
            $('#textarea1').val(' ')
            $('.add-pic').removeClass('disabled');

            // TODO: uncoment
            // app.openCamera();

            $('.first-selection, .route').hide();
            $('.status li a').removeClass('active')
            $('.confirm').show();

            app.gpsCurrent();
            app.confirmMetadata();

            $('.mark-damage').attr('data-markbtn','outerBtn');
            $('.map-back').attr('data-markbtn','outerBack');
        })
        $('.close-screen').on('click', function() {

            if($(this).attr('data-close') == 'innerClose') {
                $('.confirm').hide();
                $('.route').show();
            } else {
                $('.confirm').hide();
                $('.first-selection').show();
                $('.lat span, .long span, .accu span, address').text('');
                $('.status a').removeClass('active');
                $('.show-more').find('img').remove();
                $('#textarea1').val(' ')
                $('.add-pic').removeClass('disabled');
            }

        });
        $('.inner-quick-maker').on('click', function() {
            // app.openCamera();

            // // TODO: to to be removed
            //
            $('.first-selection, .route').hide();
            $('.status li a').removeClass('active')
            $('.confirm').show();


            app.gpsCurrent();
            // $('.confirm').show()
            app.confirmMetadata();
            $('.lat span, .long span, .accu span, address').text('');
            $('.status a').removeClass('active');
            $('.show-more').find('img').remove();
            $('#textarea1').val(' ')
            $('.add-pic').removeClass('disabled');
            $('.close-screen').attr('data-close','innerClose');
            $('.mark-damage').attr('data-markbtn','innerBtn');
            $('.map-back').attr('data-markbtn','innerBack');
        })
        $('.map-back').on('click', function() {
            var _thisAttr      = $(this).attr('data-markbtn');

            app.openCamera();
            app.gpsCurrent();
            // $('.confirm').show()
            app.confirmMetadata();
            $('.lat span, .long span, .accu span, address').text('');
            $('.status a').removeClass('active');
            $('.show-more').find('img').remove();
            $('#textarea1').val(' ')
            $('.add-pic').removeClass('disabled');

            if (_thisAttr == 'innerBack') {
                $('.mark-damage').attr('data-markbtn','innerBtn');
            } else if (_thisAttr == 'outerBack') {
                $('.mark-damage').attr('data-markbtn','outerBtn');
            } else {
                // do nothing
            }
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
            // console.log(itsDataMarkBtn);
            e.preventDefault();

            var userID          = $('.userid').text()
            ,   date            = $('.date').text()
            ,   time            = $('.time').text()
            ,   latitide        = $('.lat span').text()
            ,   longitude       = $('.long span').text()
            ,   accuracy        = $('.accu span').text()
            ,   address         = $('address').text()
            ,   note            = $('#textarea1').val()
            ,   status          = $('.status li a.active').attr('data-status')
            ,   img             = $('.damg-img img').attr('src')
            ,   base64Image     = ''
            ,   dataTime        = date + ' ' + time
            ,   gps_find        = latitide + ',' + longitude + ',' + accuracy
            ,   thumbnailImg1   = $('.countimg-0').attr('src')
            ,   thumbnailImg2   = $('.countimg-1').attr('src')
            ,   thumbnailImg3   = $('.countimg-2').attr('src')
            ,   selectActivity  = 'SELECT * FROM ACTIVITYTABLE ORDER BY activity_id DESC LIMIT 1'
            ,   dateToPost
            ,   postDate        = date.split('-')
            // todo remove userid
            //,   userID = 1
            ,   damagaeFormField = {}
            ,   postDamageData
            ,   gpsFormField = {}
            ,   postGPSData

            postMonth  = postDate[1]
            if (postMonth.length == 1) {
                postMonth = '0'+postMonth
            } else {
                postMonth = postMonth
            }
            dateToPost = postDate[2]+'-'+postMonth+'-'+postDate[0]+' '+ time+':'+'00';

            if (thumbnailImg1 == undefined) {
                // console.log("!");
                thumbnailImg1 = 'null'
            }
            if (thumbnailImg2 == undefined) {
                thumbnailImg2 = 'null'
            }
            if (thumbnailImg3 == undefined) {
                thumbnailImg3 = 'null'

            }
            if (status == undefined) {
                status = 'null'
            }
            var dummyimage = ''
            // console.log(dummyimage);
            // console.log(thumbnailImg3);
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

            // TODO: uncoment getDataURL

            // getDataURL(img, function(base64URL) {
                if (userID != null && userID != undefined && userID != '') {
                    var insertQuery     = 'INSERT INTO DAMAGETABLE (user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3,mark_km,mark_ellapsed_time, is_posted) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                    ,   insertGPSQuery  = 'INSERT INTO GPSTABLE (activity_id, date, gps_lat, gps_long,is_posted) VALUES (?,?,?,?,?)'
                    // 'INSERT INTO USERTABLE (user_name, password, first_name, family_name, user_work_number) VALUES ("iftakhar","123456789","ifty","alam","9829055")';

                    if(itsDataMarkBtn == 'outerBtn') {
                        app.db.transaction(function(tx) {
                            tx.executeSql( insertQuery ,[userID,null,dataTime,gps_find,address,note,'base64URL',status,thumbnailImg1,thumbnailImg2,thumbnailImg3,null,null,null], function() {

                                // damage form data for post
                                damagaeFormField ["user_id"]          = userID
                                damagaeFormField ["activity_id"]      = null
                                damagaeFormField ["date_time"]        = dateToPost
                                // TODO:  remove  00 cordinates
                                // damagaeFormField ["gps_find"]         = gps_find

                                damagaeFormField ["gps_find"]           = '00'
                                damagaeFormField ["address"]            = address
                                damagaeFormField ["notes"]              = note
                                damagaeFormField ["img_name"]           = 'base64URL'
                                damagaeFormField ["maintenance_status"] = status
                                damagaeFormField ["img_optional_1"]     = thumbnailImg1
                                damagaeFormField ["img_optional_2"]     = thumbnailImg2
                                damagaeFormField ["img_optional_3"]     = thumbnailImg3
                                damagaeFormField ["mark_km"]            = "null"
                                damagaeFormField ["mark_ellapsed_time"]  = "null"

                                // postDamageData   = JSON.stringify(damagaeFormField)
                                // console.log(postDamageData);

                                var array = []
                                array.push(damagaeFormField)
                                postDamageData  = JSON.stringify(array)

                                app.ajaxCall('POST','damage',postDamageData, function(resp) {
                                //    console.log(resp);
                                    if (resp == "ajaxError") {
                                        // console.log("HI");
                                            // console.log('hi');
                                        var selectLastDamageID = 'SELECT damage_id FROM DAMAGETABLE ORDER BY damage_id DESC LIMIT 1'
                                        app.db.transaction(function(tx1){
                                            tx1.executeSql( selectLastDamageID, [], function(transaction, results) {
                                                // console.log(results);
                                                if (results.rows.length > 0) {
                                                    var lastID       =  results.rows.item(0).damage_id
                                                    ,   updatePostedValue =  'UPDATE DAMAGETABLE SET is_posted = ? WHERE damage_id = "' +lastID+'"'
                                                    tx1.executeSql( updatePostedValue, [true], function() {
                                                        $('.refresh').css({
                                                            'display': 'block'
                                                        })
                                                    })
                                                }
                                            })
                                        })
                                    }
                                })

                                $('.confirm').hide();
                                $('.first-selection').show();
                            });
                        });
                    } else if (itsDataMarkBtn == 'innerBtn') {
                        // console.log('i');
                        app.db.transaction(function(tx){
                            tx.executeSql( selectActivity, [], function(transaction, results) {
                                if (results.rows.length > 0) {
                                    var activityID    = results.rows.item(0).activity_id
                                    ,   ellapsedTime  = $('#time2').text()
                                    // TODO: remove baseURL quotes
                                    tx.executeSql( insertQuery, [userID,activityID,dataTime,gps_find,address,note,'base64URL',status,thumbnailImg1,thumbnailImg2,thumbnailImg3,'null',ellapsedTime,null], function() {

                                        // damage form data for post
                                        damagaeFormField ["user_id"]          = userID
                                        damagaeFormField ["activity_id"]      = activityID
                                        damagaeFormField ["date_time"]        = dateToPost
                                        // TODO:  remove  00 cordinates
                                        // damagaeFormField ["gps_find"]         = gps_find

                                        damagaeFormField ["gps_find"]           = '00'
                                        damagaeFormField ["address"]            = address
                                        damagaeFormField ["notes"]              = note
                                        damagaeFormField ["img_name"]           = 'base64URL'
                                        damagaeFormField ["maintenance_status"] = status
                                        damagaeFormField ["img_optional_1"]     = thumbnailImg1
                                        damagaeFormField ["img_optional_2"]     = thumbnailImg2
                                        damagaeFormField ["img_optional_3"]     = thumbnailImg3
                                        damagaeFormField ["mark_km"]            = "null"
                                        damagaeFormField ["mark_ellapsed_time"]  = ellapsedTime

                                        // postDamageData   = JSON.stringify(damagaeFormField)
                                        // console.log(postDamageData);

                                        var array = []
                                        array.push(damagaeFormField)
                                        postDamageData  = JSON.stringify(array)

                                        app.ajaxCall('POST','damage',postDamageData, function(resp) {
                                            console.log(resp);
                                            if (resp == "ajaxError") {
                                                var selectLastDamageID = 'SELECT damage_id FROM DAMAGETABLE ORDER BY damage_id DESC LIMIT 1'
                                                app.db.transaction(function(tx1){
                                                    tx1.executeSql( selectLastDamageID, [], function(transaction, results) {
                                                        if (results.rows.length > 0) {
                                                            var lastID       =  results.rows.item(0).damage_id
                                                            ,   updatePostedValue =  'UPDATE DAMAGETABLE SET is_posted = ? WHERE damage_id = "' +lastID+'"'
                                                            tx1.executeSql( updatePostedValue, [true], function() {
                                                                $('.refresh').css({
                                                                    'display': 'block'
                                                                })
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        })

                                        //  gps data  enter into GPSTABLE
                                        tx.executeSql( insertGPSQuery, [activityID,dataTime,latitide,longitude,null], function() {

                                            gpsFormField ["activity_id"]    = activityID
                                            gpsFormField ["date"]           = dateToPost
                                            gpsFormField ["gps_lat"]        = latitide
                                            gpsFormField ["gps_long"]       = longitude

                                            // postGPSData   = JSON.stringify(gpsFormField)
                                            // console.log(postGPSData);

                                            var array = []
                                            array.push(gpsFormField)
                                            postGPSData  = JSON.stringify(array)

                                            app.ajaxCall('POST','gps',postGPSData, function(resp) {
                                                if (resp == "ajaxError") {
                                                    var selectLastID = 'SELECT gps_activity FROM GPSTABLE ORDER BY gps_activity DESC LIMIT 1'
                                                    app.db.transaction(function(tx1){
                                                        tx1.executeSql( selectLastID, [], function(transaction, results) {
                                                            if (results.rows.length > 0) {
                                                                var lastID       =  results.rows.item(0).gps_activity
                                                                ,   updatePostedValue =  'UPDATE GPSTABLE SET is_posted = ? WHERE gps_activity = "' +lastID+'"'
                                                                tx1.executeSql( updatePostedValue, [true], function() {
                                                                    $('.refresh').css({
                                                                        'display': 'block'
                                                                    })
                                                                })
                                                            }
                                                        })
                                                    })
                                                }
                                            })
                                        })
                                        var selectQuery     = 'SELECT * FROM DAMAGETABLE WHERE activity_id = '+activityID+''
                                        tx.executeSql( selectQuery, [], function(transaction, results) {
                                            if( results.rows.length > 0 ) {
                                                $('#time2').stopwatch().stopwatch('toggle');
                                                $('#time2').stopwatch().stopwatch('reset').stopwatch('start');
                                                var markedDamages = results.rows.length;
                                                $('.damages p').text(markedDamages);
                                            } else {
                                                $('.damages p').text('0');
                                            }
                                            $('.first-selection').hide();
                                            $('.confirm').hide();
                                            $('.route').show();
                                        })
                                    });
                                }
                            })
                        })
                        app.distanceGps(latitide,longitude)
                    } else {
                        // do nothing
                    }
                }
            // });
        })

        //ordinary button route selection page shown
        $('.ordinary-btn').on('click', function() {
            $('.first-selection, .confirm').hide();
            $('.route-selection').show();
        });
        $('.route-container .selections-btn').on('click', function() {
            var _this           = $(this)
            ,   routeId        = _this.attr('data-id')
            $('.start-activity').attr('data-routeid',routeId);
        });

        $('.start-activity').on('click', function() {
            var date = new Date()
            ,   cdate    = date.getDate()
            ,   cmonth   = date.getMonth()
            ,   cyear    = date.getFullYear()
            ,   chours   = date.getHours()
            ,   cmin     = date.getMinutes()
            ,   csec     = date.getSeconds()
            ,   currentDate = cdate + '/' + cmonth + '/' + cyear +'|' + chours + ':' + cmin +':' + csec
            // console.log(currentDate);
            localStorage.setItem('LS_StartTime', currentDate);

            // app.gpsTracker();

            var routeNumber         = $(this).attr('data-routeid')
            ,   insertQuery         = 'INSERT INTO ROUTETABLE (route_N, route_description,is_posted) VALUES(?,?,?)'
            ,   date                = new Date()
            ,   dates               = date.getDate()
            ,   month               = date.getMonth() + 1
            ,   year                = date.getFullYear()
            ,   formatedDate        = dates + "/" + month + "/" + year
            ,   hours               = date.getHours()
            ,   min                 = date.getMinutes()
            ,   formatedTime        = hours + ":" + min
            ,   currentDate         = formatedDate
            ,   currentTime         = formatedTime
            ,   insertActivityQuery = 'INSERT INTO ACTIVITYTABLE (user_id,route_id,date_time_start, date_time_stop, ellased_time, km_travelled, number_of_marker, is_posted) VALUES(?,?,?,?,?,?,?,?)'
            ,   userID              = localStorage.getItem('LS_userId')
            ,   selectLastRoute     = 'SELECT route_N FROM ROUTETABLE ORDER BY route_id DESC LIMIT 1 '
            ,   activityStartDate   = localStorage.getItem('LS_StartTime')
            ,   routeFormFields = {}
            ,   postRouteData
            // console.log(year);
            // console.log(routeId);

            // insert query for selected route
            // console.log(routeNumber);

            app.db.transaction(function(tx){
                tx.executeSql( insertQuery ,[routeNumber,null,null], function() {

                    // post route data (route id & route desc)
                    routeFormFields ["route_n"]            = routeNumber
                    routeFormFields ["route_description"]  = "null"

                    // postRouteData   = JSON.stringify(routeFormFields)
                    //console.log(postRouteData);
                    var array = []
                    array.push(routeFormFields)
                    postRouteData  = JSON.stringify(array)

                    app.ajaxCall('POST','route',postRouteData, function(resp) {
                        // console.log(resp);
                        if (resp == 'ajaxError') {
                            // console.log('hi');
                            var selectLastRouteID = 'SELECT route_id FROM ROUTETABLE ORDER BY route_id DESC LIMIT 1'
                            app.db.transaction(function(tx1){
                                tx1.executeSql( selectLastRouteID, [], function(transaction, results) {
                                    if (results.rows.length > 0) {
                                        var lastRouteID       =  results.rows.item(0).route_id
                                        ,   updatePostedValue =  'UPDATE ROUTETABLE SET is_posted = ? WHERE route_id = "' +lastRouteID+'"'
                                        tx1.executeSql( updatePostedValue, [true], function() {
                                            $('.refresh').css({
                                                'display': 'block'
                                            })
                                        })
                                    }
                                })
                            })
                        }
                    })

                    tx.executeSql( selectLastRoute, [], function(transaction, results) {
                        if (results.rows.length > 0) {
                            var activity_route_id  = results.rows.item(0).route_N
                            tx.executeSql( insertActivityQuery ,[userID,activity_route_id,activityStartDate,null,null,null,null,null], function() {
                                activityFormField ["user_id"]           = userID
                                activityFormField ["route_id"]          = activity_route_id
                                activityFormField ["date_time_start"]   = activityStartDate

                                // console.log(activityFormField);

                                var selectActivity  = 'SELECT * FROM ACTIVITYTABLE ORDER BY activity_id DESC LIMIT 1'

                                tx.executeSql( selectActivity, [], function(transaction, results) {
                                    if (results.rows.length > 0) {
                                        var activityID  = results.rows.item(0).activity_id
                                        ,   selectQuery         = 'SELECT * FROM DAMAGETABLE WHERE activity_id = "' +activityID+'"'


                                        tx.executeSql( selectQuery, [], function(transaction, results) {
                                            //  console.log(results);
                                            if( results.rows.length > 0 ) {
                                                var markedDamages = results.rows.length;
                                                $('.damages p').text(markedDamages);
                                            } else {
                                                $('.damages p').text('0');
                                            }
                                        });

                                        app.gpsTracker(activityID, null);
                                    }
                                })
                            });
                        }
                    })
                });
            });
            $('.route-selection').hide();
            $('#modal1').modal('close');
            $('.route').show();
            $('.route-number').text(routeNumber);
            $('.route-time .date-routen').text(formatedDate);
            $('.route-time time').text(formatedTime)
            // app.startTimer(true);
            $('#time, #time2').stopwatch().stopwatch('reset').stopwatch('start');

            app.runningClock();

            var options = {
                enableHighAccuracy: true
            }
            navigator.geolocation.getCurrentPosition(onSuccess,onError,options)
            var latitude    = ''
            ,   longitude   = '';

            function onSuccess(position) {
                latitude  = position.coords.latitude
                longitude = position.coords.longitude

                localStorage.setItem('DS_LAT',latitude)
                localStorage.setItem('DS_LONG',longitude)
                // app.distanceGps()
            }
            function onError(error) {
                alert(error.message)
            }
        });

        $('.back-to-route').on('click', function() {
            $('.map').hide();
            $('.first-selection').show();
        });

        //add more pic button
        $('.add-pic').on('click', function(e) {
            e.preventDefault();
            if (count <= 2 ) {
                app.addMorePic(count);
                // $('.show-more').append('')
                if (count == 2) {
                    $(this).addClass('disabled');
                }
            } else {
                $(this).addClass('disabled');
            }
            count ++;
        });

        $('.btn.marker').on('click', function(e) {
            e.preventDefault();
            var showListQuery = 'SELECT DAMAGETABLE.user_id, ACTIVITYTABLE.route_id,DAMAGETABLE.date_time, DAMAGETABLE.mark_ellapsed_time, DAMAGETABLE.mark_km, DAMAGETABLE.img_name, DAMAGETABLE.gps_find, DAMAGETABLE.address, DAMAGETABLE.maintenace_staus FROM DAMAGETABLE LEFT JOIN ACTIVITYTABLE ON DAMAGETABLE.activity_id= ACTIVITYTABLE.activity_id ORDER BY DAMAGETABLE.damage_id DESC '
            var locationArray = []


            app.db.transaction(function(tx) {
                tx.executeSql( showListQuery, [], function(transaction, results) {
                    if (results.rows.length > 0) {
                        localStorage.setItem('LS_length', results.rows.length)
                        for (var i = 0; i < results.rows.length; i++) {
                            var row             = results.rows.item(i)
                            ,   dateTime        = row.date_time
                            ,   kmTravelled     = row.mark_km
                            ,   img             = row.img_name
                            ,   address         = row.address
                            ,   gps             = row.gps_find.split(',')
                            ,   lat             = gps[0]
                            ,   long            = gps[1]

                            var locationObject = {}
                            locationObject ["lat"]      = lat
                            locationObject ["long"]     = long
                            locationObject ["address"]  = address
                            locationObject ["km"]       = kmTravelled
                            locationObject ["time"]     = dateTime
                            locationObject ["img"]      = img

                            locationArray.push(locationObject)
                        }
                    } else {
                        alert('No marked damages yet.Please mark the damges first');
                    }
                    // console.log(locationArray);
                    var directionsService = new google.maps.DirectionsService();
                    directionsDisplay = new google.maps.DirectionsRenderer({map:map,  suppressMarkers: false});
                    // directionsDisplay = new google.maps.DirectionsRenderer();
                    var map = new google.maps.Map(document.getElementById('googleMap'), {
                        zoom: 4,
                        center: new google.maps.LatLng(lat,long),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });

                    directionsDisplay.setMap(map);
                    var request = {
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    var infowindow = new google.maps.InfoWindow();
                    var marker, i;

                    // setTimeout(function() {
                    for (i = 0; i < locationArray.length; i++) {
                        marker = new google.maps.Marker({
                            position: new google.maps.LatLng(locationArray[i].lat, locationArray[i].long),
                            map: map
                        });

                        google.maps.event.addListener(marker, 'click', (function(marker, i) {
                            return function() {
                                var infoContentHTML = '<div id="infowindow"> <figure class="col s4"> <img src="'+locationArray[i].img+'" class="responsive-img" alt=""> </figure> <article class="content-map col s8"> <div><span class="bold">Address</span> <span>'+locationArray[i].address+'</span></div> <div><span class="bold">Time</span> <span>'+locationArray[i].time+'</span></div> </article> </div>'
                                infowindow.setContent(infoContentHTML);
                                infowindow.open(map, marker);
                            }
                        })(marker, i))
                        // if (i == 0) request.origin = marker.getPosition();
                        // else if (i == locationArray.length - 1) request.destination = marker.getPosition();
                        // else {
                        //     if (!request.waypoints) request.waypoints = [];
                        //     request.waypoints.push({
                        //         location: marker.getPosition(),
                        //         stopover: false
                        //     });
                        // }
                        // directionsService.route(request, function(result, status) {
                        //     if (status == google.maps.DirectionsStatus.OK) {
                        //         directionsDisplay.setDirections(result);
                        //     }
                        // });
                    }
                    var length = localStorage.getItem('LS_length')
                    if (length > 0) {
                        $('.first-selection').hide();
                        $('.map').show();
                    } else {
                        $('.first-selection').show();
                        $('.map').hide();
                    }
                });
            });
        })

        $('.map-back').on('click', function() {
            $('.map').hide();
            $('.route').show();
        });

        $('.stop-activity').on('click', function() {
            var currentTime  = localStorage.getItem('LS_StartTime');

            var boolean  =   confirm("Are you sure. You want to stop activity?");

            app.gpsTracker(null,true);

            //console.log(boolean);
            if (boolean) {
                var routeId         = $('.route-number').text()
                ,   startTime       = $('.route-time').text()
                ,   kmTravelled     = $('.distance').text()
                ,   noOfMarker      = $('.damages p').text()
                ,   userName        = $('.route .username').text()
                ,   ellased_time    = $('#time').text()
                ,   user_id         = localStorage.getItem('LS_userId')
                ,   selectActivity  = 'SELECT * FROM ACTIVITYTABLE ORDER BY activity_id DESC LIMIT 1'

                app.db.transaction(function(tx) {
                    tx.executeSql( selectActivity, [], function(transaction, results) {
                        if (results.rows.length > 0) {
                            var activityID  = results.rows.item(0).activity_id

                            var updateQuery     = 'UPDATE ACTIVITYTABLE SET date_time_stop = ?, ellased_time = ?, km_travelled = ?, number_of_marker = ? WHERE activity_id = "' +activityID+'"'

                            tx.executeSql( updateQuery ,[startTime,ellased_time,kmTravelled,noOfMarker], function() {

                                activityFormField ["date_time_stop"]    = startTime
                                activityFormField ["ellased_time"]      = ellased_time
                                activityFormField ["km_travelled"]      = kmTravelled
                                activityFormField ["number_of_marker"]  = noOfMarker

                                var array = []
                                array.push(activityFormField)
                                postActivityData  = JSON.stringify(array)
                                // console.log(array);
                                app.ajaxCall('POST','activity',postActivityData, function(resp) {
                                    if (resp == "ajaxError") {
                                        console.log(resp);
                                        var selectLastID = 'SELECT activity_id FROM ACTIVITYTABLE ORDER BY activity_id DESC LIMIT 1'
                                        app.db.transaction(function(tx1){
                                            tx1.executeSql( selectLastID, [], function(transaction, results) {
                                                if (results.rows.length > 0) {
                                                    var lastID       =  results.rows.item(0).activity_id
                                                    ,   updatePostedValue =  'UPDATE ACTIVITYTABLE SET is_posted = ? WHERE activity_id = "'+lastID+'"'
                                                    tx1.executeSql( updatePostedValue, [true], function() {
                                                        console.log("jk");
                                                        $('.refresh').css({
                                                            'display': 'block'
                                                        })
                                                    })
                                                }
                                            })
                                        })
                                    }
                                })
                            });
                        }
                    })
                })
                $('.route').hide();
                $('.first-selection').show();
                $('#time,#time2').stopwatch().stopwatch('toggle')

                $('#time, #time2').text('00:00:00')
                $('distance').text('')
                // app.startTimer(false)
                // console.log(user_id);
            } else {

            }
        });

        // list view

        $('.btn.list').on('click', function(e) {
            e.preventDefault();

            var showListQuery = 'SELECT DAMAGETABLE.user_id, ACTIVITYTABLE.route_id,DAMAGETABLE.date_time, DAMAGETABLE.mark_ellapsed_time, DAMAGETABLE.mark_km, DAMAGETABLE.img_name, DAMAGETABLE.gps_find, DAMAGETABLE.address, DAMAGETABLE.maintenace_staus FROM DAMAGETABLE LEFT JOIN ACTIVITYTABLE ON DAMAGETABLE.activity_id= ACTIVITYTABLE.activity_id ORDER BY DAMAGETABLE.damage_id DESC '
            ,   listBody =''
            ,   userName        = localStorage.getItem('LS_Auth')
            app.db.transaction(function(tx) {
                tx.executeSql( showListQuery, [], function(transaction, results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var row             = results.rows.item(i)
                            ,   routeNumber     = row.route_id
                            ,   dateTime        = row.date_time
                            ,   kmTravelled     = row.mark_km
                            ,   ellapsed        = row.mark_ellapsed_time
                            ,   img             = row.img_name
                            ,   gps             = row.gps_find
                            ,   address         = row.address
                            ,   maintenaceStatus = row.maintenace_staus

                            // console.log(routeNumber);
                            listBody = listBody +  '<tr> <td> <img src="'+img+'" width="100px" height="100px" alt=""> </td><td>'+userName+'</td><td>'+routeNumber+'</td><td>'+dateTime+'</td><td>'+kmTravelled+'km</td><td>'+ellapsed+'</td><td>'+address+'</td><td> '+maintenaceStatus+' </td></tr>'
                        }
                        // console.log(listBody);
                        $('#list tbody').html(listBody)
                        // console.log(results);
                    } else {
                        alert('Sorry no damages marked yet');
                        $('#list').modal('close');
                    }
                })
            })
        })

        //offline sync data
        $('.refresh').on('click', function(e) {
            e.preventDefault();
            var onlineStatus = navigator.onLine ?  'online' : 'offline';
            if (onlineStatus == 'online') {
                //console.log("j");
                //fetched data from route table
                var selectQuery         = 'SELECT * FROM ROUTETABLE WHERE is_posted = "true"'
                ,   damageQuery         = 'SELECT * FROM DAMAGETABLE WHERE is_posted = "true"'
                ,   GPSQuery            = 'SELECT * FROM GPSTABLE WHERE is_posted = "true"'
                ,   activityQuery       = 'SELECT * FROM ACTIVITYTABLE WHERE is_posted = "true"'
                ,   offlineRouteData    = {}
                ,   offlineRouteArray   = []
                ,   offlineDamageData   = {}
                ,   offlineDamageArray  = []
                ,   offlineGPSData      = {}
                ,   offlineGPSArray     = []
                ,   offlineActivityData = {}
                ,   offlineActivityArray= []

                app.db.transaction(function(tx) {
                    //route offline data
                    tx.executeSql( selectQuery, [], function(transaction, results) {
                        // console.log(results);
                        if( results.rows.length > 0 ) {
                            for (var i = 0; i < results.rows.length; i++) {
                                offlineRouteData    = {}
                                var routeN      = results.rows.item(i).route_N
                                ,   routeDesc   = results.rows.item(i).route_description

                                //console.log(routeN);
                                offlineRouteData["route_n"]             = routeN
                                offlineRouteData["route_description"]   = 'null'
                                // var array = []
                                offlineRouteArray.push(offlineRouteData)
                            }
                            // offlineRouteArray.push(offlineRouteArray)
                            //console.log(offlineRouteArray);
                            var offlineString  = JSON.stringify(offlineRouteArray)

                            app.ajaxCall('POST','route',offlineString, function(resp) {
                                if (resp != "ajaxError") {
                                    console.log(resp);
                                    var updatePostedColumn = 'UPDATE ROUTETABLE SET is_posted = ? WHERE is_posted = "true"';
                                    //    console.log(updatePostedColumn);
                                    app.db.transaction(function(tx2) {
                                        tx2.executeSql( updatePostedColumn, [null], function() {})
                                    })
                                }
                            })
                        }
                    })
                    //damage offline data

                    tx.executeSql( damageQuery, [], function(transaction, results) {
                        // console.log(results);
                        if( results.rows.length > 0 ) {
                            //[userID,null,dataTime,gps_find,address,note,'base64URL',status,thumbnailImg1,thumbnailImg2,thumbnailImg3,null,null,null]
                            for (var i = 0; i < results.rows.length; i++) {
                                offlineDamageData    = {}
                                var userID           = results.rows.item(i).user_id
                                ,   activityID       = results.rows.item(i).activity_id
                                ,   dateTime         = results.rows.item(i).date_time
                                ,   gpsFind          = results.rows.item(i).gps_find
                                ,   address          = results.rows.item(i).address
                                ,   notes            = results.rows.item(i).notes
                                ,   base64URL        = results.rows.item(i).img_name
                                ,   status           = results.rows.item(i).maintenace_staus
                                ,   thumbnailImg1    = results.rows.item(i).img_optional_1
                                ,   thumbnailImg2    = results.rows.item(i).img_optional_2
                                ,   thumbnailImg3    = results.rows.item(i).img_optional_3
                                ,   markKM           = results.rows.item(i).mark_km
                                ,   markEllapsed     = results.rows.item(i).mark_ellapsed_time

                                // damage form data for post
                                offlineDamageData ["user_id"]             = userID
                                offlineDamageData ["activity_id"]         = activityID
                                offlineDamageData ["date_time"]           = dateTime
                                offlineDamageData ["gps_find"]            = gpsFind
                                offlineDamageData ["address"]             = address
                                offlineDamageData ["notes"]               = notes
                                offlineDamageData ["img_name"]            = base64URL
                                offlineDamageData ["maintenance_status"]  = status
                                offlineDamageData ["img_optional_1"]      = thumbnailImg1
                                offlineDamageData ["img_optional_2"]      = thumbnailImg2
                                offlineDamageData ["img_optional_3"]      = thumbnailImg3
                                offlineDamageData ["mark_km"]             = markKM
                                offlineDamageData ["mark_ellapsed_time"]  = markEllapsed

                                offlineDamageArray.push(offlineDamageData)
                            }
                            var offlineString1  = JSON.stringify(offlineDamageArray);
                            //    console.log(offlineString1);
                            app.ajaxCall('POST','damage',offlineString1, function(resp) {
                                if (resp != "ajaxError") {
                                    console.log(resp);
                                    var updatePostedColumn = 'UPDATE DAMAGETABLE SET is_posted = ? WHERE is_posted = "true"';
                                    app.db.transaction(function(tx2) {
                                        tx2.executeSql( updatePostedColumn, [null], function() {})
                                    })
                                }
                            })
                        }
                    })

                    // offline gps data
                    tx.executeSql( GPSQuery, [], function(transaction, results) {
                        // console.log(results);
                        if( results.rows.length > 0 ) {

                            for (var i = 0; i < results.rows.length; i++) {
                                offlineGPSData    = {}
                                var activityID    = results.rows.item(i).activity_id
                                ,   date          = results.rows.item(i).date
                                ,   GPSLat        = results.rows.item(i).gps_lat
                                ,   GPSLong       = results.rows.item(i).gps_long


                                // GPS form data for post
                                offlineGPSData ["activity_id"]  = activityID
                                offlineGPSData ["date"]         = date
                                offlineGPSData ["gps_lat"]      = GPSLat
                                offlineGPSData ["gps_long"]     = GPSLong


                                offlineGPSArray.push(offlineGPSData)
                            }
                            var offlineString2  = JSON.stringify(offlineGPSArray);
                            // console.log(offlineString2);
                            app.ajaxCall('POST','gps',offlineString2, function(resp) {
                                if (resp != "ajaxError") {
                                    console.log(resp);
                                    var updatePostedColumn = 'UPDATE GPSTABLE SET is_posted = ? WHERE is_posted = "true"';
                                    app.db.transaction(function(tx2) {
                                        tx2.executeSql( updatePostedColumn, [null], function() {})
                                    })
                                }
                            })
                        }
                    })

                    // activity offline data
                    tx.executeSql( activityQuery, [], function(transaction, results) {
                        // console.log(results);
                        if( results.rows.length > 0 ) {

                            for (var i = 0; i < results.rows.length; i++) {
                                offlineActivityData    = {}
                                var userId      = results.rows.item(i).user_id
                                ,   routeId     = results.rows.item(i).route_id
                                ,   dateStart   = results.rows.item(i).date_time_start
                                ,   dateStop    = results.rows.item(i).date_time_stop
                                ,   ETime       = results.rows.item(i).ellased_time
                                ,   kmTravelled = results.rows.item(i).km_travelled
                                ,   noOfMarker  = results.rows.item(i).number_of_marker

                                // activity form data for post
                                offlineActivityData ["user_id"]           = userId
                                offlineActivityData ["route_id"]          = routeId
                                offlineActivityData ["date_time_start"]   = dateStart
                                offlineActivityData ["date_time_stop"]    = dateStop
                                offlineActivityData ["ellased_time"]      = ETime
                                offlineActivityData ["km_travelled"]      = kmTravelled
                                offlineActivityData ["number_of_marker"]  = noOfMarker

                                offlineActivityArray.push(offlineActivityData)
                            }
                            var offlineString4  = JSON.stringify(offlineActivityArray);
                            console.log(offlineString4);
                            app.ajaxCall('POST','activity',offlineString4, function(resp) {
                                if (resp != "ajaxError") {
                                    console.log(resp);
                                    var updatePostedColumn = 'UPDATE ACTIVITYTABLE SET is_posted = ? WHERE is_posted = "true"';
                                    app.db.transaction(function(tx2) {
                                        tx2.executeSql( updatePostedColumn, [null], function() {})
                                    })
                                }
                            })
                        }
                    })

                    app.showLoadingFx();
                    $('.refresh').hide();
                })
            } else {
                alert('Device not connected with internet');
            }
        })
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
        ,   currentDate    =  date.getDate() + "/"  + (date.getMonth()+1) + "/" + date.getFullYear()
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
        ,   formatedDate = dates + "-" + month + "-" + year
        ,   hours        = date.getHours()
        ,   min          = date.getMinutes()
        ,   formatedTime = hours + ":" + min

        $('.metadata .date').text(formatedDate);
        $('.metadata .time').text(formatedTime);
        var localUserId     =   localStorage.getItem('LS_userId');
        // alert(localUserId);
        $('.userid').text(localUserId);
    },
    travelledDistance: function(lat,long) {
        console.log(lat,long);

        function calculateDistance(lat1, lon1, lat2, lon2)  {
            alert(lat2)
            var R = 6371; // km
            var dLat = (lat2 - lat1).toRad();
            var dLon = (lon2 - lon1).toRad();
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;

            alert(d)
            return d;
        }
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        }

        var options = {timeout:60000,enableHighAccuracy: true};

        // setInterval(function() {
        function showLocation(position) {
            var wlatitude = position.coords.latitude;
            var wlongitude = position.coords.longitude;
            var accuracy = position.coords.accuracy

            localStorage.setItem('LS_DistanceLat', wlatitude);
            localStorage.setItem('LS_DistanceLong', wlongitude);
            // alert(accuracy)
            // if (accuracy == 14) {
            //     var calculateDistance = calculateDistance(lat, long, wlatitude, wlongitude);
            //     // console.log(a);
            //     alert(calculateDistance)
            // } else if (accuracy == 12) {
            //     var calculateDistance = calculateDistance(lat, long, wlatitude, wlongitude);
            //     // console.log(a);
            //     alert(calculateDistance)
            // } else if (accuracy == 10) {
            //     var calculateDistance = calculateDistance(lat, long, wlatitude, wlongitude);
            //     // console.log(a);
            //     alert(calculateDistance)
            // }  else if (accuracy < 8) {
            //     var calculateDistance = calculateDistance(lat, long, wlatitude, wlongitude);
            //     // console.log(a);
            //     alert(calculateDistance)
            // }

            // console.log(wlatitude);
            // alert("old lat : " + lat + " old long: " + long + "/" + "Latitude : " + wlatitude + " Longitude: " + wlongitude);

            // var calculateDistance = calculateDistance(lat, long, position.coords.latitude, position.coords.longitude);
            // // console.log(a);
            // alert(calculateDistance)
            // $('.distance').text(calculateDistance)
        }
        // },60000)

        function errorHandler(err) {
            alert(err.message)
        }
        // setInterval(function() {
        //         var l1 = localStorage.getItem('LS_DistanceLat')
        //         ,   l2 = localStorage.getItem('LS_DistanceLong')
        //
        //         // alert(l1 + ":" + l2)
        //         // var cal = calculateDistance(lat, long, l1, l2);
        //         // alert(cal)
        // },30000)
        // setInterval(function() {
        var watchId = navigator.geolocation.watchPosition(showLocation,errorHandler,options)
        // },60000)

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
    },
    distanceGps: function(d1,d2) {
        // alert(d1)
        var o1 =  localStorage.getItem('DS_LAT')
        ,   o2 =  localStorage.getItem('DS_LONG')
        ,   origin = o1+','+o2
        ,   destination = d1+','+d2

        // console.log(origin);
        var previousDistance = parseInt($('.distance').text())

        // console.log(previousDistance + 2);
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins='+origin+'&destinations='+destination+'&key=AIzaSyB19sTSic7D289n7a8x4WqXTSbGGFo26vc',
            type: "GET",
            success: function(resp) {
                var distance = resp.rows[0].elements[0].distance.value
                ,   finalDistance = (distance / 1000) + previousDistance
                ,   markKM       = finalDistance.toFixed(2)
                ,   selectQuery   = 'SELECT damage_id FROM DAMAGETABLE ORDER BY damage_id DESC LIMIT 1'
                ,   updateQuery   = 'UPDATE DAMAGETABLE SET mark_km = ?'

                app.db.transaction(function(tx){
                    tx.executeSql( selectQuery, [], function(transaction, results) {
                        if (results.rows.length > 0) {
                            var damageID  = results.rows.item(0).damage_id

                            var updateQuery   = 'UPDATE DAMAGETABLE SET mark_km = ? WHERE damage_id = "' +damageID+'"'
                            tx.executeSql( updateQuery ,[markKM]);
                        }
                    })
                })
                $('.distance').text(finalDistance.toFixed(2))

            },
            error: function() {
                //  console.log('error');
                alert('Something went wrong. Your travelling distance not determined yet ');
            }
        })

        localStorage.setItem('DS_LAT',d1)
        localStorage.setItem('DS_LONG',d2)

    },


    // ajax call
    ajaxCall:     function(methodType, apiURL, sendData, callback) {
        setTimeout(function() {
            var onlineStatus = navigator.onLine ?  'online' : 'offline'
            // if (onlineStatus == 'online') {
                $.ajax({
                    method: methodType,
                    url: ''+app.baseURL+apiURL,
                    headers : {'Content-Type' : 'application/json'},
                    data    : sendData,
                    success: function(data) {
                        // alert(data)
                        console.log(data);
                        if (data != null) {
                            callback(data)
                        }
                    },
                    error: function(err) {
                        // console.log('err');
                        callback('ajaxError')
                    }
                })
            // }
        }, 1000)
    },

    // insert userdata in table from ajax call
    insertUserdata: function(userName,password,firstName,familyName,number,i) {
        var insert  = 'INSERT INTO USERTABLE (user_name, password, first_name, family_name, user_work_number) VALUES (?,?,?,?,?)';
        app.db.transaction(function(tx) {
            tx.executeSql( insert ,[userName,password,firstName,familyName,number]);
            // alert(hi)
        });
    },
    hideLoadingFx: function() { $('.overlay').hide() },
    showLoadingFx: function() {
        $('.overlay').show()
        setTimeout(function() {
            app.hideLoadingFx()
        }, 20000)
    },
    gpsTracker: function(aID,stopActivity) {
        console.log(aID);
        if (stopActivity == null) {
            trackerInterval  = setInterval(function(){ tracker() }, 10000);

            function tracker() {
                var date         = new Date()
                ,   dates        = date.getDate()
                ,   month        =  date.getMonth() + 1
                ,   year         =  date.getFullYear()
                ,   formatedDate = dates + "-" + month + "-" + year
                ,   hours        = date.getHours()
                ,   min          = date.getMinutes()
                ,   formatedTime = hours + ":" + min
                ,   dataTime     = formatedDate + " " + formatedTime

                app.gpsCurrent(true)

                var lat     = localStorage.getItem("LS_Tracker_Lat")
                ,   long    = localStorage.getItem("LS_Tracker_Long")
                ,   insertGPSQuery  = 'INSERT INTO GPSTABLE (activity_id, date, gps_lat, gps_long,is_posted) VALUES (?,?,?,?,?)'
                app.db.transaction(function(tx){
                    tx.executeSql( insertGPSQuery, [aID,dataTime,lat,long,null], function() {})
                })
            }
        } else {
            console.log(trackerInterval);
            clearInterval(trackerInterval);
        }
    }
};
