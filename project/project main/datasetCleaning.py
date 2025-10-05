# import pandas as pd
# import re
# import string
# import nltk
# from bs4 import BeautifulSoup
# import contractions

# from nltk.corpus import stopwords
# from nltk.stem import WordNetLemmatizer
# from nltk.tokenize import TreebankWordTokenizer

# # Download required resources
# nltk.download('stopwords')
# nltk.download('wordnet')

# # Initialize tools
# stop_words = set(stopwords.words('english'))
# lemmatizer = WordNetLemmatizer()
# tokenizer = TreebankWordTokenizer()

# # Extended slang dictionary
# slang_dict = {
#     "u": "you", "r": "are", "idk": "i do not know", "lol": "laughing out loud",
#     "omg": "oh my god", "brb": "be right back", "ttyl": "talk to you later",
#     "btw": "by the way", "lmao": "laughing my ass off", "rofl": "rolling on the floor laughing",
#     "smh": "shaking my head", "tbh": "to be honest", "bff": "best friend forever",
#     "imho": "in my humble opinion", "afaik": "as far as i know", "asap": "as soon as possible",
#     "atm": "at the moment", "b4": "before", "gr8": "great", "msg": "message",
#     "nvm": "never mind", "plz": "please", "thx": "thanks", "ty": "thank you",
#     "yw": "you are welcome", "np": "no problem"
# }

# # Cleaning function
# def clean_text(text):
#     if not isinstance(text, str):
#         return ""
    
#     text = text.lower()
#     text = re.sub(r'http\S+|www\S+|https\S+', '', text)
#     text = re.sub(r'@\w+', '', text)
#     text = re.sub(r'#(\w+)', r'\1', text)
#     text = text.encode('ascii', 'ignore').decode('ascii')
#     text = BeautifulSoup(text, "html.parser").get_text()
#     text = contractions.fix(text)
#     text = re.sub(r'[^\w\s]', '', text)
#     text = re.sub(r'\d+', '', text)
#     text = re.sub(r'(.)\1{2,}', r'\1', text)

#     # Replace slang
#     text = ' '.join([slang_dict.get(word, word) for word in text.split()])

#     # Tokenize, remove stopwords, lemmatize
#     words = tokenizer.tokenize(text)
#     clean_words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    
#     return ' '.join(clean_words).strip()

# # Load dataset
# df = pd.read_csv(
#     r'C:\Users\mani0\OneDrive\Desktop\Project Work\HatsSpeechDetectionSystem (Ramzan, Hajira, Ali husnain)\dataset\Final_ReligiousHateSpeech_With_3000_Simulated.csv',
#     encoding='utf-8'
# )

# # Clean the 'txt' column
# df['txt'] = df['txt'].apply(clean_text)

# # Save the cleaned dataset
# df.to_csv('cleaned_dataset.csv', index=False)
print("✅ Cleaned dataset saved as 'cleaned_dataset.csv'")
