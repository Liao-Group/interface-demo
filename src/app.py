# Import libraries

from flask import Flask

from flask import (request, jsonify,
    Flask,render_template,

)
import pandas as pd
import json
# from get_viz_data import get_deciphering_rna_splicing_data

# Declare application
app = Flask(__name__)

# Create datastore variable
class DataStore():
    def __init__(self):
        self.data = None

data = DataStore()

@app.route("/", methods=["GET", "POST"])
def homepage():
    # # Default data option or from POST request
    # option = request.form.get('option', 'teaser')
    # try:
    #     with open(f'src/data/{option}.json', 'r') as file:
    #         json_data = json.load(file)
    #         data.data = json_data
    # except FileNotFoundError:
    #     json_data = {"error": "Data file not found"}

    return render_template("./index.html")


@app.route("/get-data", methods=["GET"])
def get_data():
    option = request.args.get('option', 'teaser')
    try:
        with open(f'data/{option}.json', 'r') as file:
            json_data = json.load(file)
    except FileNotFoundError:
        json_data = {"error": "Data file not found"}
    return jsonify(json_data)

if __name__ == "__main__":
    app.run(debug=True)