/* jshint esversion: 6 */

// Task storage
class Task {
  /**
    id: Task Id
    name: Task Name
    limit: Number of times task can be done, -1 for unlimited
    duration: How long it takes to do the task
    requirements: 
      [{id: "task id", count: "num required times task was run", keep: true/false, hidden: true/false}]
      if count < 0, the requirement means there must be none of specified task completed
      when keep is true resources will not be consumed
    action: A callback run when the task is completed
    output:
      [{id: "task id", count: "num extra output", hidden: true/false}]
      Adding the current task's id into output will double add the output
      Making the output count negative will remove items from completed

   */
  constructor(id, name, limit, duration, requirements, action, output) {
    this.name = name;
    this.limit = limit || 1;
    this.duration = duration || 1000;
    this.requirements = requirements || [];
    this.id = id;
    this.times = 0;
    this.action = action || ()=>{};
    this.output = output || [];
  }
}

// Separate the progress bar from the card so we don't have to redraw the entire card every frame
class ProgressBar extends React.Component {
  constructor(props) {
    super(props);

    this.duration = this.props.duration;

    this.state = {
      progress: 0,
      startTime: 0,
    };

    this.start = this.start.bind(this);
    this.tick = this.tick.bind(this);
  }

  // Starts rendering
  start() {
    this.setState({
      startTime: Date.now()
    });
    window.requestAnimationFrame(this.tick);
  }

  // animation tick, called until time is up
  tick() {
    let time = Date.now() - this.state.startTime;
    let progress = Math.min(1, time / this.duration);

    // show updated progress
    this.setState({
      progress: progress
    });

    // end if we are done and show an animation before calling onTaskFinish
    if(progress == 1) {
      this.props.onFinish();
    } else {
      // otherwise continue animating progress
      window.requestAnimationFrame(this.tick);
    }
  }

  render() {
    return (<div className="card-progress">
      <div className="card-progress-bar" style={{width: (this.state.progress*100)+"%"}}>
      </div>
    </div>);
  }
}

// Card React Component
class Card extends React.Component {
  constructor(props) {
    super(props);

    this.started = false;

    this.state = {
      progress: 0, // percent done
      duration: this.props.task.duration, // how long it takes to do (from task)
      startTime: 0, // when the task was started
      started: false // if the task was started
    };

    this.start = this.start.bind(this);
    this.finish = this.finish.bind(this);
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

  // called on the start button click, starts the progress bar
  start() {
    this.started = true;
    this.setState({
      started: true,
      startTime: Date.now
    })
    this.props.onTaskStart(this.props.task);
    this.refs.progressBar.start();
  }

  finish() {
    let comp = this;
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
            console.log();
            comp.props.onTaskFinish(comp.props.task);
          }
        });
      }
    });
  }

  // rendering of the card
  render() {
    let requirements = {};
    let output = {[this.props.task.id]: 1};
    
    for(let i = 0; i < this.props.task.output.length; i++) {
      let out = this.props.task.output[i];

      if(out.hidden)
        continue;

      output[out.id] = (output[out.id] || 0) + out.count;
    }

    for(let i = 0; i < this.props.task.requirements.length; i++) {
      let req = this.props.task.requirements[i];

      if(out.hidden)
        continue;

      if(req.count >= 0)
        requirements[req.id] = (requirements[req.id] || 0) + req.count;
    }

    return (<div className="card" ref="card" style={{opacity: 0}}>
      <div className="card-info">
        <div className="card-content">
          <h2>
            {this.props.task.name}
          </h2>
          <div className="card-requirements">
            {Object.keys(output).map(id => output[id] != 0 && (
              <span key={"output_" + id}
                num={output[id]}
                className={'card-requirement ' + (output[id] > 0 ? "create" : "remove")}>
                  {(output[id] > 0 ? Math.abs(output[id]) + " " : "") + id}
                </span>
            ))}
            {Object.keys(requirements).map(id => (
              <span key={"requirement_" + id}
                className="card-requirement needed">{(requirements[id] > 0 ? requirements[id] + " " : "") + id}</span>
            ))}
          </div>
        </div>
        <div className="card-button">
          <button onClick={this.start} className={this.state.started ? "started" : ""}>
            <i className="material-icons">arrow_forward</i>
          </button>
        </div>
      </div>
      <ProgressBar ref="progressBar" onFinish={this.finish} duration={this.state.duration} />
    </div>);
  }
}

// Time units
let sec = 1000;
let min = 60 * sec;
let hour = 60 * min;
let day = 24 * hour;
let week = 7 * day;

