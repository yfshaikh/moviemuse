import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os


# load environment variables
load_dotenv()

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="moviemuse",
        user=os.getenv("USER"),
        password=os.getenv("PASSWORD"),
        port="5433" 
    )
    return conn
