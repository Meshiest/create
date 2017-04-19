$things = {
  "Dust" => ["Earth", "Air"],
  "Lava" => ["Earth", "Fire"],
  "Swamp" => ["Earth", "Water"],
  "Alcohol" => ["Fire", "Water"],
  "Energy" => ["Fire", "Air"],
  "Steam" => ["Air", "Water"],
  "Life" => ["Swamp", "Energy"],
  "Bacteria" => ["Life", "Swamp"],
  "Weeds" => ["Life", "Water"],
  "Storm" => ["Energy", "Air"],
  "Moss" => ["Weeds", "Swamp"],
  "Fern" => ["Moss", "Swamp"],
  "Worm" => ["Bacteria", "Swamp"],
  "Sulfur" => ["Bacteria", "Swamp"],
  "Beetle" => ["Worm", "Earth"],
  "Stone" => ["Lava", "Water"],
  "Sand" => ["Stone", "Water"],
  "Scorpion" => ["Beetle", "Sand"],
  "Egg" => ["Life", "Stone"],
  "Dinosaur" => ["Egg", "Earth"],
  "Dragon" => ["Dinosaur", "Air"],
  "Lizard" => ["Egg", "Swamp"],
  "Bird" => ["Lizard", "Air"],
  "Vodka" => ["Water", "Alcohol"],
  "Plankton" => ["Bacteria", "Water"],
  "Phoenix" => ["Bird", "Fire"],
  "Thunderbird" => ["Bird", "Storm"],
  "Beast" => ["Lizard", "Earth"],
  "Human" => ["Beast", "Life"],
  "Wizard" => ["Human", "Energy"],
  "Demigod" => ["Wizard", "Energy"],
  "Blood" => ["Human", "Dinosaur"],
  "Vampire" => ["Human", "Blood"],
  "Animal" => ["Human", "Beast"],
  "Wool" => ["Human", "Animal"],
  "Meat" => ["Human", "Animal"],
  "Milk" => ["Human", "Animal"],
  "Metal" => ["Stone", "Fire"],
  "Tools" => ["Human", "Metal"],
  "Weapon" => ["Tools", "Metal"],
  "Sex" => ["Human", "Human"],
  "Hunter" => ["Human", "Weapon"],
  "Clay" => ["Swamp", "Sand"],
  "Golem" => ["Life", "Clay"],
  "Warrior" => ["Hunter", "Weapon"],
  "Hero" => ["Warrior", "Dragon"],
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
  "Engine" => ["Boiler", "Coal"],
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
  "Car" => ["Oil", "Cart"],
  "Airplane" => ["Car", "Air"],
  "Chariot" => ["Beast", "Cart"],
  "Alcoholic" => ["Vodka", "Human"],
  "Grass" => ["Moss", "Earth"],
  "Field" => ["Tools", "Earth"],
  "Wheat" => ["Field", "Seeds"],
  "Flour" => ["Wheat", "Stone"],
  "Dough" => ["Flour", "Water"],
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
  "Cigarette" => ["Tobacco", "Paper"],
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
}

def what_is thing
  $things[thing] && $things[thing].map{|t| what_is(t)}.flatten || thing
end

raw = $things.map{|k, v| what_is k}.flatten
base = raw.uniq.map{|t| "{id: \"#{t.downcase}\", count: #{raw.count(t)}}"}

tasks = $things.map { |k, v|
  "  #{k.downcase}: new Task(\"#{k.downcase}\", \"#{k}\", -1, #{500 + what_is(k).length * 500}, [#{v.map{|t| "{id: \"#{t.downcase}\", count: 1}"}.join(", ")}]),"
}.join("\n")

puts """
// All available tasks
let tasks = {
  elements: new Task(\"elements\", \"Create Elements\", 1, 5000, [], 0, [#{base.join(", ")}]),
#{tasks}
};

// Initial Tasks
let initial = [tasks.elements];
"""