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
  "Necromancer" => ["Skull", "Wizard"],
  "Wizard" => ["Magic", "Human"],
  "Demigod" => ["Wizard", "Energy", "Light"],
  "Vampire" => ["Human", "Blood"],
  "Slayer" => ["Vampire", "Mirror", "Wood"],
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
  "Abuse" => ["Alcoholic", "Children"],
  "Hunter" => ["Human", "Weapon"],
  "Ninja" => ["Hunter", "Assassin"],
  "Ninjutsu" => ["Ninja", "Magic"],
  "Katana" => ["Weapon", "Tools"],
  "Clay" => ["Swamp", "Sand"],
  "Golem" => ["Life", "Clay"],
  "Warrior" => ["Hunter", "Weapon"],
  "Armor" => ["Tools", "Metal", "Leather"],
  "Knight" => ["Armor", "Warrior"],
  "Hero" => ["Knight", "Dragon", "Light"],
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
  "Anchor" => ["Metal", "Boat"],
  "Ship" => ["Boat", "Wood", "Anchor"],
  "Fabric" => ["Wool", "Tools"],
  "Clothes" => ["Fabric", "Human"],
  "Frigate" => ["Fabric", "Ship"],
  "SteamShip" => ["Ship", "Engine"],
  "Wheel" => ["Tools", "Wood"],
  "Cart" => ["Wheel", "Wood"],
  "Locomotive" => ["Cart", "Engine"],
  "Oil" => ["Water", "Coal"],
  "Chair" => ["Wood", "Tools"],
  "Car" => ["Engine", "Cart", "Lamp", "Chair"],
  "Wing" => ["Air", "Mechanism"],
  "Airplane" => ["Car", "Wing", "Circuit"],
  "Airport" => ["Airplane", "Building"],
  "Teacher" => ["Student", "Time"],
  "Student" => ["Human", "Curiosity"],
  "School" => ["Building", "Teacher", "Student", "Book"],
  "Paper" => ["Leaf", "Light"],
  "Leather" => ["Fabric", "Animal", "Light"],
  "Book" => ["Leather", "Paper"],
  "Chariot" => ["Beast", "Cart"],
  "Alcoholic" => ["Vodka", "Human"],
  "Grass" => ["Moss", "Earth", "Light"],
  "Field" => ["Tools", "Earth"],
  "Wheat" => ["Field", "Seeds", "Light", "Water"],
  "Flour" => ["Wheat", "Stone"],
  "Dough" => ["Flour", "Water"],
  "Sugar" => ["Field", "Light"],
  "Cake" => ["Sugar", "Egg", "Milk", "Flour"],
  "Bread" => ["Dough", "Fire", "Air"],
  "Beer" => ["Bread", "Alcohol"],
  "Grape" => ["Seeds", "Fruit", "Light"],
  "Fruit" => ["Tree", "Earth", "Water"],
  "Wine" => ["Grape", "Time"],
  "Reed" => ["Grass", "Swamp"],
  "Paper" => ["Reed", "Tools"],
  "Feather" => ["Hunter", "Bird"],
  "Book" => ["Feather", "Paper"],
  "Electricity" => ["Energy", "Metal", "Light"],
  "Corpse" => ["Warrior", "Human"],
  "Skull" => ["Warrior", "Human"],
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
  "Bar" => ["Alcoholic", "Vodka", "Beer", "Alcohol", "Wine", "Building"],
  "Building" => ["Bricks", "Concrete", "Hut"],
  "Family" => ["Love", "Human", "Human", "Children"],
  "House" => ["Love", "Building", "Family"],
  "Skyscraper" => ["Building", "Glass"],
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
  "Scientist" => ["Human", "Science"],
  "Lense" => ["Light", "Crystal"],
  "Telescope" => ["Lense", "Mirror"],
  "Solarpanel" => ["Glass", "Circuit"],
  "Beaker" => ["Glass", "Science"],
  "Circuit" => ["Metal", "Electricity"],
  "Mechanism" => ["Electricity", "Metal"],
  "Processor" => ["Circuit", "Mechanism"],
  "Computer" => ["Processor", "Lamp"],
  "Internet" => ["Science", "Computer", "Computer", "Human", "Human"],
  "Camera" => ["Mechanism", "Lense", "Lamp"],
  "Video" => ["Mechanism", "Camera"],
  "Porn" => ["Sex", "Video"],
  "Pornhub" => ["Porn", "Internet"],
  "Boredom" => ["Human", "Time", "Time", "Time", "Time", "Time"],
  "Memes" => ["Internet", "Boredom"],
  "FiberOptics" => ["Light", "Circuit", "Glass", "Internet"],
  "Youtube" => ["Video", "Time", "Internet"],
  "Reddit" => ["Love", "Time", "Internet"],
  "Curiosity" => ["Time", "Time", "Time", "Human"],
  "Google" => ["Curiosity", "Internet"],
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
  "Anime" => ["Time", "Video", "Paper"],
  "Monk" => ["Human", "Intellect", "Time"],
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
  "Jake" => ["Ego", "Love", "Hero", "Hair"],
  "David" => ["Memes", "Teacher", "Science", "Computer"],
  "Noah" => ["Sleep", "Depression", "Student", "Sex"],
  "Isaac" => ["Reddit", "Computer", "Anime", "Hair"],
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
  "Smelter" => {
    cost: ["Mechanism", "Fire", "Tools", "Human"],
    action: "Smelt Metal",
    uses: -1,
    speed: 750,
    input: what_is("Metal") * 10,
    output: ["Metal"] * 10,
  },
  "Breeder" => {
    cost: ["Human", "Beaker", "Sex", "Intellect", "Tools"],
    action: "Breed Human",
    uses: -1,
    speed: 750,
    input: what_is("Human"),
    output: ["Human"],
  },
  "Farmer" => {
    cost: ["Science", "Tools", "Tree", "Animal", "Seeds", "Seeds", "Beaker"],
    action: "Farm Plants",
    uses: -1,
    speed: 750,
    input: what_are(["Seeds", "Tree"]) * 5 + what_is("Animal") * 2,
    output: ["Seeds", "Tree"] * 5 + ["Animal"] * 2,
  },
  "Timekeeper" => {
    cost: ["Magic", "Wizard", "Time", "Time", "Sand", "Sand", "Blood"],
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
    input: what_is("Tools") * 10,
    output: ["Tools"] * 10,
  },
  "Provider" => {
    cost: ["Internet", "Skyscraper", "FiberOptics"],
    action: "Provide Internet",
    uses: -1,
    speed: 750,
    input: what_is("Internet"),
    output: ["Internet"],
  },
  "Constructor" => {
    cost: ["Mechanism", "Building", "Cement", "Tools", "Human"],
    action: "Construct Buildings",
    uses: -1,
    speed: 750,
    input: what_is("Building") * 2,
    output: ["Building"] * 2,
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

# Calculates how many steps are in this thing
def how_long thing
  $things[thing] && (1 + $things[thing].map{|t|how_long(t)}.inject(&:+)) || 0
end

# Add all the upgrade roots as things
$upgrades.each { |k, v|
  $things[k] = v[:cost]
}

everything = what_are($things.keys)

# The first task must be the starting task
tasks = ["  things: new Task(\"things\", \"Create Things\", 1, 5000, [], 0, [{id: \"things\", count: -1}, #{stringify what_are $things.keys}]),"]

# Create all the thing tasks
tasks += $things.map { |k, v|
  "  #{k.downcase}: new Task(\"#{k.downcase}\", \"#{k}\", #{$upgrades[k] ? 1 : -1}, #{1000 + what_is(k).length * 1000}, [#{stringify v}]),"
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

/* -- Things --

  Raw Counts:
#{everything.uniq.map{|thing| "    #{thing}: #{everything.count(thing)}"}.join("\n")}

  Total Tasks: #{$things.length}
  Largest Tasks:
#{$things.keys.sort{|a,b|how_long(b)-how_long(a)}[0..10].map{|a|"   #{a} (#{what_is(a).length} raw, #{how_long(a)} steps)"}.join("\n")}
 */
"""