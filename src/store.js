import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

// Для использования https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
    reducer,
    composeEnhancers(applyMiddleware(thunkMiddleware)),
);

export default store;
