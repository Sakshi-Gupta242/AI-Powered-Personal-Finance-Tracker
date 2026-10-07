"""
Category Classifier ML Module
Uses TF-IDF Vectorizer + Multinomial Logistic Regression to automatically
classify transaction descriptions into standard financial categories.
"""

import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Standard predefined categories
CATEGORIES = [
    'Food',
    'Travel',
    'Shopping',
    'Education',
    'Bills',
    'Entertainment',
    'Healthcare',
    'Rent',
    'Transportation',
    'Other'
]

# Rich seed training dataset tailored for Indian and global financial transactions
TRAINING_DATA = [
    # Food
    ("Domino's pizza dinner", "Food"),
    ("Pizza Hut lunch with team", "Food"),
    ("Swiggy food delivery order", "Food"),
    ("Zomato meal delivery", "Food"),
    ("Starbucks iced latte coffee", "Food"),
    ("Cafe Coffee Day cappuccino and snack", "Food"),
    ("McDonalds burger and fries", "Food"),
    ("Burger King whopper meal", "Food"),
    ("KFC chicken bucket meal", "Food"),
    ("Subway sandwich sub", "Food"),
    ("Grocery supermarket fresh vegetables", "Food"),
    ("Blinkit instant grocery delivery", "Food"),
    ("Zepto groceries milk bread eggs", "Food"),
    ("BigBasket weekly grocery shopping", "Food"),
    ("Dinner at fine dining restaurant", "Food"),
    ("Lunch buffet with family", "Food"),
    ("Biryani order lunch", "Food"),
    ("Bakery cakes and pastry sweets", "Food"),
    ("Dunkin donuts and coffee", "Food"),
    ("Street food chaat snacks", "Food"),
    ("Haldirams namkeen and thali", "Food"),

    # Travel
    ("IndiGo flight tickets to Delhi", "Travel"),
    ("Air India flight booking", "Travel"),
    ("MakeMyTrip hotel reservation Goa", "Travel"),
    ("IRCTC train ticket booking", "Travel"),
    ("Train sleeper class ticket", "Travel"),
    ("Agoda hotel room stay booking", "Travel"),
    ("Airbnb vacation apartment rental", "Travel"),
    ("Goibibo flight booking confirmation", "Travel"),
    ("Intercity bus ticket redBus", "Travel"),
    ("Holiday resort weekend trip", "Travel"),
    ("Tour guide package booking", "Travel"),
    ("Visa application travel fee", "Travel"),

    # Shopping
    ("Amazon electronics purchase headphones", "Shopping"),
    ("Flipkart wireless earphone order", "Shopping"),
    ("Myntra casual denim jeans and shirts", "Shopping"),
    ("Zara party dress and jacket", "Shopping"),
    ("H&M cotton tshirt and trousers", "Shopping"),
    ("Nike running shoes sneakers", "Shopping"),
    ("Adidas sports gym shoes", "Shopping"),
    ("Apple store iPad case accessory", "Shopping"),
    ("Croma electronics laptop charger", "Shopping"),
    ("Reliance Digital television", "Shopping"),
    ("Mall clothes and apparel shopping", "Shopping"),
    ("Titan wristwatch purchase", "Shopping"),
    ("Eyewear sunglasses Lenskart", "Shopping"),
    ("Cosmetics makeup Nykaa order", "Shopping"),
    ("Home decor furnishing bedsheet", "Shopping"),

    # Education
    ("College tuition semester fees payment", "Education"),
    ("University examination admission fee", "Education"),
    ("College textbooks and notebooks", "Education"),
    ("Udemy full stack web development course", "Education"),
    ("Coursera machine learning certificate", "Education"),
    ("Stationery pens registers calculator", "Education"),
    ("Library membership annual fee", "Education"),
    ("Coaching class institute fees", "Education"),
    ("Kindle ebook textbook purchase", "Education"),
    ("EdX data science online course", "Education"),
    ("School uniform and books", "Education"),

    # Bills
    ("Monthly electricity power bill payment", "Bills"),
    ("Airtel fiber broadband wifi recharge", "Bills"),
    ("Jio mobile 5G prepaid recharge", "Bills"),
    ("Vodafone postpaid telephone bill", "Bills"),
    ("Municipal corporation water bill", "Bills"),
    ("Indane LPG gas cylinder booking", "Bills"),
    ("PNG piped natural gas bill", "Bills"),
    ("Apartment society maintenance charges", "Bills"),
    ("DTH Tata Play TV recharge", "Bills"),
    ("Credit card bill payment", "Bills"),

    # Entertainment
    ("Netflix 4K monthly subscription", "Entertainment"),
    ("Spotify Premium music streaming", "Entertainment"),
    ("Amazon Prime video membership", "Entertainment"),
    ("Disney+ Hotstar annual plan", "Entertainment"),
    ("BookMyShow cinema movie tickets PVR", "Entertainment"),
    ("IMAX movie theater popcorn tickets", "Entertainment"),
    ("Steam PC video game purchase", "Entertainment"),
    ("PlayStation Plus game subscription", "Entertainment"),
    ("Live music concert passes", "Entertainment"),
    ("Standup comedy show ticket", "Entertainment"),
    ("Theme amusement park entry ticket", "Entertainment"),

    # Healthcare
    ("Apollo Pharmacy medicines prescription", "Healthcare"),
    ("1mg online tablet medicine order", "Healthcare"),
    ("Doctor general physician consultation fee", "Healthcare"),
    ("Dental clinic root canal teeth cleaning", "Healthcare"),
    ("Dr Lal PathLabs blood test health checkup", "Healthcare"),
    ("Eye specialist ophthalmologist checkup", "Healthcare"),
    ("Hospital emergency outpatient OPD fee", "Healthcare"),
    ("Multivitamin protein powder supplements", "Healthcare"),
    ("Health insurance premium policy payment", "Healthcare"),
    ("Physiotherapy pain relief clinic", "Healthcare"),

    # Rent
    ("Monthly house apartment room rent", "Rent"),
    ("Flat owner landlord rent transfer", "Rent"),
    ("PG hostel accommodation rent", "Rent"),
    ("Co-living space monthly rental", "Rent"),
    ("Office commercial space lease rent", "Rent"),
    ("Security deposit for house rental", "Rent"),

    # Transportation
    ("Uber cab ride to office", "Transportation"),
    ("Ola auto rickshaw fare", "Transportation"),
    ("HP petrol fuel filling petrol pump", "Transportation"),
    ("Indian Oil diesel car fuel", "Transportation"),
    ("Metro rail smart card balance recharge", "Transportation"),
    ("Car servicing engine oil change brake repair", "Transportation"),
    ("Bike motorcycle service center", "Transportation"),
    ("FASTag toll plaza highway payment", "Transportation"),
    ("Rapido bike taxi ride", "Transportation"),
    ("Car parking ticket fee mall", "Transportation"),

    # Other
    ("Charity relief fund donation", "Other"),
    ("Birthday gift for best friend", "Other"),
    ("Bank account minimum balance penalty charges", "Other"),
    ("ATM cash withdrawal", "Other"),
    ("Government paperwork stamp paper notary", "Other"),
    ("Courier speed post parcel delivery", "Other"),
    ("Laundry dry cleaning services", "Other"),
]

