/* jshint esversion: 6 */

class Task {
  constructor(id, name, limit, duration, requirements, action) {
    this.name = name;
    this.limit = limit;
    this.duration = duration;
    this.requirements = requirements;
    this.id = id;
    this.times = 0;
    this.action = action;
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: 0,
      duration: this.props.task.duration,
      startTime: 0,
      started: false
    };

    this.start = this.start.bind(this);
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    let card = $(this.refs.card);
    card.animate({opacity: 1}, {
      step(now, fx) {
        card.css('transform', 'translateX(-'+(100-now*100)+"%)");
      },
      duration: "slow",
    });
  }

  start() {
    this.setState({
      started: true,
      startTime: Date.now()
    });
    this.props.onTaskStart(this.props.task);
    window.requestAnimationFrame(this.tick);
  }

  tick() {
    let time = Date.now() - this.state.startTime;
    let progress = Math.min(1, time / this.state.duration);
    let comp = this;

    this.setState({
      progress: progress
    });

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
      window.requestAnimationFrame(this.tick);
    }
  }

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

let tasks = {
  energy: new Task("energy", "Create Energy", 1, 2000, [], ()=>{}),
  light: new Task("light", "Create Light", 1, 2000, [{id: "energy", count: 1}], ()=>{}),
  test: new Task("test", "Do Forever", -1, 1000, [], ()=>{}),
}
let initial = [tasks.energy];

class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.tasks = tasks
    this.completed = {};
    this.state = {
      todo: initial
    };

    this.onTaskStart = this.onTaskStart.bind(this);
    this.onTaskFinish = this.onTaskFinish.bind(this);
  }

  onTaskStart(parent) {
    // remove our resources
    for(let i = 0; i < parent.requirements.length; i++) {
      let req = parent.requirements[i];
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

        // we don't have enough of something
        if(controls.completed[req.id] < req.count) {
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

  onTaskFinish(task) {
    if(task.limit > 0)
      task.limit --;
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
        if(this.completed[req.id] < req.count) {
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