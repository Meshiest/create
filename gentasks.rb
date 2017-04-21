$things = {
  "Dust" => ["Earth", "Air"],
  "Alcohol" => ["Fire", "Water"],
  "Steam" => ["Air", "Water"],
  "Lava" => ["Earth", "Fire"],
  "Swamp" => ["Earth", "Water"],
  "Energy" => ["Fire", "Air"],
  "Life" => ["Swamp", "Energy", "Light"],
  "Bacteria" => ["Life", "Swamp", "Light"],
  "Weeds" => ["Life", "Water", "Light"],
  "Storm" => ["Energy", "Air"],
  "Moss" => ["Weeds", "Swamp", "Light"],
  "Fern" => ["Moss", "Swamp", "Light"],
  "Worm" => ["Bacteria", "Swamp"],
  "Sulfur" => ["Bacteria", "Swamp"],
  "Beetle" => ["Worm", "Earth"],
  "Stone" => ["Lava", "Water"],
  "Sand" => ["Stone", "Water"],
  "Scorpion" => ["Beetle", "Sand"],
  "Egg" => ["Life", "Stone"],
  "Dinosaur" => ["Egg", "Earth"],
  "Dragon" => ["Dinosaur", "Air", "Fire", "Light"],
  "Lizard" => ["Egg", "Swamp"],
  "Bird" => ["Lizard", "Air", "Light"],
  "Vodka" => ["Water", "Alcohol"],
  "Plankton" => ["Bacteria", "Water", "Light"],
  "Phoenix" => ["Bird", "Fire", "Light"],
  "Thunderbird" => ["Bird", "Storm"],
  "Beast" => ["Lizard", "Earth"],
  "Human" => ["Beast", "Life"],
  "Magic" => ["Energy", "Light", "Human"],
  "Sorcery" => ["Magic", "Stone"],
  "Necromancer" => ["Skull", "Wizard"],
  "Wizard" => ["Magic", "Human"],
  "Demigod" => ["Wizard", "Energy", "Light"],
  "Vampire" => ["Human", "Blood"],
  "Spice" => ["Fire", "Food"],
  "Garlic" => ["Spice", "Fruit"],
  "Food" => ["Meat", "Tools"],
  "Slayer" => ["Vampire", "Mirror", "Garlic", "Wood"],
  "Animal" => ["Human", "Beast"],
  "Saddle" => ["Leather", "Chair"],
  "Horse" => ["Animal", "Saddle"],
  "Horseshoe" => ["Metal", "Horse"],
  "Camel" => ["Sand", "Horse"],
  "Centaur" => ["Horse", "Human"],
  "Axe" => ["Weapon", "Tools"],
  "Unicorn" => ["Horse", "Rainbow", "Candy"],
  "Candy" => ["Sugar", "Sugar"],
  "Narwhal" => ["Reddit", "Memes"],
  "Origami" => ["Bird", "Paper"],
  "Campfire" => ["Fire", "Wood"],
  "Wool" => ["Human", "Animal"],
  "Meat" => ["Human", "Animal"],
  "Milk" => ["Human", "Animal"],
  "Mermaid" => ["Human", "Fish"],
  "Microscope" => ["Telescope", "Bacteria", "Lense"],
  "Hay" => ["Grass", "Tools"],
  "Prism" => ["Glass", "Rainbow"],
  "Printer" => ["Paper", "Computer"],
  "Creditcard" => ["Plastic", "Money"],
  "Vacuum" => ["Space", "Mechanism"],
  "Dyson" => ["Vacuum", "Tools"],
  "Roomba" => ["Robot", "Vacuum"],
  "Cheese" => ["Milk", "Bacteria"],
  "Stew" => ["Mushroom", "Water", "Fire", "Bird"],
  "Coffin" => ["Wood", "Corpse"],
  "Ash" => ["Corpse", "Fire"],
  "Metal" => ["Stone", "Fire"],
  "Tools" => ["Human", "Metal"],
  "Weapon" => ["Tools", "Metal"],
  "Sex" => ["Human", "Human"],
  "Love" => ["Human", "Human", "Time"],
  "Children" => ["Sex", "Love", "Time"],
  "Abuse" => ["Alcoholic", "Children"],
  "Hunter" => ["Human", "Spear"],
  "Ninja" => ["Hunter", "Assassin"],
  "Ninjutsu" => ["Ninja", "Magic"],
  "Sword" => ["Weapon", "Metal"],
  "Excalibur" => ["Sword", "Hero", "Stone"],
  "Katana" => ["Sword", "Blood"],
  "Clay" => ["Swamp", "Sand"],
  "Golem" => ["Life", "Clay"],
  "Warrior" => ["Human", "Weapon"],
  "Armor" => ["Tools", "Metal", "Leather"],
  "Knight" => ["Armor", "Warrior"],
  "Hero" => ["Knight", "Dragon"],
  "Mushroom" => ["Earth", "Weeds"],
  "Werewolf" => ["Beast", "Vampire"],
  "Seeds" => ["Sand", "Life"],
  "Tree" => ["Seeds", "Earth"],
  "Ceramics" => ["Human", "Clay"],
  "Robot" => ["Computer", "Love"],
  "Drone" => ["Robot", "Wing"],
  "Terminator" => ["Robot", "Weapon"],
  "Letter" => ["Pen", "Paper"],
  "Mailman" => ["Letter", "Human", "Porn"],
  "Email" => ["Internet", "Letter"],
  "Gmail" => ["Email", "Google"],
  "Cyborg" => ["Human", "Robot"],
  "Hut" => ["Stone", "Human"],
  "Treant" => ["Tree", "Life"],
  "Ghost" => ["Corpse", "Magic"],
  "Curse" => ["Ghost", "Human"],
  "Coal" => ["Tree", "Fire"],
  "Boiler" => ["Steam", "Metal"],
  "SteamEngine" => ["Boiler", "Coal"],
  "Engine" => ["Gasoline", "SteamEngine"],
  "Gasoline" => ["Oil", "Fire"],
  "Wood" => ["Tree", "Tools"],
  "Boat" => ["Wood", "Water"],
  "Anchor" => ["Metal", "Boat"],
  "Ship" => ["Boat", "Wood", "Anchor"],
  "Fabric" => ["Wool", "Tools"],
  "Clothes" => ["Fabric", "Human"],
  "Hat" => ["Clothes", "Skull"],
  "Fedora" => ["Hat", "Ego"],
  "Shrek" => ["Love", "Life", "Swamp"],
  "Frigate" => ["Fabric", "Ship"],
  "SteamShip" => ["Ship", "Engine"],
  "Wheel" => ["Tools", "Wood"],
  "Cart" => ["Wheel", "Wood"],
  "Locomotive" => ["Cart", "Engine"],
  "Oil" => ["Water", "Coal"],
  "Plastic" => ["Oil", "Tools"],
  "Lego" => ["Plastic", "Bricks"],
  "Castle" => ["Building", "Wall", "Bricks", "King"],
  "Ruins" => ["Bricks", "Time", "Wall"],
  "RV" => ["Car", "House"],
  "Safe" => ["Reddit", "Money", "Metal"],
  "Chair" => ["Wood", "Tools"],
  "Car" => ["Engine", "Cart", "Glass", "Lamp", "Chair"],
  "Wing" => ["Air", "Mechanism"],
  "Airplane" => ["Car", "Wing", "Circuit"],
  "Airport" => ["Airplane", "Building"],
  "Student" => ["Human", "Curiosity"],
  "School" => ["Building", "Teacher", "Student", "Book"],
  "Leather" => ["Fabric", "Animal", "Light"],
  "Chariot" => ["Beast", "Cart"],
  "Alcoholic" => ["Vodka", "Human"],
  "Grass" => ["Moss", "Earth", "Light"],
  "Field" => ["Tools", "Earth"],
  "Wheat" => ["Field", "Seeds", "Light", "Water"],
  "Glasses" => ["Metal", "Glass"],
  "Flour" => ["Wheat", "Stone"],
  "Dough" => ["Flour", "Water"],
  "Sugar" => ["Field", "Light"],
  "Cake" => ["Sugar", "Egg", "Milk", "Flour"],
  "Bread" => ["Dough", "Fire", "Air"],
  "Beer" => ["Bread", "Alcohol"],
  "Grape" => ["Seeds", "Fruit", "Light"],
  "Juice" => ["Fruit", "Water"],
  "Apple" => ["Fruit", "Sugar"],
  "Mac" => ["Money", "Apple", "Computer"],
  "OSX" => ["Mac", "Unix"],
  "iPhone" => ["Money", "Apple", "Computer"],
  "TitanX" => ["Money", "Life", "Computer", "Energy", "Magic"],
  "TitanXP" => ["TitanX", "Money"],
  "Lasso" => ["Horse", "Rope"],
  "Cowboy" => ["Hat", "Human", "Lasso"],
  "Dragonfruit" => ["Fruit", "Dragon"],
  "Salad" => ["Fruit", "Grass"],
  "Fruit" => ["Tree", "Earth", "Water"],
  "Wine" => ["Grape", "Time"],
  "Reed" => ["Grass", "Swamp"],
  "Paper" => ["Reed", "Tools"],
  "Feather" => ["Hunter", "Bird"],
  "Book" => ["Leather", "Paper"],
  "Electricity" => ["Energy", "Metal", "Light"],
  "Corpse" => ["Warrior", "Human"],
  "Skull" => ["Warrior", "Human"],
  "Pet" => ["Love", "Animal"],
  "Dumb" => ["Air", "Skull"],
  "Edgar" => ["Dumb", "Pet", "Beast"],
  "Zombie" => ["Corpse", "Life"],
  "Frankenstein" => ["Zombie", "Electricity"],
  "Fossil" => ["Dinosaur", "Time"],
  "Ghoul" => ["Zombie", "Corpse"],
  "Poison" => ["Mushroom", "Tools"],
  "Dart" => ["Poison", "Weapon"],
  "Assassin" => ["Dart", "Human"],
  "Glass" => ["Sand", "Fire", "Light"],
  "Tobacco" => ["Grass", "Fire"],
  "Pipe" => ["Tobacco", "Wood"],
  "Piranha" => ["Fish", "Blood"],
  "Cancer" => ["Tobacco", "Human"],
  "Weed" => ["Grass", "Fire"],
  "Baked" => ["Weed", "Human"],
  "Cigarette" => ["Tobacco", "Paper"],
  "Cigar" => ["Cigarette", "Intellect"],
  "Joint" => ["Weed", "Paper"],
  "Fertilizer" => ["Animal", "Grass"],
  "Shell" => ["Stone", "Plankton"],
  "Limestone" => ["Shell", "Stone"],
  "Saltpeter" => ["Fertilizer", "Limestone"],
  "Gunpowder" => ["Saltpeter", "Sulfur"],
  "Bomb" => ["Gunpowder", "Metal"],
  "Grenade" => ["Bomb", "Weapon"],
  "Note7" => ["Bomb", "Computer"],
  "Nuke" => ["Energy", "Bomb", "Airplane"],
  "Firearm" => ["Gunpowder", "Weapon"],
  "Cement" => ["Limestone", "Clay"],
  "Snake" => ["Worm", "Sand"],
  "Fish" => ["Snake", "Water"],
  "Squid" => ["Fish", "Snake"],
  "Concrete" => ["Cement", "Water"],
  "Bricks" => ["Clay", "Fire"],
  "Wall" => ["Bricks", "Bricks"],
  "Ivy" => ["Weed", "Wall"],
  "Fence" => ["Wood", "Wall"],
  "Firewall" => ["Internet", "Wall"],
  "Prison" => ["Wall", "Metal", "Building"],
  "Bar" => ["Alcoholic", "Vodka", "Beer", "Alcohol", "Wine", "Building"],
  "Building" => ["Bricks", "Concrete", "Hut", "Glass"],
  "Family" => ["Love", "Human", "Human", "Children"],
  "Ring" => ["Love", "Metal", "Crystal"],
  "Wedding" => ["Human", "Human", "Ring"],
  "Divorce" => ["Wedding", "Car", "Pet", "Couch"],
  "Couch" => ["Chair", "Fabric"],
  "House" => ["Love", "Building", "Family"],
  "Skyscraper" => ["Building", "Glass"],
  "Butterfly" => ["Worm", "Air"],
  "Dolphin" => ["Fish", "Beast"],
  "Whale" => ["Beast", "Water"],
  "Turtle" => ["Egg", "Sand"],
  "Crystal" => ["Light", "Stone"],
  "Torch" => ["Fire", "Wood"],
  "Lamp" => ["Electricity", "Glass"],
  "Lavalamp" => ["Lava", "Lamp"],
  "Cabin" => ["Wood", "House"],
  "Mirror" => ["Light", "Stone"],
  "Ego" => ["Mirror", "Human"],
  "Intellect" => ["Human", "Time"],
  "Science" => ["Intellect", "Time"],
  "Scientist" => ["Human", "Science"],
  "Lense" => ["Light", "Crystal"],
  "Telescope" => ["Lense", "Mirror"],
  "Solarpanel" => ["Glass", "Circuit"],
  "Beaker" => ["Glass", "Science"],
  "Circuit" => ["Metal", "Electricity"],
  "Mechanism" => ["Electricity", "Metal"],
  "Processor" => ["Circuit", "Mechanism"],
  "Computer" => ["Processor", "Lamp"],
  "Internet" => ["Science", "Computer", "Computer"],
  "Camera" => ["Mechanism", "Lense", "Lamp"],
  "Video" => ["Mechanism", "Camera", "Battery"],
  "Porn" => ["Sex", "Video"],
  "Hentai" => ["Porn", "Anime"],
  "Pornhub" => ["Porn", "Internet"],
  "Boredom" => ["Human", "Time", "Time", "Time", "Time", "Time"],
  "Memes" => ["Internet", "Cancer"],
  "FiberOptics" => ["Light", "Circuit", "Glass", "Internet"],
  "Youtube" => ["Video", "Time", "Internet"],
  "Reddit" => ["Love", "Time", "Internet"],
  "Curiosity" => ["Time", "Time", "Time", "Human"],
  "Google" => ["Curiosity", "Internet"],
  "Bing" => ["Google", "Cancer"],
  "Hydrazine" => ["Gasoline", "Water"],
  "Rocket" => ["Hydrazine", "Airplane"],
  "Satellite" => ["Solarpanel", "Telescope", "Rocket", "Computer"],
  "Space" => ["Rocket", "Human"],
  "Star" => ["Space", "Light"],
  "Sun" => ["Star", "Earth"],
  "Planet" => ["Space", "Earth"],
  "Galaxy" => ["Star", "Star"],
  "Milkyway" => ["Galaxy", "Milk"],
  "Cluster" => ["Galaxy", "Galaxy"],
  "Supercluster" => ["Cluster", "Cluster"],
  "Solarsystem" => ["Star", "Planet", "Planet"],
  "Asteroid" => ["Space", "Stone"],
  "Meteor" => ["Asteroid", "Planet"],
  "Alien" => ["Space", "Life"],
  "Moon" => ["Space", "Flag"],
  "Flag" => ["Fabric", "Metal"],
  "Rover" => ["Car", "Space", "Moon", "Battery"],
  "Mars" => ["Curiosity", "Rover"],
  "Pillage" => ["Flag", "Village", "Army"],
  "Conquer" => ["Pillage", "Blood"],
  "Blood" => ["Human", "Weapon"],
  "Frontier" => ["Pillage", "Space"],
  "Flint" => ["Stone", "Sand"],
  "Spear" => ["Flint", "Wood"],
  "Time" => ["Sand", "Glass"],
  "Anime" => ["Time", "Video", "Paper"],
  "Monk" => ["Human", "Intellect", "Time"],
  "Watch" => ["Time", "Crystal", "Circuit", "Battery"],
  "Tribe" => ["Human", "Human", "Human"],
  "Village" => ["Warrior", "Hunter", "Tribe"],
  "Colony" => ["Tribe", "House"],
  "Army" => ["Warrior", "Hero"],
  "King" => ["Hero", "Royalty"],
  "Royalty" => ["Sex", "Money"],
  "Money" => ["Village", "Metal"],
  "Empire" => ["Conquer", "Colony", "King"],
  "Drill" => ["Electricity", "Tools", "Mechanism"],
  "Acorn" => ["Tree", "Seeds"],
  "Hair" => ["Human", "Time", "String"],
  "String" => ["Fabric", "Tools"],
  "City" => ["Building", "Building", "School", "Skyscraper", "Car", "House"],
  "Bed" => ["Wool", "Fabric", "Wood"],
  "Sleep" => ["Bed", "Human"],
  "Theft" => ["Human", "Money"],
  "Depression" => ["Family", "Corpse"],
  "Bandage" => ["Fabric", "Blood"],
  "Nurse" => ["Human", "Love", "Bandage"],
  "Doctor" => ["Human", "Science", "Bandage"],
  "Scalpel" => ["Doctor", "Tools"],
  "Battery" => ["Energy", "Electricity", "Metal"],
  "Cereal" => ["Wheat", "Milk"],
  "Rope" => ["String", "Tools"],
  "Chainsaw" => ["Electricity", "Axe", "Mechanism"],
  "Forest" => ["Tree", "Tree", "Tree"],
  "Witch" => ["Forest", "Magic"],
  "Fortune" => ["Witch", "Crystal"],
  "Cauldron" => ["Witch", "Metal"],
  "Rainbow" => ["Lense", "Light", "Steam"],
  "Crayon" => ["Rainbow", "Pen"],
  "Mold" => ["Bread", "Time"],
  "Penicillin" => ["Doctor", "Mold"],
  "Lust" => ["Sex"] * 7,
  "Gluttony" => ["Meat"] * 7,
  "Greed" => ["Money"] * 7,
  "Sloth" => ["Sleep"] * 7,
  "Wrath" => ["Vampire"] * 7,
  "Envy" => ["Theft"] * 7,
  "Pride" => ["Ego"] * 7,
  "Chastity" => ["Student"] * 7,
  "Abstinence" => ["Children"] * 7,
  "Liberality" => ["Nurse"] * 7,
  "Diligence" => ["Doctor"] * 7,
  "Patience" => ["Monk"] * 7,
  "Kindness" => ["Nurse"] * 7,
  "Humility" => ["Knight"] * 7,
  "Puff" => ["Sugar", "Spice"],
  "SGDC" => ["Memes", "Programming", "Love", "Spice"],
  "Jake" => ["Ego", "Love", "Hero", "Hair"],
  "James" => ["Computer", "Memes", "Hair", "Glasses", "Depression", "Spice"],
  "David" => ["Memes", "Teacher", "Science", "Computer"],
  "Noah" => ["Sleep", "Depression", "Student", "Sex"],
  "Isaac" => ["Reddit", "Programming", "Anime", "Hair"],
  "Jared" => ["Student", "Programming", "Java", "Depression"],
  "Thomas" => ["Abuse", "Memes", "Lego", "Depression"],
  "Ink" => ["Squid", "Weapon"],
  "Pen" => ["Feather", "Ink"],
  "Penguin" => ["Feather", "Fish"],
  "Programming" => ["Computer", "Science", "Time"],
  "Linux" => ["Penguin", "Programming"],
  "Unix" => ["Computer", "Programming"],
  "Epoch" => ["Unix", "Time"],
  "Github" => ["Internet", "Love", "Programming"],
  "Bash" => ["Linux", "Shell"],
  "ZSH" => ["Linux", "Shell", "Love"],
  "C" => ["Programming", "Time", "Time"],
  "CPlusPlus" => ["C", "Intellect"],
  "Go" => ["C", "Time"],
  "Java" => ["Programming", "Ego"],
  "Perl" => ["Programming", "Cancer"],
  "Ruby" => ["Programming", "Love"],
  "Javascript" => ["Programming", "Cancer", "Internet"],
  "rProgramming" => ["Reddit", "Programming"],
  "rUnixPorn" => ["Reddit", "Unix", "Porn"], 
  "rPics" => ["Reddit", "Camera"],
  "rGonewild" => ["Reddit", "Porn"],
  "rAskreddit" => ["Reddit", "Curiosity"],
  "rScience" => ["Reddit", "Science"],
  "rAnime" => ["Reddit", "Anime"],
  "Flute" => ["Human", "Drill", "Wood"],
  "Guitar" => ["Human", "Wood", "String"],
}

