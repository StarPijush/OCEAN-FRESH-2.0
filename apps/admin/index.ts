import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

import App from './App';
import { bootstrapApp } from './src/bootstrap';

bootstrapApp();
registerRootComponent(App);
