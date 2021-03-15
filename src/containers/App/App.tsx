import { useState, useEffect, useRef, useCallback } from 'react';
import { Field, Form, Formik } from 'formik';
import request from 'axios';
import isClient from '@bagofholding/is-client';

import Chip from '../../libs/chip/chip';

import './App.scss';

function App() {
  const canvas = useRef(null);

  const games = ['Brix', 'Tetris', 'Pong'];
  const keypad = [
    ['1', '2', '3', '4'],
    ['q', 'w', 'e', 'r'],
    ['a', 's', 'd', 'f'],
    ['z', 'x', 'c', 'v']
  ];
  const instructions: IInstructions = {
    brix: 'Left: Q | Right: E',
    tetris: 'Left: W | Right: E | Rotate: Q',
    pong: 'P1 Up: 1 | P1 Down: Q | P2 Up: 4 | P2 Down: R'
  };
  const [slot, setSlot] = useState(games[0].toLowerCase());

  const fetchData = useCallback(async () => {
    /**
     * sadly superagent does not support blobs in userland
     * we have retired it here in favour of axios
     */
    const response = await request({
      url: `${process.env.PUBLIC_URL}/roms/${slot}`,
      method: 'GET',
      responseType: 'blob'
    });

    const blob = new Blob([response.data]);
    const buffer = await blob.arrayBuffer();
    const rom = new Uint8Array(buffer);
    const chip = new Chip(rom, canvas);

    window.chip = chip;
  }, [slot]);

  useEffect(() => {
    if (isClient() && canvas && canvas?.current) {
      fetchData();
    }
  }, [slot, canvas, fetchData]);

  const handleButtonPress = (key: string) => {
    if (isClient()) {
      window.chip.keyboard.press(key);

      /**
       * we then wait a little time to fake a real keypress
       * the key needs to be released manually
       */

      setTimeout(() => {
        window.chip.keyboard.release();
      }, 200);
    }
  };

  const handleToggleGrid = () => {
    if (isClient()) {
      window.chip.gfx.toggleGrid();
    }
  };

  return (
    <div className="container app">
      <div className="row">
        <div className="col-12 text-center mb-3">
          <h1 className="mb-0">CHIP.ts</h1>
          <h2>
            <small className="text-muted">
              A CHIP-8 emulator in TypeScript
            </small>
          </h2>
          <canvas data-testid="canvas" ref={canvas} />
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-center mb-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              handleButtonPress('Escape');
            }}
          >
            Pause (Escape / Spacebar)
          </button>
        </div>
        <div className="col-6 text-center mb-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              handleToggleGrid();
            }}
          >
            Toggle Grid
          </button>
        </div>
        <div className="col-12">
          {/** virtual keypad */}
          {keypad.map((row, i) => (
            <div key={i} className="row">
              {row.map((column: string) => (
                <div key={column} className="col-3 text-center mb-2">
                  <button
                    className="btn btn-secondary w-100"
                    onClick={() => {
                      handleButtonPress(column);
                    }}
                  >
                    {column.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {instructions[slot] && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-secondary" role="alert">
              <h2>{slot} keys:</h2>
              {instructions[slot.toLowerCase()]}
            </div>
          </div>
        </div>
      )}
      <Formik
        initialValues={{ slot }}
        onSubmit={values => {
          setSlot(values.slot);
        }}
      >
        <Form className="row justify-content-lg-center">
          <div className="col-12 text-center">
            <h3>Choose a game</h3>
            <Field as="select" className="form-control" name="slot">
              {games.map(game => (
                <option key={game} value={game.toLowerCase()}>
                  {game}
                </option>
              ))}
            </Field>
            <hr />
            <button className="btn btn-primary" type="submit">
              Load
            </button>
            <hr />
            <a
              className="btn btn-light"
              href="https://github.com/PenguinOfWar/chip.ts"
            >
              View code on GitHub
            </a>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

export interface IInstructions {
  [key: string]: string;
}

declare global {
  interface Window {
    chip: Chip;
  }
}

export default App;
