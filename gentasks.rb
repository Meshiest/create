$things = {
  "Lava" => ["Earth", "Fire"],
  "Swamp" => ["Earth", "Water"],
  "Alcohol" => ["Fire", "Water"],
  "Energy" => ["Fire", "Air"],
  "Steam" => ["Air", "Water"],
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
  "Wizard" => ["Magic", "Human"],
  "Demigod" => ["Wizard", "Energy", "Light"],
  "Vampire" => ["Human", "Blood"],
  "Animal" => ["Human", "Beast"],
  "Wool" => ["Human", "Animal"],
  "Meat" => ["Human", "Animal"],
  "Milk" => ["Human", "Animal"],
  "Metal" => ["Stone", "Fire"],
  "Tools" => ["Human", "Metal"],
  "Weapon" => ["Tools", "Metal"],
  "Sex" => ["Human", "Human"],
  "Love" => ["Human", "Human", "Time"],
  "Children" => ["Sex", "Love", "Time"],
  "Abuse" => ["Alcohol", "Children"],
  "Hunter" => ["Human", "Weapon"],
  "Ninja" => ["Hunter", "Assassin"],
  "Ninjutsu" => ["Ninja", "Magic"],
  "Katana" => ["Weapon", "Tools"],
  "Clay" => ["Swamp", "Sand"],
  "Golem" => ["Life", "Clay"],
  "Warrior" => ["Hunter", "Weapon"],
  "Hero" => ["Warrior", "Dragon", "Light"],
  "Mushroom" => ["Earth", "Weeds"],
  "Werewolf" => ["Beast", "Vampire"],
  "Seeds" => ["Sand", "Life"],
  "Tree" => ["Seeds", "Earth"],
  "Ceramics" => ["Human", "Clay"],
  "Hut" => ["Stone", "Human"],
  "Treant" => ["Tree", "Life"],
  "Ghost" => ["Treant", "Fire"],
  "Coal" => ["Tree", "Fire"],
  "Boiler" => ["Steam", "Metal"],
  "SteamEngine" => ["Boiler", "Coal"],
  "Engine" => ["Gasoline", "SteamEngine"],
  "Gasoline" => ["Oil", "Fire"],
  "Wood" => ["Tree", "Tools"],
  "Boat" => ["Wood", "Water"],
  "Ship" => ["Boat", "Wood"],
  "Fabric" => ["Wool", "Tools"],
  "Clothes" => ["Fabric", "Human"],
  "Frigate" => ["Fabric", "Ship"],
  "SteamShip" => ["Ship", "Engine"],
  "Wheel" => ["Tools", "Wood"],
  "Cart" => ["Wheel", "Wood"],
  "Locomotive" => ["Cart", "Engine"],
  "Oil" => ["Water", "Coal"],
  "Car" => ["Engine", "Cart"],
  "Wing" => ["Air", "Mechanism"],
  "Airplane" => ["Car", "Wing"],
  "Chariot" => ["Beast", "Cart"],
  "Alcoholic" => ["Vodka", "Human"],
  "Grass" => ["Moss", "Earth"],
  "Field" => ["Tools", "Earth"],
  "Wheat" => ["Field", "Seeds"],
  "Flour" => ["Wheat", "Stone"],
  "Dough" => ["Flour", "Water"],
  "Sugar" => ["Field", "Light"],
  "Cake" => ["Sugar", "Egg", "Milk", "Wheat"],
  "Bread" => ["Dough", "Fire"],
  "Beer" => ["Bread", "Alcohol"],
  "Reed" => ["Grass", "Swamp"],
  "Paper" => ["Reed", "Tools"],
  "Feather" => ["Hunter", "Bird"],
  "Book" => ["Feather", "Paper"],
  "Electricity" => ["Energy", "Metal"],
  "Corpse" => ["Warrior", "Human"],
  "Zombie" => ["Corpse", "Life"],
  "Ghoul" => ["Zombie", "Corpse"],
  "Poison" => ["Mushroom", "Tools"],
  "Dart" => ["Poison", "Weapon"],
  "Assassin" => ["Dart", "Human"],
  "Glass" => ["Sand", "Fire"],
  "Tobacco" => ["Grass", "Fire"],
  "Weed" => ["Grass", "Fire"],
  "Baked" => ["Weed", "Human"],
  "Cigarette" => ["Tobacco", "Paper"],
  "Joint" => ["Weed", "Paper"],
  "Fertilizer" => ["Animal", "Grass"],
  "Shell" => ["Stone", "Plankton"],
  "Limestone" => ["Shell", "Stone"],
  "Saltpeter" => ["Fertilizer", "Limestone"],
  "Gunpowder" => ["Saltpeter", "Sulfur"],
  "Firearm" => ["Gunpowder", "Weapon"],
  "Cement" => ["Limestone", "Clay"],
  "Snake" => ["Worm", "Sand"],
  "Fish" => ["Snake", "Water"],
  "Concrete" => ["Cement", "Water"],
  "Bricks" => ["Clay", "Fire"],
  "House" => ["Bricks", "Concrete"],
  "Skyscraper" => ["House", "Glass"],
  "Butterfly" => ["Worm", "Air"],
  "Dolphin" => ["Fish", "Beast"],
  "Whale" => ["Beast", "Water"],
  "Turtle" => ["Egg", "Sand"],
  "Crystal" => ["Light", "Stone"],
  "Torch" => ["Fire", "Wood"],
  "Lamp" => ["Electricity", "Glass"],
  "Mirror" => ["Light", "Stone"],
  "Ego" => ["Mirror", "Human"],
  "Intellect" => ["Human", "Time"],
  "Science" => ["Intellect", "Time"],
  "Lense" => ["Light", "Crystal"],
  "Telescope" => ["Lense", "Mirror"],
  "Solarpanel" => ["Glass", "Circuit"],
  "Beaker" => ["Glass", "Science"],
  "Circuit" => ["Metal", "Electricity"],
  "Mechanism" => ["Electricity", "Metal"],
  "Processor" => ["Circuit", "Mechanism"],
  "Computer" => ["Processor", "Lamp"],
  "Hydrazine" => ["Gasoline", "Water"],
  "Rocket" => ["Hydrazine", "Airplane"],
  "Satellite" => ["Solarpanel", "Telescope", "Rocket", "Computer"],
  "Space" => ["Rocket", "Human"],
  "Moon" => ["Space", "Flag"],
  "Flag" => ["Fabric", "Metal"],
  "Rover" => ["Car", "Space", "Moon"],
  "Pillage" => ["Flag", "Village", "Army"],
  "Conquer" => ["Pillage", "Blood"],
  "Blood" => ["Human", "Weapon"],
  "Frontier" => ["Pillage", "Space"],
  "Flint" => ["Stone", "Sand"],
  "Time" => ["Sand", "Glass"],
  "Watch" => ["Time", "Crystal", "Circuit"],
  "Tribe" => ["Human", "Human", "Human"],
  "Village" => ["Warrior", "Tribe"],
  "Colony" => ["Tribe", "House"],
  "Army" => ["Warrior", "Hero"],
  "King" => ["Hero", "Royalty"],
  "Royalty" => ["Sex", "Money"],
  "Money" => ["Village", "Metal"],
  "Empire" => ["Conquer", "Colony", "King"],
  "Drill" => ["Electricity", "Tools", "Mechanism"],
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
    speed: 500,
    input: what_is("Stone") * 10,
    output: ["Stone"] * 10,
  },
  "Smelter" => {
    cost: ["Mechanism", "Fire", "Tools", "Human"],
    action: "Smelt Metal",
    uses: -1,
    speed: 500,
    input: what_is("Metal") * 10,
    output: ["Metal"] * 10,
  },
  "Breeder" => {
    cost: ["Human", "Beaker", "Sex", "Intellect", "Tools"],
    action: "Breed Human",
    uses: -1,
    speed: 500,
    input: what_is("Human"),
    output: ["Human"],
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

# Add all the upgrade roots as things
$upgrades.each { |k, v|
  $things[k] = v[:cost]
}

# The first task must be the starting task
tasks = ["  things: new Task(\"things\", \"Create Things\", 1, 5000, [], 0, [#{stringify what_are $things.keys}]),"]

# Create all the thing tasks
tasks += $things.map { |k, v|
  "  #{k.downcase}: new Task(\"#{k.downcase}\", \"#{k}\", #{$upgrades[k] ? (($upgrades[k][:uses] || -1) == -1 ? 1 : -1 ) : -1}, #{1000 + what_is(k).length * 1000}, [#{stringify v}]),"
}

# Create all the upgrade tasks
tasks += $upgrades.map { |k, v|
  speed = what_are(v[:input]).length * v[:speed]
  "  action_#{k.downcase}: new Task(\"action_#{k.downcase}\", \"#{v[:action]}\", #{$upgrades[k][:uses] || -1}, #{speed}, [{id: \"#{k}\", count: 0}, #{stringify v[:input]}], 0, [{id: \"action_#{k.downcase}\", count: -1}, #{stringify v[:output]}]),"
}

# Join the tasks
tasks = tasks.join("\n")

# Print the code
puts """// All available tasks
let tasks = {
#{tasks}
};

// Initial Tasks
let initial = [tasks.things];
"""