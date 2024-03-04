from flask import Flask, render_template, request
import json

app = Flask(__name__,static_folder=".",static_url_path='',template_folder='.')

@app.route('/') # première page où l'utilisateur saisit ses préférences
def home():
  return app.send_static_file('index.html')

if __name__=='__main__':
	app.run(debug=True,host='0.0.0.0')