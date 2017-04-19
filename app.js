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

      if(req.hidden)
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


// All available tasks
let tasks = {
  elements: new Task("elements", "Create Elements", 1, 2000, [], 0, [{id: "earth", count: 984}, {id: "air", count: 344}, {id: "fire", count: 731}, {id: "water", count: 911}]),
  dust: new Task("dust", "Dust", -1, 2000, [{id: "earth", count: 1}, {id: "air", count: 1}]),
  lava: new Task("lava", "Lava", -1, 2000, [{id: "earth", count: 1}, {id: "fire", count: 1}]),
  swamp: new Task("swamp", "Swamp", -1, 2000, [{id: "earth", count: 1}, {id: "water", count: 1}]),
  alcohol: new Task("alcohol", "Alcohol", -1, 2000, [{id: "fire", count: 1}, {id: "water", count: 1}]),
  energy: new Task("energy", "Energy", -1, 2000, [{id: "fire", count: 1}, {id: "air", count: 1}]),
  steam: new Task("steam", "Steam", -1, 2000, [{id: "air", count: 1}, {id: "water", count: 1}]),
  life: new Task("life", "Life", -1, 2000, [{id: "swamp", count: 1}, {id: "energy", count: 1}]),
  bacteria: new Task("bacteria", "Bacteria", -1, 2000, [{id: "life", count: 1}, {id: "swamp", count: 1}]),
  weeds: new Task("weeds", "Weeds", -1, 2000, [{id: "life", count: 1}, {id: "water", count: 1}]),
  storm: new Task("storm", "Storm", -1, 2000, [{id: "energy", count: 1}, {id: "air", count: 1}]),
  moss: new Task("moss", "Moss", -1, 2000, [{id: "weeds", count: 1}, {id: "swamp", count: 1}]),
  fern: new Task("fern", "Fern", -1, 2000, [{id: "moss", count: 1}, {id: "swamp", count: 1}]),
  worm: new Task("worm", "Worm", -1, 2000, [{id: "bacteria", count: 1}, {id: "swamp", count: 1}]),
  sulfur: new Task("sulfur", "Sulfur", -1, 2000, [{id: "bacteria", count: 1}, {id: "swamp", count: 1}]),
  beetle: new Task("beetle", "Beetle", -1, 2000, [{id: "worm", count: 1}, {id: "earth", count: 1}]),
  stone: new Task("stone", "Stone", -1, 2000, [{id: "lava", count: 1}, {id: "water", count: 1}]),
  sand: new Task("sand", "Sand", -1, 2000, [{id: "stone", count: 1}, {id: "water", count: 1}]),
  scorpion: new Task("scorpion", "Scorpion", -1, 2000, [{id: "beetle", count: 1}, {id: "sand", count: 1}]),
  egg: new Task("egg", "Egg", -1, 2000, [{id: "life", count: 1}, {id: "stone", count: 1}]),
  dinosaur: new Task("dinosaur", "Dinosaur", -1, 2000, [{id: "egg", count: 1}, {id: "earth", count: 1}]),
  dragon: new Task("dragon", "Dragon", -1, 2000, [{id: "dinosaur", count: 1}, {id: "air", count: 1}]),
  lizard: new Task("lizard", "Lizard", -1, 2000, [{id: "egg", count: 1}, {id: "swamp", count: 1}]),
  bird: new Task("bird", "Bird", -1, 2000, [{id: "lizard", count: 1}, {id: "air", count: 1}]),
  vodka: new Task("vodka", "Vodka", -1, 2000, [{id: "water", count: 1}, {id: "alcohol", count: 1}]),
  plankton: new Task("plankton", "Plankton", -1, 2000, [{id: "bacteria", count: 1}, {id: "water", count: 1}]),
  phoenix: new Task("phoenix", "Phoenix", -1, 2000, [{id: "bird", count: 1}, {id: "fire", count: 1}]),
  thunderbird: new Task("thunderbird", "Thunderbird", -1, 2000, [{id: "bird", count: 1}, {id: "storm", count: 1}]),
  beast: new Task("beast", "Beast", -1, 2000, [{id: "lizard", count: 1}, {id: "earth", count: 1}]),
  human: new Task("human", "Human", -1, 2000, [{id: "beast", count: 1}, {id: "life", count: 1}]),
  wizard: new Task("wizard", "Wizard", -1, 2000, [{id: "human", count: 1}, {id: "energy", count: 1}]),
  demigod: new Task("demigod", "Demigod", -1, 2000, [{id: "wizard", count: 1}, {id: "energy", count: 1}]),
  blood: new Task("blood", "Blood", -1, 2000, [{id: "human", count: 1}, {id: "dinosaur", count: 1}]),
  vampire: new Task("vampire", "Vampire", -1, 2000, [{id: "human", count: 1}, {id: "blood", count: 1}]),
  animal: new Task("animal", "Animal", -1, 2000, [{id: "human", count: 1}, {id: "beast", count: 1}]),
  wool: new Task("wool", "Wool", -1, 2000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  meat: new Task("meat", "Meat", -1, 2000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  milk: new Task("milk", "Milk", -1, 2000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  metal: new Task("metal", "Metal", -1, 2000, [{id: "stone", count: 1}, {id: "fire", count: 1}]),
  tools: new Task("tools", "Tools", -1, 2000, [{id: "human", count: 1}, {id: "metal", count: 1}]),
  weapon: new Task("weapon", "Weapon", -1, 2000, [{id: "tools", count: 1}, {id: "metal", count: 1}]),
  sex: new Task("sex", "Sex", -1, 2000, [{id: "human", count: 1}, {id: "human", count: 1}]),
  hunter: new Task("hunter", "Hunter", -1, 2000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  clay: new Task("clay", "Clay", -1, 2000, [{id: "swamp", count: 1}, {id: "sand", count: 1}]),
  golem: new Task("golem", "Golem", -1, 2000, [{id: "life", count: 1}, {id: "clay", count: 1}]),
  warrior: new Task("warrior", "Warrior", -1, 2000, [{id: "hunter", count: 1}, {id: "weapon", count: 1}]),
  hero: new Task("hero", "Hero", -1, 2000, [{id: "warrior", count: 1}, {id: "dragon", count: 1}]),
  mushroom: new Task("mushroom", "Mushroom", -1, 2000, [{id: "earth", count: 1}, {id: "weeds", count: 1}]),
  werewolf: new Task("werewolf", "Werewolf", -1, 2000, [{id: "beast", count: 1}, {id: "vampire", count: 1}]),
  seeds: new Task("seeds", "Seeds", -1, 2000, [{id: "sand", count: 1}, {id: "life", count: 1}]),
  tree: new Task("tree", "Tree", -1, 2000, [{id: "seeds", count: 1}, {id: "earth", count: 1}]),
  ceramics: new Task("ceramics", "Ceramics", -1, 2000, [{id: "human", count: 1}, {id: "clay", count: 1}]),
  hut: new Task("hut", "Hut", -1, 2000, [{id: "stone", count: 1}, {id: "human", count: 1}]),
  treant: new Task("treant", "Treant", -1, 2000, [{id: "tree", count: 1}, {id: "life", count: 1}]),
  ghost: new Task("ghost", "Ghost", -1, 2000, [{id: "treant", count: 1}, {id: "fire", count: 1}]),
  coal: new Task("coal", "Coal", -1, 2000, [{id: "tree", count: 1}, {id: "fire", count: 1}]),
  boiler: new Task("boiler", "Boiler", -1, 2000, [{id: "steam", count: 1}, {id: "metal", count: 1}]),
  engine: new Task("engine", "Engine", -1, 2000, [{id: "boiler", count: 1}, {id: "coal", count: 1}]),
  wood: new Task("wood", "Wood", -1, 2000, [{id: "tree", count: 1}, {id: "tools", count: 1}]),
  boat: new Task("boat", "Boat", -1, 2000, [{id: "wood", count: 1}, {id: "water", count: 1}]),
  ship: new Task("ship", "Ship", -1, 2000, [{id: "boat", count: 1}, {id: "wood", count: 1}]),
  fabric: new Task("fabric", "Fabric", -1, 2000, [{id: "wool", count: 1}, {id: "tools", count: 1}]),
  clothes: new Task("clothes", "Clothes", -1, 2000, [{id: "fabric", count: 1}, {id: "human", count: 1}]),
  frigate: new Task("frigate", "Frigate", -1, 2000, [{id: "fabric", count: 1}, {id: "ship", count: 1}]),
  steamship: new Task("steamship", "Steam Ship", -1, 2000, [{id: "ship", count: 1}, {id: "engine", count: 1}]),
  wheel: new Task("wheel", "Wheel", -1, 2000, [{id: "tools", count: 1}, {id: "wood", count: 1}]),
  cart: new Task("cart", "Cart", -1, 2000, [{id: "wheel", count: 1}, {id: "wood", count: 1}]),
  locomotive: new Task("locomotive", "Locomotive", -1, 2000, [{id: "cart", count: 1}, {id: "engine", count: 1}]),
  oil: new Task("oil", "Oil", -1, 2000, [{id: "water", count: 1}, {id: "coal", count: 1}]),
  car: new Task("car", "Car", -1, 2000, [{id: "oil", count: 1}, {id: "cart", count: 1}]),
  airplane: new Task("airplane", "Airplane", -1, 2000, [{id: "car", count: 1}, {id: "air", count: 1}]),
  chariot: new Task("chariot", "Chariot", -1, 2000, [{id: "beast", count: 1}, {id: "cart", count: 1}]),
  alcoholic: new Task("alcoholic", "Alcoholic", -1, 2000, [{id: "vodka", count: 1}, {id: "human", count: 1}]),
  grass: new Task("grass", "Grass", -1, 2000, [{id: "moss", count: 1}, {id: "earth", count: 1}]),
  field: new Task("field", "Field", -1, 2000, [{id: "tools", count: 1}, {id: "earth", count: 1}]),
  wheat: new Task("wheat", "Wheat", -1, 2000, [{id: "field", count: 1}, {id: "seeds", count: 1}]),
  flour: new Task("flour", "Flour", -1, 2000, [{id: "wheat", count: 1}, {id: "stone", count: 1}]),
  dough: new Task("dough", "Dough", -1, 2000, [{id: "flour", count: 1}, {id: "water", count: 1}]),
  bread: new Task("bread", "Bread", -1, 2000, [{id: "dough", count: 1}, {id: "fire", count: 1}]),
  beer: new Task("beer", "Beer", -1, 2000, [{id: "bread", count: 1}, {id: "alcohol", count: 1}]),
  reed: new Task("reed", "Reed", -1, 2000, [{id: "grass", count: 1}, {id: "swamp", count: 1}]),
  paper: new Task("paper", "Paper", -1, 2000, [{id: "reed", count: 1}, {id: "tools", count: 1}]),
  feather: new Task("feather", "Feather", -1, 2000, [{id: "hunter", count: 1}, {id: "bird", count: 1}]),
  book: new Task("book", "Book", -1, 2000, [{id: "feather", count: 1}, {id: "paper", count: 1}]),
  electricity: new Task("electricity", "Electricity", -1, 2000, [{id: "energy", count: 1}, {id: "metal", count: 1}]),
  corpse: new Task("corpse", "Corpse", -1, 2000, [{id: "warrior", count: 1}, {id: "human", count: 1}]),
  zombie: new Task("zombie", "Zombie", -1, 2000, [{id: "corpse", count: 1}, {id: "life", count: 1}]),
  ghoul: new Task("ghoul", "Ghoul", -1, 2000, [{id: "zombie", count: 1}, {id: "corpse", count: 1}]),
  poison: new Task("poison", "Poison", -1, 2000, [{id: "mushroom", count: 1}, {id: "tools", count: 1}]),
  dart: new Task("dart", "Dart", -1, 2000, [{id: "poison", count: 1}, {id: "weapon", count: 1}]),
  assassin: new Task("assassin", "Assassin", -1, 2000, [{id: "dart", count: 1}, {id: "human", count: 1}]),
  glass: new Task("glass", "Glass", -1, 2000, [{id: "sand", count: 1}, {id: "fire", count: 1}]),
  tobacco: new Task("tobacco", "Tobacco", -1, 2000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  cigarette: new Task("cigarette", "Cigarette", -1, 2000, [{id: "tobacco", count: 1}, {id: "paper", count: 1}]),
  fertilizer: new Task("fertilizer", "Fertilizer", -1, 2000, [{id: "animal", count: 1}, {id: "grass", count: 1}]),
  shell: new Task("shell", "Shell", -1, 2000, [{id: "stone", count: 1}, {id: "plankton", count: 1}]),
  limestone: new Task("limestone", "Limestone", -1, 2000, [{id: "shell", count: 1}, {id: "stone", count: 1}]),
  saltpeter: new Task("saltpeter", "Saltpeter", -1, 2000, [{id: "fertilizer", count: 1}, {id: "limestone", count: 1}]),
  gunpowder: new Task("gunpowder", "Gunpowder", -1, 2000, [{id: "saltpeter", count: 1}, {id: "sulfur", count: 1}]),
  firearm: new Task("firearm", "Firearm", -1, 2000, [{id: "gunpowder", count: 1}, {id: "weapon", count: 1}]),
  cement: new Task("cement", "Cement", -1, 2000, [{id: "limestone", count: 1}, {id: "clay", count: 1}]),
  snake: new Task("snake", "Snake", -1, 2000, [{id: "worm", count: 1}, {id: "sand", count: 1}]),
  fish: new Task("fish", "Fish", -1, 2000, [{id: "snake", count: 1}, {id: "water", count: 1}]),
  concrete: new Task("concrete", "Concrete", -1, 2000, [{id: "cement", count: 1}, {id: "water", count: 1}]),
  bricks: new Task("bricks", "Bricks", -1, 2000, [{id: "clay", count: 1}, {id: "fire", count: 1}]),
  house: new Task("house", "House", -1, 2000, [{id: "bricks", count: 1}, {id: "concrete", count: 1}]),
  skyscraper: new Task("skyscraper", "Skyscraper", -1, 2000, [{id: "house", count: 1}, {id: "glass", count: 1}]),
  butterfly: new Task("butterfly", "Butterfly", -1, 2000, [{id: "worm", count: 1}, {id: "air", count: 1}]),
  dolphin: new Task("dolphin", "Dolphin", -1, 2000, [{id: "fish", count: 1}, {id: "beast", count: 1}]),
  whale: new Task("whale", "Whale", -1, 2000, [{id: "beast", count: 1}, {id: "water", count: 1}]),
  turtle: new Task("turtle", "Turtle", -1, 2000, [{id: "egg", count: 1}, {id: "sand", count: 1}]),
};

// Initial Tasks
let initial = [tasks.elements];


// Controls component: manages tasks
class Controls extends React.Component {
  constructor(props) {
    super(props);

    // list of all tasks
    this.tasks = tasks

    this.showInventory = false;
    
    this.state = {
      todo: initial, // initial tasks are displayed
      completed: {} // storage for completed tasks and how many times the tasks were completed
        // {[taskId]: num}
    };

    this.onTaskStart = this.onTaskStart.bind(this);
    this.tryToRemoveTasks = this.tryToRemoveTasks.bind(this);
    this.onTaskFinish = this.onTaskFinish.bind(this);
    this.toggleInventory = this.toggleInventory.bind(this);
  }

  // callback for when the start button is pressed on the card component
  // consumes ingredients and removes unqualified tasks if necessary
  onTaskStart(parent) {
    // remove our resources
    for(let i = 0; i < parent.requirements.length; i++) {
      let req = parent.requirements[i];
      if(req.count > 0 && !req.keep)
        this.state.completed[req.id] -= req.count
    }

    this.setState({completed: this.state.completed});

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
        if((controls.state.completed[req.id] || 0) < req.count || req.count == 0 && !controls.state.completed[req.id] || req.count < 0 && controls.state.completed[req.id]) {
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
    if(!this.state.completed[task.id])
      this.state.completed[task.id] = 1;
    else // complete it again
      this.state.completed[task.id] ++;

    // give potential for multiple outputs
    for(let i = 0; i < task.output.length; i++) {
      let output = task.output[i];
      this.state.completed[output.id] = (this.state.completed[output.id] || 0) + output.count;
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
        if((this.state.completed[req.id] || 0) < req.count || req.count == 0 && !this.state.completed[req.id] || req.count < 0 && this.state.completed[req.id]) {
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
      todo: this.state.todo,
      completed: this.state.completed
    });

    this.tryToRemoveTasks();
  }

  toggleInventory() {
    let show = this.showInventory = !this.showInventory;
    let toolbar = $(this.refs.toolbar);
    toolbar.animate({
      bottom: show ? 0 : $('body').height() - 60
    }, {
      complete() {
        if(!show)
          toolbar.css('bottom', 'calc(100vh - 60px)');
      }
    });
  }

  render() {
    return (<div>
      <div className="card-container">
        {this.state.todo.map((t, i) => <Card key={t.id + "_" + t.times} ref={"task_" + t.id + "_" + t.times} task={t} onTaskStart={this.onTaskStart} onTaskFinish={this.onTaskFinish}/>)}
      </div>
      <div className="toolbar" ref="toolbar">
        <div className="inventory">
          <div className="inventory-content">
            {Object.keys(this.state.completed).map(k => (
              this.state.completed[k] > -1 && <span className="inventory-item" key={k}>
                {this.state.completed[k] + " " + k}
              </span>
            ))}
          </div>
        </div>
        <div className="toolbar-content" onClick={this.toggleInventory}>
          <i className="material-icons">shopping_cart</i>
        </div>
      </div>
    </div>);
  }
}

ReactDOM.render(<Controls/>, document.getElementById("controls"));