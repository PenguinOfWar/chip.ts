import { useState, useEffect, useRef, useCallback } from 'react';
import { Field, Form, Formik } from 'formik';
import request from 'axios';
import isClient from '@bagofholding/is-client';
import Collapsible from 'react-collapsible';

import arrayBuffer from '../../polyfills/arrayBuffer';
import Chip, { games, keypad, instructions } from '../../libs/chip/chip';
import { IChip } from '../../libs/chip/types/chip.types';

import './App.scss';
import DebugArrayTable from '../../components/DebugArrayTable/DebugArrayTable';

function App() {
  const canvas = useRef(null);

  const [slot, setSlot] = useState(games[0].toLowerCase());
  const [debugDetail, setDebugDetail] = useState({} as IChip);

  const fetchData = useCallback(async () => {
    /**
     * check for any instances of chip before we load a rom
     */
    if (window.chip) {
      window.chip.stop();
    }
    /**
     * sadly superagent does not support blobs in userland
     * we have retired it here in favour of axios
     */
    const response = await request({
      url: `${process.env.PUBLIC_URL}/roms/${slot}`,
      method: 'GET',
      responseType: 'blob'
    });

    /**
     * check if we need a fileArray polyfill
     */

    File.prototype.arrayBuffer = File.prototype.arrayBuffer || arrayBuffer;
    Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || arrayBuffer;

    const blob = new Blob([response.data]);
    const buffer = await blob.arrayBuffer();
    const rom = new Uint8Array(buffer);
    const chip = new Chip(slot, rom, canvas);

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

  /**
   * event listener for debug view
   */

  const handleDebugListener = useCallback(event => {
    setDebugDetail(event.detail);
    console.log(event.detail.cpu);
  }, []);

  useEffect(() => {
    document.addEventListener('chipDebug', handleDebugListener);
    return () => {
      document.removeEventListener('chipDebug', handleDebugListener);
    };
  }, [handleDebugListener]);

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
        <div className="col-12 text-center mb-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              handleButtonPress('Escape');
            }}
          >
            Pause (Escape / Spacebar)
          </button>
        </div>
        <div className="col-6 text-center mb-2 d-none">
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
          if (values.slot !== slot) {
            setSlot(values.slot);
          }
        }}
      >
        <Form className="row justify-content-lg-center">
          <div className="col-12 text-center">
            <h3>Choose a cartidge</h3>
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
          </div>
        </Form>
      </Formik>
      {Object.keys(debugDetail).length > 0 && (
        <div className="row">
          <div className="col-12">
            <Collapsible
              trigger="Debug"
              triggerTagName={'button'}
              triggerClassName="btn btn-primary d-block mx-auto"
              triggerOpenedClassName="btn btn-primary d-block mx-auto"
            >
              <div className="d-block w-100">
                <table className="table table-dark debug-table">
                  <thead>
                    <tr>
                      <th scope="col">Key</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Speed</th>
                      <td>{debugDetail?.speed}</td>
                    </tr>
                    <tr>
                      <th scope="row">Frame</th>
                      <td>{debugDetail?.frame}</td>
                    </tr>
                    {/** cpu */}
                    <tr>
                      <th scope="row">Cpu Counter</th>
                      <td>{debugDetail?.cpu?.counter}</td>
                    </tr>
                    <tr>
                      <th scope="row">Cpu Delay Timer</th>
                      <td>{debugDetail?.cpu?.delayTimer}</td>
                    </tr>
                    <tr>
                      <th scope="row">Cpu Key Pressed</th>
                      <td>{debugDetail?.cpu?.key}</td>
                    </tr>
                    {/* <tr>
                      <th scope="row">Cpu Memory</th>
                      <td>{debugDetail?.cpu?.memory}</td>
                    </tr> */}
                    <tr>
                      <th scope="row">Cpu Pointer</th>
                      <td>{debugDetail?.cpu?.pointer}</td>
                    </tr>
                    <tr>
                      <th scope="row">Cpu Registers</th>
                      <td>
                        <DebugArrayTable
                          data={debugDetail?.cpu?.registers}
                          format={'stack'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Cpu Running</th>
                      <td>{String(debugDetail?.cpu?.running)}</td>
                    </tr>
                    {/* <tr>
                      <th scope="row">Cpu Screen</th>
                      <td>{debugDetail?.cpu?.screen}</td>
                    </tr> */}
                    <tr>
                      <th scope="row">Cpu Sound Timer</th>
                      <td>{debugDetail?.cpu?.soundTimer}</td>
                    </tr>
                    <tr>
                      <th scope="row">Cpu Stack</th>
                      <td>
                        <DebugArrayTable
                          data={debugDetail?.cpu?.stack}
                          format={'stack'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Cpu Stack Pointer</th>
                      <td>{debugDetail?.cpu?.stackPointer}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Collapsible>
          </div>
          <div className="col-12 text-center">
            <hr />
            <a
              className="btn btn-light"
              href="https://github.com/PenguinOfWar/chip.ts"
            >
              View code on GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    chip: Chip;
  }
}

export default App;
