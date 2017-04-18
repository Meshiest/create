/* jshint esversion: 6 */

// Task storage
class Task {
  /**
    id: Task Id
    name: Task Name
    limit: Number of times task can be done, -1 for unlimited
    duration: How long it takes to do the task
    requirements: 
      [{id: "task id", count: "num required times task was run"}]
      if count < 0, the requirement means there must be none of specified task completed
    action: A callback run when the task is completed
   */
  constructor(id, name, limit, duration, requirements, action) {
    this.name = name;
    this.limit = limit || 1;
    this.duration = duration || 1000;
    this.requirements = requirements || [];
    this.id = id;
    this.times = 0;
    this.action = action || ()=>{};
  }
}

// Card React Component
class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: 0, // percent done
      duration: this.props.task.duration, // how long it takes to do (from task)
      startTime: 0, // when the task was started
      started: false // if the task was started
    };

    this.start = this.start.bind(this);
    this.tick = this.tick.bind(this);
  }

  // show an animation when this card mounts
  componentDidMount() {
    let card = $(this.refs.card);
    card.animate({opacity: 1}, {
      step(now, fx) {
        card.css('transform', 'translateX(-'+(100-now*100)+"%)");
      },
      duration: "slow",
    });
  }

  // called on the start button click, initiates animation
  start() {
    this.setState({
      started: true,
      startTime: Date.now()
    });
    this.props.onTaskStart(this.props.task);
    window.requestAnimationFrame(this.tick);
  }

  // animation tick, called until time is up
  tick() {
    let time = Date.now() - this.state.startTime;
    let progress = Math.min(1, time / this.state.duration);
    let comp = this;

    // show updated progress
    this.setState({
      progress: progress
    });

    // end if we are done and show an animation before calling onTaskFinish
    if(progress == 1) {
      let card = $(this.refs.card);
      card.animate({opacity: 0}, {
        step(now, fx) {
          card.css('transform', 'translateX('+(100-now*100)+"%)");
        },
        duration: "slow",
        complete() {
          card.animate({height: 0}, {
            duration: "fast",
            complete(){
              card.hide();
              comp.props.onTaskFinish(comp.props.task);
            }
          });
        }
      });
    } else {
      // otherwise continue animating progress
      window.requestAnimationFrame(this.tick);
    }
  }

  // rendering of the card
  render() {
    return (<div className="card" ref="card" style={{opacity: 0}}>
      <div className="card-info">
        <div className="card-content">
          <h2>
            {this.props.task.name}
          </h2>
        </div>
        <div className="card-button">
          <button onClick={this.start} className={this.state.started ? "started" : ""}>
            <i className="material-icons">arrow_forward</i>
          </button>
        </div>
      </div>
      <div className="card-progress">
        <div className="card-progress-bar" style={{width: (this.state.progress*100)+"%"}}>
        </div>
      </div>
    </div>);
  }
}

// All available tasks
let tasks = {
  energy: new Task("energy", "Fabricate Energy", 1, 2000, []),
  light: new Task("light", "Devise Light", 1, 2000, [{id: "energy", count: 0}]),
  electricity: new Task("electricity", "Establish Electricity", 1, 2000, [{id: "energy", count: 0}]),
  aura: new Task("aura", "Originate Aura", 1, 20000, [{id: "electricity", count: -1}, {id: "light", count: 0}, {id: "matter", count: -1}]),
  magic: new Task("magic", "Originate Magic", 1, 20000, [{id: "electricity", count: 0}, {id: "light", count: -1}, {id: "matter", count: -1}]),
  matter: new Task("matter", "Make Matter", 1, 2000, [{id: "energy", count: 0}]),
  elements: new Task("elements", "Forge Elements", 1, 2000, [{id: "matter", count: 0}]),
  molecules: new Task("molecules", "Design Molecules", 1, 2000, [{id: "matter", count: 0}]),
  star: new Task("star", "Shape Stars", 1, 4000, [{id: "light", count: 0}, {id: "elements", count: 0}]),
  planet: new Task("planet", "Develop Planets", 1, 4000, [{id: "molecules", count: 0}, {id: "elements", count: 0}]),
  life: new Task("life", "Breathe Life", 1, 8000, [{id: "molecules", count: 0}, {id: "light", count: 0}, {id: "electricity", count: 0}]),
}