# Breaks a thing down into components
def what_is thing
  $things[thing] && $things[thing].map{|t| what_is(t)}.flatten || [thing]
end

# Takes an array and breaks the things down into components
def what_are things
  things.map{|k| what_is k}.flatten
end

$upgrades = {
  "Miner" => {
    cost: ["Drill", "Tools", "Human", "Energy"],
    action: "Mine Stone",
    uses: -1,
    speed: 750,
    input: what_is("Stone") * 10,
    output: ["Stone"] * 10,
  },
  "Lumberjack" => {
    cost: ["Axe", "Tools", "Human", "Wood"],
    action: "Chop Wood",
    uses: -1,
    speed: 750,
    input: what_is("Wood") * 5,
    output: ["Wood"] * 5,
  },
  "Fisherman" => {
    cost: ["Fish", "Human", "Spear"],
    action: "Catch Fish",
    uses: -1,
    speed: 750,
    input: what_is("Fish") * 2,
    output: ["Fish"] * 2,
  },
  "Smelter" => {
    cost: ["Mechanism", "Fire", "Tools", "Human"],
    action: "Smelt Materials",
    uses: -1,
    speed: 750,
    input: what_is("Metal") * 6 + what_is("Glass") * 3,
    output: ["Metal"] * 6 + ["Glass"] * 3,
  },
  "Breeder" => {
    cost: ["Human", "Beaker", "Sex", "Intellect", "Tools"],
    action: "Breed Human",
    uses: -1,
    speed: 750,
    input: what_is("Human"),
    output: ["Human"],
  },
  "Chef" => {
    cost: ["Human", "Tools", "Food"],
    action: "Cook Food",
    uses: -1,
    speed: 750,
    input: what_is("Food") * 2,
    output: ["Food"] * 2,
  },
  "Teacher" => {
    cost: ["Student", "Book", "Time", "Intellect"],
    action: "Teach Student",
    uses: -1,
    speed: 750,
    input: what_are(["Student", "Intellect"]),
    output: ["Student", "Intellect"],
  },
  "God" => {
    cost: ["Demigod", "Demigod", "Life"],
    action: "Make Life",
    uses: -1,
    speed: 750,
    input: what_is("Life") * 5,
    output: ["Life"] * 5,
  },
  "Cloner" => {
    cost: ["Breeder", "Sex", "Scientist", "Beaker"],
    action: "Clone Human",
    uses: -1,
    speed: 750,
    input: what_is("Human") * 5,
    output: ["Human"] * 5,
  },
  "Lover" => {
    cost: ["Human", "Love", "Time", "Mirror"],
    action: "Love Unconditionally",
    uses: -1,
    speed: 750,
    input: what_is("Love") * 2,
    output: ["Love"] * 2,
  },
  "Farmer" => {
    cost: ["Tools", "Field", "Animal", "Seeds", "Fertilizer"],
    action: "Farm Plants",
    uses: -1,
    speed: 750,
    input:  what_is("Seeds") + what_are(["Grass", "Tree"]) * 3 + what_is("Animal") * 2,
    output: ["Seeds"] + ["Grass", "Tree"] * 3 + ["Animal"] * 2,
  },
  "Seamstress" => {
    cost: ["Human", "Tools", "Fabric", "Wool", "String"],
    action: "Sew Fabric",
    uses: -1,
    speed: 750,
    input:  what_are(["Fabric", "String"]) * 2,
    output: ["Fabric", "String"] * 2,
  },
  "Timekeeper" => {
    cost: ["Magic", "Wizard", "Time", "Sand", "Blood"],
    action: "Rewind Time",
    uses: -1,
    speed: 1200,
    input: what_is("Time") * 5,
    output: ["Time"] * 5,
  },
  "Smither" => {
    cost: ["Mechanism", "Metal", "Village", "Tools", "Human"],
    action: "Smith Tools",
    uses: -1,
    speed: 750,
    input: what_are(["Tools", "Weapon"]) * 3,
    output: ["Tools", "Weapon"] * 3,
  },
  "Provider" => {
    cost: ["Internet", "Skyscraper", "FiberOptics"],
    action: "Provide Internet",
    uses: -1,
    speed: 750,
    input: what_is("Internet"),
    output: ["Internet"],
  },
  "Generator" => {
    cost: ["Energy", "Mechanism", "Solarpanel", "Science", "Battery", "Electricity"],
    action: "Generate Electricity",
    uses: -1,
    speed: 750,
    input: what_is("Electricity") * 3 + what_is("Energy"),
    output: ["Electricity"] * 3 + ["Energy"],
  },
  "Builder" => {
    cost: ["Mechanism", "Building", "Cement", "Tools", "Human"],
    action: "Build Buildings",
    uses: -1,
    speed: 750,
    input: what_is("Building") * 2,
    output: ["Building"] * 2,
  },
  "Voyager" => {
    cost: ["Rocket", "Space", "Human"],
    action: "Explore Space",
    uses: -1,
    speed: 750,
    input: what_is("Space") * 2,
    output: ["Space"] * 2,
  },
  "Researcher" => {
    cost: ["Scientist", "Book", "Curiosity", "Tools", "Beaker", "Science"],
    action: "Research Science",
    uses: -1,
    speed: 750,
    input: what_is("Science") * 5,
    output: ["Science"] * 5,
  },
  "Trainer" => {
    cost: ["Teacher", "Warrior", "Tools", "Human"],
    action: "Train Warriors",
    uses: -1,
    speed: 750,
    input: what_is("Warrior") * 2,
    output: ["Warrior"] * 2,
  },
  "Engineer" => {
    cost: ["Scientist", "Tools", "Mechanism", "Circuit"],
    action: "Engineer Electronics",
    uses: -1,
    speed: 750,
    input: what_are(["Mechanism", "Circuit"]) * 2,
    output: ["Mechanism", "Circuit"] * 2,
  },
  "Writer" => {
    cost: ["Human", "Tools", "Book", "Paper", "Pen"],
    action: "Write Books",
    uses: -1,
    speed: 1000,
    input: what_are(["Book"]) * 5,
    output: ["Book"] * 5,
  },
  "Banker" => {
    cost: ["Human", "Theft", "Money", "Time"],
    action: "Make Money",
    uses: -1,
    speed: 750,
    input: what_are(["Money"]) * 3,
    output: ["Money"] * 3,
  },
  "Programmer" => {
    cost: ["Programming", "Human", "Ego", "Computer", "Intellect"],
    action: "Write Code",
    uses: -1,
    speed: 750,
    input: what_are(["Programming"]) * 3,
    output: ["Programming"] * 3,
  },
  "Redditor" => {
    cost: ["Human", "Boredom", "Time", "Reddit"],
    action: "Read Reddit",
    uses: -1,
    speed: 1000,
    input: what_are(["Reddit"]) * 3,
    output: ["Reddit"] * 3,
  },
  "Camgirl" => {
    cost: ["Human", "Sex", "Video", "Porn", "Internet"],
    action: "Make Porn",
    uses: -1,
    speed: 750,
    input: what_are(["Porn"]),
    output: ["Porn"],
  },
}

