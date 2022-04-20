# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

import json 
from flask import (Flask, render_template, 
                   request, redirect, url_for,
                   session 
                   )

from forms import PlayerForm 
from model import GameSession, GameInfo

# not required for prod version 
from flask_cors import CORS # for dev purposes 

from helpers import (
    vertical_moves,
    horizontal_moves,
    diagonal_right_cross,
    diagonal_left_cross
)


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+
# app setup 

app = Flask(__name__, template_folder="ui/build/", static_folder='ui/build/static')
CORS(app) 


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

def render(data):
    return json.dumps(data)


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

@app.route("/", methods=['POST', 'GET'])
def index():
    
    formdata = {} 
    if request.data:
        formdata = json.loads(request.data)

    form = PlayerForm(**formdata)
 

    if request.method == "POST":
        
        if not form.validate():
            
            out = {
                "errors": {key: val[0] for key, val in form.errors.items() },
                "status": -1 
            }

            return render(out)
 
        # set up the session for the game 
            
        mdl = GameInfo(
            player_one=form.player_one.data, 
            player_two=form.player_two.data,
            status=0 
        )

        mdl.save()
                 
        # x makes the first move 

        out =  {
            "session": mdl.session,
            "status": 0, 
            "current_player": "x"          
        }

        return render(out)
        

    return render_template("index.html", form=form)


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+


@app.route("/game/<player>/<sess>", methods=['GET', 'POST'])
def play_session(player, sess):    

    
    is_error = False 

    if request.method == 'POST': 

        if request.data:
        
            # save a new play and return data back to the client

            formdata = json.loads(request.data)
            
            win = check_winnings(formdata['moves'], player)

            draw_status = False 
            if check_plays(formdata['moves']) == 'draw':
                draw_status = True 


            mdl = GameSession()
            mdl.record_play(formdata['moves'], player, sess, winner=win, isdraw=draw_status)
        
        else:            
            is_error = True 

  
    play_sess = GameSession() 

    out = {
        "game_info": play_sess.get_game(sess),
        "status": 0 if is_error == False else -1,
        'errors': {"move": 'server error detected.' if is_error == True else None }
    }

        

    return render(out)


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

def check_winnings(game_moves, player):

    resp = vertical_moves(game_moves, player)
    if resp == True:        
        return resp 

    resp = horizontal_moves(game_moves, player)
    if resp == True:
        
        return resp 
    
    resp = diagonal_right_cross(game_moves, player)
    if resp == True:
        return resp 


    resp = diagonal_left_cross(game_moves, player)
    if resp == True:
        return resp

    return False



def check_plays(game_moves):

    status = 'draw'

    for row in game_moves:
        for col in row:
            if col == 0:
                status = "gameon"
                break

        if status != "draw":
            break


    return status



# +-------------------------+-------------------------+
# +-------------------------+-------------------------+


@app.route("/gameover/<player>/<sess>")
def game_over(player, sess):

    GameInfo(session=sess).end_game()

    play_sess = GameSession()
    play_sess.end_game(player, sess)
    
    
    out = {
        "game_info": play_sess.get_game(sess),
        "status": 0        
    }

    return render(out)



# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

if __name__ == '__main__':
    app.run(port=5000, debug=True)


