# moviemuse

To start up the project for the first time:
1. run ```cd client``` to enter the client directory
2. run ```npm install``` to install the necessary dependencies
3. run ```npm run dev``` to start up the website locally

In a seperate terminal:
1. run ```cd server``` to enter the server directory
2. run ```pip install -r requirements.txt``` to download the neccessary python dependencies
3. run ```psql -U postgres -f setup_database.sql``` to set up the database
4. make sure you have a .env file in the server directory with USER=<postgres_username> and PASSWORD=<postgres_password>
5. run ```python app.py``` to start up the server



To run the testcase file for app.py:
1. run ```cd server```
2. run ```py -m unittest app_test.py```