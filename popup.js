$(function(){


    function zeroPad(timeString) {
        if(timeString.length == 1) {
          timeString = "0" + timeString; 
          return timeString; 
          } else {
            return timeString;
          }
      }


      function wordEnding(num) {
        if (num !== 1) {
            return  "s";
        } else {
            return ""; 
        }
    }

      
    function getTimeString(dtObject) {
        return zeroPad(dtObject.getHours().toString()) + ":" 
        + zeroPad(dtObject.getMinutes().toString()) + ":" 
        + zeroPad(dtObject.getSeconds().toString());
    }
    

    function moduloIncrement(value, base, increment) {
        return (value + increment) % base; 
      }

    
    chrome.storage.sync.get(['limit', 'repeat', 'alarmTime', 'noTimeMsg'], function(settings){  
        try {
            $('#limit').text(settings.limit);     
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
        } catch(err) {
            console.log(err.message);
        }
    });


    $('#start').click(function(){
        try {
            var curRepeat = true; 
            chrome.storage.sync.get(['repeat', 'limit', 'reset'], function(settings){ 
            curRepeat = settings.repeat; 
            if (curRepeat === false) { 
                chrome.storage.sync.set({'reset': moduloIncrement(settings.reset, 2, 1)});   
                chrome.storage.sync.set({'repeat': true});
                $('#status').text("Running"); 
                var alarmTimeDt = new Date();
                alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + settings.limit);
                chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()}); 
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
    

    $('#stop').click(function(){
        try {
            chrome.storage.sync.set({'repeat': false});
            $('#status').text("Stopped");
            chrome.storage.sync.get(['noTimeMsg', 'noTimeDiff'], function(settings){
                $('#breakTime').text(settings.noTimeMsg);
                $('#mins').text(settings.noTimeDiff.toString());
            });
        } catch(err) { 
            console.log(err.message);
        }
    });


    $('#reset').click(function(){
        try {
            chrome.storage.sync.get(['reset', 'limit', 'repeat'], function(settings){ 
                if (settings.repeat === true) {
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
                } 
            });
        } catch(err) {   
            console.log(err.message);
        }
    });  

});