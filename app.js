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
    comp.visible = false;
    card.animate({opacity: 0}, {
      step(now, fx) {
        card.css('transform', 'translateX('+(100-now*100)+"%)");
      },
      duration: "slow",
      complete() {
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
                onMouseLeave={e=>{identify(e, '')}} onMouseOver={e=>{identify(e, id)}}
                className={'card-requirement ' + (scoreValues[id] ? "final" : (output[id] > 0 ? "create" : "remove"))}>
                  {scoreValues[id] && <i className="material-icons">star</i>}
                  {(output[id] > 0 && !scoreValues[id] ? Math.abs(output[id]) + " " : "") + id}
                </span>
            ))}
            {Object.keys(requirements).map(id => (
              <span key={"requirement_" + id}
                onMouseLeave={e=>{identify(e, '')}} onMouseOver={e=>{identify(e, id)}}
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
  things: new Task("things", "Create Things", 1, 5000, [{id: "__start", count: 1}], 0, [{id: "earth", count: 18153}, {id: "air", count: 6272}, {id: "fire", count: 16220}, {id: "water", count: 17446}, {id: "light", count: 7423}]),
  dust: new Task("dust", "Dust", 1, 3000, [{id: "earth", count: 1}, {id: "air", count: 1}]),
  alcohol: new Task("alcohol", "Alcohol", -1, 3000, [{id: "fire", count: 1}, {id: "water", count: 1}]),
  steam: new Task("steam", "Steam", -1, 3000, [{id: "air", count: 1}, {id: "water", count: 1}]),
  lava: new Task("lava", "Lava", -1, 3000, [{id: "earth", count: 1}, {id: "fire", count: 1}]),
  swamp: new Task("swamp", "Swamp", -1, 3000, [{id: "earth", count: 1}, {id: "water", count: 1}]),
  energy: new Task("energy", "Energy", -1, 3000, [{id: "fire", count: 1}, {id: "air", count: 1}]),
  life: new Task("life", "Life", -1, 6000, [{id: "swamp", count: 1}, {id: "energy", count: 1}, {id: "light", count: 1}]),
  bacteria: new Task("bacteria", "Bacteria", -1, 9000, [{id: "life", count: 1}, {id: "swamp", count: 1}, {id: "light", count: 1}]),
  weeds: new Task("weeds", "Weeds", -1, 8000, [{id: "life", count: 1}, {id: "water", count: 1}, {id: "light", count: 1}]),
  flower: new Task("flower", "Flower", -1, 17000, [{id: "weeds", count: 1}, {id: "seeds", count: 1}]),
  sunflower: new Task("sunflower", "Sunflower", 1, 250000, [{id: "star", count: 1}, {id: "flower", count: 1}]),
  perfume: new Task("perfume", "Perfume", 1, 19000, [{id: "alcohol", count: 1}, {id: "flower", count: 1}]),
  bee: new Task("bee", "Bee", 1, 28000, [{id: "flower", count: 1}, {id: "beetle", count: 1}]),
  rose: new Task("rose", "Rose", 1, 57000, [{id: "blood", count: 1}, {id: "flower", count: 1}]),
  hydrangea: new Task("hydrangea", "Hydrangea", 1, 45000, [{id: "flower", count: 1}, {id: "poison", count: 1}]),
  lily: new Task("lily", "Lily", 1, 18000, [{id: "water", count: 1}, {id: "flower", count: 1}]),
  storm: new Task("storm", "Storm", -1, 4000, [{id: "energy", count: 1}, {id: "air", count: 1}]),
  moss: new Task("moss", "Moss", -1, 11000, [{id: "weeds", count: 1}, {id: "swamp", count: 1}, {id: "light", count: 1}]),
  fern: new Task("fern", "Fern", 1, 14000, [{id: "moss", count: 1}, {id: "swamp", count: 1}, {id: "light", count: 1}]),
  worm: new Task("worm", "Worm", -1, 11000, [{id: "bacteria", count: 1}, {id: "swamp", count: 1}]),
  sulfur: new Task("sulfur", "Sulfur", -1, 11000, [{id: "bacteria", count: 1}, {id: "swamp", count: 1}]),
  beetle: new Task("beetle", "Beetle", -1, 12000, [{id: "worm", count: 1}, {id: "earth", count: 1}]),
  stone: new Task("stone", "Stone", -1, 4000, [{id: "lava", count: 1}, {id: "water", count: 1}]),
  sand: new Task("sand", "Sand", -1, 5000, [{id: "stone", count: 1}, {id: "water", count: 1}]),
  firefly: new Task("firefly", "Firefly", 1, 13000, [{id: "beetle", count: 1}, {id: "fire", count: 1}]),
  spider: new Task("spider", "Spider", 1, 95000, [{id: "beetle", count: 1}, {id: "string", count: 1}]),
  scorpion: new Task("scorpion", "Scorpion", 1, 40000, [{id: "beetle", count: 1}, {id: "poison", count: 1}]),
  scarab: new Task("scarab", "Scarab", 1, 16000, [{id: "beetle", count: 1}, {id: "sand", count: 1}]),
  termite: new Task("termite", "Termite", 1, 42000, [{id: "beetle", count: 1}, {id: "wood", count: 1}]),
  ladybug: new Task("ladybug", "Ladybug", 1, 54000, [{id: "beetle", count: 1}, {id: "love", count: 1}]),
  egg: new Task("egg", "Egg", -1, 9000, [{id: "life", count: 1}, {id: "stone", count: 1}]),
  omelet: new Task("omelet", "Omelet", 1, 72000, [{id: "egg", count: 1}, {id: "food", count: 1}]),
  dinosaur: new Task("dinosaur", "Dinosaur", -1, 10000, [{id: "egg", count: 1}, {id: "earth", count: 1}]),
  dragon: new Task("dragon", "Dragon", -1, 13000, [{id: "dinosaur", count: 1}, {id: "air", count: 1}, {id: "fire", count: 1}, {id: "light", count: 1}]),
  lizard: new Task("lizard", "Lizard", -1, 11000, [{id: "egg", count: 1}, {id: "swamp", count: 1}]),
  bird: new Task("bird", "Bird", -1, 13000, [{id: "lizard", count: 1}, {id: "air", count: 1}, {id: "light", count: 1}]),
  vodka: new Task("vodka", "Vodka", -1, 4000, [{id: "water", count: 1}, {id: "alcohol", count: 1}]),
  plankton: new Task("plankton", "Plankton", -1, 11000, [{id: "bacteria", count: 1}, {id: "water", count: 1}, {id: "light", count: 1}]),
  phoenix: new Task("phoenix", "Phoenix", 1, 15000, [{id: "bird", count: 1}, {id: "fire", count: 1}, {id: "light", count: 1}]),
  thunderbird: new Task("thunderbird", "Thunderbird", 1, 16000, [{id: "bird", count: 1}, {id: "storm", count: 1}]),
  beast: new Task("beast", "Beast", -1, 12000, [{id: "lizard", count: 1}, {id: "earth", count: 1}]),
  human: new Task("human", "Human", -1, 17000, [{id: "beast", count: 1}, {id: "life", count: 1}]),
  magic: new Task("magic", "Magic", -1, 20000, [{id: "energy", count: 1}, {id: "light", count: 1}, {id: "human", count: 1}]),
  sorcery: new Task("sorcery", "Sorcery", 1, 23000, [{id: "magic", count: 1}, {id: "stone", count: 1}]),
  necromancer: new Task("necromancer", "Necromancer", 1, 92000, [{id: "skull", count: 1}, {id: "wizard", count: 1}]),
  wizard: new Task("wizard", "Wizard", -1, 36000, [{id: "magic", count: 1}, {id: "human", count: 1}]),
  demigod: new Task("demigod", "Demigod", -1, 39000, [{id: "wizard", count: 1}, {id: "energy", count: 1}, {id: "light", count: 1}]),
  vampire: new Task("vampire", "Vampire", -1, 57000, [{id: "human", count: 1}, {id: "blood", count: 1}]),
  spice: new Task("spice", "Spice", -1, 65000, [{id: "fire", count: 1}, {id: "food", count: 1}]),
  jalapeno: new Task("jalapeno", "Jalapeno", -1, 76000, [{id: "spice", count: 1}, {id: "lava", count: 1}, {id: "seeds", count: 1}]),
  tortilla: new Task("tortilla", "Tortilla", -1, 70000, [{id: "flour", count: 1}, {id: "paper", count: 1}]),
  burrito: new Task("burrito", "Burrito", 1, 239000, [{id: "tortilla", count: 1}, {id: "jalapeno", count: 1}, {id: "meat", count: 1}, {id: "cheese", count: 1}]),
  garlic: new Task("garlic", "Garlic", -1, 77000, [{id: "spice", count: 1}, {id: "fruit", count: 1}]),
  tomato: new Task("tomato", "Tomato", -1, 53000, [{id: "fruit", count: 1}, {id: "blood", count: 1}]),
  pizza: new Task("pizza", "Pizza", 1, 279000, [{id: "dough", count: 1}, {id: "garlic", count: 1}, {id: "tomato", count: 1}, {id: "cheese", count: 1}, {id: "food", count: 1}]),
  sandwich: new Task("sandwich", "Sandwich", 1, 196000, [{id: "bread", count: 1}, {id: "cheese", count: 1}, {id: "meat", count: 1}, {id: "food", count: 1}]),
  food: new Task("food", "Food", -1, 64000, [{id: "meat", count: 1}, {id: "tools", count: 1}]),
  slayer: new Task("slayer", "Slayer", 1, 167000, [{id: "vampire", count: 1}, {id: "mirror", count: 1}, {id: "garlic", count: 1}, {id: "wood", count: 1}]),
  animal: new Task("animal", "Animal", -1, 28000, [{id: "human", count: 1}, {id: "beast", count: 1}]),
  saddle: new Task("saddle", "Saddle", -1, 142000, [{id: "leather", count: 1}, {id: "chair", count: 1}]),
  horse: new Task("horse", "Horse", -1, 169000, [{id: "animal", count: 1}, {id: "saddle", count: 1}]),
  horseshoe: new Task("horseshoe", "Horseshoe", 1, 173000, [{id: "metal", count: 1}, {id: "horse", count: 1}]),
  camel: new Task("camel", "Camel", 1, 173000, [{id: "sand", count: 1}, {id: "horse", count: 1}]),
  centaur: new Task("centaur", "Centaur", 1, 185000, [{id: "horse", count: 1}, {id: "human", count: 1}]),
  axe: new Task("axe", "Axe", -1, 45000, [{id: "weapon", count: 1}, {id: "tools", count: 1}]),
  unicorn: new Task("unicorn", "Unicorn", 1, 247000, [{id: "horse", count: 1}, {id: "rainbow", count: 1}, {id: "candy", count: 1}]),
  candy: new Task("candy", "Candy", -1, 71000, [{id: "sugar", count: 2}]),
  narwhal: new Task("narwhal", "Narwhal", 1, 294000, [{id: "reddit", count: 1}, {id: "memes", count: 1}]),
  origami: new Task("origami", "Origami", 1, 47000, [{id: "bird", count: 1}, {id: "paper", count: 1}]),
  campfire: new Task("campfire", "Campfire", 1, 32000, [{id: "fire", count: 1}, {id: "wood", count: 1}]),
  wool: new Task("wool", "Wool", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  meat: new Task("meat", "Meat", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  milk: new Task("milk", "Milk", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  cow: new Task("cow", "Cow", 1, 212000, [{id: "milk", count: 1}, {id: "horse", count: 1}]),
  mermaid: new Task("mermaid", "Mermaid", 1, 32000, [{id: "human", count: 1}, {id: "fish", count: 1}]),
  microscope: new Task("microscope", "Microscope", 1, 23000, [{id: "telescope", count: 1}, {id: "bacteria", count: 1}, {id: "lense", count: 1}]),
  hay: new Task("hay", "Hay", 1, 33000, [{id: "grass", count: 1}, {id: "tools", count: 1}]),
  prism: new Task("prism", "Prism", 1, 15000, [{id: "glass", count: 1}, {id: "rainbow", count: 1}]),
  printer: new Task("printer", "Printer", 1, 70000, [{id: "paper", count: 1}, {id: "computer", count: 1}]),
  creditcard: new Task("creditcard", "Creditcard", 1, 178000, [{id: "plastic", count: 1}, {id: "money", count: 1}]),
  vacuum: new Task("vacuum", "Vacuum", -1, 244000, [{id: "space", count: 1}, {id: "mechanism", count: 1}]),
  dyson: new Task("dyson", "Dyson", 1, 264000, [{id: "vacuum", count: 1}, {id: "tools", count: 1}]),
  roomba: new Task("roomba", "Roomba", 1, 321000, [{id: "robot", count: 1}, {id: "vacuum", count: 1}]),
  cheese: new Task("cheese", "Cheese", -1, 52000, [{id: "milk", count: 1}, {id: "bacteria", count: 1}]),
  stew: new Task("stew", "Stew", 1, 23000, [{id: "mushroom", count: 1}, {id: "water", count: 1}, {id: "fire", count: 1}, {id: "bird", count: 1}]),
  coffin: new Task("coffin", "Coffin", 1, 87000, [{id: "wood", count: 1}, {id: "corpse", count: 1}]),
  ash: new Task("ash", "Ash", 1, 58000, [{id: "corpse", count: 1}, {id: "fire", count: 1}]),
  metal: new Task("metal", "Metal", -1, 5000, [{id: "stone", count: 1}, {id: "fire", count: 1}]),
  tools: new Task("tools", "Tools", -1, 21000, [{id: "human", count: 1}, {id: "metal", count: 1}]),
  weapon: new Task("weapon", "Weapon", -1, 25000, [{id: "tools", count: 1}, {id: "metal", count: 1}]),
  sex: new Task("sex", "Sex", -1, 33000, [{id: "human", count: 2}]),
  love: new Task("love", "Love", -1, 43000, [{id: "human", count: 2}, {id: "time", count: 1}]),
  children: new Task("children", "Children", -1, 85000, [{id: "sex", count: 1}, {id: "love", count: 1}, {id: "time", count: 1}]),
  abuse: new Task("abuse", "Abuse", -1, 104000, [{id: "alcoholic", count: 1}, {id: "children", count: 1}]),
  hunter: new Task("hunter", "Hunter", -1, 54000, [{id: "human", count: 1}, {id: "spear", count: 1}]),
  ninja: new Task("ninja", "Ninja", -1, 122000, [{id: "hunter", count: 1}, {id: "assassin", count: 1}]),
  ninjutsu: new Task("ninjutsu", "Ninjutsu", 1, 141000, [{id: "ninja", count: 1}, {id: "magic", count: 1}]),
  sword: new Task("sword", "Sword", -1, 29000, [{id: "weapon", count: 1}, {id: "metal", count: 1}]),
  excalibur: new Task("excalibur", "Excalibur", 1, 199000, [{id: "sword", count: 1}, {id: "hero", count: 1}, {id: "stone", count: 1}]),
  katana: new Task("katana", "Katana", 1, 69000, [{id: "sword", count: 1}, {id: "blood", count: 1}]),
  clay: new Task("clay", "Clay", -1, 7000, [{id: "swamp", count: 1}, {id: "sand", count: 1}]),
  golem: new Task("golem", "Golem", 1, 12000, [{id: "life", count: 1}, {id: "clay", count: 1}]),
  warrior: new Task("warrior", "Warrior", -1, 41000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  armor: new Task("armor", "Armor", -1, 116000, [{id: "tools", count: 1}, {id: "metal", count: 1}, {id: "leather", count: 1}]),
  tank: new Task("tank", "Tank", 1, 332000, [{id: "armor", count: 1}, {id: "car", count: 1}, {id: "weapon", count: 1}, {id: "shell", count: 1}]),
  knight: new Task("knight", "Knight", -1, 156000, [{id: "armor", count: 1}, {id: "warrior", count: 1}]),
  hero: new Task("hero", "Hero", -1, 168000, [{id: "knight", count: 1}, {id: "dragon", count: 1}]),
  mushroom: new Task("mushroom", "Mushroom", -1, 9000, [{id: "earth", count: 1}, {id: "weeds", count: 1}]),
  werewolf: new Task("werewolf", "Werewolf", 1, 68000, [{id: "beast", count: 1}, {id: "vampire", count: 1}]),
  seeds: new Task("seeds", "Seeds", -1, 10000, [{id: "sand", count: 1}, {id: "life", count: 1}]),
  tree: new Task("tree", "Tree", -1, 11000, [{id: "seeds", count: 1}, {id: "earth", count: 1}]),
  ceramics: new Task("ceramics", "Ceramics", 1, 23000, [{id: "human", count: 1}, {id: "clay", count: 1}]),
  robot: new Task("robot", "Robot", -1, 78000, [{id: "computer", count: 1}, {id: "love", count: 1}]),
  singularity: new Task("singularity", "Singularity", 1, 104000, [{id: "robot", count: 1}, {id: "intellect", count: 1}]),
  ai: new Task("ai", "AI", 1, 83000, [{id: "robot", count: 1}, {id: "life", count: 1}]),
  drone: new Task("drone", "Drone", -1, 90000, [{id: "robot", count: 1}, {id: "wing", count: 1}]),
  quadcopter: new Task("quadcopter", "Quadcopter", 1, 206000, [{id: "drone", count: 1}, {id: "toy", count: 1}]),
  terminator: new Task("terminator", "Terminator", 1, 102000, [{id: "robot", count: 1}, {id: "weapon", count: 1}]),
  letter: new Task("letter", "Letter", -1, 153000, [{id: "pen", count: 1}, {id: "paper", count: 1}]),
  alphabet: new Task("alphabet", "Alphabet", 1, 305000, [{id: "letter", count: 2}]),
  mailman: new Task("mailman", "Mailman", 1, 254000, [{id: "letter", count: 1}, {id: "human", count: 1}, {id: "porn", count: 1}]),
  email: new Task("email", "Email", -1, 259000, [{id: "internet", count: 1}, {id: "letter", count: 1}]),
  gmail: new Task("gmail", "Gmail", 1, 411000, [{id: "email", count: 1}, {id: "google", count: 1}]),
  cyborg: new Task("cyborg", "Cyborg", 1, 94000, [{id: "human", count: 1}, {id: "robot", count: 1}]),
  hut: new Task("hut", "Hut", -1, 20000, [{id: "stone", count: 1}, {id: "human", count: 1}]),
  sauna: new Task("sauna", "Sauna", 1, 22000, [{id: "steam", count: 1}, {id: "hut", count: 1}]),
  treant: new Task("treant", "Treant", 1, 16000, [{id: "tree", count: 1}, {id: "life", count: 1}]),
  ghost: new Task("ghost", "Ghost", -1, 76000, [{id: "corpse", count: 1}, {id: "magic", count: 1}]),
  curse: new Task("curse", "Curse", 1, 92000, [{id: "ghost", count: 1}, {id: "human", count: 1}]),
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
  hat: new Task("hat", "Hat", -1, 136000, [{id: "clothes", count: 1}, {id: "skull", count: 1}]),
  fedora: new Task("fedora", "Fedora", 1, 156000, [{id: "hat", count: 1}, {id: "ego", count: 1}]),
  shrek: new Task("shrek", "Shrek", 1, 50000, [{id: "love", count: 1}, {id: "life", count: 1}, {id: "swamp", count: 1}]),
  frigate: new Task("frigate", "Frigate", 1, 160000, [{id: "fabric", count: 1}, {id: "ship", count: 1}]),
  steamship: new Task("steamship", "SteamShip", 1, 127000, [{id: "ship", count: 1}, {id: "engine", count: 1}]),
  wheel: new Task("wheel", "Wheel", -1, 51000, [{id: "tools", count: 1}, {id: "wood", count: 1}]),
  bicycle: new Task("bicycle", "Bicycle", -1, 55000, [{id: "metal", count: 1}, {id: "wheel", count: 1}]),
  motorcycle: new Task("motorcycle", "Motorcycle", 1, 85000, [{id: "bicycle", count: 1}, {id: "engine", count: 1}]),
  waterwheel: new Task("waterwheel", "Waterwheel", 1, 52000, [{id: "wheel", count: 1}, {id: "water", count: 1}]),
  cart: new Task("cart", "Cart", -1, 81000, [{id: "wheel", count: 1}, {id: "wood", count: 1}]),
  locomotive: new Task("locomotive", "Locomotive", 1, 111000, [{id: "cart", count: 1}, {id: "engine", count: 1}]),
  oil: new Task("oil", "Oil", -1, 13000, [{id: "water", count: 1}, {id: "coal", count: 1}]),
  plastic: new Task("plastic", "Plastic", -1, 33000, [{id: "oil", count: 1}, {id: "tools", count: 1}]),
  toy: new Task("toy", "Toy", -1, 117000, [{id: "plastic", count: 1}, {id: "children", count: 1}]),
  condom: new Task("condom", "Condom", 1, 65000, [{id: "plastic", count: 1}, {id: "sex", count: 1}]),
  lego: new Task("lego", "Lego", -1, 40000, [{id: "plastic", count: 1}, {id: "bricks", count: 1}]),
  castle: new Task("castle", "Castle", 1, 421000, [{id: "building", count: 1}, {id: "wall", count: 1}, {id: "bricks", count: 1}, {id: "king", count: 1}]),
  dam: new Task("dam", "Dam", 1, 16000, [{id: "water", count: 1}, {id: "wall", count: 1}]),
  ruins: new Task("ruins", "Ruins", 1, 32000, [{id: "bricks", count: 1}, {id: "time", count: 1}, {id: "wall", count: 1}]),
  rv: new Task("rv", "RV", 1, 435000, [{id: "car", count: 1}, {id: "house", count: 1}]),
  safe: new Task("safe", "Safe", 1, 150000, [{id: "money", count: 1}, {id: "metal", count: 1}]),
  chair: new Task("chair", "Chair", -1, 51000, [{id: "wood", count: 1}, {id: "tools", count: 1}]),
  car: new Task("car", "Car", -1, 180000, [{id: "engine", count: 1}, {id: "cart", count: 1}, {id: "glass", count: 1}, {id: "lamp", count: 1}, {id: "chair", count: 1}]),
  hotwheels: new Task("hotwheels", "Hotwheels", 1, 212000, [{id: "car", count: 1}, {id: "plastic", count: 1}]),
  wing: new Task("wing", "Wing", -1, 13000, [{id: "air", count: 1}, {id: "mechanism", count: 1}]),
  airplane: new Task("airplane", "Airplane", -1, 203000, [{id: "car", count: 1}, {id: "wing", count: 1}, {id: "circuit", count: 1}]),
  paperairplane: new Task("paperairplane", "PaperAirplane", 1, 237000, [{id: "airplane", count: 1}, {id: "paper", count: 1}]),
  student: new Task("student", "Student", -1, 63000, [{id: "human", count: 1}, {id: "curiosity", count: 1}]),
  school: new Task("school", "School", -1, 466000, [{id: "building", count: 1}, {id: "teacher", count: 1}, {id: "student", count: 1}, {id: "book", count: 1}]),
  leather: new Task("leather", "Leather", -1, 92000, [{id: "fabric", count: 1}, {id: "animal", count: 1}, {id: "light", count: 1}]),
  chariot: new Task("chariot", "Chariot", 1, 92000, [{id: "beast", count: 1}, {id: "cart", count: 1}]),
  alcoholic: new Task("alcoholic", "Alcoholic", -1, 20000, [{id: "vodka", count: 1}, {id: "human", count: 1}]),
  grass: new Task("grass", "Grass", -1, 13000, [{id: "moss", count: 1}, {id: "earth", count: 1}, {id: "light", count: 1}]),
  field: new Task("field", "Field", -1, 22000, [{id: "tools", count: 1}, {id: "earth", count: 1}]),
  wheat: new Task("wheat", "Wheat", -1, 33000, [{id: "field", count: 1}, {id: "seeds", count: 1}, {id: "light", count: 1}, {id: "water", count: 1}]),
  glasses: new Task("glasses", "Glasses", -1, 11000, [{id: "metal", count: 1}, {id: "glass", count: 1}]),
  flour: new Task("flour", "Flour", -1, 36000, [{id: "wheat", count: 1}, {id: "stone", count: 1}]),
  dough: new Task("dough", "Dough", -1, 37000, [{id: "flour", count: 1}, {id: "water", count: 1}]),
  sugar: new Task("sugar", "Sugar", -1, 36000, [{id: "field", count: 1}, {id: "reed", count: 1}]),
  skittles: new Task("skittles", "Skittles", 1, 45000, [{id: "sugar", count: 1}, {id: "seeds", count: 1}]),
  cake: new Task("cake", "Cake", 1, 122000, [{id: "sugar", count: 1}, {id: "egg", count: 1}, {id: "milk", count: 1}, {id: "flour", count: 1}]),
  bread: new Task("bread", "Bread", -1, 39000, [{id: "dough", count: 1}, {id: "fire", count: 1}, {id: "air", count: 1}]),
  beer: new Task("beer", "Beer", -1, 41000, [{id: "bread", count: 1}, {id: "alcohol", count: 1}]),
  grape: new Task("grape", "Grape", -1, 23000, [{id: "seeds", count: 1}, {id: "fruit", count: 1}, {id: "light", count: 1}]),
  pie: new Task("pie", "Pie", 1, 147000, [{id: "dough", count: 1}, {id: "apple", count: 1}, {id: "food", count: 1}]),
  juice: new Task("juice", "Juice", 1, 14000, [{id: "fruit", count: 1}, {id: "water", count: 1}]),
  apple: new Task("apple", "Apple", -1, 48000, [{id: "fruit", count: 1}, {id: "sugar", count: 1}]),
  mac: new Task("mac", "Mac", -1, 228000, [{id: "money", count: 1}, {id: "apple", count: 1}, {id: "computer", count: 1}]),
  osx: new Task("osx", "OSX", 1, 344000, [{id: "mac", count: 1}, {id: "unix", count: 1}]),
  iphone: new Task("iphone", "iPhone", 1, 228000, [{id: "money", count: 1}, {id: "apple", count: 1}, {id: "computer", count: 1}]),
  titanx: new Task("titanx", "TitanX", -1, 207000, [{id: "money", count: 1}, {id: "life", count: 1}, {id: "computer", count: 1}, {id: "energy", count: 1}, {id: "magic", count: 1}]),
  titanxp: new Task("titanxp", "TitanXP", 1, 352000, [{id: "titanx", count: 1}, {id: "money", count: 1}]),
  lasso: new Task("lasso", "Lasso", -1, 272000, [{id: "horse", count: 1}, {id: "rope", count: 1}]),
  cowboy: new Task("cowboy", "Cowboy", 1, 423000, [{id: "hat", count: 1}, {id: "human", count: 1}, {id: "lasso", count: 1}]),
  dragonfruit: new Task("dragonfruit", "Dragonfruit", 1, 25000, [{id: "dragon", count: 1}, {id: "fruit", count: 1}]),
  salad: new Task("salad", "Salad", 1, 88000, [{id: "fruit", count: 1}, {id: "grass", count: 1}, {id: "food", count: 1}]),
  fruit: new Task("fruit", "Fruit", -1, 13000, [{id: "tree", count: 1}, {id: "earth", count: 1}, {id: "water", count: 1}]),
  wine: new Task("wine", "Wine", -1, 33000, [{id: "grape", count: 1}, {id: "time", count: 1}]),
  reed: new Task("reed", "Reed", -1, 15000, [{id: "grass", count: 1}, {id: "swamp", count: 1}]),
  paper: new Task("paper", "Paper", -1, 35000, [{id: "reed", count: 1}, {id: "tools", count: 1}]),
  feather: new Task("feather", "Feather", -1, 66000, [{id: "hunter", count: 1}, {id: "bird", count: 1}]),
  book: new Task("book", "Book", -1, 126000, [{id: "leather", count: 1}, {id: "paper", count: 1}]),
  electricity: new Task("electricity", "Electricity", -1, 8000, [{id: "energy", count: 1}, {id: "metal", count: 1}, {id: "light", count: 1}]),
  corpse: new Task("corpse", "Corpse", -1, 57000, [{id: "warrior", count: 1}, {id: "human", count: 1}]),
  skull: new Task("skull", "Skull", -1, 57000, [{id: "warrior", count: 1}, {id: "human", count: 1}]),
  pet: new Task("pet", "Pet", -1, 70000, [{id: "love", count: 1}, {id: "animal", count: 1}]),
  chia: new Task("chia", "Chia", 1, 138000, [{id: "grass", count: 1}, {id: "skull", count: 1}, {id: "pet", count: 1}]),
  dumb: new Task("dumb", "Dumb", -1, 58000, [{id: "air", count: 1}, {id: "skull", count: 1}]),
  edgar: new Task("edgar", "Edgar", 1, 138000, [{id: "dumb", count: 1}, {id: "pet", count: 1}, {id: "beast", count: 1}]),
  zombie: new Task("zombie", "Zombie", -1, 62000, [{id: "corpse", count: 1}, {id: "life", count: 1}]),
  frankenstein: new Task("frankenstein", "Frankenstein", 1, 69000, [{id: "zombie", count: 1}, {id: "electricity", count: 1}]),
  fossil: new Task("fossil", "Fossil", 1, 20000, [{id: "dinosaur", count: 1}, {id: "time", count: 1}]),
  ghoul: new Task("ghoul", "Ghoul", 1, 118000, [{id: "zombie", count: 1}, {id: "corpse", count: 1}]),
  poison: new Task("poison", "Poison", -1, 29000, [{id: "mushroom", count: 1}, {id: "tools", count: 1}]),
  dart: new Task("dart", "Dart", -1, 53000, [{id: "poison", count: 1}, {id: "weapon", count: 1}]),
  assassin: new Task("assassin", "Assassin", -1, 69000, [{id: "dart", count: 1}, {id: "human", count: 1}]),
  glass: new Task("glass", "Glass", -1, 7000, [{id: "sand", count: 1}, {id: "fire", count: 1}, {id: "light", count: 1}]),
  tobacco: new Task("tobacco", "Tobacco", -1, 14000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  pipe: new Task("pipe", "Pipe", 1, 44000, [{id: "tobacco", count: 1}, {id: "wood", count: 1}]),
  piranha: new Task("piranha", "Piranha", 1, 56000, [{id: "fish", count: 1}, {id: "blood", count: 1}]),
  cancer: new Task("cancer", "Cancer", -1, 30000, [{id: "tobacco", count: 1}, {id: "human", count: 1}]),
  weed: new Task("weed", "Weed", -1, 14000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  baked: new Task("baked", "Baked", 1, 30000, [{id: "weed", count: 1}, {id: "human", count: 1}]),
  cigarette: new Task("cigarette", "Cigarette", -1, 48000, [{id: "tobacco", count: 1}, {id: "paper", count: 1}]),
  cigar: new Task("cigar", "Cigar", 1, 74000, [{id: "cigarette", count: 1}, {id: "intellect", count: 1}]),
  joint: new Task("joint", "Joint", 1, 48000, [{id: "weed", count: 1}, {id: "paper", count: 1}]),
  fertilizer: new Task("fertilizer", "Fertilizer", -1, 40000, [{id: "animal", count: 1}, {id: "grass", count: 1}]),
  shell: new Task("shell", "Shell", -1, 14000, [{id: "stone", count: 1}, {id: "plankton", count: 1}]),
  limestone: new Task("limestone", "Limestone", -1, 17000, [{id: "shell", count: 1}, {id: "stone", count: 1}]),
  saltpeter: new Task("saltpeter", "Saltpeter", -1, 56000, [{id: "fertilizer", count: 1}, {id: "limestone", count: 1}]),
  gunpowder: new Task("gunpowder", "Gunpowder", -1, 66000, [{id: "saltpeter", count: 1}, {id: "sulfur", count: 1}]),
  bomb: new Task("bomb", "Bomb", -1, 70000, [{id: "gunpowder", count: 1}, {id: "metal", count: 1}]),
  grenade: new Task("grenade", "Grenade", 1, 94000, [{id: "bomb", count: 1}, {id: "weapon", count: 1}]),
  note7: new Task("note7", "Note7", 1, 105000, [{id: "bomb", count: 1}, {id: "computer", count: 1}]),
  nuke: new Task("nuke", "Nuke", 1, 274000, [{id: "energy", count: 1}, {id: "bomb", count: 1}, {id: "airplane", count: 1}]),
  firearm: new Task("firearm", "Firearm", 1, 90000, [{id: "gunpowder", count: 1}, {id: "weapon", count: 1}]),
  cement: new Task("cement", "Cement", -1, 23000, [{id: "limestone", count: 1}, {id: "clay", count: 1}]),
  snake: new Task("snake", "Snake", -1, 15000, [{id: "worm", count: 1}, {id: "sand", count: 1}]),
  fish: new Task("fish", "Fish", -1, 16000, [{id: "snake", count: 1}, {id: "water", count: 1}]),
  squid: new Task("squid", "Squid", -1, 30000, [{id: "fish", count: 1}, {id: "snake", count: 1}]),
  concrete: new Task("concrete", "Concrete", -1, 24000, [{id: "cement", count: 1}, {id: "water", count: 1}]),
  bricks: new Task("bricks", "Bricks", -1, 8000, [{id: "clay", count: 1}, {id: "fire", count: 1}]),
  wall: new Task("wall", "Wall", -1, 15000, [{id: "bricks", count: 2}]),
  ivy: new Task("ivy", "Ivy", 1, 28000, [{id: "weed", count: 1}, {id: "wall", count: 1}]),
  fence: new Task("fence", "Fence", 1, 45000, [{id: "wood", count: 1}, {id: "wall", count: 1}]),
  firewall: new Task("firewall", "Firewall", 1, 121000, [{id: "internet", count: 1}, {id: "wall", count: 1}]),
  prison: new Task("prison", "Prison", 1, 74000, [{id: "wall", count: 1}, {id: "metal", count: 1}, {id: "building", count: 1}]),
  bar: new Task("bar", "Bar", 1, 152000, [{id: "alcoholic", count: 1}, {id: "vodka", count: 1}, {id: "beer", count: 1}, {id: "alcohol", count: 1}, {id: "wine", count: 1}, {id: "building", count: 1}]),
  building: new Task("building", "Building", -1, 56000, [{id: "bricks", count: 1}, {id: "concrete", count: 1}, {id: "hut", count: 1}, {id: "glass", count: 1}]),
  family: new Task("family", "Family", -1, 159000, [{id: "love", count: 1}, {id: "human", count: 2}, {id: "children", count: 1}]),
  ring: new Task("ring", "Ring", -1, 51000, [{id: "love", count: 1}, {id: "metal", count: 1}, {id: "crystal", count: 1}]),
  wedding: new Task("wedding", "Wedding", -1, 83000, [{id: "human", count: 2}, {id: "ring", count: 1}]),
  divorce: new Task("divorce", "Divorce", 1, 444000, [{id: "wedding", count: 1}, {id: "car", count: 1}, {id: "pet", count: 1}, {id: "couch", count: 1}]),
  couch: new Task("couch", "Couch", -1, 114000, [{id: "chair", count: 1}, {id: "fabric", count: 1}]),
  house: new Task("house", "House", -1, 256000, [{id: "love", count: 1}, {id: "building", count: 1}, {id: "family", count: 1}]),
  barbie: new Task("barbie", "Barbie", 1, 288000, [{id: "plastic", count: 1}, {id: "house", count: 1}]),
  skyscraper: new Task("skyscraper", "Skyscraper", -1, 62000, [{id: "building", count: 1}, {id: "glass", count: 1}]),
  butterfly: new Task("butterfly", "Butterfly", 1, 12000, [{id: "worm", count: 1}, {id: "air", count: 1}]),
  dolphin: new Task("dolphin", "Dolphin", 1, 27000, [{id: "fish", count: 1}, {id: "beast", count: 1}]),
  whale: new Task("whale", "Whale", 1, 13000, [{id: "beast", count: 1}, {id: "water", count: 1}]),
  turtle: new Task("turtle", "Turtle", 1, 13000, [{id: "egg", count: 1}, {id: "sand", count: 1}]),
  crystal: new Task("crystal", "Crystal", -1, 5000, [{id: "light", count: 1}, {id: "stone", count: 1}]),
  torch: new Task("torch", "Torch", 1, 32000, [{id: "fire", count: 1}, {id: "wood", count: 1}]),
  lamp: new Task("lamp", "Lamp", -1, 14000, [{id: "electricity", count: 1}, {id: "glass", count: 1}]),
  nightlight: new Task("nightlight", "Nightlight", 1, 150000, [{id: "bed", count: 1}, {id: "lamp", count: 1}]),
  lavalamp: new Task("lavalamp", "Lavalamp", 1, 16000, [{id: "lava", count: 1}, {id: "lamp", count: 1}]),
  cabin: new Task("cabin", "Cabin", 1, 286000, [{id: "wood", count: 1}, {id: "house", count: 1}]),
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
  internet: new Task("internet", "Internet", -1, 107000, [{id: "science", count: 1}, {id: "computer", count: 2}]),
  camera: new Task("camera", "Camera", -1, 30000, [{id: "mechanism", count: 1}, {id: "lense", count: 1}, {id: "lamp", count: 1}]),
  video: new Task("video", "Video", -1, 54000, [{id: "mechanism", count: 1}, {id: "camera", count: 1}, {id: "battery", count: 1}]),
  porn: new Task("porn", "Porn", -1, 86000, [{id: "sex", count: 1}, {id: "video", count: 1}]),
  hentai: new Task("hentai", "Hentai", 1, 183000, [{id: "porn", count: 1}, {id: "anime", count: 1}]),
  pornhub: new Task("pornhub", "Pornhub", 1, 192000, [{id: "porn", count: 1}, {id: "internet", count: 1}]),
  boredom: new Task("boredom", "Boredom", -1, 67000, [{id: "human", count: 1}, {id: "time", count: 5}]),
  memes: new Task("memes", "Memes", -1, 136000, [{id: "internet", count: 1}, {id: "cancer", count: 1}]),
  fiberoptics: new Task("fiberoptics", "FiberOptics", -1, 125000, [{id: "light", count: 1}, {id: "circuit", count: 1}, {id: "glass", count: 1}, {id: "internet", count: 1}]),
  youtube: new Task("youtube", "Youtube", 1, 170000, [{id: "video", count: 1}, {id: "time", count: 1}, {id: "internet", count: 1}]),
  reddit: new Task("reddit", "Reddit", -1, 159000, [{id: "love", count: 1}, {id: "time", count: 1}, {id: "internet", count: 1}]),
  curiosity: new Task("curiosity", "Curiosity", -1, 47000, [{id: "time", count: 3}, {id: "human", count: 1}]),
  google: new Task("google", "Google", -1, 153000, [{id: "curiosity", count: 1}, {id: "internet", count: 1}]),
  bing: new Task("bing", "Bing", 1, 182000, [{id: "google", count: 1}, {id: "cancer", count: 1}]),
  hydrazine: new Task("hydrazine", "Hydrazine", -1, 15000, [{id: "gasoline", count: 1}, {id: "water", count: 1}]),
  rocket: new Task("rocket", "Rocket", -1, 217000, [{id: "hydrazine", count: 1}, {id: "airplane", count: 1}]),
  satellite: new Task("satellite", "Satellite", 1, 278000, [{id: "solarpanel", count: 1}, {id: "telescope", count: 1}, {id: "rocket", count: 1}, {id: "computer", count: 1}]),
  space: new Task("space", "Space", -1, 233000, [{id: "rocket", count: 1}, {id: "human", count: 1}]),
  star: new Task("star", "Star", -1, 234000, [{id: "space", count: 1}, {id: "light", count: 1}]),
  sun: new Task("sun", "Sun", 1, 235000, [{id: "star", count: 1}, {id: "earth", count: 1}]),
  planet: new Task("planet", "Planet", -1, 234000, [{id: "space", count: 1}, {id: "earth", count: 1}]),
  galaxy: new Task("galaxy", "Galaxy", -1, 467000, [{id: "star", count: 2}]),
  milkyway: new Task("milkyway", "Milkyway", 1, 510000, [{id: "galaxy", count: 1}, {id: "milk", count: 1}]),
  cluster: new Task("cluster", "Cluster", -1, 933000, [{id: "galaxy", count: 2}]),
  supercluster: new Task("supercluster", "Supercluster", 1, 1865000, [{id: "cluster", count: 2}]),
  solarsystem: new Task("solarsystem", "Solarsystem", 1, 700000, [{id: "star", count: 1}, {id: "planet", count: 2}]),
  asteroid: new Task("asteroid", "Asteroid", -1, 236000, [{id: "space", count: 1}, {id: "stone", count: 1}]),
  meteor: new Task("meteor", "Meteor", 1, 469000, [{id: "asteroid", count: 1}, {id: "planet", count: 1}]),
  alien: new Task("alien", "Alien", 1, 238000, [{id: "space", count: 1}, {id: "life", count: 1}]),
  moon: new Task("moon", "Moon", -1, 300000, [{id: "space", count: 1}, {id: "flag", count: 1}]),
  flag: new Task("flag", "Flag", -1, 68000, [{id: "fabric", count: 1}, {id: "metal", count: 1}]),
  rover: new Task("rover", "Rover", -1, 724000, [{id: "car", count: 1}, {id: "space", count: 1}, {id: "moon", count: 1}, {id: "battery", count: 1}]),
  mars: new Task("mars", "Mars", 1, 770000, [{id: "curiosity", count: 1}, {id: "rover", count: 1}]),
  pillage: new Task("pillage", "Pillage", -1, 416000, [{id: "flag", count: 1}, {id: "village", count: 1}, {id: "army", count: 1}]),
  conquer: new Task("conquer", "Conquer", -1, 456000, [{id: "pillage", count: 1}, {id: "blood", count: 1}]),
  blood: new Task("blood", "Blood", -1, 41000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  frontier: new Task("frontier", "Frontier", 1, 648000, [{id: "pillage", count: 1}, {id: "space", count: 1}]),
  flint: new Task("flint", "Flint", -1, 8000, [{id: "stone", count: 1}, {id: "sand", count: 1}]),
  spear: new Task("spear", "Spear", -1, 38000, [{id: "flint", count: 1}, {id: "wood", count: 1}]),
  time: new Task("time", "Time", -1, 11000, [{id: "sand", count: 1}, {id: "glass", count: 1}]),
  anime: new Task("anime", "Anime", -1, 98000, [{id: "time", count: 1}, {id: "video", count: 1}, {id: "paper", count: 1}]),
  monk: new Task("monk", "Monk", -1, 53000, [{id: "human", count: 1}, {id: "intellect", count: 1}, {id: "time", count: 1}]),
  watch: new Task("watch", "Watch", 1, 39000, [{id: "time", count: 1}, {id: "crystal", count: 1}, {id: "circuit", count: 1}, {id: "battery", count: 1}]),
  tribe: new Task("tribe", "Tribe", -1, 49000, [{id: "human", count: 3}]),
  village: new Task("village", "Village", -1, 142000, [{id: "warrior", count: 1}, {id: "hunter", count: 1}, {id: "tribe", count: 1}]),
  colony: new Task("colony", "Colony", -1, 304000, [{id: "tribe", count: 1}, {id: "house", count: 1}]),
  army: new Task("army", "Army", -1, 208000, [{id: "warrior", count: 1}, {id: "hero", count: 1}]),
  king: new Task("king", "King", -1, 345000, [{id: "hero", count: 1}, {id: "royalty", count: 1}]),
  royalty: new Task("royalty", "Royalty", -1, 178000, [{id: "sex", count: 1}, {id: "money", count: 1}]),
  money: new Task("money", "Money", -1, 146000, [{id: "village", count: 1}, {id: "metal", count: 1}]),
  empire: new Task("empire", "Empire", 1, 1103000, [{id: "conquer", count: 1}, {id: "colony", count: 1}, {id: "king", count: 1}]),
  drill: new Task("drill", "Drill", -1, 39000, [{id: "electricity", count: 1}, {id: "tools", count: 1}, {id: "mechanism", count: 1}]),
  acorn: new Task("acorn", "Acorn", 1, 20000, [{id: "tree", count: 1}, {id: "seeds", count: 1}]),
  hair: new Task("hair", "Hair", -1, 110000, [{id: "human", count: 1}, {id: "time", count: 1}, {id: "string", count: 1}]),
  string: new Task("string", "String", -1, 84000, [{id: "fabric", count: 1}, {id: "tools", count: 1}]),
  city: new Task("city", "City", 1, 1071000, [{id: "building", count: 2}, {id: "school", count: 1}, {id: "skyscraper", count: 1}, {id: "car", count: 1}, {id: "house", count: 1}]),
  bed: new Task("bed", "Bed", -1, 137000, [{id: "wool", count: 1}, {id: "fabric", count: 1}, {id: "wood", count: 1}]),
  sleep: new Task("sleep", "Sleep", -1, 153000, [{id: "bed", count: 1}, {id: "human", count: 1}]),
  theft: new Task("theft", "Theft", -1, 162000, [{id: "human", count: 1}, {id: "money", count: 1}]),
  depression: new Task("depression", "Depression", -1, 215000, [{id: "family", count: 1}, {id: "corpse", count: 1}]),
  bandage: new Task("bandage", "Bandage", -1, 104000, [{id: "fabric", count: 1}, {id: "blood", count: 1}]),
  nurse: new Task("nurse", "Nurse", -1, 162000, [{id: "human", count: 1}, {id: "love", count: 1}, {id: "bandage", count: 1}]),
  doctor: new Task("doctor", "Doctor", -1, 156000, [{id: "human", count: 1}, {id: "science", count: 1}, {id: "bandage", count: 1}]),
  ambulance: new Task("ambulance", "Ambulance", 1, 335000, [{id: "doctor", count: 1}, {id: "car", count: 1}]),
  scalpel: new Task("scalpel", "Scalpel", 1, 176000, [{id: "doctor", count: 1}, {id: "tools", count: 1}]),
  battery: new Task("battery", "Battery", -1, 14000, [{id: "energy", count: 1}, {id: "electricity", count: 1}, {id: "metal", count: 1}]),
  cereal: new Task("cereal", "Cereal", 1, 76000, [{id: "wheat", count: 1}, {id: "milk", count: 1}]),
  rope: new Task("rope", "Rope", -1, 104000, [{id: "string", count: 1}, {id: "tools", count: 1}]),
  chainsaw: new Task("chainsaw", "Chainsaw", 1, 63000, [{id: "electricity", count: 1}, {id: "axe", count: 1}, {id: "mechanism", count: 1}]),
  forest: new Task("forest", "Forest", -1, 31000, [{id: "tree", count: 3}]),
  witch: new Task("witch", "Witch", -1, 50000, [{id: "forest", count: 1}, {id: "magic", count: 1}]),
  potion: new Task("potion", "Potion", 1, 69000, [{id: "witch", count: 1}, {id: "magic", count: 1}]),
  fortune: new Task("fortune", "Fortune", 1, 54000, [{id: "witch", count: 1}, {id: "crystal", count: 1}]),
  cauldron: new Task("cauldron", "Cauldron", 1, 54000, [{id: "witch", count: 1}, {id: "metal", count: 1}]),
  rainbow: new Task("rainbow", "Rainbow", -1, 9000, [{id: "lense", count: 1}, {id: "light", count: 1}, {id: "steam", count: 1}]),
  crayon: new Task("crayon", "Crayon", 1, 127000, [{id: "rainbow", count: 1}, {id: "pen", count: 1}]),
  mold: new Task("mold", "Mold", -1, 49000, [{id: "bread", count: 1}, {id: "time", count: 1}]),
  penicillin: new Task("penicillin", "Penicillin", 1, 204000, [{id: "doctor", count: 1}, {id: "mold", count: 1}]),
  lust: new Task("lust", "Lust", 1, 225000, [{id: "sex", count: 7}]),
  gluttony: new Task("gluttony", "Gluttony", 1, 302000, [{id: "meat", count: 7}]),
  greed: new Task("greed", "Greed", 1, 1016000, [{id: "money", count: 7}]),
  sloth: new Task("sloth", "Sloth", 1, 1065000, [{id: "sleep", count: 7}]),
  wrath: new Task("wrath", "Wrath", 1, 393000, [{id: "vampire", count: 7}]),
  envy: new Task("envy", "Envy", 1, 1128000, [{id: "theft", count: 7}]),
  pride: new Task("pride", "Pride", 1, 141000, [{id: "ego", count: 7}]),
  chastity: new Task("chastity", "Chastity", 1, 435000, [{id: "student", count: 7}]),
  abstinence: new Task("abstinence", "Abstinence", 1, 589000, [{id: "children", count: 7}]),
  liberality: new Task("liberality", "Liberality", 1, 1128000, [{id: "nurse", count: 7}]),
  diligence: new Task("diligence", "Diligence", 1, 1086000, [{id: "doctor", count: 7}]),
  patience: new Task("patience", "Patience", 1, 365000, [{id: "monk", count: 7}]),
  kindness: new Task("kindness", "Kindness", 1, 1128000, [{id: "nurse", count: 7}]),
  humility: new Task("humility", "Humility", 1, 1086000, [{id: "knight", count: 7}]),
  puff: new Task("puff", "Puff", 1, 100000, [{id: "sugar", count: 1}, {id: "spice", count: 1}]),
  sgdc: new Task("sgdc", "SGDC", 1, 323000, [{id: "memes", count: 1}, {id: "programming", count: 1}, {id: "love", count: 1}, {id: "spice", count: 1}]),
  jake: new Task("jake", "Jake", 1, 339000, [{id: "ego", count: 1}, {id: "love", count: 1}, {id: "hero", count: 1}, {id: "hair", count: 1}]),
  james: new Task("james", "James", 1, 568000, [{id: "computer", count: 1}, {id: "memes", count: 1}, {id: "hair", count: 1}, {id: "glasses", count: 1}, {id: "depression", count: 1}, {id: "spice", count: 1}]),
  david: new Task("david", "David", 1, 430000, [{id: "memes", count: 1}, {id: "teacher", count: 1}, {id: "science", count: 1}, {id: "computer", count: 1}]),
  noah: new Task("noah", "Noah", 1, 461000, [{id: "sleep", count: 1}, {id: "depression", count: 1}, {id: "student", count: 1}, {id: "sex", count: 1}]),
  isaac: new Task("isaac", "Isaac", 1, 446000, [{id: "reddit", count: 1}, {id: "programming", count: 1}, {id: "anime", count: 1}, {id: "hair", count: 1}]),
  jared: new Task("jared", "Jared", 1, 459000, [{id: "student", count: 1}, {id: "programming", count: 1}, {id: "java", count: 1}, {id: "depression", count: 1}]),
  thomas: new Task("thomas", "Thomas", 1, 492000, [{id: "abuse", count: 1}, {id: "memes", count: 1}, {id: "lego", count: 1}, {id: "depression", count: 1}]),
  ink: new Task("ink", "Ink", -1, 54000, [{id: "squid", count: 1}, {id: "weapon", count: 1}]),
  pen: new Task("pen", "Pen", -1, 119000, [{id: "feather", count: 1}, {id: "ink", count: 1}]),
  bic: new Task("bic", "Bic", 1, 151000, [{id: "plastic", count: 1}, {id: "pen", count: 1}]),
  penguin: new Task("penguin", "Penguin", -1, 81000, [{id: "feather", count: 1}, {id: "fish", count: 1}]),
  programming: new Task("programming", "Programming", -1, 82000, [{id: "computer", count: 1}, {id: "science", count: 1}, {id: "time", count: 1}]),
  linux: new Task("linux", "Linux", -1, 162000, [{id: "penguin", count: 1}, {id: "programming", count: 1}]),
  unix: new Task("unix", "Unix", -1, 117000, [{id: "computer", count: 1}, {id: "programming", count: 1}]),
  epoch: new Task("epoch", "Epoch", 1, 127000, [{id: "unix", count: 1}, {id: "time", count: 1}]),
  github: new Task("github", "Github", 1, 230000, [{id: "internet", count: 1}, {id: "love", count: 1}, {id: "programming", count: 1}]),
  bash: new Task("bash", "Bash", 1, 175000, [{id: "linux", count: 1}, {id: "shell", count: 1}]),
  zsh: new Task("zsh", "ZSH", 1, 217000, [{id: "linux", count: 1}, {id: "shell", count: 1}, {id: "love", count: 1}]),
  c: new Task("c", "C", -1, 102000, [{id: "programming", count: 1}, {id: "time", count: 2}]),
  cplusplus: new Task("cplusplus", "CPlusPlus", 1, 128000, [{id: "c", count: 1}, {id: "intellect", count: 1}]),
  go: new Task("go", "Go", 1, 138000, [{id: "c", count: 1}, {id: "intellect", count: 1}, {id: "time", count: 1}]),
  java: new Task("java", "Java", -1, 102000, [{id: "programming", count: 1}, {id: "ego", count: 1}]),
  python: new Task("python", "Python", -1, 96000, [{id: "programming", count: 1}, {id: "snake", count: 1}]),
  python3: new Task("python3", "Python3", 1, 106000, [{id: "python", count: 1}, {id: "time", count: 1}]),
  perl: new Task("perl", "Perl", 1, 111000, [{id: "programming", count: 1}, {id: "cancer", count: 1}]),
  ruby: new Task("ruby", "Ruby", 1, 124000, [{id: "programming", count: 1}, {id: "love", count: 1}]),
  javascript: new Task("javascript", "Javascript", 1, 217000, [{id: "programming", count: 1}, {id: "cancer", count: 1}, {id: "internet", count: 1}]),
  rprogramming: new Task("rprogramming", "rProgramming", 1, 240000, [{id: "reddit", count: 1}, {id: "programming", count: 1}]),
  runixporn: new Task("runixporn", "rUnixPorn", 1, 360000, [{id: "reddit", count: 1}, {id: "unix", count: 1}, {id: "porn", count: 1}]),
  rearthporn: new Task("rearthporn", "rEarthPorn", 1, 245000, [{id: "reddit", count: 1}, {id: "earth", count: 1}, {id: "porn", count: 1}]),
  rfoodporn: new Task("rfoodporn", "rFoodPorn", 1, 307000, [{id: "reddit", count: 1}, {id: "food", count: 1}, {id: "porn", count: 1}]),
  rspaceporn: new Task("rspaceporn", "rSpacePorn", 1, 476000, [{id: "reddit", count: 1}, {id: "space", count: 1}, {id: "porn", count: 1}]),
  rpics: new Task("rpics", "rPics", 1, 188000, [{id: "reddit", count: 1}, {id: "camera", count: 1}]),
  rgonewild: new Task("rgonewild", "rGonewild", 1, 244000, [{id: "reddit", count: 1}, {id: "porn", count: 1}]),
  raskreddit: new Task("raskreddit", "rAskreddit", 1, 205000, [{id: "reddit", count: 1}, {id: "curiosity", count: 1}]),
  rscience: new Task("rscience", "rScience", 1, 195000, [{id: "reddit", count: 1}, {id: "science", count: 1}]),
  ranime: new Task("ranime", "rAnime", 1, 256000, [{id: "reddit", count: 1}, {id: "anime", count: 1}]),
  flute: new Task("flute", "Flute", -1, 85000, [{id: "human", count: 1}, {id: "drill", count: 1}, {id: "wood", count: 1}]),
  recorder: new Task("recorder", "Recorder", 1, 117000, [{id: "plastic", count: 1}, {id: "flute", count: 1}]),
  guitar: new Task("guitar", "Guitar", 1, 130000, [{id: "human", count: 1}, {id: "wood", count: 1}, {id: "string", count: 1}]),
  miner: new Task("miner", "Miner", 1, 77000, [{id: "upgrade_miner", count: -1}, {id: "drill", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}, {id: "energy", count: 1}]),
  lumberjack: new Task("lumberjack", "Lumberjack", 1, 111000, [{id: "upgrade_lumberjack", count: -1}, {id: "axe", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}, {id: "wood", count: 1}]),
  fisherman: new Task("fisherman", "Fisherman", 1, 69000, [{id: "upgrade_fisherman", count: -1}, {id: "fish", count: 1}, {id: "human", count: 1}, {id: "spear", count: 1}]),
  refinery: new Task("refinery", "Refinery", 1, 93000, [{id: "upgrade_refinery", count: -1}, {id: "mechanism", count: 1}, {id: "science", count: 1}, {id: "oil", count: 1}, {id: "gasoline", count: 1}, {id: "tools", count: 1}]),
  smelter: new Task("smelter", "Smelter", 1, 49000, [{id: "upgrade_smelter", count: -1}, {id: "mechanism", count: 1}, {id: "fire", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  breeder: new Task("breeder", "Breeder", 1, 111000, [{id: "upgrade_breeder", count: -1}, {id: "human", count: 1}, {id: "beaker", count: 1}, {id: "sex", count: 1}, {id: "tools", count: 1}]),
  chef: new Task("chef", "Chef", 1, 100000, [{id: "upgrade_chef", count: -1}, {id: "human", count: 1}, {id: "tools", count: 1}, {id: "food", count: 1}]),
  teacher: new Task("teacher", "Teacher", 1, 224000, [{id: "upgrade_teacher", count: -1}, {id: "student", count: 1}, {id: "book", count: 1}, {id: "time", count: 1}, {id: "intellect", count: 1}]),
  god: new Task("god", "God", 1, 82000, [{id: "upgrade_god", count: -1}, {id: "demigod", count: 2}, {id: "life", count: 1}]),
  cloner: new Task("cloner", "Cloner", 1, 237000, [{id: "upgrade_cloner", count: -1}, {id: "breeder", count: 1}, {id: "sex", count: 1}, {id: "scientist", count: 1}, {id: "beaker", count: 1}]),
  lover: new Task("lover", "Lover", 1, 73000, [{id: "upgrade_lover", count: -1}, {id: "human", count: 1}, {id: "love", count: 1}, {id: "time", count: 1}, {id: "mirror", count: 1}]),
  chicken: new Task("chicken", "Chicken", 1, 31000, [{id: "upgrade_chicken", count: -1}, {id: "bird", count: 1}, {id: "egg", count: 1}, {id: "time", count: 1}]),
  farmer: new Task("farmer", "Farmer", 1, 117000, [{id: "upgrade_farmer", count: -1}, {id: "tools", count: 1}, {id: "field", count: 1}, {id: "animal", count: 1}, {id: "seeds", count: 1}, {id: "fertilizer", count: 1}]),
  seamstress: new Task("seamstress", "Seamstress", 1, 226000, [{id: "upgrade_seamstress", count: -1}, {id: "human", count: 1}, {id: "tools", count: 1}, {id: "fabric", count: 1}, {id: "wool", count: 1}, {id: "string", count: 1}]),
  timekeeper: new Task("timekeeper", "Timekeeper", 1, 109000, [{id: "upgrade_timekeeper", count: -1}, {id: "magic", count: 1}, {id: "wizard", count: 1}, {id: "time", count: 1}, {id: "sand", count: 1}, {id: "blood", count: 1}]),
  smither: new Task("smither", "Smither", 1, 193000, [{id: "upgrade_smither", count: -1}, {id: "mechanism", count: 1}, {id: "metal", count: 1}, {id: "village", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  provider: new Task("provider", "Provider", 1, 292000, [{id: "upgrade_provider", count: -1}, {id: "internet", count: 1}, {id: "skyscraper", count: 1}, {id: "fiberoptics", count: 1}]),
  generator: new Task("generator", "Generator", 1, 87000, [{id: "upgrade_generator", count: -1}, {id: "energy", count: 1}, {id: "mechanism", count: 1}, {id: "solarpanel", count: 1}, {id: "science", count: 1}, {id: "battery", count: 1}, {id: "electricity", count: 1}]),
  builder: new Task("builder", "Builder", 1, 125000, [{id: "upgrade_builder", count: -1}, {id: "mechanism", count: 1}, {id: "building", count: 1}, {id: "cement", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  voyager: new Task("voyager", "Voyager", 1, 465000, [{id: "upgrade_voyager", count: -1}, {id: "rocket", count: 1}, {id: "space", count: 1}, {id: "human", count: 1}]),
  researcher: new Task("researcher", "Researcher", 1, 322000, [{id: "upgrade_researcher", count: -1}, {id: "scientist", count: 1}, {id: "book", count: 1}, {id: "curiosity", count: 1}, {id: "tools", count: 1}, {id: "beaker", count: 1}, {id: "science", count: 1}]),
  trainer: new Task("trainer", "Trainer", 1, 300000, [{id: "upgrade_trainer", count: -1}, {id: "teacher", count: 1}, {id: "warrior", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  engineer: new Task("engineer", "Engineer", 1, 95000, [{id: "upgrade_engineer", count: -1}, {id: "scientist", count: 1}, {id: "tools", count: 1}, {id: "mechanism", count: 1}, {id: "circuit", count: 1}]),
  writer: new Task("writer", "Writer", 1, 314000, [{id: "upgrade_writer", count: -1}, {id: "human", count: 1}, {id: "tools", count: 1}, {id: "book", count: 1}, {id: "paper", count: 1}, {id: "pen", count: 1}]),
  banker: new Task("banker", "Banker", 1, 333000, [{id: "upgrade_banker", count: -1}, {id: "human", count: 1}, {id: "theft", count: 1}, {id: "money", count: 1}, {id: "time", count: 1}]),
  programmer: new Task("programmer", "Programmer", 1, 179000, [{id: "upgrade_programmer", count: -1}, {id: "programming", count: 1}, {id: "human", count: 1}, {id: "ego", count: 1}, {id: "computer", count: 1}, {id: "intellect", count: 1}]),
  redditor: new Task("redditor", "Redditor", 1, 251000, [{id: "upgrade_redditor", count: -1}, {id: "human", count: 1}, {id: "boredom", count: 1}, {id: "time", count: 1}, {id: "reddit", count: 1}]),
  camgirl: new Task("camgirl", "Camgirl", 1, 293000, [{id: "upgrade_camgirl", count: -1}, {id: "human", count: 1}, {id: "sex", count: 1}, {id: "video", count: 1}, {id: "porn", count: 1}, {id: "internet", count: 1}]),
  airport: new Task("airport", "Airport", 1, 287000, [{id: "upgrade_airport", count: -1}, {id: "airplane", count: 1}, {id: "building", count: 1}, {id: "solarpanel", count: 1}, {id: "oil", count: 1}]),
  upgrade_miner: new Task("upgrade_miner", "Mine Stone", -1, 12750, [{id: "miner", count: 0}, {id: "earth", count: 5}, {id: "fire", count: 5}, {id: "water", count: 7}], 0, [{id: "upgrade_miner", count: -1}, {id: "stone", count: 3}, {id: "sand", count: 2}]),
  upgrade_lumberjack: new Task("upgrade_lumberjack", "Chop Wood", -1, 112500, [{id: "lumberjack", count: 0}, {id: "earth", count: 45}, {id: "fire", count: 35}, {id: "water", count: 40}, {id: "air", count: 15}, {id: "light", count: 15}], 0, [{id: "upgrade_lumberjack", count: -1}, {id: "wood", count: 5}]),
  upgrade_fisherman: new Task("upgrade_fisherman", "Catch Fish", -1, 22500, [{id: "fisherman", count: 0}, {id: "earth", count: 8}, {id: "water", count: 12}, {id: "fire", count: 4}, {id: "air", count: 2}, {id: "light", count: 4}], 0, [{id: "upgrade_fisherman", count: -1}, {id: "fish", count: 2}]),
  upgrade_refinery: new Task("upgrade_refinery", "Refine Oil", -1, 62250, [{id: "refinery", count: 0}, {id: "water", count: 25}, {id: "earth", count: 21}, {id: "fire", count: 23}, {id: "air", count: 7}, {id: "light", count: 7}], 0, [{id: "upgrade_refinery", count: -1}, {id: "oil", count: 1}, {id: "plastic", count: 1}, {id: "gasoline", count: 3}]),
  upgrade_smelter: new Task("upgrade_smelter", "Smelt Materials", -1, 31500, [{id: "smelter", count: 0}, {id: "earth", count: 9}, {id: "fire", count: 18}, {id: "water", count: 12}, {id: "light", count: 3}], 0, [{id: "upgrade_smelter", count: -1}, {id: "metal", count: 6}, {id: "glass", count: 3}]),
  upgrade_breeder: new Task("upgrade_breeder", "Breed Human", -1, 12000, [{id: "breeder", count: 0}, {id: "earth", count: 5}, {id: "water", count: 4}, {id: "fire", count: 3}, {id: "air", count: 2}, {id: "light", count: 2}], 0, [{id: "upgrade_breeder", count: -1}, {id: "human", count: 1}]),
  upgrade_chef: new Task("upgrade_chef", "Cook Food", -1, 168000, [{id: "chef", count: 0}, {id: "earth", count: 71}, {id: "water", count: 57}, {id: "fire", count: 45}, {id: "air", count: 24}, {id: "light", count: 27}], 0, [{id: "upgrade_chef", count: -1}, {id: "food", count: 3}, {id: "sugar", count: 1}]),
  upgrade_teacher: new Task("upgrade_teacher", "Teach Student", -1, 66000, [{id: "teacher", count: 0}, {id: "earth", count: 23}, {id: "water", count: 28}, {id: "fire", count: 21}, {id: "air", count: 6}, {id: "light", count: 10}], 0, [{id: "upgrade_teacher", count: -1}, {id: "student", count: 1}, {id: "intellect", count: 1}]),
  upgrade_god: new Task("upgrade_god", "Make Life", -1, 18750, [{id: "god", count: 0}, {id: "earth", count: 5}, {id: "water", count: 5}, {id: "fire", count: 5}, {id: "air", count: 5}, {id: "light", count: 5}], 0, [{id: "upgrade_god", count: -1}, {id: "life", count: 5}]),
  upgrade_cloner: new Task("upgrade_cloner", "Clone Human", -1, 60000, [{id: "cloner", count: 0}, {id: "earth", count: 25}, {id: "water", count: 20}, {id: "fire", count: 15}, {id: "air", count: 10}, {id: "light", count: 10}], 0, [{id: "upgrade_cloner", count: -1}, {id: "human", count: 5}]),
  upgrade_lover: new Task("upgrade_lover", "Love Unconditionally", -1, 63000, [{id: "lover", count: 0}, {id: "earth", count: 24}, {id: "water", count: 24}, {id: "fire", count: 18}, {id: "air", count: 8}, {id: "light", count: 10}], 0, [{id: "upgrade_lover", count: -1}, {id: "love", count: 2}]),
  upgrade_chicken: new Task("upgrade_chicken", "Lay Eggs", -1, 36000, [{id: "chicken", count: 0}, {id: "earth", count: 12}, {id: "water", count: 12}, {id: "fire", count: 12}, {id: "air", count: 6}, {id: "light", count: 6}], 0, [{id: "upgrade_chicken", count: -1}, {id: "egg", count: 6}]),
  upgrade_farmer: new Task("upgrade_farmer", "Farm Plants", -1, 96750, [{id: "farmer", count: 0}, {id: "earth", count: 38}, {id: "fire", count: 21}, {id: "water", count: 35}, {id: "air", count: 13}, {id: "light", count: 22}], 0, [{id: "upgrade_farmer", count: -1}, {id: "seeds", count: 1}, {id: "grass", count: 3}, {id: "tree", count: 3}, {id: "animal", count: 2}]),
  upgrade_seamstress: new Task("upgrade_seamstress", "Sew Fabric", -1, 219000, [{id: "seamstress", count: 0}, {id: "earth", count: 92}, {id: "water", count: 74}, {id: "fire", count: 62}, {id: "air", count: 32}, {id: "light", count: 32}], 0, [{id: "upgrade_seamstress", count: -1}, {id: "fabric", count: 2}, {id: "string", count: 2}]),
  upgrade_timekeeper: new Task("upgrade_timekeeper", "Rewind Time", -1, 60000, [{id: "timekeeper", count: 0}, {id: "earth", count: 10}, {id: "fire", count: 15}, {id: "water", count: 20}, {id: "light", count: 5}], 0, [{id: "upgrade_timekeeper", count: -1}, {id: "time", count: 5}]),
  upgrade_smither: new Task("upgrade_smither", "Smith Tools", -1, 99000, [{id: "smither", count: 0}, {id: "earth", count: 39}, {id: "water", count: 33}, {id: "fire", count: 36}, {id: "air", count: 12}, {id: "light", count: 12}], 0, [{id: "upgrade_smither", count: -1}, {id: "tools", count: 3}, {id: "weapon", count: 3}]),
  upgrade_provider: new Task("upgrade_provider", "Provide Internet", -1, 79500, [{id: "provider", count: 0}, {id: "earth", count: 21}, {id: "water", count: 26}, {id: "fire", count: 39}, {id: "air", count: 8}, {id: "light", count: 12}], 0, [{id: "upgrade_provider", count: -1}, {id: "internet", count: 1}]),
  upgrade_generator: new Task("upgrade_generator", "Generate Electricity", -1, 17250, [{id: "generator", count: 0}, {id: "fire", count: 10}, {id: "air", count: 4}, {id: "earth", count: 3}, {id: "water", count: 3}, {id: "light", count: 3}], 0, [{id: "upgrade_generator", count: -1}, {id: "electricity", count: 3}, {id: "energy", count: 1}]),
  upgrade_builder: new Task("upgrade_builder", "Build Buildings", -1, 87750, [{id: "builder", count: 0}, {id: "earth", count: 32}, {id: "water", count: 41}, {id: "fire", count: 26}, {id: "air", count: 6}, {id: "light", count: 12}], 0, [{id: "upgrade_builder", count: -1}, {id: "building", count: 2}, {id: "bricks", count: 1}]),
  upgrade_voyager: new Task("upgrade_voyager", "Explore Space", -1, 348000, [{id: "voyager", count: 0}, {id: "water", count: 122}, {id: "earth", count: 122}, {id: "fire", count: 128}, {id: "air", count: 46}, {id: "light", count: 46}], 0, [{id: "upgrade_voyager", count: -1}, {id: "space", count: 2}]),
  upgrade_researcher: new Task("upgrade_researcher", "Research Science", -1, 135000, [{id: "researcher", count: 0}, {id: "earth", count: 45}, {id: "water", count: 60}, {id: "fire", count: 45}, {id: "air", count: 10}, {id: "light", count: 20}], 0, [{id: "upgrade_researcher", count: -1}, {id: "science", count: 5}]),
  upgrade_trainer: new Task("upgrade_trainer", "Train Warriors", -1, 60000, [{id: "trainer", count: 0}, {id: "earth", count: 24}, {id: "water", count: 20}, {id: "fire", count: 20}, {id: "air", count: 8}, {id: "light", count: 8}], 0, [{id: "upgrade_trainer", count: -1}, {id: "warrior", count: 2}]),
  upgrade_engineer: new Task("upgrade_engineer", "Engineer Electronics", -1, 33000, [{id: "engineer", count: 0}, {id: "fire", count: 20}, {id: "air", count: 4}, {id: "earth", count: 8}, {id: "water", count: 8}, {id: "light", count: 4}], 0, [{id: "upgrade_engineer", count: -1}, {id: "mechanism", count: 2}, {id: "circuit", count: 2}]),
  upgrade_writer: new Task("upgrade_writer", "Write Books", -1, 625000, [{id: "writer", count: 0}, {id: "earth", count: 195}, {id: "water", count: 160}, {id: "fire", count: 120}, {id: "air", count: 65}, {id: "light", count: 85}], 0, [{id: "upgrade_writer", count: -1}, {id: "book", count: 5}]),
  upgrade_banker: new Task("upgrade_banker", "Make Money", -1, 326250, [{id: "banker", count: 0}, {id: "earth", count: 132}, {id: "water", count: 114}, {id: "fire", count: 99}, {id: "air", count: 45}, {id: "light", count: 45}], 0, [{id: "upgrade_banker", count: -1}, {id: "money", count: 3}]),
  upgrade_programmer: new Task("upgrade_programmer", "Write Code", -1, 182250, [{id: "programmer", count: 0}, {id: "earth", count: 51}, {id: "fire", count: 81}, {id: "water", count: 69}, {id: "air", count: 15}, {id: "light", count: 27}], 0, [{id: "upgrade_programmer", count: -1}, {id: "programming", count: 3}]),
  upgrade_redditor: new Task("upgrade_redditor", "Read Reddit", -1, 474000, [{id: "redditor", count: 0}, {id: "earth", count: 105}, {id: "water", count: 126}, {id: "fire", count: 153}, {id: "air", count: 36}, {id: "light", count: 54}], 0, [{id: "upgrade_redditor", count: -1}, {id: "reddit", count: 3}]),
  upgrade_camgirl: new Task("upgrade_camgirl", "Make Porn", -1, 63750, [{id: "camgirl", count: 0}, {id: "earth", count: 19}, {id: "water", count: 18}, {id: "fire", count: 28}, {id: "air", count: 9}, {id: "light", count: 11}], 0, [{id: "upgrade_camgirl", count: -1}, {id: "porn", count: 1}]),
  upgrade_airport: new Task("upgrade_airport", "Fly Airplanes", -1, 151500, [{id: "airport", count: 0}, {id: "water", count: 52}, {id: "earth", count: 53}, {id: "fire", count: 57}, {id: "air", count: 20}, {id: "light", count: 20}], 0, [{id: "upgrade_airport", count: -1}, {id: "airplane", count: 1}]),
};

// Things to hide from the menu
let hidden = {
  "things": 1,
  "upgrade_miner": 1,
  "upgrade_lumberjack": 1,
  "upgrade_fisherman": 1,
  "upgrade_refinery": 1,
  "upgrade_smelter": 1,
  "upgrade_breeder": 1,
  "upgrade_chef": 1,
  "upgrade_teacher": 1,
  "upgrade_god": 1,
  "upgrade_cloner": 1,
  "upgrade_lover": 1,
  "upgrade_chicken": 1,
  "upgrade_farmer": 1,
  "upgrade_seamstress": 1,
  "upgrade_timekeeper": 1,
  "upgrade_smither": 1,
  "upgrade_provider": 1,
  "upgrade_generator": 1,
  "upgrade_builder": 1,
  "upgrade_voyager": 1,
  "upgrade_researcher": 1,
  "upgrade_trainer": 1,
  "upgrade_engineer": 1,
  "upgrade_writer": 1,
  "upgrade_banker": 1,
  "upgrade_programmer": 1,
  "upgrade_redditor": 1,
  "upgrade_camgirl": 1,
  "upgrade_airport": 1,
};

// Initial Tasks
let initial = [tasks.things];

let scoreValues = {
  dust: 1,
  fern: 8,
  butterfly: 8,
  firefly: 9,
  golem: 9,
  phoenix: 10,
  juice: 10,
  whale: 10,
  turtle: 10,
  prism: 11,
  scarab: 12,
  thunderbird: 12,
  treant: 12,
  lavalamp: 12,
  lily: 13,
  perfume: 14,
  dam: 14,
  stew: 15,
  fossil: 16,
  acorn: 16,
  sorcery: 18,
  microscope: 18,
  sauna: 18,
  dragonfruit: 18,
  ceramics: 19,
  bee: 21,
  baked: 22,
  ivy: 22,
  dolphin: 22,
  chicken: 24,
  hay: 25,
  mermaid: 26,
  campfire: 27,
  torch: 27,
  ruins: 28,
  watch: 31,
  scorpion: 32,
  termite: 35,
  pipe: 35,
  hydrangea: 36,
  skittles: 36,
  joint: 36,
  origami: 37,
  shrek: 40,
  fence: 40,
  smelter: 40,
  ladybug: 44,
  waterwheel: 45,
  fortune: 45,
  cauldron: 45,
  rose: 48,
  piranha: 48,
  ash: 50,
  chainsaw: 54,
  condom: 56,
  potion: 57,
  printer: 58,
  werewolf: 59,
  frankenstein: 59,
  cigar: 59,
  fisherman: 59,
  lover: 60,
  katana: 61,
  omelet: 62,
  prison: 63,
  cereal: 64,
  miner: 64,
  god: 66,
  ai: 70,
  generator: 71,
  salad: 72,
  firearm: 74,
  coffin: 76,
  motorcycle: 76,
  grenade: 78,
  necromancer: 79,
  curse: 79,
  refinery: 79,
  cyborg: 80,
  chariot: 81,
  engineer: 81,
  spider: 82,
  puff: 85,
  chef: 86,
  note7: 87,
  terminator: 88,
  singularity: 89,
  python3: 91,
  timekeeper: 91,
  perl: 93,
  lumberjack: 96,
  farmer: 97,
  locomotive: 99,
  cake: 101,
  recorder: 101,
  ghoul: 103,
  builder: 104,
  firewall: 106,
  ruby: 106,
  epoch: 110,
  cplusplus: 110,
  crayon: 111,
  steamship: 113,
  guitar: 113,
  chia: 116,
  go: 118,
  edgar: 119,
  pride: 120,
  ninjutsu: 123,
  pie: 124,
  bar: 125,
  nightlight: 130,
  safe: 131,
  bic: 133,
  fedora: 137,
  frigate: 141,
  slayer: 145,
  youtube: 145,
  bash: 151,
  horseshoe: 152,
  camel: 152,
  hentai: 153,
  programmer: 153,
  bing: 154,
  scalpel: 154,
  creditcard: 156,
  rpics: 161,
  centaur: 162,
  pornhub: 165,
  smither: 166,
  sandwich: 167,
  rscience: 168,
  excalibur: 173,
  raskreddit: 175,
  penicillin: 177,
  quadcopter: 178,
  javascript: 185,
  cow: 186,
  hotwheels: 186,
  zsh: 186,
  lust: 190,
  iphone: 196,
  seamstress: 196,
  github: 198,
  burrito: 203,
  cloner: 203,
  paperairplane: 205,
  sun: 206,
  rprogramming: 207,
  alien: 208,
  rearthporn: 209,
  rgonewild: 209,
  unicorn: 212,
  redditor: 212,
  ranime: 217,
  sunflower: 218,
  mailman: 218,
  dyson: 232,
  nuke: 235,
  pizza: 240,
  cabin: 242,
  satellite: 243,
  barbie: 244,
  airport: 248,
  camgirl: 249,
  provider: 250,
  narwhal: 252,
  trainer: 256,
  gluttony: 260,
  rfoodporn: 264,
  alphabet: 265,
  writer: 269,
  researcher: 275,
  sgdc: 277,
  roomba: 281,
  tank: 288,
  banker: 290,
  jake: 293,
  ambulance: 294,
  osx: 298,
  titanxp: 305,
  patience: 309,
  runixporn: 310,
  wrath: 344,
  gmail: 357,
  chastity: 365,
  castle: 367,
  david: 367,
  rv: 373,
  cowboy: 373,
  isaac: 382,
  divorce: 386,
  jared: 394,
  noah: 396,
  voyager: 408,
  meteor: 413,
  rspaceporn: 413,
  thomas: 422,
  milkyway: 449,
  james: 488,
  abstinence: 498,
  frontier: 569,
  solarsystem: 616,
  mars: 675,
  greed: 890,
  city: 912,
  sloth: 932,
  diligence: 953,
  humility: 953,
  empire: 958,
  liberality: 981,
  kindness: 981,
  envy: 988,
  supercluster: 1647, 
};

/* -- Things --

  Raw Counts:
    Earth: 18153
      Air: 6272
     Fire: 16220
    Water: 17446
    Light: 7423

  Total Tasks: 443

  Largest Tasks:
   Supercluster (1864 raw, 1647 steps)
           Envy (1127 raw, 988 steps)
     Liberality (1127 raw, 981 steps)
       Kindness (1127 raw, 981 steps)

  Shortest Ends:
           Dust (2 raw, 1 steps)
           Fern (13 raw, 8 steps)
      Butterfly (11 raw, 8 steps)
        Firefly (12 raw, 9 steps)
 */


function loadGame(saveData) {
  let todo = [];
  for(let t in saveData.times) {
    let task = tasks[t];
    task.times = saveData.times[t];
    if(task.limit > 0) {
      task.limit -= task.times;
      task.limit = Math.max(task.limit, 0);
    }
  }
  for(let i = 0; i < saveData.todo.length; i++) {
    let item = saveData.todo[i];
    if(!tasks[item.id])
      continue;

    let task = tasks[item.id];
    task.started = item.started;
    task.startTime = item.startTime;

    todo.push(task);
  }

  GameController.setState({
    todo: todo,
    saved: true,
  });
}

$(document).ready(() => {
  if(location.hash.length <= 1)
    return;

  let saveData = location.hash.substr(1);

  try {
    saveData = JSON.parse(atob(saveData));
  } catch (e) {
    console.log("Error Importing Save");
    console.error(e);
    return;
  }

  /*
    {completed:{thing: 1}, times: {thing: 1}, todo: [{id: "asdf", started: false, startTime: 0}]}
  */

  // make sure completed is an object with value type number
  if(typeof saveData.completed === "object" && typeof saveData.completed.length === "undefined") {
    for(let key in saveData.completed)
      if(typeof saveData.completed[key] !== "number") {
        console.error("Import completed value type not number");
        return;
      }
  } else {
    console.error("Import completed type not object");
    return;
  }

  // make sure times is an object with value type number
  if(typeof saveData.times === "object" && typeof saveData.times.length === "undefined") {
    for(let key in saveData.times)
      if(typeof saveData.times[key] !== "number") {
        console.error("Import times value type not number");
        return;
      }
  } else {
    console.error("Import times type not object");
    return;
  }

  // make sure times is an array with value type object with keys id, started, startTime
  if(typeof saveData.todo === "object" && typeof saveData.todo.length !== "undefined") {
    for(let i = 0; i < saveData.todo.length; i++) {
      let thing = saveData.todo[i];
      if(typeof thing.id !== "string") {
        console.error("Import todo id value type not string");
        return;
      }
      if(typeof thing.started !== "boolean") {
        console.error("Import todo started value type not boolean");
        return;
      }
      if(typeof thing.startTime !== "number") {
        console.error("Import todo startTime value type not number");
        return;
      }
    }
  } else {
    console.error("Import todo type not array");
    return;
  }

  // Create our load game task
  tasks.__imported_game = new Task("__imported_game", "Import Things", 1, 5000, [{id: "__start", count: 1}], ()=>{
    loadGame(saveData);
  }, Object.keys(saveData.completed).map(t => ({id: t, count: saveData.completed[t]})));

  GameController.state.todo.push(tasks.__imported_game);
  GameController.setState({
    todo: GameController.state.todo
  });

});

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
  tasks.__loaded_game = new Task("__loaded_game", "Load Things", 1, 5000, [{id: "__start", count: 1}], ()=>{
    loadGame(saveData);
  }, Object.keys(saveData.completed).map(t => ({id: t, count: saveData.completed[t]})));

  GameController.state.todo.push(tasks.__loaded_game);
  GameController.setState({
    todo: GameController.state.todo
  });
});

hidden.__loaded_game = 1;
hidden.__imported_game = 1;
hidden.__start = 1;

function identify(event, task) {
  let elem = event.currentTarget;
  if(!elem)
    return;
  if(TooltipController.task !== task) {
    TooltipController.setTask(task);
  }
}

$(document.body).mousemove((e) => {
  if(!TooltipController.task)
    return;
  
  $('#tooltip').css("left", e.pageX);
  $('#tooltip').css("top", e.pageY);
});


class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    this.task = '';
    this.state = {};

    this.setTask = this.setTask.bind(this);
  }

  setTask(task) {
    this.task = task;
    this.setState({
      task: task,
      requirements: tasks[task] ? tasks[task].requirements : [{id: "Raw Element", count: 0}]
    });
  }

  render() {
    if(!this.state.task)
      return <div></div>;

    let requirements = this.state.requirements;
    return (<div className="card">
      <div className="card-content">
        <div className="card-requirements">
          {requirements.map(req => (
            !hidden[req.id] && !req.hidden &&
            <span key={req.id}
              className={"card-requirement " + (req.count > 0 ? "remove" : "needed")}>{(req.count > 0 ? req.count + " " : "") + req.id}</span>
          ))}
        </div>
      </div>
    </div>);
  }
}

window.TooltipController = ReactDOM.render(<Tooltip/>, document.getElementById("tooltip"));

// Displays the achievements
class Achievements extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      achievements: [
      ]
    };

    this.onFinish = this.onFinish.bind(this);
  }

  // when an achievement finishes
  onFinish(achievement) {
    let pos = this.state.achievements.indexOf(achievement);
    if(pos > -1) {
      this.state.achievements.splice(pos, 1);
      this.setState({achievements: this.state.achievements});
    }
  }

  // Adds another achievement to display
  addAchievement(achievement) {
    this.state.achievements.push(achievement);
    this.setState({
      achievements: this.state.achievements
    });
  }

  // Renders the achievement cards
  render() {
    return (<div className="card-container">
      {this.state.achievements.map((t, i) => <AchievementCard key={t} content={t} onFinish={this.onFinish}/>)}
    </div>);
  }
}

// class for individual achievement cards
class AchievementCard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let height = $(this.refs.card).height();
    $(this.refs.card).css("height", 0);
    $(this.refs.card).animate({height: height}, "slow");
    let comp = this;
    setTimeout(()=> {
      $(this.refs.card).animate({height: 0}, {
        duration: "slow", 
        complete() {
          comp.props.onFinish(comp.props.content)
        }
      });
    }, 3000);
  }

  render() {
    return (<div ref="card" className="card achievement">
      <div className="card-content">
        <h2>
          <i className="material-icons">star</i>
          {this.props.content}
          <i className="material-icons">star</i>
        </h2>
      </div>
    </div>);
  }
}

window.AchievementController = ReactDOM.render(<Achievements/>, document.getElementById("achievements"));

window.achievement = function achievement(task) {
  AchievementController.addAchievement(task);
}

// Controls component: manages tasks
class Controls extends React.Component {
  constructor(props) {
    super(props);

    // list of all tasks
    this.tasks = tasks;

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
    this.saveLink = this.saveLink.bind(this);
    this.canAfford = this.canAfford.bind(this);
    this.computeScore = this.computeScore.bind(this);
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
          card.visible = false;
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
    
    task.times ++;

    // decrease the task if it's not an unlimited task
    if(task.limit > 0) {
      task.limit --;

      if(task.limit == 0 && task.times == 1 && !task.hidden && !hidden[task.id]) {
        achievement(task.name);
      }
    }

    task.action();
    task.started = false;
    task.startTime = 0;

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

  saveLink() {
    window.location.href = window.location.origin + window.location.pathname + "#" + btoa(localStorage.CreateSaveData);
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
  


    this.setState({saved: true});
    console.log("Saved Game");
  }

  computeScore() {
    let score = {ends: 0, score: 0};
    Object.keys(scoreValues).map(t => {
      if(this.state.completed[t]) {
        score.ends ++;
        score.score += scoreValues[t];
      }
    });
    score.score *= 10;
    return score;
  }

  render() {
    let score = this.computeScore();
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
        {this.state.completed.things &&
        <div className="card-container">
          <div className="card">
            <div className="card-content">
              <h2><span>Score</span><span>{score.score}</span></h2>
              <h2><span>Final Products</span><span>{score.ends}</span></h2>
            </div>
          </div>
        </div>}
        <div className="inventory-buttons">
          {this.state.completed.things && <button ref="saveButton" onClick={this.saveGame}>
            <i className="material-icons">save</i>
          </button>}
          {this.state.saved && <button onClick={this.saveLink}>
            <i className="material-icons">link</i>
          </button>}
        </div>
        <div className="card-container">
          <div className="inventory-content">
            {!this.state.completed.things && <h2>Nothing Here Yet!</h2>}
            {Object.keys(this.state.completed).map(k => (this.state.completed[k] > -1 && !hidden[k] && (
              <span className={"inventory-item " + (scoreValues[k] ? "final" : "")} key={k} onMouseLeave={e=>{identify(e, '')}} onMouseOver={e=>{identify(e, k)}}>
                {scoreValues[k] && <i className="material-icons">star</i>}
                {(scoreValues[k] ? "" : this.state.completed[k] + " ") + k}
              </span>
            )))}
          </div>
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
