import { combineReducers } from 'redux';

import auth from './auth';
import url from './url';

export default combineReducers({
    auth: auth,
    url: url
})