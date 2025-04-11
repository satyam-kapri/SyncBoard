steps:
............................................
cd mlserver
python -m venv venv (only first time)
venv/Scripts/activate
pip install -r requirements.txt (only first time)
python train.py (only first time)
python app.py
.............................................
another terminal:
cd nodeserver
npm install (only first time)
node index.js
............................................
another terminal:
cd frontend
npm install (only first time)
npm run dev