# "Creation Name" => {
#   cost: ["Ingredients", "Like", "Things"],
#   action: "Action Name",
#   uses: -1, # -1 for unlimited uses (but one time craft), > 1 for limited uses and unlimited crafts
#   speed: 500, # Speed * Raw Ingredients = Duration
#   input: ["Ingredient", "Ingredient"], # or what_is("Thing") * n
#   output: ["Ingredient", "Ingredient"],
# },

# Lazy Function
def stringify things
  things.uniq.map { |t|
    "{id: \"#{t.downcase}\", count: #{things.count(t)}}"
  }.join(", ")
end



$lengthCache = {}
# Calculates how many steps are in this thing
def how_long thing
  $lengthCache[thing] ||= $things[thing] && (1 + $things[thing].map{|t|how_long(t)}.inject(&:+)) || 0
end

# If a thing is used in a recipe
def is_used? thing
  $things.values.flatten.include? thing
end

# Add all the upgrade roots as things
$upgrades.each { |k, v|
  $things[k] = v[:cost]
}

everything = what_are($things.keys)

# The first task must be the starting task
tasks = ["  things: new Task(\"things\", \"Create Things\", 1, 5000, [{id: \"__start\", count: 1}], 0, [#{stringify what_are $things.keys}]),"]

# Create all the thing tasks
tasks += $things.map { |k, v|
  upgrade = $upgrades[k] ? "{id: \"upgrade_#{k.downcase}\", count: -1}, " : ""
  amount = is_used?(k) ? -1 : 1
  "  #{k.downcase}: new Task(\"#{k.downcase}\", \"#{k}\", #{$upgrades[k] ? 1 : amount}, #{1000 + what_is(k).length * 1000}, [#{upgrade}#{stringify v}]),"
}

