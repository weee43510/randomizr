export interface TriviaQuestion {
  category: "General" | "Science" | "History" | "Pop Culture" | "Geography" | "Sports";
  question: string;
  choices: string[];
  answer: number; // index
}

export const TRIVIA: TriviaQuestion[] = [
  // General
  { category: "General", question: "What is the rarest blood type?", choices: ["O-", "AB-", "B-", "A-"], answer: 1 },
  { category: "General", question: "How many bones are in the adult human body?", choices: ["196", "206", "216", "226"], answer: 1 },
  { category: "General", question: "What color is a polar bear's skin?", choices: ["White", "Pink", "Black", "Gray"], answer: 2 },
  { category: "General", question: "What's the most spoken language in the world?", choices: ["English", "Spanish", "Mandarin", "Hindi"], answer: 2 },
  { category: "General", question: "Which planet has the most moons?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1 },
  { category: "General", question: "How many hearts does an octopus have?", choices: ["1", "2", "3", "8"], answer: 2 },
  { category: "General", question: "What's the hardest natural substance on Earth?", choices: ["Gold", "Iron", "Diamond", "Quartz"], answer: 2 },
  { category: "General", question: "What gas do plants absorb from the atmosphere?", choices: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"], answer: 2 },
  { category: "General", question: "How many continents are there?", choices: ["5", "6", "7", "8"], answer: 2 },
  { category: "General", question: "What's the smallest country in the world?", choices: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 },

  // Science
  { category: "Science", question: "What's the chemical symbol for gold?", choices: ["Go", "Gd", "Au", "Ag"], answer: 2 },
  { category: "Science", question: "What's the speed of light (approximately)?", choices: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"], answer: 0 },
  { category: "Science", question: "What planet is known as the Red Planet?", choices: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1 },
  { category: "Science", question: "What part of the cell contains DNA?", choices: ["Mitochondria", "Cytoplasm", "Nucleus", "Membrane"], answer: 2 },
  { category: "Science", question: "What's H2O more commonly known as?", choices: ["Salt", "Sugar", "Water", "Acid"], answer: 2 },
  { category: "Science", question: "Who proposed the theory of relativity?", choices: ["Newton", "Einstein", "Hawking", "Tesla"], answer: 1 },
  { category: "Science", question: "What's the largest organ in the human body?", choices: ["Liver", "Brain", "Skin", "Lungs"], answer: 2 },
  { category: "Science", question: "What's the boiling point of water (Celsius)?", choices: ["90", "100", "110", "120"], answer: 1 },
  { category: "Science", question: "How many elements are on the periodic table?", choices: ["108", "118", "128", "138"], answer: 1 },
  { category: "Science", question: "What's the smallest unit of matter?", choices: ["Cell", "Molecule", "Atom", "Proton"], answer: 2 },

  // History
  { category: "History", question: "In what year did WWII end?", choices: ["1943", "1944", "1945", "1946"], answer: 2 },
  { category: "History", question: "Who was the first US President?", choices: ["Jefferson", "Lincoln", "Washington", "Adams"], answer: 2 },
  { category: "History", question: "What ancient civilization built the pyramids of Giza?", choices: ["Romans", "Greeks", "Egyptians", "Mayans"], answer: 2 },
  { category: "History", question: "The Berlin Wall fell in what year?", choices: ["1987", "1989", "1991", "1993"], answer: 1 },
  { category: "History", question: "Who painted the Mona Lisa?", choices: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2 },
  { category: "History", question: "What year did the Titanic sink?", choices: ["1905", "1912", "1918", "1923"], answer: 1 },
  { category: "History", question: "Who discovered penicillin?", choices: ["Pasteur", "Curie", "Fleming", "Darwin"], answer: 2 },
  { category: "History", question: "Which empire was ruled by Julius Caesar?", choices: ["Greek", "Roman", "Persian", "Ottoman"], answer: 1 },
  { category: "History", question: "Who wrote the Declaration of Independence?", choices: ["Franklin", "Jefferson", "Adams", "Hamilton"], answer: 1 },
  { category: "History", question: "What war was fought between the North and South US?", choices: ["Revolutionary War", "Civil War", "WWI", "Cold War"], answer: 1 },

  // Pop Culture
  { category: "Pop Culture", question: "Who sang 'Shape of You'?", choices: ["Drake", "Ed Sheeran", "Bruno Mars", "The Weeknd"], answer: 1 },
  { category: "Pop Culture", question: "Which app is known for short-form vertical videos?", choices: ["Instagram", "TikTok", "Snapchat", "YouTube"], answer: 1 },
  { category: "Pop Culture", question: "Who plays Iron Man in the MCU?", choices: ["Chris Evans", "Robert Downey Jr.", "Mark Ruffalo", "Chris Hemsworth"], answer: 1 },
  { category: "Pop Culture", question: "What's the highest-grossing film of all time (as of 2023)?", choices: ["Titanic", "Avengers: Endgame", "Avatar", "Star Wars VII"], answer: 2 },
  { category: "Pop Culture", question: "Which streaming service made 'Stranger Things'?", choices: ["Hulu", "Netflix", "Disney+", "HBO"], answer: 1 },
  { category: "Pop Culture", question: "Who is the lead singer of Coldplay?", choices: ["Chris Martin", "Bono", "Thom Yorke", "Matt Bellamy"], answer: 0 },
  { category: "Pop Culture", question: "What year did the first iPhone release?", choices: ["2005", "2007", "2009", "2011"], answer: 1 },
  { category: "Pop Culture", question: "Which game has the most copies sold ever?", choices: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], answer: 1 },
  { category: "Pop Culture", question: "Who voices SpongeBob SquarePants?", choices: ["Tom Kenny", "Bill Fagerbakke", "Tom Hanks", "Seth MacFarlane"], answer: 0 },
  { category: "Pop Culture", question: "Which Taylor Swift album has the song 'Anti-Hero'?", choices: ["1989", "Folklore", "Midnights", "Lover"], answer: 2 },

  // Geography
  { category: "Geography", question: "What's the longest river in the world?", choices: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
  { category: "Geography", question: "Which country has the most population?", choices: ["USA", "China", "India", "Russia"], answer: 2 },
  { category: "Geography", question: "What's the capital of Australia?", choices: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
  { category: "Geography", question: "Which desert is the largest in the world?", choices: ["Sahara", "Gobi", "Antarctic", "Arabian"], answer: 2 },
  { category: "Geography", question: "Mount Everest is in which mountain range?", choices: ["Andes", "Rockies", "Alps", "Himalayas"], answer: 3 },
  { category: "Geography", question: "What's the largest ocean?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { category: "Geography", question: "Which country has Tokyo as capital?", choices: ["China", "Korea", "Japan", "Thailand"], answer: 2 },
  { category: "Geography", question: "What continent is Egypt in?", choices: ["Asia", "Africa", "Europe", "Middle East"], answer: 1 },
  { category: "Geography", question: "Which US state is the largest by area?", choices: ["Texas", "California", "Alaska", "Montana"], answer: 2 },
  { category: "Geography", question: "What's the capital of Canada?", choices: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: 2 },

  // Sports
  { category: "Sports", question: "How many players on a soccer team (on field)?", choices: ["9", "10", "11", "12"], answer: 2 },
  { category: "Sports", question: "What sport uses a shuttlecock?", choices: ["Tennis", "Badminton", "Squash", "Cricket"], answer: 1 },
  { category: "Sports", question: "How often are the Summer Olympics held?", choices: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], answer: 2 },
  { category: "Sports", question: "Which country invented basketball?", choices: ["USA", "Canada", "UK", "Australia"], answer: 0 },
  { category: "Sports", question: "How many holes in a standard round of golf?", choices: ["9", "12", "18", "21"], answer: 2 },
  { category: "Sports", question: "Which country has won the most FIFA World Cups?", choices: ["Germany", "Argentina", "Brazil", "Italy"], answer: 2 },
  { category: "Sports", question: "What's the diameter of a basketball hoop (inches)?", choices: ["16", "18", "20", "22"], answer: 1 },
  { category: "Sports", question: "Who has the most NBA championships as a player?", choices: ["Michael Jordan", "Bill Russell", "Kobe Bryant", "LeBron James"], answer: 1 },
  { category: "Sports", question: "What sport is Wimbledon associated with?", choices: ["Golf", "Cricket", "Tennis", "Rugby"], answer: 2 },
  { category: "Sports", question: "How long is a marathon (miles)?", choices: ["20.2", "24.2", "26.2", "30.2"], answer: 2 },
];
