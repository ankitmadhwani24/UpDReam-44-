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
            // app.apiEvents();
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
            ,   createQuickMarker   = 'CREATE TABLE IF NOT EXISTS DAMAGETABLE(damage_id INTEGER PRIMARY KEY, user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3,mark_km,mark_ellapsed_time)'
            ,   createRouteTable    = 'CREATE TABLE IF NOT EXISTS ROUTETABLE (route_id INTEGER PRIMARY KEY, route_N, route_description )'
            ,   createActivityTable = 'CREATE TABLE IF NOT EXISTS ACTIVITYTABLE (activity_id INTEGER PRIMARY KEY, user_id, route_id, date_time_start, date_time_stop ,ellased_time, km_travelled, number_of_marker)'
            ,   createGPSTable      = 'CREATE TABLE IF NOT EXISTS GPSTABLE (gps_activity INTEGER PRIMARY KEY, activity_id, date, gps_lat, gps_long)'
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
            ,   createQuickMarker   = 'CREATE TABLE IF NOT EXISTS DAMAGETABLE(damage_id INTEGER PRIMARY KEY, user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3,mark_km,mark_ellapsed_time)'
            ,   createRouteTable    = 'CREATE TABLE IF NOT EXISTS ROUTETABLE (route_id INTEGER PRIMARY KEY, route_N, route_description )'
            ,   createActivityTable = 'CREATE TABLE IF NOT EXISTS ACTIVITYTABLE (activity_id INTEGER PRIMARY KEY, user_id, route_id, date_time_start, date_time_stop ,ellased_time, km_travelled, number_of_marker)'
            ,   createGPSTable      = 'CREATE TABLE IF NOT EXISTS GPSTABLE (gps_activity INTEGER PRIMARY KEY, activity_id, date, gps_lat, gps_long)'

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
    gpsCurrent: function() {
        var options = {
            enableHighAccuracy: true
        }
        // navigator.geolocation.getAccurateCurrentPosition(onSuccess, onError, onProgress, options);
        var watchId     = navigator.geolocation.getCurrentPosition(onSuccess,onError,options)
        // navigator.geolocation.getAccurateCurrentPosition(onSuccess, onError, onProgress, options);
        var   latitude    = ''
        ,   longitude   = ''
        ,   accuracy    = ''
        ,   address     =  '';

        // function geoprogress() {
        //     console.log("Locating");
        //     // output.innerHTML = '<p>Locating in progress</p>';
        // }

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
                        $('.metadata address').text(results[0].formatted_address);
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
            // reset confirm page
            $('.lat span, .long span, .accu span, address').text('');
            $('.status a').removeClass('active');
            $('.show-more').find('img').remove();
            $('#textarea1').val(' ')
            $('.add-pic').removeClass('disabled');

            // TODO: uncoment
            app.openCamera();

            // $('.first-selection, .route').hide();
            // $('.status li a').removeClass('active')
            // $('.confirm').show();
            // $('.confirm').show()
            app.gpsCurrent();
            app.confirmMetadata();

            $('.mark-damage').attr('data-markbtn','outerBtn');
            $('.map-back').attr('data-markbtn','outerBack');
        })
        $('.close-screen').on('click', function() {
            $('.confirm').hide();
            $('.first-selection').show();
            $('.lat span, .long span, .accu span, address').text('');
            $('.status a').removeClass('active');
            $('.show-more').find('img').remove();
            $('#textarea1').val(' ')
            $('.add-pic').removeClass('disabled');

        });
        $('.inner-quick-maker').on('click', function() {
            app.openCamera();

            // // TODO: to to be removed
            //
            // $('.first-selection, .route').hide();
            // $('.status li a').removeClass('active')
            // $('.confirm').show();


            app.gpsCurrent();
            // $('.confirm').show()
            app.confirmMetadata();
            $('.lat span, .long span, .accu span, address').text('');
            $('.status a').removeClass('active');
            $('.show-more').find('img').remove();
            $('#textarea1').val(' ')
            $('.add-pic').removeClass('disabled');
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
            // ,   userID = 1
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

            getDataURL(img, function(base64URL) {
                if (userID != null && userID != undefined && userID != '') {
                    var insertQuery     = 'INSERT INTO DAMAGETABLE (user_id, activity_id, date_time, gps_find, address, notes, img_name, maintenace_staus, img_optional_1, img_optional_2,img_optional_3,mark_km,mark_ellapsed_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)'
                    ,   insertGPSQuery  = 'INSERT INTO GPSTABLE (activity_id, date, gps_lat, gps_long) VALUES (?,?,?,?)'
                    // 'INSERT INTO USERTABLE (user_name, password, first_name, family_name, user_work_number) VALUES ("iftakhar","123456789","ifty","alam","9829055")';

                    if(itsDataMarkBtn == 'outerBtn') {
                        app.db.transaction(function(tx) {
                            tx.executeSql( insertQuery ,[userID,null,dataTime,gps_find,address,note,base64URL,status,thumbnailImg1,thumbnailImg2,thumbnailImg3,null,null], function() {

                                // damage form data for post
                                damagaeFormField ["user_id"]          = userID
                                damagaeFormField ["activity_id"]      = null
                                damagaeFormField ["date_time"]        = dateToPost
                                // TODO:  remove  00 cordinates
                                damagaeFormField ["gps_find"]         = gps_find

                                // damagaeFormField ["gps_find"]           = '00'
                                damagaeFormField ["address"]            = address
                                damagaeFormField ["notes"]              = note
                                damagaeFormField ["img_name"]           = base64URL
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
                            //        console.log(resp);
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
                                    tx.executeSql( insertQuery, [userID,activityID,dataTime,gps_find,address,note,base64URL,status,thumbnailImg1,thumbnailImg2,thumbnailImg3,'null',ellapsedTime], function() {

                                        // damage form data for post
                                        damagaeFormField ["user_id"]          = userID
                                        damagaeFormField ["activity_id"]      = activityID
                                        damagaeFormField ["date_time"]        = dateToPost
                                        // TODO:  remove  00 cordinates
                                        damagaeFormField ["gps_find"]         = gps_find

                                        // damagaeFormField ["gps_find"]           = '00'
                                        damagaeFormField ["address"]            = address
                                        damagaeFormField ["notes"]              = note
                                        damagaeFormField ["img_name"]           = base64URL
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
                                            //console.log(resp);
                                        })

                                        //  gps data  enter into GPSTABLE
                                        tx.executeSql( insertGPSQuery, [activityID,dataTime,latitide,longitude], function() {

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
                                                // console.log(resp);
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
            });
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
            var routeNumber         = $(this).attr('data-routeid')
            ,   insertQuery         = 'INSERT INTO ROUTETABLE (route_N, route_description) VALUES(?,?)'
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
            ,   insertActivityQuery = 'INSERT INTO ACTIVITYTABLE (user_id,route_id,date_time_start, date_time_stop, ellased_time, km_travelled, number_of_marker) VALUES(?,?,?,?,?,?,?)'
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
                tx.executeSql( insertQuery ,[routeNumber,null], function() {

                    // post route data (route id & route desc)
                    routeFormFields ["route_n"]            = routeNumber
                    routeFormFields ["route_description"]  = "null"

                    // postRouteData   = JSON.stringify(routeFormFields)
                    //console.log(postRouteData);
                    var array = []
                    array.push(routeFormFields)
                    postRouteData  = JSON.stringify(array)

                    app.ajaxCall('POST','route',postRouteData, function(resp) {
                        console.log(resp);
                    })

                    tx.executeSql( selectLastRoute, [], function(transaction, results) {
                        if (results.rows.length > 0) {
                            var activity_route_id  = results.rows.item(0).route_N
                            tx.executeSql( insertActivityQuery ,[userID,activity_route_id,activityStartDate,null,null,null,null], function() {
                                activityFormField ["user_id"]           = userID
                                activityFormField ["route_id"]          = activity_route_id
                                activityFormField ["date_time_start"]   = activityStartDate

                                console.log(activityFormField);

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

            var routeId         = $('.route-number').text()
            ,   startTime       = $('.route-time').text()
            ,   kmTravelled     = $('.distance').text()
            ,   noOfMarker      = $('.damages p').text()
            ,   userName        = $('.route .username').text()
            //,   ellased_hr   = $('#time #hours').text()
            //,   ellased_min  = $('#time #minutes').text()
            //,   ellased_sec  = $('#time #seconds').text()
            //,   ellased_time = ellased_hr + ':' + ellased_min + ':' + ellased_sec
            ,   ellased_time    = $('#time').text()
            ,   user_id         = localStorage.getItem('LS_userId')
            // ,   insertQuery     = 'INSERT INTO ACTIVITYTABLE (user_id,route_id, date_time_start, date_time_stop, ellased_time, km_travelled, number_of_marker) VALUES(?,?,?,?,?,?,?)'
            ,   selectActivity  = 'SELECT * FROM ACTIVITYTABLE ORDER BY activity_id DESC LIMIT 1'
            // ,   updateQuery     = 'UPDATE ACTIVITYTABLE SET date_time_stop = ?, ellased_time = ?, km_travelled = ?, number_of_marker = ? WHERE activity_id = "' +aId+'"'
            // console.log(ellased_time);
            // console.log(selectQuery);
            // console.log(routeId,startTime,kmTravelled,noOfMarker);

            app.db.transaction(function(tx) {
                tx.executeSql( selectActivity, [], function(transaction, results) {
                    if (results.rows.length > 0) {
                        var activityID  = results.rows.item(0).activity_id

                        var updateQuery     = 'UPDATE ACTIVITYTABLE SET date_time_stop = ?, ellased_time = ?, km_travelled = ?, number_of_marker = ? WHERE activity_id = "' +activityID+'"'

                        // console.log(updateQuery);

                        tx.executeSql( updateQuery ,[startTime,ellased_time,kmTravelled,noOfMarker], function() {

                            activityFormField ["date_time_stop"]    = startTime
                            activityFormField ["ellased_time"]      = ellased_time
                            activityFormField ["km_travelled"]      = kmTravelled
                            activityFormField ["number_of_marker"]  = noOfMarker
                            // console.log(activityFormField);

                            var array = []
                            array.push(activityFormField)
                            postActivityData  = JSON.stringify(array)
                            // console.log(array);
                            app.ajaxCall('POST','activity',postActivityData, function(resp) {
                                console.log(resp);
                                if (resp) {
                                    activityFormField = {}
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
        ,   currentDate    =  date.getDate() + "/"  + date.getMonth() + "/" + date.getFullYear()
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
            if (onlineStatus == 'online') {
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
                        // alert(err);
                        console.log(err);
                        callback('ajaxError')
                    }
                })
            }
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
}
;
