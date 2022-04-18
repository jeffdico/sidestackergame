


def vertical_moves(game, player):


    col = 0
    
    for row in range(7):
        matches = 0
        cont = 0

        for _ in range(7):
            
            if game[cont][col] == player:
                matches += 1
 
            else:  
                matches = 0 # reset 

            cont += 1 

            if cont > 6:
                break

            if matches == 4:
                break
        
        col += 1 


        if matches == 4:
            break
    

    return matches == 4 
 

def horizontal_moves(game, player):

    for mov in game:
        matches = 0 

        for pos in mov:
            if pos == player:
                matches += 1 

            elif pos != player:
                matches = 0 

            if matches == 4:
                break

        if matches >= 4:
            break


    return matches >= 4 

 

def right_cross(game, player, row, colno):
         
    counter = row 
    found = 0 
     
    for cl in range(colno, -1, -1):

        
        if game[counter][cl] == player:
            found += 1 
        else:
            found = 0 


        if found >= 4:
            break 


        counter += 1

        if counter > 6:
            break 

    return found

def diagonal_right_cross(game, player):

    start_row = 0 
    start_col = 6 
    cycle = 0 
        
    while True:

        match = right_cross(game, player, start_row, start_col)

        if match >= 4:
            break 

        
        
        start_col -= 1 
        cycle += 1 

        if start_row == 6 and cycle == 7:
            break 

        if cycle == 7 and start_col == -1:
            # reset 
            start_col = 6
            start_row += 1 
            cycle = 0


    return match >= 4 



def left_cross(game, player, row, colno):
         
    counter = row 
    found = 0 

    for cl in range(7):
        
        if game[counter][cl] == player:
            found += 1 
        else:
            found = 0 


        if found >= 4:
            break 


        counter += 1

        if counter > 6:
            break 

    return found



def diagonal_left_cross(game, player):
    start_row = 0 
    start_col = 0 
    cycle = 0 
        
    while True:

        match = left_cross(game, player, start_row, start_col)

        if match >= 4:
            break 

                
        start_col += 1 
        cycle += 1 

        if start_row == 6 and cycle == 7:
            break 

        if cycle == 7 and start_col == 7:
            # reset 
            start_col = 0
            start_row += 1 
            cycle = 0

    return match >= 4


 






