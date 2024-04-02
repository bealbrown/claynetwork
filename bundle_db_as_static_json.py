import sqlite3
import json


def fetch_data_from_db(db_path):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    cursor = conn.cursor()

    # Queries to fetch nodes and edges
    nodes_query = "SELECT * FROM nodes"
    edges_query = "SELECT * FROM edges"

    # Fetching nodes
    cursor.execute(nodes_query)
    rows = cursor.fetchall()
    nodes = [dict(row) for row in rows]  # Convert rows to dictionaries

    # Fetching edges
    cursor.execute(edges_query)
    rows = cursor.fetchall()
    edges = [dict(row) for row in rows]  # Convert rows to dictionaries

    # Closing the database connection
    conn.close()

    return {"nodes": nodes, "edges": edges}


def save_as_json(data, file_path):
    # Writing the data to a JSON file
    with open(file_path, "w") as json_file:
        json.dump(data, json_file, indent=4)


def main():
    db_path = "../db/ceramics_lineage.db"  # Path to your database
    json_output_path = "./frontend/public/ceramics_data.json"  # Output JSON file path

    # Fetch data from the database
    data = fetch_data_from_db(db_path)

    # Save the fetched data as JSON
    save_as_json(data, json_output_path)

    print("Data has been successfully saved as JSON.")


if __name__ == "__main__":
    main()
