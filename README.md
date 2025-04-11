
steps:  
open terminal in vscode without opening any folder
write=> git clone https://github.com/satyam-kapri/SyncBoard
then open the folder SyncBoard that is created just now
.................................................................................
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
