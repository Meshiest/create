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
                className={"card-requirement " + (requirements[id] > 0 ? "remove" : "needed")}>{(requirements[id] > 0 ? requirements[id] + " " : "") + id}</span>
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
  things: new Task("things", "Create Things", 1, 5000, [], 0, [{id: "earth", count: 2546}, {id: "fire", count: 2125}, {id: "water", count: 2333}, {id: "air", count: 897}, {id: "light", count: 936}]),
  lava: new Task("lava", "Lava", -1, 3000, [{id: "earth", count: 1}, {id: "fire", count: 1}]),
  swamp: new Task("swamp", "Swamp", -1, 3000, [{id: "earth", count: 1}, {id: "water", count: 1}]),
  alcohol: new Task("alcohol", "Alcohol", -1, 3000, [{id: "fire", count: 1}, {id: "water", count: 1}]),
  energy: new Task("energy", "Energy", -1, 3000, [{id: "fire", count: 1}, {id: "air", count: 1}]),
  steam: new Task("steam", "Steam", -1, 3000, [{id: "air", count: 1}, {id: "water", count: 1}]),
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
  wizard: new Task("wizard", "Wizard", -1, 36000, [{id: "magic", count: 1}, {id: "human", count: 1}]),
  demigod: new Task("demigod", "Demigod", -1, 39000, [{id: "wizard", count: 1}, {id: "energy", count: 1}, {id: "light", count: 1}]),
  vampire: new Task("vampire", "Vampire", -1, 57000, [{id: "human", count: 1}, {id: "blood", count: 1}]),
  animal: new Task("animal", "Animal", -1, 28000, [{id: "human", count: 1}, {id: "beast", count: 1}]),
  wool: new Task("wool", "Wool", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  meat: new Task("meat", "Meat", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  milk: new Task("milk", "Milk", -1, 44000, [{id: "human", count: 1}, {id: "animal", count: 1}]),
  metal: new Task("metal", "Metal", -1, 5000, [{id: "stone", count: 1}, {id: "fire", count: 1}]),
  tools: new Task("tools", "Tools", -1, 21000, [{id: "human", count: 1}, {id: "metal", count: 1}]),
  weapon: new Task("weapon", "Weapon", -1, 25000, [{id: "tools", count: 1}, {id: "metal", count: 1}]),
  sex: new Task("sex", "Sex", -1, 33000, [{id: "human", count: 2}]),
  love: new Task("love", "Love", -1, 42000, [{id: "human", count: 2}, {id: "time", count: 1}]),
  children: new Task("children", "Children", -1, 83000, [{id: "sex", count: 1}, {id: "love", count: 1}, {id: "time", count: 1}]),
  abuse: new Task("abuse", "Abuse", -1, 85000, [{id: "alcohol", count: 1}, {id: "children", count: 1}]),
  hunter: new Task("hunter", "Hunter", -1, 41000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  ninja: new Task("ninja", "Ninja", -1, 109000, [{id: "hunter", count: 1}, {id: "assassin", count: 1}]),
  ninjutsu: new Task("ninjutsu", "Ninjutsu", -1, 128000, [{id: "ninja", count: 1}, {id: "magic", count: 1}]),
  katana: new Task("katana", "Katana", -1, 45000, [{id: "weapon", count: 1}, {id: "tools", count: 1}]),
  clay: new Task("clay", "Clay", -1, 7000, [{id: "swamp", count: 1}, {id: "sand", count: 1}]),
  golem: new Task("golem", "Golem", -1, 12000, [{id: "life", count: 1}, {id: "clay", count: 1}]),
  warrior: new Task("warrior", "Warrior", -1, 65000, [{id: "hunter", count: 1}, {id: "weapon", count: 1}]),
  hero: new Task("hero", "Hero", -1, 78000, [{id: "warrior", count: 1}, {id: "dragon", count: 1}, {id: "light", count: 1}]),
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
  ship: new Task("ship", "Ship", -1, 62000, [{id: "boat", count: 1}, {id: "wood", count: 1}]),
  fabric: new Task("fabric", "Fabric", -1, 64000, [{id: "wool", count: 1}, {id: "tools", count: 1}]),
  clothes: new Task("clothes", "Clothes", -1, 80000, [{id: "fabric", count: 1}, {id: "human", count: 1}]),
  frigate: new Task("frigate", "Frigate", -1, 125000, [{id: "fabric", count: 1}, {id: "ship", count: 1}]),
  steamship: new Task("steamship", "SteamShip", -1, 92000, [{id: "ship", count: 1}, {id: "engine", count: 1}]),
  wheel: new Task("wheel", "Wheel", -1, 51000, [{id: "tools", count: 1}, {id: "wood", count: 1}]),
  cart: new Task("cart", "Cart", -1, 81000, [{id: "wheel", count: 1}, {id: "wood", count: 1}]),
  locomotive: new Task("locomotive", "Locomotive", -1, 111000, [{id: "cart", count: 1}, {id: "engine", count: 1}]),
  oil: new Task("oil", "Oil", -1, 13000, [{id: "water", count: 1}, {id: "coal", count: 1}]),
  car: new Task("car", "Car", -1, 111000, [{id: "engine", count: 1}, {id: "cart", count: 1}]),
  wing: new Task("wing", "Wing", -1, 12000, [{id: "air", count: 1}, {id: "mechanism", count: 1}]),
  airplane: new Task("airplane", "Airplane", -1, 122000, [{id: "car", count: 1}, {id: "wing", count: 1}]),
  chariot: new Task("chariot", "Chariot", -1, 92000, [{id: "beast", count: 1}, {id: "cart", count: 1}]),
  alcoholic: new Task("alcoholic", "Alcoholic", -1, 20000, [{id: "vodka", count: 1}, {id: "human", count: 1}]),
  grass: new Task("grass", "Grass", -1, 12000, [{id: "moss", count: 1}, {id: "earth", count: 1}]),
  field: new Task("field", "Field", -1, 22000, [{id: "tools", count: 1}, {id: "earth", count: 1}]),
  wheat: new Task("wheat", "Wheat", -1, 31000, [{id: "field", count: 1}, {id: "seeds", count: 1}]),
  flour: new Task("flour", "Flour", -1, 34000, [{id: "wheat", count: 1}, {id: "stone", count: 1}]),
  dough: new Task("dough", "Dough", -1, 35000, [{id: "flour", count: 1}, {id: "water", count: 1}]),
  sugar: new Task("sugar", "Sugar", -1, 23000, [{id: "field", count: 1}, {id: "light", count: 1}]),
  cake: new Task("cake", "Cake", -1, 104000, [{id: "sugar", count: 1}, {id: "egg", count: 1}, {id: "milk", count: 1}, {id: "wheat", count: 1}]),
  bread: new Task("bread", "Bread", -1, 36000, [{id: "dough", count: 1}, {id: "fire", count: 1}]),
  beer: new Task("beer", "Beer", -1, 38000, [{id: "bread", count: 1}, {id: "alcohol", count: 1}]),
  reed: new Task("reed", "Reed", -1, 14000, [{id: "grass", count: 1}, {id: "swamp", count: 1}]),
  paper: new Task("paper", "Paper", -1, 34000, [{id: "reed", count: 1}, {id: "tools", count: 1}]),
  feather: new Task("feather", "Feather", -1, 53000, [{id: "hunter", count: 1}, {id: "bird", count: 1}]),
  book: new Task("book", "Book", -1, 86000, [{id: "feather", count: 1}, {id: "paper", count: 1}]),
  electricity: new Task("electricity", "Electricity", -1, 7000, [{id: "energy", count: 1}, {id: "metal", count: 1}]),
  corpse: new Task("corpse", "Corpse", -1, 81000, [{id: "warrior", count: 1}, {id: "human", count: 1}]),
  zombie: new Task("zombie", "Zombie", -1, 86000, [{id: "corpse", count: 1}, {id: "life", count: 1}]),
  ghoul: new Task("ghoul", "Ghoul", -1, 166000, [{id: "zombie", count: 1}, {id: "corpse", count: 1}]),
  poison: new Task("poison", "Poison", -1, 29000, [{id: "mushroom", count: 1}, {id: "tools", count: 1}]),
  dart: new Task("dart", "Dart", -1, 53000, [{id: "poison", count: 1}, {id: "weapon", count: 1}]),
  assassin: new Task("assassin", "Assassin", -1, 69000, [{id: "dart", count: 1}, {id: "human", count: 1}]),
  glass: new Task("glass", "Glass", -1, 6000, [{id: "sand", count: 1}, {id: "fire", count: 1}]),
  tobacco: new Task("tobacco", "Tobacco", -1, 13000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  weed: new Task("weed", "Weed", -1, 13000, [{id: "grass", count: 1}, {id: "fire", count: 1}]),
  baked: new Task("baked", "Baked", -1, 29000, [{id: "weed", count: 1}, {id: "human", count: 1}]),
  cigarette: new Task("cigarette", "Cigarette", -1, 46000, [{id: "tobacco", count: 1}, {id: "paper", count: 1}]),
  joint: new Task("joint", "Joint", -1, 46000, [{id: "weed", count: 1}, {id: "paper", count: 1}]),
  fertilizer: new Task("fertilizer", "Fertilizer", -1, 39000, [{id: "animal", count: 1}, {id: "grass", count: 1}]),
  shell: new Task("shell", "Shell", -1, 14000, [{id: "stone", count: 1}, {id: "plankton", count: 1}]),
  limestone: new Task("limestone", "Limestone", -1, 17000, [{id: "shell", count: 1}, {id: "stone", count: 1}]),
  saltpeter: new Task("saltpeter", "Saltpeter", -1, 55000, [{id: "fertilizer", count: 1}, {id: "limestone", count: 1}]),
  gunpowder: new Task("gunpowder", "Gunpowder", -1, 65000, [{id: "saltpeter", count: 1}, {id: "sulfur", count: 1}]),
  firearm: new Task("firearm", "Firearm", -1, 89000, [{id: "gunpowder", count: 1}, {id: "weapon", count: 1}]),
  cement: new Task("cement", "Cement", -1, 23000, [{id: "limestone", count: 1}, {id: "clay", count: 1}]),
  snake: new Task("snake", "Snake", -1, 15000, [{id: "worm", count: 1}, {id: "sand", count: 1}]),
  fish: new Task("fish", "Fish", -1, 16000, [{id: "snake", count: 1}, {id: "water", count: 1}]),
  concrete: new Task("concrete", "Concrete", -1, 24000, [{id: "cement", count: 1}, {id: "water", count: 1}]),
  bricks: new Task("bricks", "Bricks", -1, 8000, [{id: "clay", count: 1}, {id: "fire", count: 1}]),
  house: new Task("house", "House", -1, 31000, [{id: "bricks", count: 1}, {id: "concrete", count: 1}]),
  skyscraper: new Task("skyscraper", "Skyscraper", -1, 36000, [{id: "house", count: 1}, {id: "glass", count: 1}]),
  butterfly: new Task("butterfly", "Butterfly", -1, 12000, [{id: "worm", count: 1}, {id: "air", count: 1}]),
  dolphin: new Task("dolphin", "Dolphin", -1, 27000, [{id: "fish", count: 1}, {id: "beast", count: 1}]),
  whale: new Task("whale", "Whale", -1, 13000, [{id: "beast", count: 1}, {id: "water", count: 1}]),
  turtle: new Task("turtle", "Turtle", -1, 13000, [{id: "egg", count: 1}, {id: "sand", count: 1}]),
  crystal: new Task("crystal", "Crystal", -1, 5000, [{id: "light", count: 1}, {id: "stone", count: 1}]),
  torch: new Task("torch", "Torch", -1, 32000, [{id: "fire", count: 1}, {id: "wood", count: 1}]),
  lamp: new Task("lamp", "Lamp", -1, 12000, [{id: "electricity", count: 1}, {id: "glass", count: 1}]),
  mirror: new Task("mirror", "Mirror", -1, 5000, [{id: "light", count: 1}, {id: "stone", count: 1}]),
  ego: new Task("ego", "Ego", -1, 21000, [{id: "mirror", count: 1}, {id: "human", count: 1}]),
  intellect: new Task("intellect", "Intellect", -1, 26000, [{id: "human", count: 1}, {id: "time", count: 1}]),
  science: new Task("science", "Science", -1, 35000, [{id: "intellect", count: 1}, {id: "time", count: 1}]),
  lense: new Task("lense", "Lense", -1, 6000, [{id: "light", count: 1}, {id: "crystal", count: 1}]),
  telescope: new Task("telescope", "Telescope", -1, 10000, [{id: "lense", count: 1}, {id: "mirror", count: 1}]),
  solarpanel: new Task("solarpanel", "Solarpanel", -1, 16000, [{id: "glass", count: 1}, {id: "circuit", count: 1}]),
  beaker: new Task("beaker", "Beaker", -1, 40000, [{id: "glass", count: 1}, {id: "science", count: 1}]),
  circuit: new Task("circuit", "Circuit", -1, 11000, [{id: "metal", count: 1}, {id: "electricity", count: 1}]),
  mechanism: new Task("mechanism", "Mechanism", -1, 11000, [{id: "electricity", count: 1}, {id: "metal", count: 1}]),
  processor: new Task("processor", "Processor", -1, 21000, [{id: "circuit", count: 1}, {id: "mechanism", count: 1}]),
  computer: new Task("computer", "Computer", -1, 32000, [{id: "processor", count: 1}, {id: "lamp", count: 1}]),
  hydrazine: new Task("hydrazine", "Hydrazine", -1, 15000, [{id: "gasoline", count: 1}, {id: "water", count: 1}]),
  rocket: new Task("rocket", "Rocket", -1, 136000, [{id: "hydrazine", count: 1}, {id: "airplane", count: 1}]),
  satellite: new Task("satellite", "Satellite", -1, 191000, [{id: "solarpanel", count: 1}, {id: "telescope", count: 1}, {id: "rocket", count: 1}, {id: "computer", count: 1}]),
  space: new Task("space", "Space", -1, 152000, [{id: "rocket", count: 1}, {id: "human", count: 1}]),
  moon: new Task("moon", "Moon", -1, 219000, [{id: "space", count: 1}, {id: "flag", count: 1}]),
  flag: new Task("flag", "Flag", -1, 68000, [{id: "fabric", count: 1}, {id: "metal", count: 1}]),
  rover: new Task("rover", "Rover", -1, 480000, [{id: "car", count: 1}, {id: "space", count: 1}, {id: "moon", count: 1}]),
  pillage: new Task("pillage", "Pillage", -1, 321000, [{id: "flag", count: 1}, {id: "village", count: 1}, {id: "army", count: 1}]),
  conquer: new Task("conquer", "Conquer", -1, 361000, [{id: "pillage", count: 1}, {id: "blood", count: 1}]),
  blood: new Task("blood", "Blood", -1, 41000, [{id: "human", count: 1}, {id: "weapon", count: 1}]),
  frontier: new Task("frontier", "Frontier", -1, 472000, [{id: "pillage", count: 1}, {id: "space", count: 1}]),
  flint: new Task("flint", "Flint", -1, 8000, [{id: "stone", count: 1}, {id: "sand", count: 1}]),
  time: new Task("time", "Time", -1, 10000, [{id: "sand", count: 1}, {id: "glass", count: 1}]),
  watch: new Task("watch", "Watch", -1, 24000, [{id: "time", count: 1}, {id: "crystal", count: 1}, {id: "circuit", count: 1}]),
  tribe: new Task("tribe", "Tribe", -1, 49000, [{id: "human", count: 3}]),
  village: new Task("village", "Village", -1, 113000, [{id: "warrior", count: 1}, {id: "tribe", count: 1}]),
  colony: new Task("colony", "Colony", -1, 79000, [{id: "tribe", count: 1}, {id: "house", count: 1}]),
  army: new Task("army", "Army", -1, 142000, [{id: "warrior", count: 1}, {id: "hero", count: 1}]),
  king: new Task("king", "King", -1, 226000, [{id: "hero", count: 1}, {id: "royalty", count: 1}]),
  royalty: new Task("royalty", "Royalty", -1, 149000, [{id: "sex", count: 1}, {id: "money", count: 1}]),
  money: new Task("money", "Money", -1, 117000, [{id: "village", count: 1}, {id: "metal", count: 1}]),
  empire: new Task("empire", "Empire", -1, 664000, [{id: "conquer", count: 1}, {id: "colony", count: 1}, {id: "king", count: 1}]),
  drill: new Task("drill", "Drill", -1, 37000, [{id: "electricity", count: 1}, {id: "tools", count: 1}, {id: "mechanism", count: 1}]),
  miner: new Task("miner", "Miner", 1, 75000, [{id: "drill", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}, {id: "energy", count: 1}]),
  smelter: new Task("smelter", "Smelter", 1, 48000, [{id: "mechanism", count: 1}, {id: "fire", count: 1}, {id: "tools", count: 1}, {id: "human", count: 1}]),
  breeder: new Task("breeder", "Breeder", 1, 133000, [{id: "human", count: 1}, {id: "beaker", count: 1}, {id: "sex", count: 1}, {id: "intellect", count: 1}, {id: "tools", count: 1}]),
  action_miner: new Task("action_miner", "Mine Stone", -1, 15000, [{id: "Miner", count: 0}, {id: "earth", count: 10}, {id: "fire", count: 10}, {id: "water", count: 10}], 0, [{id: "action_miner", count: -1}, {id: "stone", count: 10}]),
  action_smelter: new Task("action_smelter", "Smelt Metal", -1, 20000, [{id: "Smelter", count: 0}, {id: "earth", count: 10}, {id: "fire", count: 20}, {id: "water", count: 10}], 0, [{id: "action_smelter", count: -1}, {id: "metal", count: 10}]),
  action_breeder: new Task("action_breeder", "Breed Human", -1, 8000, [{id: "Breeder", count: 0}, {id: "earth", count: 5}, {id: "water", count: 4}, {id: "fire", count: 3}, {id: "air", count: 2}, {id: "light", count: 2}], 0, [{id: "action_breeder", count: -1}, {id: "human", count: 1}]),
};

// Initial Tasks
let initial = [tasks.things];


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
    let inventory = $(this.refs.inventory);
    inventory.animate({
      top: !show ? "-100vh" : 0
    });
  }

  render() {
    return (<div>
      <div className="card-container">
        {this.state.todo.map((t, i) => <Card key={t.id + "_" + t.times} ref={"task_" + t.id + "_" + t.times} task={t} onTaskStart={this.onTaskStart} onTaskFinish={this.onTaskFinish}/>)}
      </div>
      <div className="inventory" ref="inventory">
        <div className="inventory-content">
          {!Object.keys(this.state.completed).length && <h2>Nothing Here Yet!</h2>}
          {Object.keys(this.state.completed).map(k => (
            this.state.completed[k] > -1 && <span className="inventory-item" key={k}>
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

ReactDOM.render(<Controls/>, document.getElementById("controls"));