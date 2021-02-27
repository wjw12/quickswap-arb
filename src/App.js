import { useEffect, useState, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

const API_URL = "https://lightsail.jiewen.wang:3001/quickswap"

const INTERVAL = 20000

async function fetch_prices() {
  var res = await fetch(API_URL)
  
  try {
      var body = await res.json()
      return body
  }
  catch (err) {
      console.error(err)
      return null
  }
}

function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
      savedCallback.current = callback
  }, [callback])

  useEffect(() => {
      function tick() {
          savedCallback.current()
      }

      if (delay !== null) {
          const id = setInterval(tick, delay)
          return () => {
              clearInterval(id)
          }
      }
  }, [callback, delay])
}

function App() {
  const [priceData, setPriceData] = useState({uniswap: {}, quickswap: {}})

  const refreshData = () => {
    fetch_prices().then(result => {
      setPriceData(result)
      console.log(result)
    })
  }

  useEffect(refreshData, [])

  useInterval(refreshData, INTERVAL)

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <table>
            <tbody>
              <tr>
                <th>Pair</th>
                <th>Quickswap 0</th>
                <th>Uniswap 0</th> 
                <th>Quickswap 1</th>
                <th>Uniswap 1</th>
                <th>Diff</th>
              </tr>
              {
                Object.keys(priceData).map(key => (
                    <tr>
                      <th>{key}</th>
                      <th>{priceData[key].quickswap ? priceData[key].quickswap.token0Price : "None"}</th>
                      <th>{priceData[key].uniswap ? priceData[key].uniswap.token0Price : "None"}</th>
                      <th>{priceData[key].quickswap ? priceData[key].quickswap.token1Price : "None"}</th>
                      <th>{priceData[key].uniswap ? priceData[key].uniswap.token1Price : "None"}</th>
                      <th>{priceData[key].diff}</th>
                    </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}

export default App;