// Initial task
let initial = [tasks.energy];

// Controls component: manages tasks
class Controls extends React.Component {
  constructor(props) {
    super(props);

    // list of all tasks
    this.tasks = tasks

    // storage for completed tasks and how many times the tasks were completed
    // {[taskId]: num}
    this.completed = {};

    this.state = {
      todo: initial // initial tasks are displayed
    };

    this.onTaskStart = this.onTaskStart.bind(this);
    this.onTaskFinish = this.onTaskFinish.bind(this);
  }

  // callback for when the start button is pressed on the card component
  // consumes ingredients and removes unqualified tasks if necessary
  onTaskStart(parent) {
    // remove our resources
    for(let i = 0; i < parent.requirements.length; i++) {
      let req = parent.requirements[i];
      if(req.count > 0)
        this.completed[req.id] -= req.count
    }

    let controls = this;

    // check if we need to remove some tasks
    this.state.todo.forEach((task, i) => {
      if(task === parent) {
        return;
      }

      // check if this task has enough ingredients
      for(let j = 0; j < task.requirements.length; j++) {
        let req = task.requirements[j];
        let card = $(this.refs["task_" + task.id + "_" + task.times].refs.card);

        // we don't have enough of something or we're not supposed to have something
        if((controls.completed[req.id] || 0) < req.count || req.count == 0 && !controls.completed[req.id] || req.count < 0 && controls.completed[req.id]) {
          // hide the task
          card.animate({opacity: 0}, {
            step(now, fx) {
              card.css('transform', 'translateX(-'+(100-now*100)+"%)");
            },
            duration: "slow",
            complete() {
              card.animate({height: 0}, {
                duration: "fast",
                complete(){
                  card.hide();

                  // finally remove the task
                  controls.state.todo.splice(controls.state.todo.indexOf(task), 1);
                  controls.setState({
                    todo: controls.state.todo
                  });
                }
              });
            }
          });
          break;
        }
      }
    });
  }

  // Called when the duration for a task is done
  onTaskFinish(task) {
    // decrease the task if it's not an unlimited task
    if(task.limit > 0)
      task.limit --;

    task.action();
    task.times ++;

    // we haven't completed this task before
    if(!this.completed[task.id])
      this.completed[task.id] = 1;
    else // complete it again
      this.completed[task.id] ++;

    // remove it
    this.state.todo.splice(this.state.todo.indexOf(task), 1);

    // check if we can add new tasks
    for(let name in this.tasks) {
      let task = this.tasks[name];
      
      // make sure we can do this task and we don't already have it in progress
      if(task.limit == 0 || this.state.todo.includes(task))
        continue;

      // make sure we have all the requirements
      let hasRequirements = true;
      for(let i = 0; i < task.requirements.length; i++) {
        let req = task.requirements[i];

        // if we don't have enough or we're not supposed to have a resource
        if((this.completed[req.id] || 0) < req.count || req.count == 0 && !this.completed[req.id] || req.count < 0 && this.completed[req.id]) {
          hasRequirements = false;
          break;
        }
      }
      // add the task to our todo
      if(hasRequirements) {
        this.state.todo.push(task);
      }
    }
    this.setState({
      todo: this.state.todo
    });
  }

  render() {
    return (<div>
      {this.state.todo.map((t, i) => <Card key={t.id + "_" + t.times} ref={"task_" + t.id + "_" + t.times} task={t} onTaskStart={this.onTaskStart} onTaskFinish={this.onTaskFinish}/>)}
    </div>)
  }
}

ReactDOM.render(<Controls/>, document.getElementById("controls"));