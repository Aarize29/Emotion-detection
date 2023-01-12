// Include npm packages
const express = require("express");
const natural = require("natural");
const stopword = require("stopword");

// For conversion of contractions to standard lexicon
const wordDict = {
	"aren't": "are not",
	"can't": "cannot",
	"couldn't": "could not",
	"didn't": "did not",
	"doesn't": "does not",
	"don't": "do not",
	"hadn't": "had not",
	"hasn't": "has not",
	"haven't": "have not",
	"he'd": "he would",
	"he'll": "he will",
	"he's": "he is",
	"i'd": "I would",
	"i'd": "I had",
	"i'll": "I will",
	"i'm": "I am",
	"isn't": "is not",
	"it's": "it is",
	"it'll": "it will",
	"i've": "I have",
	"let's": "let us",
	"mightn't": "might not",
	"mustn't": "must not",
	"shan't": "shall not",
	"she'd": "she would",
	"she'll": "she will",
	"she's": "she is",
	"shouldn't": "should not",
	"that's": "that is",
	"there's": "there is",
	"they'd": "they would",
	"they'll": "they will",
	"they're": "they are",
	"they've": "they have",
	"we'd": "we would",
	"we're": "we are",
	"weren't": "were not",
	"we've": "we have",
	"what'll": "what will",
	"what're": "what are",
	"what's": "what is",
	"what've": "what have",
	"where's": "where is",
	"who'd": "who would",
	"who'll": "who will",
	"who're": "who are",
	"who's": "who is",
	"who've": "who have",
	"won't": "will not",
	"wouldn't": "would not",
	"you'd": "you would",
	"you'll": "you will",
	"you're": "you are",
	"you've": "you have",
	"'re": " are",
	"wasn't": "was not",
	"we'll": " will",
	"didn't": "did not"
}

const port = 5500;
const host = "127.0.0.1";

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",express.static(__dirname + "/public"));


// Contractions to standard lexicons Conversion
const convertToStandard = text => {
	const data = text.split(' ');
	data.forEach((word, index) => {
		Object.keys(wordDict).forEach(key => {
			if (key === word.toLowerCase()) {
				data[index] = wordDict[key]
			};
		});
	});

	return data.join(' ');
}

// LowerCase Conversion
const convertTolowerCase = text => {
	return text.toLowerCase();
}

// Pure Alphabets extraction
const removeNonAlpha = text => {

	// This specific Regex means that replace all
	//non alphabets with empty string.
	return text.replace(/[^a-zA-Z\s]+/g, '');
}

// Analysis Route
app.post("/feedback", (request, response) => {
	console.log(request.body);

	// NLP Logic
	// Convert all data to its standard form
	const lexData = convertToStandard(request.body.feedback);
	console.log("Lexed Data: ",lexData);

	// Convert all data to lowercase
	const lowerCaseData = convertTolowerCase(lexData);
	console.log("LowerCase Format: ",lowerCaseData);

	// Remove non alphabets and special characters
	const onlyAlpha = removeNonAlpha(lowerCaseData);
	console.log("OnlyAlpha: ",onlyAlpha);

	// Tokenization
	const tokenConstructor = new natural.WordTokenizer();
	const tokenizedData = tokenConstructor.tokenize(onlyAlpha);
	console.log("Tokenized Data: ",tokenizedData);

	// Remove Stopwords
	const filteredData = stopword.removeStopwords(tokenizedData);
	console.log("After removing stopwords: ",filteredData);

	// Stemming
	const Sentianalyzer =
	new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
	const analysis_score = Sentianalyzer.getSentiment(filteredData);
	console.log("Sentiment Score: ",analysis_score);


	response.status(200).json({
		message: "Data received",
		sentiment_score: analysis_score
	})
});

app.listen(port, host, () => {
	console.log('Server is running...');
});
