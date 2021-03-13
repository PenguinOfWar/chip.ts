import { useState, useEffect } from 'react';
import isClient from '@bagofholding/is-client';

import request from 'axios';

import Chip from '../../libs/chip/chip';

import './App.scss';

function App() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setBooted(true);
      /**
       * sadly superagent does not support blobs in userland
       * we have retired it here in favour of axios
       */
      const response = await request({
        url: `${process.env.PUBLIC_URL}/roms/pong`,
        method: 'GET',
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const buffer = await blob.arrayBuffer();
      const rom = new Uint8Array(buffer);
      const chip = new Chip(rom);

      console.log(chip);
    }

    if (booted) {
      return;
    }

    if (isClient()) {
      fetchData();
    }
  }, [booted]);

  return (
    <div className="container app">
      <div className="row">
        <div className="col-12">
          <h1>CHIP.ts</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
