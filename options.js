$(function(){


    function moduloIncrement(value, base, increment) {
        return (value + increment) % base; 
      }


      function wordEnding(num) {
        if (num !== 1) {
            return  "s";
        } else {
            return ""; 
        }
     }
      

    function zeroPad(timeString) {
        if(timeString.length == 1) {
          timeString = "0" + timeString; 
          return timeString; 
          } else {
            return timeString;
          }
      }

       
    function getTimeString(dtObject) {
        return zeroPad(dtObject.getHours().toString()) + ":" 
        + zeroPad(dtObject.getMinutes().toString()) + ":" 
        + zeroPad(dtObject.getSeconds().toString());
    }


    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      } 


    chrome.storage.sync.get(['limit', 'repeat', 'showAdditionalNots', 'timeOnBadge', 'alarmTime', 'showAlerts', 'noTimeMsg', 'reset'], function(settings) {
        try { 
            if (settings.repeat === true) {
                $('#status').text("Running");
                var nextBreak = new Date(settings.alarmTime);
                var timeString = getTimeString(nextBreak); 
                $('#breakTime').text(timeString);
                today = new Date(); 
                var dtDiff = (nextBreak - today);
                var diffMins = Math.round(((dtDiff % 86400000) % 3600000) / 60000); 
                $('#mins').text("(in " + diffMins.toString() + " minute" + wordEnding(diffMins) + ")"); 
            } else {
                $('#status').text("Stopped"); 
                $('#breakTime').text(settings.noTimeMsg);
            }
            $('#limit').val(settings.limit); 
            if (settings.repeat === true) {
                $('#reminders').prop("checked", true);  
            } 
            else {
                $('#reminders').prop("checked", false);  
            }
            $('#showNotifications').prop("checked", settings.showAdditionalNots); 
            $('#showTimeLimit').prop("checked", settings.timeOnBadge); 
            $('#showAlerts').prop("checked", settings.showAlerts);
        } catch(err) {
            console.log(err.message);
        }
    }); 


    $('#start').click(function(){
        try {
            chrome.storage.sync.get(['reset', 'repeat', 'limit'], function(settings){ 
                var curRepeat = settings.repeat; 
                if (curRepeat === false) {
                    chrome.storage.sync.set({'reset': moduloIncrement(settings.reset, 2, 1)});  
                    var alarmTimeDt = new Date();
                    alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + settings.limit);
                    chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()}); 
                    var timeString = getTimeString(alarmTimeDt);
                    $('#breakTime').text(timeString);
                    today = new Date(); 
                    var dtDiff = (alarmTimeDt - today);
                    var diffMins = Math.round(((dtDiff % 86400000) % 3600000) / 60000); 
                    $('#mins').text("(in " + diffMins.toString() + " minute" + wordEnding(diffMins) + ")"); 
                    chrome.storage.sync.set({'repeat': true});
                    $('#status').text("Running");
                    $('#reminders').prop("checked", true); 
                }
            }); 
        } catch(err) {     
            console.log(err.message);   
        }
    });
    

    $('#stop').click(function(){
        try {
            chrome.storage.sync.set({'repeat': false});
            $('#status').text("Stopped");  
            $('#reminders').prop("checked", false); 
            chrome.storage.sync.get(['noTimeMsg', 'noTimeDiff'], function(settings){
                $('#breakTime').text(settings.noTimeMsg);
                $('#mins').text(settings.noTimeDiff.toString());
            }); 
        } catch(err) {  
            console.log(err.message);
        }
    });
    

    $('#saveOptions').click(function(){
        try {
            var limit = $('#limit').val();
            var repeatSetting = $('#reminders').is(":checked");
            var showNots = $('#showNotifications').is(":checked");
            var showTime = $('#showTimeLimit').is(":checked");
            var showAlertMessages = $('#showAlerts').is(":checked"); 
            if (isNumber(limit)) {
                var limitInt = parseInt(limit); 
                if (limitInt > 4 && limitInt < 61) {
                    chrome.storage.sync.get(['limit', 'repeat', 'reset'], function(settings){
                        if (settings.limit !== limitInt || settings.repeat !== repeatSetting) {
                            chrome.storage.sync.set({'limit': limitInt}, function() {
                            }); 
                            chrome.storage.sync.set({'repeat': repeatSetting}, function() {
                            });
                            if (repeatSetting === true) {
                                chrome.storage.sync.set({'reset': moduloIncrement(settings.reset, 2, 1)});
                                var alarmTimeDt = new Date();
                                alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + limitInt);
                                chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()}); 
                                var timeString = getTimeString(alarmTimeDt);
                                $('#breakTime').text(timeString);
                                today = new Date(); 
                                var dtDiff = (alarmTimeDt - today);
                                var diffMins = Math.round(((dtDiff % 86400000) % 3600000) / 60000); 
                                $('#mins').text("(in " + diffMins.toString() + " minute" + wordEnding(diffMins) + ")");
                            } else {
                                chrome.storage.sync.get(['noTimeMsg', 'noTimeDiff'], function(settings){
                                    $('#status').text("Stopped");  
                                    $('#reminders').prop("checked", false); 
                                    $('#breakTime').text(settings.noTimeMsg);
                                    $('#mins').text(settings.noTimeDiff);
                                }); 
                            }
                        } 
                    }); 
                    chrome.storage.sync.set({'showAdditionalNots': showNots}, function() {
                    });
                    chrome.storage.sync.set({'timeOnBadge': showTime}, function() {
                    });
                    chrome.storage.sync.set({'showAlerts': showAlertMessages}, function() {
                    });
                } else {
                    chrome.storage.sync.get(['limit', 'limitOutOfRangeMsg'], function(settings){
                        $('#limit').val(settings.limit); 
                        alert(settings.limitOutOfRangeMsg);
                    });
                }
            } else {
                chrome.storage.sync.get(['limit', 'limitNonNumMsg'], function(settings){
                    $('#limit').val(settings.limit); 
                alert(settings.limitNonNumMsg);
                });
            } 
        } catch(err) {   
            console.log(err.message);
        }
    });


    $('#resetDefaults').click(function() {
        try {
            var defaultLimit = 25; 
            var defaultNots = true;
            var defaultShowTime = true;
            var defaultShowAlerts = true; 
            chrome.storage.sync.set({'limit': defaultLimit});   
            chrome.storage.sync.set({'showAdditionalNots': defaultNots});
            chrome.storage.sync.set({'timeOnBadge': defaultShowTime});
            chrome.storage.sync.set({'showAlerts': defaultShowAlerts});
            $('#limit').val(defaultLimit); 
            chrome.storage.sync.get(['reset', 'repeat', 'noTimeMsg', 'noTimeDiff'], function(settings){ 
                chrome.storage.sync.set({'reset': moduloIncrement(settings.reset, 2, 1)});  
                if (settings.repeat === true) {
                    $('#reminders').prop("checked", true);  
                    $('#status').text("Running");
                    var alarmTimeDt = new Date();
                    alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + defaultLimit);
                    chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()}); 
                    var timeString = getTimeString(alarmTimeDt);
                    $('#breakTime').text(timeString);
                    today = new Date(); 
                    var dtDiff = (alarmTimeDt - today);
                    var diffMins = Math.round(((dtDiff % 86400000) % 3600000) / 60000); 
                    $('#mins').text("(in " + diffMins.toString() + " minute" + wordEnding(diffMins) + ")");
                } 
                else {
                    $('#reminders').prop("checked", false);  
                    $('#status').text("Stopped");
                    $('#breakTime').text(settings.noTimeMsg);
                    $('#mins').text(settings.noTimeDiff);
                }
        });
            $('#showNotifications').prop("checked", defaultNots);
            $('#showTimeLimit').prop("checked", defaultShowTime);
            $('#showAlerts').prop("checked", defaultShowAlerts); 
        } catch(err) {
            console.log(err.message);
        }
    });


    $('#resetAlarm').click(function(){
        try {
            chrome.storage.sync.get(['limit', 'repeat', 'reset'], function(settings){  
                if (settings.repeat === true) {
                    chrome.storage.sync.set({'reset': moduloIncrement(settings.reset, 2, 1)});  
                    var alarmTimeDt = new Date();
                    alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + settings.limit);
                    chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()});  
                    $('#reminders').prop("checked", true); 
                    var timeString = getTimeString(alarmTimeDt);
                    $('#breakTime').text(timeString);
                    today = new Date(); 
                    var dtDiff = (alarmTimeDt - today);
                    var diffMins = Math.round(((dtDiff % 86400000) % 3600000) / 60000); 
                    $('#mins').text("(in " + diffMins.toString() + " minute" + wordEnding(diffMins) + ")");  
                } 
            });
        } catch(err) { 
            console.log(err.message);
        }
    }); 


    $('#closeOptions').click(function() {
        try {
            close();
        } catch(err) {
            console.log(err.message);        
        }
    });

});