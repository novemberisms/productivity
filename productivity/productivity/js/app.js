//==========================================================================
//  CONSTS

var colors = {
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
    black: "#000000"
}

var amount_recent_to_show = 7
var DEFAULT_TASK = document.getElementById("task").innerHTML
var start_time = new Date()
var timer
var timer_ongoing = false
var current_task
var RESOLUTION = 86400 * 1000 * 0.000 // 0.5 percent of each day, which has 86400 seconds

//==========================================================================
//  BUTTON FUNCTIONS

function buttonPress(which) {
    if(!timer_ongoing) {
        if(which === "task") {
            startTask()
            changeFavicon("gear_green.ico")
        } else {
            startBreak()
            changeFavicon("gear_red.ico")
        }
    } else {
        endTask()
        changeFavicon("favicon.ico")
    }
    displayRecent(amount_recent_to_show)
}

//==========================================================================
//  TASK CONTROL

function startTask() {
    var taskname = document.getElementById("taskname").value
    var tasktext = document.getElementById("task")
    var timetext = document.getElementById("time")
    if(taskname === ""){
        taskname = "Working"
    }
    tasktext.innerHTML = taskname
    setColor("time", colors.success)
    
    // change button text
    document.getElementById("btntask").innerHTML = "End Task"
    document.getElementById("btnbreak").innerHTML = "Start Break"
    
    toggleVisibility("taskname")
    toggleVisibility("btnbreak")
    toggleVisibility("breakname")
    
    startTimer()
    
    current_task =  new Task(taskname, "task")
    
}

function startBreak() {
    var taskname = document.getElementById("breakname").value
    var tasktext = document.getElementById("task")
    var timetext = document.getElementById("time")
    if(taskname === ""){
        taskname = "Taking a break"
    }
    tasktext.innerHTML = taskname
    setColor("time", colors.danger)
    
    // change button text
    document.getElementById("btntask").innerHTML = "Start Task"
    document.getElementById("btnbreak").innerHTML = "End Break"
    
    toggleVisibility("taskname")
    toggleVisibility("btntask")
    toggleVisibility("breakname")
    
    startTimer()
    
    current_task = new Task(taskname, "break")
    
}

function endTask() {
    endCurrentTask()
    clearTimer()
    setVisibility("taskname", true)
    setVisibility("breakname", true)
    setVisibility("btntask", true)
    setVisibility("btnbreak", true)
    document.getElementById("btntask").innerHTML = "Start Task"
    document.getElementById("btnbreak").innerHTML = "Start Break"
    var tasktext = document.getElementById("task").innerHTML = DEFAULT_TASK
    setColor("time", colors.black)
}

function Task(name, kind) {
    this.name = name
    this.kind = kind
    this.start_time = start_time
    this.end_time = null
    this.duration = 0
    this.ongoing = true
}

function endCurrentTask() {
    var end_time = new Date()
    current_task.end_time = end_time
    current_task.ongoing = false
    current_task.duration = end_time - start_time
    saveTask(current_task)
    current_task = null
}


//==========================================================================
//  TIMER

function startTimer() {
    timer_ongoing = true
    start_time = new Date()
    timer = window.setInterval(updateTimer, 1000)
}

function clearTimer() {
    if(timer) {
        window.clearInterval(timer)
        timer = null
        timer_ongoing = false
    }
    document.getElementById("time").innerHTML = formatTime(0)
}

function updateTimer() {
    var cur_time = new Date()
    var elapsed = cur_time - start_time // elapsed is now the number of milliseconds
    var timetext = document.getElementById("time")
    timetext.innerHTML = formatTime(elapsed)
}

function formatTime(ms) {
    var seconds = Math.floor(ms / 1000)
    var minutes = Math.floor(seconds / 60)
    var hours = Math.floor(minutes / 60)
    
    var seconds_m = seconds % 60
    var minutes_m = minutes % 60
    
    var seconds_d = seconds_m < 10 ? "0"+seconds_m : seconds_m
    var minutes_d = minutes_m < 10 ? "0"+minutes_m : minutes_m
    var hours_d   = hours < 10 ? "0"+hours : hours 
    
    return hours_d + "h " + minutes_d + "m " + seconds_d + "s"
}


//==========================================================================
//  LOAD


function load() {
    displayRecent(amount_recent_to_show)
}


//==========================================================================
//  SAVE AND RETRIEVE DATA

