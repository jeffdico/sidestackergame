
import { createStore, combineReducers } from 'redux';
import { createAction, handleActions } from 'redux-actions';

const appInitialState = {
  session: null,

};

const PlaySession = 'PlaySession';
export const setPlaySession = createAction(PlaySession);

const App = handleActions(
  {
    [PlaySession]: (state, { payload }) => ({
      ...state,
      session: payload,
    }),
  },

  appInitialState,
  
);


const rootReducer = combineReducers({
  App,
});

const configureStore = () => createStore(rootReducer);
export const store = configureStore();