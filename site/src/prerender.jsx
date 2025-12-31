import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export async function prerender() {
  const html = renderToString(<App />)
  return { html }
}
