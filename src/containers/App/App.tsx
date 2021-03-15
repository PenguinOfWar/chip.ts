import { useState, useEffect, useRef } from 'react';
import { Field, Form, Formik } from 'formik';
import request from 'axios';
import isClient from '@bagofholding/is-client';

import Chip from '../../libs/chip/chip';

import './App.scss';

function App() {
  const [booted, setBooted] = useState(false);
  const canvas = useRef(null);

  const config = { fps: 10 };
  const { fps } = config;
  const [state, setState] = useState(config);

  useEffect(() => {
    async function fetchData() {
      setBooted(true);
      /**
       * sadly superagent does not support blobs in userland
       * we have retired it here in favour of axios
       */
      const response = await request({
        url: `${process.env.PUBLIC_URL}/roms/brix`,
        method: 'GET',
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const buffer = await blob.arrayBuffer();
      const rom = new Uint8Array(buffer);
      const chip = new Chip(rom, canvas, fps);

      window.chip = chip;
    }

    if (booted) {
      return;
    }

    if (isClient() && canvas && canvas?.current) {
      fetchData();
    }
  }, [booted, canvas, fps]);

  return (
    <div className="container app">
      <div className="row">
        <div className="col-12 text-center">
          <h1>CHIP.ts</h1>
          <canvas data-testid="canvas" ref={canvas} />
        </div>
      </div>

      <Formik
        initialValues={{ ...state }}
        onSubmit={values => setState(values)}
      >
        <Form className="row g-3 justify-content-lg-center">
          <div className="col-2 text-center form-floating">
            <Field
              className="form-control"
              type="number"
              name="fps"
              id="fps"
              min="0"
            />
            <label htmlFor="fps" className="text-dark">
              Frame rate
            </label>
          </div>
          <div className="col-2 text-center">
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

declare global {
  interface Window {
    chip: Chip;
  }
}

export default App;
