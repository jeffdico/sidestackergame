

import json 
import datetime

from sqlalchemy import (create_engine, Integer, String,
                        Text, DateTime,
                        Column, ForeignKey, or_,
                        update)

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

Engine = create_engine("sqlite:///storage.db", echo=True)
Base = declarative_base()

# +-------------------------+-------------------------+
# +-------------------------+-------------------------+

@contextmanager
def sql_cursor():
    CursorObj = sessionmaker(bind=Engine)
    cursor = CursorObj()

    try:
        yield cursor
        cursor.commit()
    except Exception as e:
        cursor.rollback()
        raise e


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+


class GameInfo(Base):

    __tablename__ = 'game_info'

    id = Column(Integer, primary_key=True, autoincrement=True)

    player_one = Column(String(10), nullable=False)
    player_two = Column(String(10), nullable=False)
    session = Column(String(100), nullable=False, unique=True)
    
    date_created = Column(DateTime, nullable=False)
    # status 0 for ongoing games and 1 for game closed
    status = Column(Integer, nullable=False)

    def save(self):
        
        sess = datetime.datetime.now().strftime("sess-%Y%m%d%H%M%S")
        self.session = sess 
        self.date_created = datetime.datetime.now()

        with sql_cursor() as db:
            db.add(self)
            db.flush() 


        self.session = sess 


    def end_game(self):

        with sql_cursor() as db:

            db.execute(
                update(GameInfo).where(GameInfo.session == self.session).values({'status': 1})
            )


    def draw(self):

        with sql_cursor() as db:

            db.execute(
                update(GameInfo).where(GameInfo.session == self.session).values({'status': 2}) 
            )


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+
   

class GameSession(Base):

    __tablename__ = "game_session"

    id = Column(Integer, primary_key=True, autoincrement=True)
    play_id = Column(Integer, ForeignKey(GameInfo.id), nullable=False)
    
    # a list object with a dict that describes the moves and the time stamp of when the game was played 
    moves = Column(Text, nullable=False)
    
    # 1 for player 1 and 2 for player 2 
    last_played = Column(String(5), nullable=False)

    move_logs = Column(Text)

    winner = Column(String(5))


    def get_game(self, sess):


        with sql_cursor() as db:

            qry = db.query(
                GameInfo.player_two,
                GameInfo.player_one,
                GameSession.id,
                GameSession.moves,
                GameSession.last_played,
                GameSession.winner,
                GameInfo.status
            ).outerjoin(
                GameSession, GameSession.play_id == GameInfo.id 
            ).filter(
                GameInfo.session == sess,
                
            ).first() 

        retv = {"gamestatus": 0}

        if not qry:
            return {}
 

        if qry.moves:

            if qry.status > 0:
                
                retv['player_one'] = qry.player_one 
                retv['player_two'] = qry.player_two 
                retv['winner'] = qry.winner
                retv['last_played'] = qry.last_played
                retv['moves'] = json.loads(qry.moves) 
                retv['gamestatus'] = qry.status  

            else:
                retv['last_played'] = qry.last_played
                retv['moves'] = json.loads(qry.moves) 
                retv['player_one'] = qry.player_one 
                retv['player_two'] = qry.player_two 
                retv['winner'] = qry.winner 

                

        else:
            # player x is always first 
            retv['last_played'] = qry.player_two if qry.player_two == 'o' else qry.player_one 
            retv['moves'] = [[0, 0,0,0,0,0,0] for x in range(7)]

            retv['player_one'] = qry.player_one 
            retv['player_two'] = qry.player_two 

        
        retv['next_player'] =  qry.player_one if retv['last_played'] == qry.player_two else qry.player_two 
        

        return  retv



    def record_play(self, moves, player, sess, winner=False, isdraw=False):

        with sql_cursor() as db:

            qry = db.query(
                GameInfo.id.label('infoid'),
                GameSession.id,
                GameSession.moves,
                GameSession.last_played,
                GameSession.move_logs
            ).outerjoin(
                GameSession, GameSession.play_id == GameInfo.id
            ).filter(
                GameInfo.session == sess                
            ).first()


            move_logs = json.loads(qry.move_logs or '[]')     
            
            move_logs.append({
                "moves": moves, "timestamp": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 
                'player': player 
            })

            if not qry:
                return 


            if qry and qry.moves:

                if player == qry.last_played:
                    return # just to be extra sure 
 
                db.execute(
                    update(GameSession).where(
                            GameSession.id == qry.id 
                        ).values({
                            "moves": json.dumps(moves),
                            "move_logs": json.dumps(move_logs),
                            "last_played": player,
                            "winner": player if winner == True else None 
                        })
                )

            else:
                
                mdl = GameSession(
                    moves=json.dumps(moves),
                    move_logs=json.dumps(move_logs),
                    play_id= qry.infoid,
                    last_played=player
                )

                db.add(mdl)



        gameinfo = GameInfo(session=sess)

        if winner == True:
            gameinfo.end_game()

        elif isdraw == True:
            gameinfo.draw()




    def end_game(self, player, sess):

        with sql_cursor() as db:
            qry = db.query(
                    GameInfo              
                ).filter(
                    GameInfo.session == sess 
                ).first()

            winplayer = qry.player_one  
            if qry.player_one == player:
                winplayer = qry.player_two
                

            db.execute(
                update(GameSession).where(GameSession.play_id == qry.id ).values({"winner": winplayer})
            )



# +-------------------------+-------------------------+
# +-------------------------+-------------------------+


def create_tables():
    Base.metadata.create_all(Engine)


# +-------------------------+-------------------------+
# +-------------------------+-------------------------+


def drop_tables():
    Base.metadata.drop_all(Engine)

# +-------------------------+-------------------------+
# +-------------------------+-------------------------+


if __name__ == '__main__':
    
    import argparse
    parser = argparse.ArgumentParser()

    parser.add_argument('-c', '--create', 
                        action="store_true", 
                        help="create the missing tables on the database",
                        default=False)

    parser.add_argument('-d', '--drop', 
                        action="store_true", 
                        help="drop the database completely",
                        default=False)
    

    args = parser.parse_args()

    if args.create == True:

        create_tables() 
        print("tables created successfully...")


    elif args.drop == True:
        
        drop_tables() 
        print("database schema dropped...")


