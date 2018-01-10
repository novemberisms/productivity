function newDate(datestr) {
    var d = new Date(datestr)
    d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
    return d
}

function toggleVisibility(id) {
    var x = document.getElementById(id)
    if(x.style.display == "none"){
        x.style.display = "block"
    } else {
        x.style.display = "none"
    }
}

function setVisibility(id, value) {
    document.getElementById(id).style.display = value ? "block" : "none"
}

function setColor(id,color) {
    var x = document.getElementById(id)
    x.style.color = color
}

function getDayString(date) {
    
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    
    return year + '-' + month + '-' + day
    
}

function toPrettyDate(daystring) {
    var d = new Date(daystring)
    var result = ""
    result += getDayName(d.getDay()) + ", "
    result += getMonthName(d.getMonth()) + " "
    result += d.getDate() + ", " + d.getFullYear()
    return result
}

function getMonthName(number) {
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"]
    return months[number]
}

function getDayName(number) {
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    return days[number]
}


function changeFavicon(src) {
    var link = document.createElement('link'),
    oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

function loadSessions() {
    var string_sessions = localStorage.getItem("sessions")
    if (string_sessions === null) {
        console.log("no previous sessions")
        return
    }
    var sessions = JSON.parse(string_sessions)
    for (var i = 1; i < sessions.length; i++) {
        var day = sessions[i]
        Object.setPrototypeOf(day, Day.prototype)  
        for (var j = 1; j < day.tasks.length; j++) {
            var task = day.tasks[j]
            Object.setPrototypeOf(task, Task.prototype)
        }
    }
    return sessions
}

function capitalize(word) {
    return word.slice(0,1).toUpperCase() + word.slice(1)
}