class CategoryClassifier:
    """Singleton classifier that uses TF-IDF + Logistic Regression."""
    def __init__(self):
        self.model = None
        self._train_initial_model()

    def _preprocess(self, text: str) -> str:
        """Clean and normalize transaction text."""
        if not text:
            return ""
        text = text.lower()
        # Keep letters, numbers, spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _train_initial_model(self):
        """Train the classifier on the rich seed dataset."""
        texts = [self._preprocess(t[0]) for t in TRAINING_DATA]
        labels = [t[1] for t in TRAINING_DATA]

        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
            ('clf', LogisticRegression(C=1.0, max_iter=200, random_state=42))
        ])
        self.model.fit(texts, labels)

    def predict(self, description: str, user_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Predict category for a given description.
        Returns predicted category, confidence score (0-100%), and alternative category candidates.
        """
        if not description or not description.strip():
            return {
                'predicted_category': 'Other',
                'confidence': 0.0,
                'alternatives': [],
                'explanation': 'Empty description provided.'
            }

        cleaned = self._preprocess(description)
        
        # Exact keyword fast-track for unambiguous terms
        keyword_map = {
            'swiggy': 'Food', 'zomato': 'Food', 'dominos': 'Food', 'pizza': 'Food', 'burger': 'Food',
            'starbucks': 'Food', 'kfc': 'Food', 'subway': 'Food', 'biryani': 'Food', 'grocery': 'Food',
            'uber': 'Transportation', 'ola': 'Transportation', 'petrol': 'Transportation', 'diesel': 'Transportation',
            'rapido': 'Transportation', 'fastag': 'Transportation', 'metro': 'Transportation',
            'amazon': 'Shopping', 'flipkart': 'Shopping', 'myntra': 'Shopping', 'zara': 'Shopping', 'lenskart': 'Shopping',
            'netflix': 'Entertainment', 'spotify': 'Entertainment', 'hotstar': 'Entertainment', 'bookmyshow': 'Entertainment', 'cinema': 'Entertainment', 'movie': 'Entertainment',
            'flight': 'Travel', 'hotel': 'Travel', 'irctc': 'Travel', 'makemytrip': 'Travel', 'redbus': 'Travel',
            'electricity': 'Bills', 'wifi': 'Bills', 'broadband': 'Bills', 'recharge': 'Bills', 'lpg': 'Bills',
            'pharmacy': 'Healthcare', 'doctor': 'Healthcare', 'hospital': 'Healthcare', 'medicine': 'Healthcare', 'clinic': 'Healthcare',
            'rent': 'Rent', 'landlord': 'Rent',
            'tuition': 'Education', 'exam': 'Education', 'course': 'Education', 'udemy': 'Education', 'college': 'Education', 'books': 'Education'
        }
        
        for word, cat in keyword_map.items():
            if word in cleaned.split():
                return {
                    'predicted_category': cat,
                    'confidence': 98.0,
                    'alternatives': [{'category': c, 'confidence': 2.0} for c in CATEGORIES if c != cat][:3],
                    'explanation': f'Matched high-confidence financial keyword "{word}".'
                }

        # Predict using TF-IDF + Logistic Regression
        try:
            probabilities = self.model.predict_proba([cleaned])[0]
            classes = self.model.classes_
            
            # Sort categories by probability descending
            ranked = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)
            top_category, top_prob = ranked[0]
            confidence_pct = round(top_prob * 100, 1)

            # Gather next top 2 alternatives
            alternatives = [
                {'category': cat, 'confidence': round(prob * 100, 1)}
                for cat, prob in ranked[1:3]
            ]

            return {
                'predicted_category': top_category,
                'confidence': confidence_pct,
                'alternatives': alternatives,
                'explanation': f'TF-IDF Logistic Regression classified this as "{top_category}" with {confidence_pct}% confidence.'
            }
        except Exception as e:
            return {
                'predicted_category': 'Other',
                'confidence': 50.0,
                'alternatives': [],
                'explanation': f'Fallback default (error: {str(e)})'
            }

# Global singleton instance
classifier = CategoryClassifier()

def predict_category(description: str) -> Dict[str, Any]:
    """Helper function to call the global category classifier."""
    return classifier.predict(description)
