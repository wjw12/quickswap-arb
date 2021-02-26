import { useEffect, useState, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

const TOKEN = "5bc72686da814f75abbae295097e3047"

const UNISWAP_API = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"

const QUICKSWAP_API = "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap"

const INTERVAL = 8000

const watchlist = [
  {
    name: 'SWAP-ETH',
    quickswap: '0xba8a6d86cd5577426ffbea6c40b7334650ff3900',
    uniswap: '0xd90a1ba0cbaaaabfdc6c814cdf1611306a26e1f8',
    inverse: true
  },
  {
    name: 'USDC-ETH',
    quickswap: '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
    uniswap: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'
  },
  {
    name: 'MATIC-ETH',
    quickswap: '0xadbf1854e5883eb8aa7baf50705338739e558e5b',
    uniswap: '0x819f3450da6f110ba6ea52195b3beafa246062de'
  }
]

async function fetch_subgraph(api, pair_address) {
  const query = `
    query {
      pair_price: pair(id: "${pair_address}"){
        token0Price
        token1Price
      }
    }`;
  var res = await fetch(api, {
      method: 'POST',
      body: JSON.stringify({query}),
      headers: {
          'Authorization': `Bearer ${TOKEN}`,
      },
  })
  
  try {
      var body = await res.json()
      var token0Price = parseFloat(body.data.pair_price.token0Price)
      var token1Price = parseFloat(body.data.pair_price.token1Price)
      return { 
        token0Price: token0Price, 
        token1Price: token1Price
      }
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
    watchlist.forEach(item => {
      fetch_subgraph(UNISWAP_API).then(result => {
        if (result) {
          var newPriceData = priceData
          newPriceData.uniswap[item.name] = item.inverse? [result.token1Price, result.token0Price] : [result.token0Price, result.token1Price]
          setPriceData(newPriceData)
        }
      })

      fetch_subgraph(QUICKSWAP_API).then(result => {
        if (result) {
          var newPriceData = priceData
          newPriceData.quickswap[item.name] = [result.token0Price, result.token1Price]
          setPriceData(newPriceData)
        }
      })
    })
  }

  useInterval(refreshData, INTERVAL)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {JSON.stringify(priceData)}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
