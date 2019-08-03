import * as React from 'react'
import * as ReactDom from 'react-dom'
// import * as loadable from '@loadable/component'
// const App = loadable(() => import('./components/App'))
import App from './components/App'

ReactDom.render(
    <App name='alarm' version='0.1.0' />, document.getElementById('app')
)
