import psycopg2

#-------- Make Connection & Cursor--------
try:
    conn = psycopg2.connect(
        dbname="userDB",
        user="postgres",
        password="yourpassword",
        host="localhost",
        port="5432"
    )

    cur = conn.cursor()

except (Exception, psycopg2.Error) as error:
    print("Error while connecting to PostgreSQL", error)
#---------------

# create user login table
# change password type if hashing is implemented
cur.execute("""CREATE TABLE IF NOT EXISTS userLogins(
            id SERIAL PRIMARY KEY, 
            username VARCHAR (30) UNIQUE NOT NULL,
            password VARCHAR (50)
            )""")

def insertRow(uName, pwrd):
    cur.execute(f"INSERT INTO userLogins(username, password) VALUES('{uName}', '{pwrd}')")

def userInsertRow():
    username = input("Enter username: ")
    password = input("Enter password: ")
    insertRow(username, password)

userInsertRow()
# Close communication with the database
conn.commit()
if cur:
    cur.close()
if conn:
    conn.close()
    print("PostgreSQL connection is closed")