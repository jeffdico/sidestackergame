

from wtforms import (
                     Form, 
                     SelectField,
                     ValidationError                
                    )



class PlayerForm(Form):

	player_one = SelectField('Player One',
                            render_kw={'class_': 'form-control form-control-lg'},
                            choices=[(0, 'Select Symbols'), ('x', "X"), ('o', 'O')])
	
	player_two = SelectField('Player Two', 
                            render_kw={'class_': 'form-control form-control-lg'},
                            choices=[(0, 'Select Symbols'), ('x', "X"), ('o', 'O')])


	def validate_player_one(form, field):

		if not field.data:
			raise ValidationError("field is required")

		if field.data == form.player_two.data:
			raise ValidationError("player symbol not unique")


	def validate_player_two(form, field):

		if not field.data:
			raise ValidationError("field is required")



