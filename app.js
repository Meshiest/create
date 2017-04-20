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
    this.started = false;
    this.startTime = 0;
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
  start(time) {
    this.setState({
      startTime: time || Date.now()
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

    this.started = this.props.task.started;
    this.visible = false;

    this.state = {
      duration: this.props.task.duration, // how long it takes to do (from task)
      startTime: this.props.task.startTime, // when the task was started
      started: this.props.task.started // if the task was started
    };

    this.start = this.start.bind(this);
    this.finish = this.finish.bind(this);
    this.appear = this.appear.bind(this);
  }

  // show an animation when this card mounts
  componentDidMount() {
    this.appear();
  }

  // card entrance animation
  appear() {
    if(this.visible)
      return;

    let card = $(this.refs.card);
    let comp = this;
    card.css("opacity", 0);
    card.animate({opacity: 1}, {
      step(now, fx) {
        card.css('transform', 'translateX(-'+(100-now*100)+"%)");
      },
      duration: "slow",
      complete() {
        comp.visible = true;
        if(comp.state.started) {
          comp.start(comp.state.startTime);
        }
      }
    });
  }

  // called on the start button click, starts the progress bar
  start(time) {
    if(!this.refs.progressBar) {
      window.requestAnimationFrame(()=>{this.start(time)}.bind(this));
      return;
    }

    if(!this.props.canAfford(this.props.task) || !this.visible) {
      return;
    }

    this.props.task.startTime = time || Date.now();
    this.props.task.started = true;

    this.setState({
      started: true,
      startTime: time || Date.now()
    });

    this.props.onTaskStart(this.props.task);
    this.refs.progressBar.start(time);
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
        comp.visible = false;
        if(comp.props.canAfford(comp.props.task))
          comp.props.onTaskFinish(comp.props.task);
        else
          card.animate({height: 0}, {
            duration: "fast",
            complete(){
              comp.props.onTaskFinish(comp.props.task);
            }
          });
      }
    });
  }

  // rendering of the card
  render() {
    let requirements = {};
    let output = hidden[this.props.task.id] ? {} : {[this.props.task.id]: 1};
    
    for(let i = 0; i < this.props.task.output.length; i++) {
      let out = this.props.task.output[i];

      if(out.hidden || hidden[out.id])
        continue;

      output[out.id] = (output[out.id] || 0) + out.count;
    }

    for(let i = 0; i < this.props.task.requirements.length; i++) {
      let req = this.props.task.requirements[i];

      if(req.hidden || hidden[req.id])
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
                className={"card-requirement " + (requirements[id] > 0 ? "remove" : "needed")}>{(requirements[id] > 0 ? requirements[id] + " " : "") + id}</span>
            ))}
          </div>
        </div>
        <div className="card-button">
          <button onClick={()=>{if(!this.state.started) this.start()}.bind(this)} className={this.state.started ? "started" : ""}>
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
  things: new Task("things", "Create Things", 1, 5000, [{id: "__start", count: 1}], 0, [{id: "fire", count: 7460}, {id: "water", count: 8433}, {id: "air", count: 3083}, {id: "earth", count: 9006}, {id: "light", count: 3556}]),
  alcohol: new Task("alcohol", "Alcohol", -1, 3000, [{id: "fire", count: 1}, {id: "water", count: 1}]),
  steam: new Task("steam", "Steam", -1, 3000, [{id: "air", count: 1}, {id: "water", count: 1}]),
  lava: new Task("lava", "Lava", -1, 3000, [{id: "earth", count: 1}, {id: "fire", count: 1}]),
  swamp: new Task("swamp", "Swamp", -1, 3000, [{id: "earth", count: 1}, {id: "water", count: 1}]),
  energy: new Task("energy", "Energy", -1, 3000, [{id: "fire", count: 1}, {id: "air", count: 1}]),
  life: new Task("life", "Life", -1, 6000, [{id: "swamp", count: 1}, {id: "energy", count: 1}, {id: "light", count: 1}]),
  bacteria: new Task("bacteria", "Bacteria", -1, 9000, [{id: "life", count: 1}, {id: "swamp", count: 1}, {id: "light", count: 1}]),
  weeds: new Task("weeds", "Weeds", -1, 8000, [{id: "life", count: 1}, {id: "water", count: 1}, {id: "light", count: 1}]),
  storm: new Task("storm", "Storm", -1, 4000, [{id: "energy", count: 1}, {id: "air", count: 1}]),
  moss: new Task("moss", "Moss", -1, 11000, [{id: "weeds", count: 1}, {id: "swamp", count: 1}, {id: "light", count: 1}]),
  fern: new Task("fern", "Fern", -1, 14000, [{id: "moss", count: 1}, {id: "swamp", count: 1}, {id: "light", count: 1}]),
  worm: new Task("worm", "Worm", -1, 11000, [{id: "bacteria", count: 1}, {id: "swamp", count: 1}]),
  sulfur: new Task("sulfur", "Sulfur", -1, 11000, [{id: "bacteria", count: 1}, {id: "swamp", count: 1}]),
  beetle: new Task("beetle", "Beetle", -1, 12000, [{id: "worm", count: 1}, {id: "earth", count: 1}]),
  stone: new Task("stone", "Stone", -1, 4000, [{id: "lava", count: 1}, {id: "water", count: 1}]),
  sand: new Task("sand", "Sand", -1, 5000, [{id: "stone", count: 1}, {id: "water", count: 1}]),
  scorpion: new Task("scorpion", "Scorpion", -1, 16000, [{id: "beetle", count: 1}, {id: "sand", count: 1}]),
  egg: new Task("egg", "Egg", -1, 9000, [{id: "life", count: 1}, {id: "stone", count: 1}]),
  dinosaur: new Task("dinosaur", "Dinosaur", -1, 10000, [{id: "egg", count: 1}, {id: "earth", count: 1}]),
  dragon: new Task("dragon", "Dragon", -1, 13000, [{id: "dinosaur", count: 1}, {id: "air", count: 1}, {id: "fire", count: 1}, {id: "light", count: 1}]),
  lizard: new Task("lizard", "Lizard", -1, 11000, [{id: "egg", count: 1}, {id: "swamp", count: 1}]),
  bird: new Task("bird", "Bird", -1, 13000, [{id: "lizard", count: 1}, {id: "air", count: 1}, {id: "light", count: 1}]),
  vodka: new Task("vodka", "Vodka", -1, 4000, [{id: "water", count: 1}, {id: "alcohol", count: 1}]),
  plankton: new Task("plankton", "Plankton", -1, 11000, [{id: "bacteria", count: 1}, {id: "water", count: 1}, {id: "light", count: 1}]),
  phoenix: new Task("phoenix", "Phoenix", -1, 15000, [{id: "bird", count: 1}, {id: "fire", count: 1}, {id: "light", count: 1}]),
  thunderbird: new Task("thunderbird", "Thunderbird", -1, 16000, [{id: "bird", count: 1}, {id: "storm", count: 1}]),
  beast: new Task("beast", "Beast", -1, 12000, [{id: "lizard", count: 1}, {id: "earth", count: 1}]),
  human: new Task("human", "Human", -1, 17000, [{id: "beast", count: 1}, {id: "life", count: 1}]),
  magic: new Task("magic", "Magic", -1, 20000, [{id: "energy", count: 1}, {id: "light", count: 1}, {id: "human", count: 1}]),
  sorcery: new Task("sorcery", "Sorcery", -1, 23000, [{id: "magic", count: 1}, {id: "stone", count: 1}]),
  necromancer: new Task("necromancer", "Necromancer", -1, 92000, [{id: "skull", count: 1}, {id: "wizard", count: 1}]),
  wizard: new Task("wizard", "Wizard", -1, 36000, [{id: "magic", count: 1}, {id: "human", count: 1}]),
  demigod: new Task("demigod", "Demigod", -1, 39000, [{id: "wizard", count: 1}, {id: "energy", count: 1}, {id: "light", count: 1}]),
  vampire: new Task("vampire", "Vampire", -1, 57000, [{id: "human", count: 1}, {id: "blood", count: 1}]),
  slayer: new Task("slayer", "Slayer", -1, 91000, [{id: "vampire", count: 1}, {id: "mirror", count: 1}, {id: "wood", count: 1}]),
  animal: new Task("animal", "Animal", -1, 28000, [{id: "human", count: 1}, {id: "beast", count: 1}]),
  wool: new Task("wool", "Wool", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  meat: new Task("meat", "Meat", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  milk: new Task("milk", "Milk", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  metal: new Task("metal", "Metal", -1, 5000, [{id: "stone", count: 1}, {id: "fire", count: 1}]),
  tools: new Task("tools", "Tools", -1, 21000, [{id: "human", count: 1}, {id: "metal", count: 1}]),
  weapon: new Task("weapon", "Weapon", -1, 25000, [{id: "tools", count: 1}, {id: "metal", count: 1}]),
  sex: new Task("sex", "Sex", -1, 33000, [{id: "human", count: 2}]),
  love: new Task("love", "Love", -1, 43000, [{id: "human", count: 2}, {id: "time", count: 1}]),
  children: new Task("children", "Children", -1, 85000, [{id: "sex", count: 1}, {id: "love", count: 1}, {id: "time", count: 1}]),
  abuse: new Task("abuse", "Abuse", -1, 104000, [{id: "alcoholic", count: 1}, {id: "children", count: 1}]),
  hunter: new Task("hunter", "Hunter", -1, 54000, [{id: "human", count: 1}, {id: "spear", count: 1}]),
  ninja: new Task("ninja", "Ninja", -1, 122000, [{id: "hunter", count: 1}, {id: "assassin", count: 1}]),
  ninjutsu: new Task("ninjutsu", "Ninjutsu", -1, 141000, [{id: "ninja", count: 1}, {id: "magic", count: 1}]),
  katana: new Task("katana", "Katana", -1, 45000, [{id: "weapon", count: 1}, {id: "tools", count: 1}]),
  clay: new Task("clay", "Clay", -1, 7000, [{id: "swamp", count: 1}, {id: "sand", count: 1}]),
  golem: new Task("golem", "Golem", -1, 12000, [{id: "life", count: 1}, {id: "clay", count: 1}]),
  warrior: new Task("warrior", "Warrior", -1, 41000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  armor: new Task("armor", "Armor", -1, 116000, [{id: "tools", count: 1}, {id: "metal", count: 1}, {id: "leather", count: 1}]),
  knight: new Task("knight", "Knight", -1, 156000, [{id: "armor", count: 1}, {id: "warrior", count: 1}]),
  hero: new Task("hero", "Hero", -1, 169000, [{id: "knight", count: 1}, {id: "dragon", count: 1}, {id: "light", count: 1}]),
  mushroom: new Task("mushroom", "Mushroom", -1, 9000, [{id: "earth", count: 1}, {id: "weeds", count: 1}]),
  werewolf: new Task("werewolf", "Werewolf", -1, 68000, [{id: "beast", count: 1}, {id: "vampire", count: 1}]),
  seeds: new Task("seeds", "Seeds", -1, 10000, [{id: "sand", count: 1}, {id: "life", count: 1}]),
  tree: new Task("tree", "Tree", -1, 11000, [{id: "seeds", count: 1}, {id: "earth", count: 1}]),
  ceramics: new Task("ceramics", "Ceramics", -1, 23000, [{id: "human", count: 1}, {id: "clay", count: 1}]),
  hut: new Task("hut", "Hut", -1, 20000, [{id: "stone", count: 1}, {id: "human", count: 1}]),
  treant: new Task("treant", "Treant", -1, 16000, [{id: "tree", count: 1}, {id: "life", count: 1}]),
  ghost: new Task("ghost", "Ghost", -1, 17000, [{id: "treant", count: 1}, {id: "fire", count: 1}]),
  coal: new Task("coal", "Coal", -1, 12000, [{id: "tree", count: 1}, {id: "fire", count: 1}]),
  boiler: new Task("boiler", "Boiler", -1, 7000, [{id: "steam", count: 1}, {id: "metal", count: 1}]),
  steamengine: new Task("steamengine", "SteamEngine", -1, 18000, [{id: "boiler", count: 1}, {id: "coal", count: 1}]),
  engine: new Task("engine", "Engine", -1, 31000, [{id: "gasoline", count: 1}, {id: "steamengine", count: 1}]),
  gasoline: new Task("gasoline", "Gasoline", -1, 14000, [{id: "oil", count: 1}, {id: "fire", count: 1}]),
  wood: new Task("wood", "Wood", -1, 31000, [{id: "tree", count: 1}, {id: "tools", count: 1}]),
  boat: new Task("boat", "Boat", -1, 32000, [{id: "wood", count: 1}, {id: "water", count: 1}]),
  anchor: new Task("anchor", "Anchor", -1, 36000, [{id: "metal", count: 1}, {id: "boat", count: 1}]),
  ship: new Task("ship", "Ship", -1, 97000, [{id: "boat", count: 1}, {id: "wood", count: 1}, {id: "anchor", count: 1}]),
  fabric: new Task("fabric", "Fabric", -1, 64000, [{id: "wool", count: 1}, {id: "tools", count: 1}]),
  clothes: new Task("clothes", "Clothes", -1, 80000, [{id: "fabric", count: 1}, {id: "human", count: 1}]),
  frigate: new Task("frigate", "Frigate", -1, 160000, [{id: "fabric", count: 1}, {id: "ship", count: 1}]),
  steamship: new Task("steamship", "SteamShip", -1, 127000, [{id: "ship", count: 1}, {id: "engine", count: 1}]),
  wheel: new Task("wheel", "Wheel", -1, 51000, [{id: "tools", count: 1}, {id: "wood", count: 1}]),
  cart: new Task("cart", "Cart", -1, 81000, [{id: "wheel", count: 1}, {id: "wood", count: 1}]),
  locomotive: new Task("locomotive", "Locomotive", -1, 111000, [{id: "cart", count: 1}, {id: "engine", count: 1}]),
  oil: new Task("oil", "Oil", -1, 13000, [{id: "water", count: 1}, {id: "coal", count: 1}]),
  chair: new Task("chair", "Chair", -1, 51000, [{id: "wood", count: 1}, {id: "tools", count: 1}]),
  car: new Task("car", "Car", -1, 174000, [{id: "engine", count: 1}, {id: "cart", count: 1}, {id: "lamp", count: 1}, {id: "chair", count: 1}]),
  wing: new Task("wing", "Wing", -1, 13000, [{id: "air", count: 1}, {id: "mechanism", count: 1}]),
  airplane: new Task("airplane", "Airplane", -1, 197000, [{id: "car", count: 1}, {id: "wing", count: 1}, {id: "circuit", count: 1}]),
  airport: new Task("airport", "Airport", -1, 252000, [{id: "airplane", count: 1}, {id: "building", count: 1}]),
  teacher: new Task("teacher", "Teacher", -1, 73000, [{id: "student", count: 1}, {id: "time", count: 1}]),
  student: new Task("student", "Student", -1, 63000, [{id: "human", count: 1}, {id: "curiosity", count: 1}]),
  school: new Task("school", "School", -1, 289000, [{id: "building", count: 1}, {id: "teacher", count: 1}, {id: "student", count: 1}, {id: "book", count: 1}]),
  paper: new Task("paper", "Paper", -1, 35000, [{id: "reed", count: 1}, {id: "tools", count: 1}]),
  leather: new Task("leather", "Leather", -1, 92000, [{id: "fabric", count: 1}, {id: "animal", count: 1}, {id: "light", count: 1}]),
  book: new Task("book", "Book", -1, 100000, [{id: "feather", count: 1}, {id: "paper", count: 1}]),
  chariot: new Task("chariot", "Chariot", -1, 92000, [{id: "beast", count: 1}, {id: "cart", count: 1}]),
  alcoholic: new Task("alcoholic", "Alcoholic", -1, 20000, [{id: "vodka", count: 1}, {id: "human", count: 1}]),
  grass: new Task("grass", "Grass", -1, 13000, [{id: "moss", count: 1}, {id: "earth", count: 1}, {id: "light", count: 1}]),
  field: new Task("field", "Field", -1, 22000, [{id: "tools", count: 1}, {id: "earth", count: 1}]),
  wheat: new Task("wheat", "Wheat", -1, 33000, [{id: "field", count: 1}, {id: "seeds", count: 1}, {id: "light", count: 1}, {id: "water", count: 1}]),
  flour: new Task("flour", "Flour", -1, 36000, [{id: "wheat", count: 1}, {id: "stone", count: 1}]),
  dough: new Task("dough", "Dough", -1, 37000, [{id: "flour", count: 1}, {id: "water", count: 1}]),
  sugar: new Task("sugar", "Sugar", -1, 23000, [{id: "field", count: 1}, {id: "light", count: 1}]),
  cake: new Task("cake", "Cake", -1, 109000, [{id: "sugar", count: 1}, {id: "egg", count: 1}, {id: "milk", count: 1}, {id: "flour", count: 1}]),
  bread: new Task("bread", "Bread", -1, 39000, [{id: "dough", count: 1}, {id: "fire", count: 1}, {id: "air", count: 1}]),
  beer: new Task("beer", "Beer", -1, 41000, [{id: "bread", count: 1}, {id: "alcohol", count: 1}]),
  grape: new Task("grape", "Grape", -1, 23000, [{id: "seeds", count: 1}, {id: "fruit", count: 1}, {id: "light", count: 1}]),
  fruit: new Task("fruit", "Fruit", -1, 13000, [{id: "tree", count: 1}, {id: "earth", count: 1}, {id: "water", count: 1}]),
  wine: new Task("wine", "Wine", -1, 33000, [{id: "grape", count: 1}, {id: "time", count: 1}]),
  reed: new Task("reed", "Reed", -1, 15000, [{id: "grass", count: 1}, {id: "swamp", count: 1}]),
  feather: new Task("feather", "Feather", -1, 66000, [{id: "hunter", count: 1}, {id: "bird", count: 1}]),
  electricity: new Task("electricity", "Electricity", -1, 8000, [{id: "energy", count: 1}, {id: "metal", count: 1}, {id: "light", count: 1}]),
  corpse: new Task("corpse", "Corpse", -1, 57000, [{id: "warrior", count: 1}, {id: "human", count: 1}]),
  skull: new Task("skull", "Skull", -1, 57000, [{id: "warrior", count: 1}, {id: "human", count: 1}]),
  pet: new Task("pet", "Pet", -1, 70000, [{id: "love", count: 1}, {id: "animal", count: 1}]),
  dumb: new Task("dumb", "Dumb", -1, 58000, [{id: "air", count: 1}, {id: "skull", count: 1}]),
  edgar: new Task("edgar", "Edgar", -1, 138000, [{id: "dumb", count: 1}, {id: "pet", count: 1}, {id: "beast", count: 1}]),
  zombie: new Task("zombie", "Zombie", -1, 62000, [{id: "corpse", count: 1}, {id: "life", count: 1}]),
  ghoul: new Task("ghoul", "Ghoul", -1, 118000, [{id: "zombie", count: 1}, {id: "corpse", count: 1}]),
  poison: new Task("poison", "Poison", -1, 29000, [{id: "mushroom", count: 1}, {id: "tools", count: 1}]),
  dart: new Task("dart", "Dart", -1, 53000, [{id: "poison", count: 1}, {id: "weapon", count: 1}]),
  assassin: new Task("assassin", "Assassin", -1, 69000, [{id: "dart", count: 1}, {id: "human", count: 1}]),
  glass: new Task("glass", "Glass", -1, 7000, [{id: "sand", count: 1}, {id: "fire", count: 1}, {id: "light", count: 1}]),
  tobacco: new Task("tobacco", "Tobacco", -1, 14000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  weed: new Task("weed", "Weed", -1, 14000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  baked: new Task("baked", "Baked", -1, 30000, [{id: "weed", count: 1}, {id: "human", count: 1}]),
  cigarette: new Task("cigarette", "Cigarette", -1, 48000, [{id: "tobacco", count: 1}, {id: "paper", count: 1}]),
  joint: new Task("joint", "Joint", -1, 48000, [{id: "weed", count: 1}, {id: "paper", count: 1}]),
  fertilizer: new Task("fertilizer", "Fertilizer", -1, 40000, [{id: "animal", count: 1}, {id: "grass", count: 1}]),
  shell: new Task("shell", "Shell", -1, 14000, [{id: "stone", count: 1}, {id: "plankton", count: 1}]),
  limestone: new Task("limestone", "Limestone", -1, 17000, [{id: "shell", count: 1}, {id: "stone", count: 1}]),
  saltpeter: new Task("saltpeter", "Saltpeter", -1, 56000, [{id: "fertilizer", count: 1}, {id: "limestone", count: 1}]),
  gunpowder: new Task("gunpowder", "Gunpowder", -1, 66000, [{id: "saltpeter", count: 1}, {id: "sulfur", count: 1}]),
  firearm: new Task("firearm", "Firearm", -1, 90000, [{id: "gunpowder", count: 1}, {id: "weapon", count: 1}]),
  cement: new Task("cement", "Cement", -1, 23000, [{id: "limestone", count: 1}, {id: "clay", count: 1}]),
  snake: new Task("snake", "Snake", -1, 15000, [{id: "worm", count: 1}, {id: "sand", count: 1}]),
  fish: new Task("fish", "Fish", -1, 16000, [{id: "snake", count: 1}, {id: "water", count: 1}]),
  concrete: new Task("concrete", "Concrete", -1, 24000, [{id: "cement", count: 1}, {id: "water", count: 1}]),
  bricks: new Task("bricks", "Bricks", -1, 8000, [{id: "clay", count: 1}, {id: "fire", count: 1}]),
  bar: new Task("bar", "Bar", -1, 152000, [{id: "alcoholic", count: 1}, {id: "vodka", count: 1}, {id: "beer", count: 1}, {id: "alcohol", count: 1}, {id: "wine", count: 1}, {id: "building", count: 1}]),
  building: new Task("building", "Building", -1, 56000, [{id: "bricks", count: 1}, {id: "concrete", count: 1}, {id: "hut", count: 1}, {id: "glass", count: 1}]),
  family: new Task("family", "Family", -1, 159000, [{id: "love", count: 1}, {id: "human", count: 2}, {id: "children", count: 1}]),
  house: new Task("house", "House", -1, 256000, [{id: "love", count: 1}, {id: "building", count: 1}, {id: "family", count: 1}]),
  skyscraper: new Task("skyscraper", "Skyscraper", -1, 62000, [{id: "building", count: 1}, {id: "glass", count: 1}]),
  butterfly: new Task("butterfly", "Butterfly", -1, 12000, [{id: "worm", count: 1}, {id: "air", count: 1}]),
  dolphin: new Task("dolphin", "Dolphin", -1, 27000, [{id: "fish", count: 1}, {id: "beast", count: 1}]),
  whale: new Task("whale", "Whale", -1, 13000, [{id: "beast", count: 1}, {id: "water", count: 1}]),
  turtle: new Task("turtle", "Turtle", -1, 13000, [{id: "egg", count: 1}, {id: "sand", count: 1}]),
  crystal: new Task("crystal", "Crystal", -1, 5000, [{id: "light", count: 1}, {id: "stone", count: 1}]),
  torch: new Task("torch", "Torch", -1, 32000, [{id: "fire", count: 1}, {id: "wood", count: 1}]),
  lamp: new Task("lamp", "Lamp", -1, 14000, [{id: "electricity", count: 1}, {id: "glass", count: 1}]),
  mirror: new Task("mirror", "Mirror", -1, 5000, [{id: "light", count: 1}, {id: "stone", count: 1}]),
  ego: new Task("ego", "Ego", -1, 21000, [{id: "mirror", count: 1}, {id: "human", count: 1}]),
  intellect: new Task("intellect", "Intellect", -1, 27000, [{id: "human", count: 1}, {id: "time", count: 1}]),
  science: new Task("science", "Science", -1, 37000, [{id: "intellect", count: 1}, {id: "time", count: 1}]),
  scientist: new Task("scientist", "Scientist", -1, 53000, [{id: "human", count: 1}, {id: "science", count: 1}]),
  lense: new Task("lense", "Lense", -1, 6000, [{id: "light", count: 1}, {id: "crystal", count: 1}]),
  telescope: new Task("telescope", "Telescope", -1, 10000, [{id: "lense", count: 1}, {id: "mirror", count: 1}]),
  solarpanel: new Task("solarpanel", "Solarpanel", -1, 18000, [{id: "glass", count: 1}, {id: "circuit", count: 1}]),
  beaker: new Task("beaker", "Beaker", -1, 43000, [{id: "glass", count: 1}, {id: "science", count: 1}]),
  circuit: new Task("circuit", "Circuit", -1, 12000, [{id: "metal", count: 1}, {id: "electricity", count: 1}]),
  mechanism: new Task("mechanism", "Mechanism", -1, 12000, [{id: "electricity", count: 1}, {id: "metal", count: 1}]),
  processor: new Task("processor", "Processor", -1, 23000, [{id: "circuit", count: 1}, {id: "mechanism", count: 1}]),
  computer: new Task("computer", "Computer", -1, 36000, [{id: "processor", count: 1}, {id: "lamp", count: 1}]),
  internet: new Task("internet", "Internet", -1, 139000, [{id: "science", count: 1}, {id: "computer", count: 2}, {id: "human", count: 2}]),
  camera: new Task("camera", "Camera", -1, 30000, [{id: "mechanism", count: 1}, {id: "lense", count: 1}, {id: "lamp", count: 1}]),
  video: new Task("video", "Video", -1, 54000, [{id: "mechanism", count: 1}, {id: "camera", count: 1}, {id: "battery", count: 1}]),
  porn: new Task("porn", "Porn", -1, 86000, [{id: "sex", count: 1}, {id: "video", count: 1}]),
  pornhub: new Task("pornhub", "Pornhub", -1, 224000, [{id: "porn", count: 1}, {id: "internet", count: 1}]),
  boredom: new Task("boredom", "Boredom", -1, 67000, [{id: "human", count: 1}, {id: "time", count: 5}]),
  memes: new Task("memes", "Memes", -1, 205000, [{id: "internet", count: 1}, {id: "boredom", count: 1}]),
  fiberoptics: new Task("fiberoptics", "FiberOptics", -1, 157000, [{id: "light", count: 1}, {id: "circuit", count: 1}, {id: "glass", count: 1}, {id: "internet", count: 1}]),
  youtube: new Task("youtube", "Youtube", -1, 202000, [{id: "video", count: 1}, {id: "time", count: 1}, {id: "internet", count: 1}]),
  reddit: new Task("reddit", "Reddit", -1, 191000, [{id: "love", count: 1}, {id: "time", count: 1}, {id: "internet", count: 1}]),
  curiosity: new Task("curiosity", "Curiosity", -1, 47000, [{id: "time", count: 3}, {id: "human", count: 1}]),
  google: new Task("google", "Google", -1, 185000, [{id: "curiosity", count: 1}, {id: "internet", count: 1}]),
  hydrazine: new Task("hydrazine", "Hydrazine", -1, 15000, [{id: "gasoline", count: 1}, {id: "water", count: 1}]),
  rocket: new Task("rocket", "Rocket", -1, 211000, [{id: "hydrazine", count: 1}, {id: "airplane", count: 1}]),
  satellite: new Task("satellite", "Satellite", -1, 272000, [{id: "solarpanel", count: 1}, {id: "telescope", count: 1}, {id: "rocket", count: 1}, {id: "computer", count: 1}]),
  space: new Task("space", "Space", -1, 227000, [{id: "rocket", count: 1}, {id: "human", count: 1}]),
  moon: new Task("moon", "Moon", -1, 294000, [{id: "space", count: 1}, {id: "flag", count: 1}]),
  flag: new Task("flag", "Flag", -1, 68000, [{id: "fabric", count: 1}, {id: "metal", count: 1}]),
  rover: new Task("rover", "Rover", -1, 706000, [{id: "car", count: 1}, {id: "space", count: 1}, {id: "moon", count: 1}, {id: "battery", count: 1}]),
  mars: new Task("mars", "Mars", -1, 752000, [{id: "curiosity", count: 1}, {id: "rover", count: 1}]),
  pillage: new Task("pillage", "Pillage", -1, 417000, [{id: "flag", count: 1}, {id: "village", count: 1}, {id: "army", count: 1}]),
  conquer: new Task("conquer", "Conquer", -1, 457000, [{id: "pillage", count: 1}, {id: "blood", count: 1}]),
  blood: new Task("blood", "Blood", -1, 41000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  frontier: new Task("frontier", "Frontier", -1, 643000, [{id: "pillage", count: 1}, {id: "space", count: 1}]),
  flint: new Task("flint", "Flint", -1, 8000, [{id: "stone", count: 1}, {id: "sand", count: 1}]),
  spear: new Task("spear", "Spear", -1, 38000, [{id: "flint", count: 1}, {id: "wood", count: 1}]),
  time: new Task("time", "Time", -1, 11000, [{id: "sand", count: 1}, {id: "glass", count: 1}]),
  anime: new Task("anime", "Anime", -1, 98000, [{id: "time", count: 1}, {id: "video", count: 1}, {id: "paper", count: 1}]),
  monk: new Task("monk", "Monk", -1, 53000, [{id: "human", count: 1}, {id: "intellect", count: 1}, {id: "time", count: 1}]),
  watch: new Task("watch", "Watch", -1, 39000, [{id: "time", count: 1}, {id: "crystal", count: 1}, {id: "circuit", count: 1}, {id: "battery", count: 1}]),
  tribe: new Task("tribe", "Tribe", -1, 49000, [{id: "human", count: 3}]),
  village: new Task("village", "Village", -1, 142000, [{id: "warrior", count: 1}, {id: "hunter", count: 1}, {id: "tribe", count: 1}]),
  colony: new Task("colony", "Colony", -1, 304000, [{id: "tribe", count: 1}, {id: "house", count: 1}]),
  army: new Task("army", "Army", -1, 209000, [{id: "warrior", count: 1}, {id: "hero", count: 1}]),
  king: new Task("king", "King", -1, 346000, [{id: "hero", count: 1}, {id: "royalty", count: 1}]),
  royalty: new Task("royalty", "Royalty", -1, 178000, [{id: "sex", count: 1}, {id: "money", count: 1}]),
  money: new Task("money", "Money", -1, 146000, [{id: "village", count: 1}, {id: "metal", count: 1}]),
  empire: new Task("empire", "Empire", -1, 1105000, [{id: "conquer", count: 1}, {id: "colony", count: 1}, {id: "king", count: 1}]),
  drill: new Task("drill", "Drill", -1, 39000, [{id: "electricity", count: 1}, {id: "tools", count: 1}, {id: "mechanism", count: 1}]),
  acorn: new Task("acorn", "Acorn", -1, 20000, [{id: "tree", count: 1}, {id: "seeds", count: 1}]),
  hair: new Task("hair", "Hair", -1, 110000, [{id: "human", count: 1}, {id: "time", count: 1}, {id: "string", count: 1}]),
  string: new Task("string", "String", -1, 84000, [{id: "fabric", count: 1}, {id: "tools", count: 1}]),
  city: new Task("city", "City", -1, 888000, [{id: "building", count: 2}, {id: "school", count: 1}, {id: "skyscraper", count: 1}, {id: "car", count: 1}, {id: "house", count: 1}]),
  bed: new Task("bed", "Bed", -1, 137000, [{id: "wool", count: 1}, {id: "fabric", count: 1}, {id: "wood", count: 1}]),
  sleep: new Task("sleep", "Sleep", -1, 153000, [{id: "bed", count: 1}, {id: "human", count: 1}]),
  theft: new Task("theft", "Theft", -1, 162000, [{id: "human", count: 1}, {id: "money", count: 1}]),
  depression: new Task("depression", "Depression", -1, 215000, [{id: "family", count: 1}, {id: "corpse", count: 1}]),
  bandage: new Task("bandage", "Bandage", -1, 104000, [{id: "fabric", count: 1}, {id: "blood", count: 1}]),
  nurse: new Task("nurse", "Nurse", -1, 162000, [{id: "human", count: 1}, {id: "love", count: 1}, {id: "bandage", count: 1}]),
  doctor: new Task("doctor", "Doctor", -1, 156000, [{id: "human", count: 1}, {id: "science", count: 1}, {id: "bandage", count: 1}]),
  battery: new Task("battery", "Battery", -1, 14000, [{id: "energy", count: 1}, {id: "electricity", count: 1}, {id: "metal", count: 1}]),
  lust: new Task("lust", "Lust", -1, 225000, [{id: "sex", count: 7}]),
  gluttony: new Task("gluttony", "Gluttony", -1, 302000, [{id: "meat", count: 7}]),
  greed: new Task("greed", "Greed", -1, 1016000, [{id: "money", count: 7}]),
  sloth: new Task("sloth", "Sloth", -1, 1065000, [{id: "sleep", count: 7}]),
  wrath: new Task("wrath", "Wrath", -1, 393000, [{id: "vampire", count: 7}]),
  envy: new Task("envy", "Envy", -1, 1128000, [{id: "theft", count: 7}]),
  pride: new Task("pride", "Pride", -1, 141000, [{id: "ego", count: 7}]),
  chastity: new Task("chastity", "Chastity", -1, 435000, [{id: "student", count: 7}]),
  abstinence: new Task("abstinence", "Abstinence", -1, 589000, [{id: "children", count: 7}]),
  liberality: new Task("liberality", "Liberality", -1, 1128000, [{id: "nurse", count: 7}]),
  diligence: new Task("diligence", "Diligence", -1, 1086000, [{id: "doctor", count: 7}]),
  patience: new Task("patience", "Patience", -1, 365000, [{id: "monk", count: 7}]),
  kindness: new Task("kindness", "Kindness", -1, 1128000, [{id: "nurse", count: 7}]),
  humility: new Task("humility", "Humility", -1, 1086000, [{id: "knight", count: 7}]),
  jake: new Task("jake", "Jake", -1, 340000, [{id: "ego", count: 1}, {id: "love", count: 1}, {id: "hero", count: 1}, {id: "hair", count: 1}]),
  david: new Task("david", "David", -1, 348000, [{id: "memes", count: 1}, {id: "teacher", count: 1}, {id: "science", count: 1}, {id: "computer", count: 1}]),
  noah: new Task("noah", "Noah", -1, 461000, [{id: "sleep", count: 1}, {id: "depression", count: 1}, {id: "student", count: 1}, {id: "sex", count: 1}]),
  isaac: new Task("isaac", "Isaac", -1, 432000, [{id: "reddit", count: 1}, {id: "computer", count: 1}, {id: "anime", count: 1}, {id: "hair", count: 1}]),
  miner: new Task("miner", "Miner", 1, 77000, [{id: "upgrade_miner", count: -1}, {id: "drill", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}, {id: "energy", count: 1}]),
  smelter: new Task("smelter", "Smelter", 1, 49000, [{id: "upgrade_smelter", count: -1}, {id: "mechanism", count: 1}, {id: "fire", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  breeder: new Task("breeder", "Breeder", 1, 137000, [{id: "upgrade_breeder", count: -1}, {id: "human", count: 1}, {id: "beaker", count: 1}, {id: "sex", count: 1}, {id: "intellect", count: 1}, {id: "tools", count: 1}]),
  cloner: new Task("cloner", "Cloner", 1, 263000, [{id: "upgrade_cloner", count: -1}, {id: "breeder", count: 1}, {id: "sex", count: 1}, {id: "scientist", count: 1}, {id: "beaker", count: 1}]),
  farmer: new Task("farmer", "Farmer", 1, 117000, [{id: "upgrade_farmer", count: -1}, {id: "tools", count: 1}, {id: "field", count: 1}, {id: "animal", count: 1}, {id: "seeds", count: 1}, {id: "fertilizer", count: 1}]),
  timekeeper: new Task("timekeeper", "Timekeeper", 1, 109000, [{id: "upgrade_timekeeper", count: -1}, {id: "magic", count: 1}, {id: "wizard", count: 1}, {id: "time", count: 1}, {id: "sand", count: 1}, {id: "blood", count: 1}]),
  smither: new Task("smither", "Smither", 1, 193000, [{id: "upgrade_smither", count: -1}, {id: "mechanism", count: 1}, {id: "metal", count: 1}, {id: "village", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  provider: new Task("provider", "Provider", 1, 356000, [{id: "upgrade_provider", count: -1}, {id: "internet", count: 1}, {id: "skyscraper", count: 1}, {id: "fiberoptics", count: 1}]),
  generator: new Task("generator", "Generator", 1, 87000, [{id: "upgrade_generator", count: -1}, {id: "energy", count: 1}, {id: "mechanism", count: 1}, {id: "solarpanel", count: 1}, {id: "science", count: 1}, {id: "battery", count: 1}, {id: "electricity", count: 1}]),
  builder: new Task("builder", "Builder", 1, 125000, [{id: "upgrade_builder", count: -1}, {id: "mechanism", count: 1}, {id: "building", count: 1}, {id: "cement", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  researcher: new Task("researcher", "Researcher", 1, 296000, [{id: "upgrade_researcher", count: -1}, {id: "scientist", count: 1}, {id: "book", count: 1}, {id: "curiosity", count: 1}, {id: "tools", count: 1}, {id: "beaker", count: 1}, {id: "science", count: 1}]),
  trainer: new Task("trainer", "Trainer", 1, 149000, [{id: "upgrade_trainer", count: -1}, {id: "teacher", count: 1}, {id: "warrior", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  engineer: new Task("engineer", "Engineer", 1, 95000, [{id: "upgrade_engineer", count: -1}, {id: "scientist", count: 1}, {id: "tools", count: 1}, {id: "mechanism", count: 1}, {id: "circuit", count: 1}]),
  upgrade_miner: new Task("upgrade_miner", "Mine Stone", -1, 22500, [{id: "miner", count: 0}, {id: "earth", count: 10}, {id: "fire", count: 10}, {id: "water", count: 10}], 0, [{id: "upgrade_miner", count: -1}, {id: "stone", count: 10}]),
  upgrade_smelter: new Task("upgrade_smelter", "Smelt Metal", -1, 30000, [{id: "smelter", count: 0}, {id: "earth", count: 10}, {id: "fire", count: 20}, {id: "water", count: 10}], 0, [{id: "upgrade_smelter", count: -1}, {id: "metal", count: 10}]),
  upgrade_breeder: new Task("upgrade_breeder", "Breed Human", -1, 12000, [{id: "breeder", count: 0}, {id: "earth", count: 5}, {id: "water", count: 4}, {id: "fire", count: 3}, {id: "air", count: 2}, {id: "light", count: 2}], 0, [{id: "upgrade_breeder", count: -1}, {id: "human", count: 1}]),
  upgrade_cloner: new Task("upgrade_cloner", "Clone Human", -1, 60000, [{id: "cloner", count: 0}, {id: "earth", count: 25}, {id: "water", count: 20}, {id: "fire", count: 15}, {id: "air", count: 10}, {id: "light", count: 10}], 0, [{id: "upgrade_cloner", count: -1}, {id: "human", count: 5}]),
  upgrade_farmer: new Task("upgrade_farmer", "Farm Plants", -1, 96750, [{id: "farmer", count: 0}, {id: "earth", count: 38}, {id: "fire", count: 21}, {id: "water", count: 35}, {id: "air", count: 13}, {id: "light", count: 22}], 0, [{id: "upgrade_farmer", count: -1}, {id: "seeds", count: 1}, {id: "grass", count: 3}, {id: "tree", count: 3}, {id: "animal", count: 2}]),
  upgrade_timekeeper: new Task("upgrade_timekeeper", "Rewind Time", -1, 60000, [{id: "timekeeper", count: 0}, {id: "earth", count: 10}, {id: "fire", count: 15}, {id: "water", count: 20}, {id: "light", count: 5}], 0, [{id: "upgrade_timekeeper", count: -1}, {id: "time", count: 5}]),
  upgrade_smither: new Task("upgrade_smither", "Smith Tools", -1, 99000, [{id: "smither", count: 0}, {id: "earth", count: 39}, {id: "water", count: 33}, {id: "fire", count: 36}, {id: "air", count: 12}, {id: "light", count: 12}], 0, [{id: "upgrade_smither", count: -1}, {id: "tools", count: 3}, {id: "weapon", count: 3}]),
  upgrade_provider: new Task("upgrade_provider", "Provide Internet", -1, 103500, [{id: "provider", count: 0}, {id: "earth", count: 31}, {id: "water", count: 34}, {id: "fire", count: 45}, {id: "air", count: 12}, {id: "light", count: 16}], 0, [{id: "upgrade_provider", count: -1}, {id: "internet", count: 1}]),
  upgrade_generator: new Task("upgrade_generator", "Generate Electricity", -1, 17250, [{id: "generator", count: 0}, {id: "fire", count: 10}, {id: "air", count: 4}, {id: "earth", count: 3}, {id: "water", count: 3}, {id: "light", count: 3}], 0, [{id: "upgrade_generator", count: -1}, {id: "electricity", count: 3}, {id: "energy", count: 1}]),
  upgrade_builder: new Task("upgrade_builder", "Build Buildings", -1, 82500, [{id: "builder", count: 0}, {id: "earth", count: 30}, {id: "water", count: 38}, {id: "fire", count: 24}, {id: "air", count: 6}, {id: "light", count: 12}], 0, [{id: "upgrade_builder", count: -1}, {id: "building", count: 2}]),
  upgrade_researcher: new Task("upgrade_researcher", "Research Science", -1, 135000, [{id: "researcher", count: 0}, {id: "earth", count: 45}, {id: "water", count: 60}, {id: "fire", count: 45}, {id: "air", count: 10}, {id: "light", count: 20}], 0, [{id: "upgrade_researcher", count: -1}, {id: "science", count: 5}]),
  upgrade_trainer: new Task("upgrade_trainer", "Train Warriors", -1, 60000, [{id: "trainer", count: 0}, {id: "earth", count: 24}, {id: "water", count: 20}, {id: "fire", count: 20}, {id: "air", count: 8}, {id: "light", count: 8}], 0, [{id: "upgrade_trainer", count: -1}, {id: "warrior", count: 2}]),
  upgrade_engineer: new Task("upgrade_engineer", "Engineer Electronics", -1, 33000, [{id: "engineer", count: 0}, {id: "fire", count: 20}, {id: "air", count: 4}, {id: "earth", count: 8}, {id: "water", count: 8}, {id: "light", count: 4}], 0, [{id: "upgrade_engineer", count: -1}, {id: "mechanism", count: 2}, {id: "circuit", count: 2}]),
};

// Things to hide from the menu
let hidden = {
  "things": 1,
  "upgrade_miner": 1,
  "upgrade_smelter": 1,
  "upgrade_breeder": 1,
  "upgrade_cloner": 1,
  "upgrade_farmer": 1,
  "upgrade_timekeeper": 1,
  "upgrade_smither": 1,
  "upgrade_provider": 1,
  "upgrade_generator": 1,
  "upgrade_builder": 1,
  "upgrade_researcher": 1,
  "upgrade_trainer": 1,
  "upgrade_engineer": 1,
};

// Initial Tasks
let initial = [tasks.things];

/* -- Things --

  Raw Counts:
     Fire: 7460
    Water: 8433
      Air: 3083
    Earth: 9006
    Light: 3556

  Total Tasks: 243

  Largest Tasks:
           Envy (1127 raw, 988 steps)
     Liberality (1127 raw, 981 steps)
       Kindness (1127 raw, 981 steps)
         Empire (1104 raw, 958 steps)

  Shortest Ends:
           Fern (13 raw, 8 steps)
      Butterfly (11 raw, 8 steps)
          Golem (11 raw, 9 steps)
          Whale (12 raw, 10 steps)
 */




$(document).ready(() => {
  // Make sure we can store things
  if(typeof Storage === "undefined")
    return;

  // Game Loading Logic
  let saveData;
  // make sure we can parse the json
  try {
    saveData = JSON.parse(localStorage.CreateSaveData);
  } catch (e) {
    console.log("Error Loading Save");
    console.error(e);
    return;
  }

  // Create our load game task
  tasks.__loaded_game = new Task("__loaded_game", "Load Things", 1, 5000, [{id: "__start", count: 0}], ()=>{
    let todo = [];
    for(let i = 0; i < saveData.todo.length; i++) {
      let item = saveData.todo[i];
      if(!tasks[item.id])
        continue;

      let task = tasks[item.id];
      task.started = item.started;
      task.startTime = item.startTime;
      task.times = saveData.times[item.id];
      if(task.limit > 0)
        task.limit -= task.times;

      todo.push(task);
    }

    GameController.setState({
      todo: todo,
    });
  }, Object.keys(saveData.completed).map(t => ({id: t, count: saveData.completed[t]})));

  GameController.state.todo.push(tasks.__loaded_game);

  GameController.setState({
    todo: GameController.state.todo
  })
});

hidden.__loaded_game = 1;
hidden.__start = 1;

// Controls component: manages tasks
class Controls extends React.Component {
  constructor(props) {
    super(props);

    // list of all tasks
    this.tasks = tasks

    this.showInventory = false;
    
    this.state = {
      todo: initial, // initial tasks are displayed
      completed: {__start: 1} // storage for completed tasks and how many times the tasks were completed
        // {[taskId]: num}
    };

    this.onTaskStart = this.onTaskStart.bind(this);
    this.tryToRemoveTasks = this.tryToRemoveTasks.bind(this);
    this.onTaskFinish = this.onTaskFinish.bind(this);
    this.toggleInventory = this.toggleInventory.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.canAfford = this.canAfford.bind(this);
  }

  canAfford(task) {
    // make sure we can do this task and we don't already have it in progress
    if(task.limit == 0)
      return false;

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

    return hasRequirements;
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
      let ref = controls.refs["task_" + task.id + "_" + task.times];

      if(typeof ref === "undefined")
        return;

      let card = $(ref.refs.card);

      // we don't want to interrupt this!
      if(task.started)
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
    task.started = false;
    task.startTime = 0;
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

    // remove it if we can't afford it
    if(!this.canAfford(task))
      this.state.todo.splice(this.state.todo.indexOf(task), 1);


    // Remove invalid tasks
    this.tryToRemoveTasks();

    // check if we can add new tasks
    for(let name in this.tasks) {
      let task = this.tasks[name];
      
      // add the task to our todo
      if(!this.state.todo.includes(task) && this.canAfford(task)) {
        this.state.todo.push(task);
      }
    }

    this.setState({
      todo: this.state.todo,
      completed: this.state.completed
    });
  }

  toggleInventory() {
    let show = this.showInventory = !this.showInventory;
    let inventory = $(this.refs.inventory);
    inventory.animate({
      top: !show ? "-100vh" : 0
    });
  }

  saveGame() {
    // Can't save to storage
    if(typeof Storage === "undefined") {
      $(this.refs.saveButton).shake();
      return;
    }

    // Generate save data blob
    let comp = this;
    let saveData = {
      completed: this.state.completed,
      todo: this.state.todo.map(t => {
        return {id: t.id, started: t.started, startTime: t.startTime };
      })
    };
    saveData.times = {};
    Object.keys(tasks).forEach(t => {
      saveData.times[t] = tasks[t].times;
    });
    
    // Save to storage
    localStorage.CreateSaveData = JSON.stringify(saveData);

    // Animate Button
    let elem = $(this.refs.saveButton);
    $(this.refs.saveButton).shake({direction: "up", times: 0.5, distance: 20});
    
    console.log("Saved Game");
  }

  render() {
    return (<div>
      <div className="card-container">
        {this.state.todo.map((t, i) => (
          <Card key={t.id + "_" + t.times}
            ref={"task_" + t.id + "_" + t.times}
            task={t}
            onTaskStart={this.onTaskStart}
            onTaskFinish={this.onTaskFinish}
            canAfford={this.canAfford}
          />)
        )}
      </div>
      <div className="inventory" ref="inventory">
        <div className="inventory-buttons">
          {this.state.completed.things && <button ref="saveButton" onClick={this.saveGame}>
            <i className="material-icons">save</i>
          </button>}
        </div>
        <div className="inventory-content">
          {!Object.keys(this.state.completed).length && <h2>Nothing Here Yet!</h2>}
          {Object.keys(this.state.completed).map(k => (
            this.state.completed[k] > -1 && !hidden[k] && <span className="inventory-item" key={k}>
              {this.state.completed[k] + " " + k}
            </span>
          ))}
        </div>
      </div>
      <div className="toolbar">
        <div className="toolbar-content" onClick={this.toggleInventory}>
          <i className="material-icons">shopping_cart</i>
        </div>
      </div>
    </div>);
  }
}

window.GameController = ReactDOM.render(<Controls/>, document.getElementById("controls"));