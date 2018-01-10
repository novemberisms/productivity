class TaskKind {
    constructor (name, color, default_title) {
        this.name = name
        this.color = color
        this.default_title = default_title
        TaskKind.TaskKinds.push(this)
    }
    
    static getKinds() {
        return TaskKind.TaskKinds
    }
    
    static getByName(name) {
        var kinds = TaskKind.getKinds()
        for (var i = 0; i < kinds.length; i++) {
            var kind = kinds[i]
            if (kind.name === name) {
                return kind
            }
        }
    }
    
    getColor() {
        for (var colorname in colors) {
            if (colors[colorname] == this.color) {
                return colorname
            }
        }
    }
    
    static createForm() {
        // creates the form for inputting task names and the buttons to start and end them
        var form = document.getElementById("myform")
        var result = ""
        // for each taskkind, try to generate this:
        /*
                <div class="input-group">
                    <button class="btn btn-success samewidth" type="button" onclick="buttonPress('task')" id="btntask">Start Task</button>
                    <input type="text" id="taskname" class="form-control" placeholder="Task name">
                </div>
        */
        var kinds = TaskKind.getKinds()
        for (var i = 0; i < kinds.length; i++) {
            var kind = kinds[i]
            var group = "<div class='input-group'>"
            group += "<button class='btn samewidth btn-" + kind.getColor() + "' "
            group += "type='button' onclick='buttonPress("
            group += '"' + kind.name + '"'
            group += ")' id='btn" + kind.name + "'>"
            group += "Start " + capitalize(kind.name)
            group += "</button>"
            group += "<input type='text' id='" + kind.name + "name'"
            group += " class = 'form-control' placeholder='"
            group += capitalize(kind.name) + " name'>"
            group += "</div>"
            result += group + '\n'
        }
        form.innerHTML = result
        return result
    }
}
TaskKind.TaskKinds = []

//==========================================================================

class Task {       // CHANGE iTask to Task and delete old task constructor
    constructor (name, kind, start) {
        this.name = name
        this.kind = kind        // must be a string for backwards compatibility!
        this.start_time = start
        this.end_time = null
        this.duration = 0
    }
    
    begin() {
        var kindobj = TaskKind.getByName(this.kind)
        // get the task title and time elapsed fields
        var tasktext = document.getElementById("task")
        var timetext = document.getElementById("time")
        // default working title if none provided
        if (this.name === "") {
            this.name = kindobj.default_title
        }
        // set title
        tasktext.innerHTML = this.name
        // set color of elapsed time
        setColor("time", kindobj.color)

        // change button text of associated button
        document.getElementById("btn" + this.kind).innerHTML = "End " + capitalize(this.kind)

        // toggle visibility of all other buttons, and all input fields
        var allkinds = TaskKind.getKinds()
        for (var i = 0; i < allkinds.length; i++) {
            var x = allkinds[i]
            if (x.name !== this.kind) {
                setVisibility("btn" + x.name, false)
            }
            setVisibility(x.name + "name", false)
        }
    }
    
    end() {
        // internal stuff
        var end_time = new Date()
        this.end_time = end_time
        this.ongoing = false
        this.duration = end_time - start_time
        // external stuff
        
        // set Visibility of all form elements
        var allkinds = TaskKind.getKinds()
        for (var i = 0; i < allkinds.length; i++) {
            var x = allkinds[i]
            setVisibility("btn" + x.name, true)
            setVisibility(x.name + "name", true)
        }
        // change associated button text back to Begin
        document.getElementById("btn" + this.kind).innerHTML = "Begin " + capitalize(this.kind)
        // return the label fields to their natural state
        document.getElementById("task").innerHTML = DEFAULT_TASK
        setColor("time", colors.black)
    }
}