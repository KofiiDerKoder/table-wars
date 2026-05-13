/**
 * TABLE WARS! - Game Constants & Data
 * 
 * Contains default question banks and blind taste test items.
 * Used for initializing the game store state.
 * 
 * Last Updated: May 13, 2026
 */

export const DEFAULT_QUIZ_QUESTIONS = [
  // ─── Round 1: Table Trivia (30 questions) ─────────────────────────
  // Science (6)
  { id: "r1-1", text: "What is the chemical symbol for gold?", options: ["Ag", "Au", "Fe", "Cu"], correctAnswer: "Au", category: "Science" },
  { id: "r1-2", text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", category: "Science" },
  { id: "r1-3", text: "How many bones are in the adult human body?", options: ["186", "206", "216", "226"], correctAnswer: "206", category: "Science" },
  { id: "r1-4", text: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: "Carbon Dioxide", category: "Science" },
  { id: "r1-5", text: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Quartz"], correctAnswer: "Diamond", category: "Science" },
  { id: "r1-6", text: "How many chromosomes do humans have?", options: ["23", "44", "46", "48"], correctAnswer: "46", category: "Science" },

  // Geography (5)
  { id: "r1-7", text: "What is the capital city of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: "Paris", category: "Geography" },
  { id: "r1-8", text: "Which is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctAnswer: "Pacific", category: "Geography" },
  { id: "r1-9", text: "In which country is the city of Tokyo located?", options: ["China", "South Korea", "Japan", "Thailand"], correctAnswer: "Japan", category: "Geography" },
  { id: "r1-10", text: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Mississippi", "Yangtze"], correctAnswer: "Nile", category: "Geography" },
  { id: "r1-11", text: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correctAnswer: "Vatican City", category: "Geography" },

  // Math (4)
  { id: "r1-12", text: "What is 7 multiplied by 8?", options: ["48", "54", "56", "62"], correctAnswer: "56", category: "Math" },
  { id: "r1-13", text: "What is the square root of 64?", options: ["6", "7", "8", "9"], correctAnswer: "8", category: "Math" },
  { id: "r1-14", text: "What is the next prime number after 7?", options: ["8", "9", "10", "11"], correctAnswer: "11", category: "Math" },
  { id: "r1-15", text: "How many degrees are in a right angle?", options: ["45", "90", "180", "360"], correctAnswer: "90", category: "Math" },

  // History (4)
  { id: "r1-16", text: "Who was the first man to walk on the moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], correctAnswer: "Neil Armstrong", category: "History" },
  { id: "r1-17", text: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctAnswer: "1945", category: "History" },
  { id: "r1-18", text: "Who was the first President of the United States?", options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"], correctAnswer: "George Washington", category: "History" },
  { id: "r1-19", text: "Which ancient civilization built the pyramids?", options: ["Romans", "Greeks", "Egyptians", "Persians"], correctAnswer: "Egyptians", category: "History" },

  // Literature (3)
  { id: "r1-20", text: "Who wrote the Harry Potter series?", options: ["J.R.R. Tolkien", "Roald Dahl", "J.K. Rowling", "C.S. Lewis"], correctAnswer: "J.K. Rowling", category: "Literature" },
  { id: "r1-21", text: "In which play does the line 'To be, or not to be' appear?", options: ["Macbeth", "Othello", "Hamlet", "King Lear"], correctAnswer: "Hamlet", category: "Literature" },
  { id: "r1-22", text: "Who wrote '1984'?", options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"], correctAnswer: "George Orwell", category: "Literature" },

  // Art & Pop Culture (4)
  { id: "r1-23", text: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Monet"], correctAnswer: "Leonardo da Vinci", category: "Art" },
  { id: "r1-24", text: "What are the three primary colors?", options: ["Red, Green, Blue", "Red, Yellow, Blue", "Yellow, Green, Blue", "Red, Yellow, Green"], correctAnswer: "Red, Yellow, Blue", category: "Art" },
  { id: "r1-25", text: "Which movie series features Captain Jack Sparrow?", options: ["Star Wars", "Indiana Jones", "Pirates of the Caribbean", "Jurassic Park"], correctAnswer: "Pirates of the Caribbean", category: "Pop Culture" },
  { id: "r1-26", text: "Who was known as the 'King of Rock and Roll'?", options: ["Chuck Berry", "Little Richard", "Elvis Presley", "Buddy Holly"], correctAnswer: "Elvis Presley", category: "Music" },

  // Food & Nature (4)
  { id: "r1-27", text: "Which expensive spice comes from the crocus flower?", options: ["Vanilla", "Saffron", "Cardamom", "Cinnamon"], correctAnswer: "Saffron", category: "Food" },
  { id: "r1-28", text: "Which type of tree produces acorns?", options: ["Pine", "Maple", "Oak", "Birch"], correctAnswer: "Oak", category: "Nature" },
  { id: "r1-29", text: "Which is the largest land animal?", options: ["White Rhino", "African Elephant", "Hippopotamus", "Giraffe"], correctAnswer: "African Elephant", category: "Nature" },
  { id: "r1-30", text: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], correctAnswer: "5", category: "Sports" },

  // ─── Round 5: Grand Finale / Hard Questions (25 questions) ─────────
  { id: "r5-1", text: "What is the tallest mountain in the solar system?", options: ["Mount Everest", "Olympus Mons", "Mauna Kea", "Pikes Peak"], correctAnswer: "Olympus Mons", category: "Science" },
  { id: "r5-2", text: "What is the largest desert in the world?", options: ["Sahara", "Gobi", "Antarctic", "Arabian"], correctAnswer: "Antarctic", category: "Geography" },
  { id: "r5-3", text: "Who was the first woman to win a Nobel Prize?", options: ["Mother Teresa", "Marie Curie", "Jane Addams", "Rosalind Franklin"], correctAnswer: "Marie Curie", category: "History" },
  { id: "r5-4", text: "What is the name of the process by which a solid changes directly into a gas?", options: ["Evaporation", "Condensation", "Sublimation", "Deposition"], correctAnswer: "Sublimation", category: "Science" },
  { id: "r5-5", text: "Which Dutch artist painted 'Girl with a Pearl Earring'?", options: ["Rembrandt", "Johannes Vermeer", "Frans Hals", "Jan Steen"], correctAnswer: "Johannes Vermeer", category: "Art" },
  { id: "r5-6", text: "What is the mathematical term for a polygon with 12 sides?", options: ["Decagon", "Undecagon", "Dodecagon", "Hendecagon"], correctAnswer: "Dodecagon", category: "Math" },
  { id: "r5-7", text: "In Herman Melville's 'Moby Dick', what is the name of Captain Ahab's ship?", options: ["The Bounty", "The Pequod", "The Hispaniola", "The Beagle"], correctAnswer: "The Pequod", category: "Literature" },
  { id: "r5-8", text: "Which chemical element has the highest melting point?", options: ["Iron", "Platinum", "Tungsten", "Carbon"], correctAnswer: "Tungsten", category: "Science" },
  { id: "r5-9", text: "What is the capital city of Kazakhstan?", options: ["Almaty", "Astana", "Tashkent", "Bishkek"], correctAnswer: "Astana", category: "Geography" },
  { id: "r5-10", text: "Which series of treaties ended the Thirty Years' War in 1648?", options: ["Treaty of Versailles", "Peace of Westphalia", "Treaty of Utrecht", "Peace of Augsburg"], correctAnswer: "Peace of Westphalia", category: "History" },
  { id: "r5-11", text: "Which grape variety is the primary component of a classic Chianti wine?", options: ["Merlot", "Sangiovese", "Nebbiolo", "Cabernet Sauvignon"], correctAnswer: "Sangiovese", category: "Food" },
  { id: "r5-12", text: "What is the most abundant protein in the human body?", options: ["Keratin", "Hemoglobin", "Collagen", "Albumin"], correctAnswer: "Collagen", category: "Science" },
  { id: "r5-13", text: "Which golfer holds the record for the most major championship victories?", options: ["Tiger Woods", "Arnold Palmer", "Jack Nicklaus", "Gary Player"], correctAnswer: "Jack Nicklaus", category: "Sports" },
  { id: "r5-14", text: "Who is the often-forgotten third co-founder of Apple Computer Company?", options: ["Ronald Wayne", "Mike Markkula", "Bill Fernandez", "Daniel Kottke"], correctAnswer: "Ronald Wayne", category: "Technology" },
  { id: "r5-15", text: "Which famous composer became deaf but continued to write music, including his Ninth Symphony?", options: ["Mozart", "Beethoven", "Bach", "Schubert"], correctAnswer: "Beethoven", category: "Music" },
  { id: "r5-16", text: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctAnswer: "300,000 km/s", category: "Science" },
  { id: "r5-17", text: "Which country has the most natural lakes?", options: ["USA", "Canada", "Russia", "Finland"], correctAnswer: "Canada", category: "Geography" },
  { id: "r5-18", text: "Who developed the theory of general relativity?", options: ["Newton", "Einstein", "Hawking", "Galileo"], correctAnswer: "Einstein", category: "Science" },
  { id: "r5-19", text: "What is the rarest blood type?", options: ["A", "B", "AB", "O"], correctAnswer: "AB", category: "Science" },
  { id: "r5-20", text: "Which Shakespeare play is the longest?", options: ["Hamlet", "Romeo and Juliet", "Macbeth", "King Lear"], correctAnswer: "Hamlet", category: "Literature" },
  { id: "r5-21", text: "What year was the Berlin Wall built?", options: ["1959", "1961", "1963", "1965"], correctAnswer: "1961", category: "History" },
  { id: "r5-22", text: "Which animal has the longest lifespan?", options: ["Elephant", "Bowhead Whale", "Galapagos Tortoise", "Koi Fish"], correctAnswer: "Galapagos Tortoise", category: "Nature" },
  { id: "r5-23", text: "What is the SI unit of electric current?", options: ["Volt", "Ampere", "Ohm", "Watt"], correctAnswer: "Ampere", category: "Science" },
  { id: "r5-24", text: "Which country consumes the most chocolate per capita?", options: ["Belgium", "Switzerland", "Germany", "USA"], correctAnswer: "Switzerland", category: "Food" },
  { id: "r5-25", text: "What is the deepest point in the ocean?", options: ["Mariana Trench", "Tonga Trench", "Java Trench", "Puerto Rico Trench"], correctAnswer: "Mariana Trench", category: "Geography" },
];

export const DEFAULT_TASTE_ITEMS = [
  { id: 't1', name: 'Soy Sauce', hint: 'A dark, salty liquid used in Asian cuisine', category: 'Condiment' },
  { id: 't2', name: 'Honey', hint: 'A golden sweet substance made by bees', category: 'Sweetener' },
  { id: 't3', name: 'Lemon Juice', hint: 'A tangy citrus liquid', category: 'Citrus' },
  { id: 't4', name: 'Olive Oil', hint: 'A smooth, rich liquid from pressed olives', category: 'Cooking Oil' },
  { id: 't5', name: 'Peanut Butter', hint: 'A thick, nutty spread', category: 'Spread' },
  { id: 't6', name: 'Coconut Milk', hint: 'A creamy white liquid from a tropical fruit', category: 'Dairy Alternative' },
  { id: 't7', name: 'Maple Syrup', hint: 'A sweet amber liquid from tree sap', category: 'Sweetener' },
  { id: 't8', name: 'Balsamic Vinegar', hint: 'A dark, sweet-and-sour Italian condiment', category: 'Condiment' },
  { id: 't9', name: 'Marmite', hint: 'A sticky, dark spread with a strong savory flavour', category: 'Spread' },
  { id: 't10', name: 'Cream Cheese', hint: 'A soft, mild, white spreadable cheese', category: 'Dairy' },
  { id: 't11', name: 'Tahini', hint: 'A smooth paste made from sesame seeds', category: 'Spread' },
  { id: 't12', name: 'Fish Sauce', hint: 'A pungent, salty liquid popular in Southeast Asian cooking', category: 'Condiment' },
  { id: 't13', name: 'Coconut Oil', hint: 'A tropical oil that is solid at room temperature', category: 'Cooking Oil' },
  { id: 't14', name: 'Sour Cream', hint: 'A tangy, thick dairy product often used as a topping', category: 'Dairy' },
  { id: 't15', name: 'Molasses', hint: 'A thick, dark syrup produced during sugar refining', category: 'Sweetener' },
];