function saveTask(task, day) {
    var sessions = []
    var daystring = getDayString(task.start_time)
    
    if (localStorage.getItem("sessions") === null) {
        var firstdate = new Day(day? day : daystring)
        firstdate.addTask(task)
        sessions.push(firstdate)
        localStorage.setItem("sessions", JSON.stringify(sessions))
    } else {
        var string_sessions = localStorage.getItem("sessions")
        sessions = JSON.parse(string_sessions)
        
        var currdate = new Day(day? day : daystring)
        var lastdate = sessions[sessions.length-1]
        // because destringified objects lose their prototypes
        Object.setPrototypeOf(lastdate, Day.prototype)  
        
        if (Day.compare(currdate, lastdate) === "equal") {
            lastdate.addTask(task)
        } else if (Day.compare(currdate, lastdate) === "greater") {
            currdate.addTask(task)
            sessions.push(currdate)
        } else {
            alert("Date error occurred")
        }
        
        localStorage.setItem("sessions", JSON.stringify(sessions))
    }
}

function displayRecent(amt) {
    var amount = amt ? amt : 7
    // load recent sessions
    var string_sessions = localStorage.getItem("sessions")
    if (string_sessions === null) {
        console.log("no previous sessions")
        return
    }
    var sessions = JSON.parse(string_sessions)
    var recentdays = document.getElementById("recentdays")
    
    
    recentdays.innerHTML = ""
    
    var displayed = 0
    for (var i = sessions.length-1; i > -1; i--) {
        var day = sessions[i]
        Object.setPrototypeOf(day, Day.prototype)  
        var entry = '<div class="card card-body bg-light">'
        entry += '<h3>' + toPrettyDate(day.datestr) + '</h3>'
        entry += day.createProgressBar()
        entry += '<div id="' + day.datestr + '"> </div>'
        entry += '</div>'
        
        recentdays.innerHTML += entry
        
        displayed += 1
        if (displayed >= amount) { break }
    }
}


//==========================================================================
//  DAY OBJECT
class Day{
    constructor(datestr) {
        this.datestr = datestr
        this.tasks = []
    }
    
    addTask(task) {
        this.tasks.push(task)
    }
    
    static compare(day1,day2) {
        var d1 = new Date(day1.datestr)
        var d2 = new Date(day2.datestr)
        if (day1.datestr === day2.datestr) {
            return "equal"
        } else if (d1 > d2) {
            return "greater"
        } else {
            return "less"
        }
    }
     
    static diffToPercent(diff) {
        var totalTime = 86400 * 1000
        var decimalPercent = diff / totalTime
        var percent = decimalPercent * 100
        return percent + "%"
    }
    
    createProgressBar() {
        var result = "<div class='progress'>"
        var curr_time = newDate(this.datestr)  // time is 00:00 midnight
        
        for (var i = 0; i < this.tasks.length; i++) {
            var task = this.tasks[i]
            // get the time from curr_time to task time
            var start = new Date(task.start_time)
            var diff = start - curr_time
            if (diff > RESOLUTION) {
                result += "<div class='progress-bar bg-progress' "
                result += "style='width:" + Day.diffToPercent(diff) + "'>"
                result += "</div>"
            }
            // use the actual duration of the task
            var end = new Date(task.end_time)
            diff = end - start
            var timestring = start.toLocaleTimeString() + ' to ' + end.toLocaleTimeString()
            var duration = formatTime(task.duration)
            result += "<div class='progress-bar bg-"
                result += (task.kind === "task" ? "success' " : "danger' ")
                result += "style='width:" + Day.diffToPercent(task.duration) + "'"
                result += "onmouseenter='mouseenterTask(" + '"'
                    result += task.name + '","' 
                    result += task.kind + '","' 
                    result += timestring + '","' 
                    result += duration + '","' 
                    result += this.datestr + '"' + ")'"
                result += "onmouseleave='mouseleaveTask(" 
                    result += '"'+ this.datestr + '"'+ ")'" 
                result += ">"
            result += Day.diffToPercent(diff)
            result += "</div>"
            curr_time = end
        }
        
        
        
        result += "</div>"
        return result
    }
}

function mouseenterTask(name, kind, timestring, duration, divid) {
    var namediv = document.getElementById(divid)
    var entry =  "<div class='text-" + (kind==="task"?"success":"danger") + "'>"
    entry += "<strong>" + name + "</strong></div>"
    entry += "<div><strong>Time:</strong> " + timestring + "</div>"
    entry += "<div><strong>Duration:</strong> " + duration + "</div>"
    namediv.innerHTML = entry
}

function mouseleaveTask(divid) {
    var namediv = document.getElementById(divid)
    namediv.innerHTML = ""
}

