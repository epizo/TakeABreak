function zeroPad(timeString) {
  if(timeString.length == 1) {
    timeString = "0" + timeString; 
    return timeString; 
    } else {
      return timeString;
    }
}


chrome.runtime.onInstalled.addListener(function(details) {  
try { 
    var defLim = 25; 
    var defaultBadgeText = "";
    var defaultShowAlerts = true;
    var defaultRepeat = true;
    var defaultReset = 0; 
    var defaultTimeOnBadge = true;
    var defaultShowAdditionalNots = true; 
    var userMessageString = "Take a moment to stretch and to rest your eyes. Remember to stay hydrated too!";
    var defaultLimOORMsg = "The time limit should be between 5 minutes and 1 hour";
    var defaultLimitNonNumMsg = "Nope, the time limit should be a number";
    var defaultNoTimeMsg = "--:--:--";
    var defaultNoTimeDiff = "";
    var alarmTimeDt = new Date(); 
    alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + defLim);
    chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()});
    chrome.storage.sync.set({'limit': defLim}); 
    chrome.storage.sync.set({'repeat': defaultRepeat}); 
    chrome.storage.sync.set({'showAlerts': defaultShowAlerts});
    chrome.storage.sync.set({'showAdditionalNots': defaultShowAdditionalNots});
    chrome.storage.sync.set({'reset': defaultReset});
    chrome.storage.sync.set({'userMessage': userMessageString});
    chrome.storage.sync.set({'timeOnBadge': defaultTimeOnBadge}); 
    chrome.storage.sync.set({'limitOutOfRangeMsg': defaultLimOORMsg}); 
    chrome.storage.sync.set({'limitNonNumMsg': defaultLimitNonNumMsg});
    chrome.storage.sync.set({'noTimeMsg': defaultNoTimeMsg});
    chrome.storage.sync.set({'noTimeDiff': defaultNoTimeDiff});
    chrome.alarms.create("reminderAlarm", {
      delayInMinutes: defLim 
    }); 
      if (defaultTimeOnBadge === true) {
          chrome.browserAction.setBadgeText({"text": defLim.toString()}); 
      } else {
        chrome.browserAction.setBadgeText({"text": defaultBadgeText});
      }   
  } catch(err) { 
    console.log(err.message);
  } 
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  try {
    for (var key in changes) { 
      if (key === "reset") {
        chrome.alarms.clearAll(function(wasCleared) {
        });
        chrome.storage.sync.get('limit', function(settings){   
          chrome.alarms.create("reminderAlarm", {
            delayInMinutes: settings.limit  
          }); 
        });    
      }
      if (key === "timeOnBadge") {
        chrome.storage.sync.get('timeOnBadge', function(settings){
          if (settings.timeOnBadge === true) {
            chrome.storage.sync.get('limit', function(settings){
              chrome.browserAction.setBadgeText({"text": settings.limit.toString()});
            });
          } else {
            chrome.browserAction.setBadgeText({"text": ""});
          }         
        });  
      }  
      if (key === "limit") {
        chrome.storage.sync.get('limit', function(settings){
          chrome.alarms.create("reminderAlarm", {
            delayInMinutes: settings.limit  
          });
          chrome.storage.sync.get('timeOnBadge', function(settings){
            if (settings.timeOnBadge === true) {
              chrome.storage.sync.get('limit', function(settings){
                chrome.browserAction.setBadgeText({"text": settings.limit.toString()});
              });
            } else {
              chrome.browserAction.setBadgeText({"text": ""});
            }         
          }); 
          var alarmTimeDt = new Date();
          alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + settings.limit);
          chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()}); 
        });    
      }
    }
  } catch(err) {  
    console.log(err.message);
  }
});

  
chrome.alarms.onAlarm.addListener(function(alarm) {
  try{
    if (alarm.name === "reminderAlarm") {
      chrome.storage.sync.get(['repeat', 'showAdditionalNots', 'limit', 'showAlerts', 'userMessage'], function(settings){
          if (settings.repeat === true) { 
            if (settings.showAlerts === true) {
              alert(settings.userMessage);
            }
              if (settings.showAdditionalNots) {
                if (settings.showAdditionalNots === true) {
                  const options = {
                    type: "basic",
                    iconUrl: "icon48.png",
                    title: "TakeABreak",
                    message: settings.userMessage
                  }; 
                  chrome.notifications.create(options);
                }
              }
              chrome.alarms.clearAll(function(wasCleared) {
              });
              chrome.alarms.create("reminderAlarm", {
                delayInMinutes: settings.limit 
              }); 
           }
          var alarmTimeDt = new Date();
          alarmTimeDt.setMinutes(alarmTimeDt.getMinutes() + settings.limit);
          chrome.storage.sync.set({'alarmTime': alarmTimeDt.getTime()});     
      });
    }
  } catch(err) {
    console.log(err.message);
  }
});