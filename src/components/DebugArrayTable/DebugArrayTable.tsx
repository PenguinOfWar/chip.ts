import StackView from './views/StackView/StackView';

import './DebugArrayTable.scss';

interface IDebugArrayTable {
  data: Uint8Array | Uint16Array;
  format: 'table' | 'stack';
  columns?: number;
}

export default function DebugArrayTable(props: IDebugArrayTable) {
  const { data, format } = props;

  return (
    <div className="debug-array-table">
      {format === 'stack' ? (
        <StackView data={data} />
      ) : (
        <table className="table w-100">
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