# Create all the upgrade tasks
tasks += $upgrades.map { |k, v|
  speed = what_are(v[:input]).length * v[:speed]
  "  upgrade_#{k.downcase}: new Task(\"upgrade_#{k.downcase}\", \"#{v[:action]}\", #{$upgrades[k][:uses] || -1}, #{speed}, [{id: \"#{k.downcase}\", count: 0}, #{stringify v[:input]}], 0, [{id: \"upgrade_#{k.downcase}\", count: -1}, #{stringify v[:output]}]),"
}

# Join the tasks
tasks = tasks.join("\n")

# Print the code
puts """// All available tasks
let tasks = {
#{tasks}
};

// Things to hide from the menu
let hidden = {
  \"things\": 1,
#{$upgrades.keys.map{|a| "  \"upgrade_#{a.downcase}\": 1,"}.join("\n")}
};

// Initial Tasks
let initial = [tasks.things];

let scoreValues = {
#{$things.keys.select{|t|!is_used? t}.sort{|a,b|how_long(a)-how_long(b)}.map{|a|"  #{a.downcase}: #{how_long(a)},"}.join("\n")} 
};

/* -- Things --

  Raw Counts:
#{everything.uniq.map{|thing| "    #{thing.rjust(5)}: #{everything.count(thing)}"}.join("\n")}

  Total Tasks: #{$things.length}

  Largest Tasks:
#{$things.keys.sort{|a,b|how_long(b)-how_long(a)}[0..3].map{|a|"#{a.rjust(15)} (#{what_is(a).length} raw, #{how_long(a)} steps)"}.join("\n")}

  Shortest Ends:
#{$things.keys.select{|t|!is_used? t}.sort{|a,b|how_long(a)-how_long(b)}[0..3].map{|a|"#{a.rjust(15)} (#{what_is(a).length} raw, #{how_long(a)} steps)"}.join("\n")}
 */
"""