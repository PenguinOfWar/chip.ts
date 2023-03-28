import './StackView.scss';

interface IStackView {
  data: Uint8Array | Uint16Array;
}

export default function StackView(props: IStackView) {
  const { data } = props;

  const array = Array.from(data);

  return array && array.length > 0 ? (
    <table className="stack-view w-100 text-center">
      <thead>
        <tr>
          {array.map((_item, i) => (
            <td key={i}>{i}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {array.map((item, i) => (
            <td key={i}>
              <div className="ratio ratio-1x1 bg-primary text-bg-primary text-center rounded">
                <div>{item}</div>
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  ) : (
    <strong>'No data'</strong>
  );
}