// All available tasks
let tasks = {
  energy: new Task("energy", "Fabricate Energy", 1, 2000, []),

  light: new Task("light", "Devise Light", 1, 2000, [{id: "energy", count: 0}]),
  electricity: new Task("electricity", "Establish Electricity", 1, 2000, [{id: "energy", count: 0}]),

  aura: new Task("aura", "Originate Aura", 1, 60000, [{id: "light", count: 0}, {id: "electricity", count: -1}, {id: "matter", count: -1}]),
  mana: new Task("mana", "Originate Mana", 1, 60000, [{id: "electricity", count: 0}, {id: "light", count: -1}, {id: "matter", count: -1}]),

  matter: new Task("matter", "Make Matter", 1, 2000, [{id: "energy", count: 0}]),
  elements: new Task("elements", "Forge Elements", 1, 2000, [{id: "matter", count: 0}]),
  molecules: new Task("molecules", "Design Molecules", 1, 2000, [{id: "elements", count: 0}]),
  compounds: new Task("compounds", "Fashion Compounds", 1, 2000, [{id: "molecules", count: 0}]),

  star: new Task("star", "Shape Stars", 1, 4000, [{id: "light", count: 0}, {id: "elements", count: 0}]),
  fusion: new Task("fusion", "Fuse Atoms", 8, 3*min, [{id: "star", count: 0}, {id: "electricity", count: 0}]),
  planet: new Task("planet", "Develop Planets", 1, 4000, [{id: "molecules", count: 0}, {id: "elements", count: 0}]),
  starsystem: new Task("starsystem", "Arrange Systems", 1, 4000, [{id: "planet", count: 0}, {id: "star", count: 0}]),
  galaxy: new Task("galaxy", "Spin Galaxies", 1, 4000, [{id: "starsystem", count: 0}]),
  cluster: new Task("cluster", "Group Clusters", 1, 4000, [{id: "galaxy", count: 0}]),
  supercluster: new Task("supercluster", "Cluster Superclusters", 1, 4000, [{id: "cluster", count: 0}]),

  life: new Task("life", "Breathe Life", 1, 10000, [{id: "compounds", count: 0}, {id: "light", count: 0}, {id: "electricity", count: 0}]),
  cell: new Task("cell", "Split Cell", 10, 1000, [{id: "life", count: 0}]),
  movement: new Task("movement", "Kickstart Movement", 1, 5000, [{id: "cell", count: 2}]),
  senses: new Task("senses", "Sharpen Senses", 1, 5000, [{id: "cell", count: 2}]),
  complexity: new Task("complexity", "Begin Complexity", 1, 10000, [{id: "cell", count: 4}]),

  plant: new Task("plant", "Grow Plants", 1, 10000, [{id: "complexity", count: 0}, {id: "cell", count: 1}, {id: "light", count: 0}]),
  fruit: new Task("fruit", "Fertilize Fruit", 1, 2000, [{id: "plant", count: 0}]),
  animal: new Task("animal", "Prototype Animals", 1, 2000, [{id: "fruit", count: 0}, {id: "cell", count: 1}, {id: "movement", count: 0}, {id: "senses", count: 0}]),
  breed: new Task("breed", "Breed Animals", 5, 2000, [{id: "animal", count: 0}], false, [{id: "breed", count: -1}, {id: "animal", count: 1}]),
  primates: new Task("primates", "Evolve Primates", 1, 10000, [{id: "animal", count: 5}]),
  human: new Task("human", "First Humans", 1, 10000, [{id: "primates", count: 0}]),

  village: new Task("village", "Live Together", 1, 5000, [{id: "human", count: 0}], 0, {id: "CHOICE_RELIGION", hidden: true, count: 1}),
  colony: new Task("colony", "Colonize Together", 1, 5000, [{id: "village", count: 0}, {id: "human", count: 0}]),

  religion: new Task("religion", "Become Faithful", 1, 10000, [{id: "human", count: 0}, {id: "CHOICE_RELIGION", hidden: true, count: 1}, {id: "village", count: 0}, {id: "aura", count: -1}, {id: "atheism", count: -1}]),
  atheism: new Task("atheism", "Reject Faith", 1, 10000, [{id: "human", count: 0},  {id: "CHOICE_RELIGION", hidden: true, count: 1}, {id: "village", count: 0}, {id: "religion", count: -1}]),

  magic: new Task("magic", "Discover Magic", 1, 20000, [{id: "human", count: 0}, {id: "village", count: 0}, {id: "mana", count: 0}]),
  mage: new Task("mage", "Train Mages", 1, 5000, [{id: "human", count: 0}, {id: "magic", count: 0}]),
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
    this.tryToRemoveTasks = this.tryToRemoveTasks.bind(this);
    this.onTaskFinish = this.onTaskFinish.bind(this);
  }

  // callback for when the start button is pressed on the card component
  // consumes ingredients and removes unqualified tasks if necessary
  onTaskStart(parent) {
    // remove our resources
    for(let i = 0; i < parent.requirements.length; i++) {
      let req = parent.requirements[i];
      if(req.count > 0 && !req.keep)
        this.completed[req.id] -= req.count
    }

    this.tryToRemoveTasks();
  }

  tryToRemoveTasks() {
    // this is needed so we can reference this class where `this` would represent something else in a different scope
    let controls = this;

    // check if we need to remove some tasks
    this.state.todo.forEach((task, i) => {
      if(task === parent) {
        return;
      }
      let ref = this.refs["task_" + task.id + "_" + task.times];
      let card = $(ref.refs.card);

      // we don't want to interrupt this!
      if(ref.started)
        return;

      // check if this task has enough ingredients
      for(let j = 0; j < task.requirements.length; j++) {
        let req = task.requirements[j];

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

                  // make sure we're actually removing what we think we're removing
                  let index = controls.state.todo.indexOf(task);
                  if(index < 0)
                    return;

                  // finally remove the task
                  controls.state.todo.splice(index, 1);
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

    // give potential for multiple outputs
    for(let i = 0; i < task.output.length; i++) {
      let output = task.output[i];
      this.completed[output.id] = (this.completed[output.id] || 0) + output.count;
    }

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

    this.tryToRemoveTasks();
  }

  render() {
    return (<div>
      {this.state.todo.map((t, i) => <Card key={t.id + "_" + t.times} ref={"task_" + t.id + "_" + t.times} task={t} onTaskStart={this.onTaskStart} onTaskFinish={this.onTaskFinish}/>)}
    </div>)
  }
}

ReactDOM.render(<Controls/>, document.getElementById("controls"));